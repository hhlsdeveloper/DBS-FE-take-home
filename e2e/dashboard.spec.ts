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

  // Structure only: names, amounts and counts come from the API, so they
  // aren't asserted here.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'New transfer' })).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Accounts' }).getByRole('listitem').first(),
  ).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Recent transactions' }),
  ).toBeVisible()

  expect(consoleErrors).toEqual([])
})
