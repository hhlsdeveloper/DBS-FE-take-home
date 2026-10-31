import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp } from './test/renderApp'
import { server } from './test/setup'

const serverError = () =>
  HttpResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
    { status: 500 },
  )

describe('dashboard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows a loading state first', async () => {
    renderApp()

    expect(
      screen.getByRole('status', { name: 'Loading dashboard' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Good evening, Ava' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: 'Loading dashboard' }),
    ).not.toBeInTheDocument()
  })

  it('shows an error when the dashboard fails and loads after Retry', async () => {
    server.use(http.get('*/api/accounts', serverError, { once: true }))
    const { user } = renderApp()

    expect(
      await screen.findByText("We couldn't load your dashboard."),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('heading', { name: 'Good evening, Ava' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText("We couldn't load your dashboard."),
    ).not.toBeInTheDocument()
  })
})

describe('theme and segment', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles dark mode and remembers it', async () => {
    const { user } = renderApp()
    const toggle = screen.getByRole('button', { name: 'Dark mode' })

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('meridian.theme')).toBe('dark')
  })

  it('switches to premium', async () => {
    const { user } = renderApp()
    // jsdom applies the CSS at a narrow width, so the visible switch is the
    // mobile one under the greeting, which appears once data has loaded.
    const [segmentSwitch] = await screen.findAllByRole('group', {
      name: 'Customer segment',
    })

    await user.click(within(segmentSwitch).getByRole('button', { name: 'Premium' }))

    expect(document.documentElement.dataset.segment).toBe('premium')
    expect(localStorage.getItem('meridian.segment')).toBe('premium')
  })
})
