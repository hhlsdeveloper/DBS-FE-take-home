import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { formatMoney } from '../../lib/format'
import { money, renderApp } from '../../test/renderApp'
import { server } from '../../test/setup'

async function openTransfer() {
  const app = renderApp()
  const button = await screen.findByRole('button', { name: 'New transfer' })
  await app.user.click(button)
  const dialog = screen.getByRole('dialog', { name: 'New transfer' })
  return { ...app, button, dialog }
}

const recipients = (dialog: HTMLElement) =>
  within(dialog).getByRole('radiogroup', { name: 'Who are you sending to?' })

describe('transfer dialog', () => {
  it('opens on the recipient step and returns focus when closed', async () => {
    const { user, button, dialog } = await openTransfer()

    expect(
      within(dialog).getByRole('heading', { name: 'Who are you sending to?' }),
    ).toHaveFocus()
    const steps = within(dialog).getByRole('list', { name: 'Transfer steps' })
    expect(within(steps).getByText('Recipient')).toHaveAttribute(
      'aria-current',
      'step',
    )

    await user.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })

  it('starts empty again after Cancel', async () => {
    const { user, button } = await openTransfer()
    await user.click(await screen.findByRole('radio', { name: /Jamie Tan/ }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(button).toHaveFocus()

    await user.click(button)

    expect(
      await screen.findByRole('radio', { name: /Jamie Tan/ }),
    ).not.toBeChecked()
  })
})

describe('recipient step', () => {
  it('lists every payee and filters them by name or bank', async () => {
    const { user, dialog } = await openTransfer()
    const group = recipients(dialog)

    expect(
      await within(group).findByRole('radio', { name: /Jamie Tan/ }),
    ).toBeInTheDocument()
    // 4 payees plus "Send to someone new".
    expect(within(group).getAllByRole('radio')).toHaveLength(5)

    await user.type(
      within(dialog).getByRole('searchbox', { name: 'Search payees' }),
      'ocbc',
    )
    const radios = within(group).getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios[1]).toHaveAccessibleName('Send to someone new')
  })

  it('picks a payee with the keyboard and continues to the amount step', async () => {
    const { user, dialog } = await openTransfer()
    const first = await within(recipients(dialog)).findByRole('radio', {
      name: /Jamie Tan/,
    })

    first.focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowDown}')
    const second = within(recipients(dialog)).getAllByRole('radio')[1]
    expect(second).toBeChecked()

    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

    expect(
      within(dialog).getByRole('heading', { name: 'How much?' }),
    ).toHaveFocus()

    await user.click(within(dialog).getByRole('button', { name: 'Back' }))
    expect(within(recipients(dialog)).getAllByRole('radio')[1]).toBeChecked()
  })

  it('asks for a recipient when nothing is picked', async () => {
    const { user, dialog } = await openTransfer()
    await within(dialog).findByRole('radio', { name: /Jamie Tan/ })

    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

    expect(recipients(dialog)).toHaveAccessibleDescription(
      'Choose who to send to.',
    )
    expect(
      within(dialog).getByRole('heading', { name: 'Who are you sending to?' }),
    ).toBeInTheDocument()
  })

  it('checks new-recipient fields on leave and on Continue', async () => {
    const { user, dialog } = await openTransfer()
    await user.click(
      within(dialog).getByRole('radio', { name: 'Send to someone new' }),
    )

    const account = within(dialog).getByRole('textbox', {
      name: 'Account number',
    })
    await user.type(account, '1234')
    await user.tab()
    expect(account).toHaveAccessibleDescription(
      'Enter a valid 8-digit account number.',
    )

    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

    const name = within(dialog).getByRole('textbox', { name: 'Recipient name' })
    expect(name).toHaveFocus()
    expect(name).toHaveAccessibleDescription(
      'Enter a name between 2 and 50 characters.',
    )
    expect(
      within(dialog).getByRole('combobox', { name: 'Bank' }),
    ).toHaveAccessibleDescription('Choose a bank.')

    await user.type(name, 'Alex Lim')
    await user.clear(account)
    await user.type(account, '12345678')
    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Bank' }),
      'OCBC',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

    expect(
      within(dialog).getByRole('heading', { name: 'How much?' }),
    ).toBeInTheDocument()
  })

  it('still offers someone new when payees fail to load', async () => {
    server.use(
      http.get(
        '*/api/payees',
        () =>
          HttpResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
            { status: 500 },
          ),
        { once: true },
      ),
    )
    const { user, dialog } = await openTransfer()

    expect(
      await within(dialog).findByText("We couldn't load your payees."),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('radio', { name: 'Send to someone new' }),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Retry' }))

    expect(
      await within(dialog).findByRole('radio', { name: /Jamie Tan/ }),
    ).toBeInTheDocument()
  })
})

