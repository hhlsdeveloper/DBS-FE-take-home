import { expect, test } from '@playwright/test'

test('dashboard loads with accounts and transactions', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')

  // The mock API answers in ~500ms, so the skeleton shows first.
  await expect(
    page.getByRole('status', { name: 'Loading dashboard' }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { name: 'Good evening, Ava' }),
  ).toBeVisible()
  await expect(page.getByText(/SGD\s17,120\.55/)).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Accounts' }).getByRole('listitem'),
  ).toHaveCount(3)
  await expect(
    page.getByRole('list', { name: 'Recent transactions' }).getByRole('listitem'),
  ).toHaveCount(8)

  expect(consoleErrors).toEqual([])
})