async function openAmountStep() {
  const app = await openTransfer()
  await app.user.click(
    await within(app.dialog).findByRole('radio', { name: /Jamie Tan/ }),
  )
  await app.user.click(
    within(app.dialog).getByRole('button', { name: 'Continue' }),
  )
  const amount = within(app.dialog).getByRole('textbox', { name: 'Amount' })
  return { ...app, amount }
}

describe('amount step', () => {
  // Accessible descriptions keep formatMoney's non-breaking space, so these
  // compare against formatMoney rather than money().
  it('blocks an amount over the balance and sends nothing', async () => {
    const requests: string[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.method !== 'GET') requests.push(request.url)
    })
    const { user, dialog, amount } = await openAmountStep()

    await user.type(amount, '5000')
    await user.tab()
    const message = `Amount can't be more than your available balance (${formatMoney(4280.55)}).`
    expect(amount).toHaveAccessibleDescription(message)

    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

    expect(amount).toHaveFocus()
    expect(
      within(dialog).getByRole('heading', { name: 'How much?' }),
    ).toBeInTheDocument()
    expect(requests).toEqual([])
  })

  it('checks the daily limit against a larger account', async () => {
    const { user, dialog, amount } = await openAmountStep()

    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: 'From account' }),
      within(dialog).getByRole('option', { name: /Savings/ }),
    )
    expect(within(dialog).getByText(money(12840))).toBeInTheDocument()

    await user.type(amount, '6000')
    await user.tab()

    expect(amount).toHaveAccessibleDescription(
      `This transfer exceeds your remaining daily limit (${formatMoney(5000)}).`,
    )
  })

  it('offers only deposit accounts', async () => {
    const { dialog } = await openAmountStep()

    const options = within(
      within(dialog).getByRole('combobox', { name: 'From account' }),
    ).getAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual([
      'Everyday Checking · •••• 4821',
      'Savings Plus · •••• 9930',
    ])
  })

  it('rejects amounts below 1.00 or with more than 2 decimals', async () => {
    const { user, amount } = await openAmountStep()

    await user.type(amount, '0.5')
    await user.tab()
    expect(amount).toHaveAccessibleDescription(
      `Enter at least ${formatMoney(1)}.`,
    )

    await user.clear(amount)
    await user.type(amount, '12.345')
    expect(amount).toHaveAccessibleDescription(
      'Use numbers only, up to 2 decimal places.',
    )
  })

  it('fills the amount from a quick amount', async () => {
    const { user, dialog, amount } = await openAmountStep()

    await user.click(within(dialog).getByRole('button', { name: '250' }))

    expect(amount).toHaveValue('250')
  })

  it('counts note characters and flags notes over 50', async () => {
    const { user, dialog } = await openAmountStep()
    const note = within(dialog).getByRole('textbox', {
      name: 'Note (optional)',
    })

    await user.type(note, 'Dinner')
    expect(within(dialog).getByText('6/50')).toBeInTheDocument()

    await user.type(note, 'x'.repeat(45))
    await user.tab()
    expect(within(dialog).getByText('51/50')).toBeInTheDocument()
    expect(note).toHaveAccessibleDescription(
      'Keep the note to 50 characters or fewer.',
    )
  })
})

describe('review step', () => {
  it('shows the details and Back keeps them', async () => {
    const { user, dialog, amount } = await openAmountStep()
    await user.type(amount, '120')
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Note (optional)' }),
      'Dinner',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

    expect(
      within(dialog).getByRole('heading', { name: 'Check the details' }),
    ).toHaveFocus()
    expect(dialog).toHaveTextContent('Everyday Checking · •••• 4821')
    expect(dialog).toHaveTextContent('Jamie Tan · DBS · •••• 3391')
    expect(dialog).toHaveTextContent(`Amount${money(120)}`)
    expect(dialog).toHaveTextContent(`Fee${money(0)}`)
    expect(dialog).toHaveTextContent('NoteDinner')
    expect(dialog).toHaveTextContent(`Total${money(120)}`)
    expect(
      within(dialog).getByRole('button', { name: 'Confirm transfer' }),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Back' }))

    expect(within(dialog).getByRole('textbox', { name: 'Amount' })).toHaveValue(
      '120',
    )
    expect(
      within(dialog).getByRole('textbox', { name: 'Note (optional)' }),
    ).toHaveValue('Dinner')
  })

  it('masks a new recipient’s account number', async () => {
    const { user, dialog } = await openTransfer()
    await user.click(
      within(dialog).getByRole('radio', { name: 'Send to someone new' }),
    )
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Recipient name' }),
      'Alex Lim',
    )
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Account number' }),
      '12345678',
    )
    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Bank' }),
      'OCBC',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Amount' }),
      '50',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

    expect(dialog).toHaveTextContent('Alex Lim · OCBC · •••• 5678')
    expect(dialog).not.toHaveTextContent('Note')
  })
})
