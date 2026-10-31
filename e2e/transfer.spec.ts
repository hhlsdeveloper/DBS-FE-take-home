import { expect, test } from '@playwright/test'

// jsdom has no real <dialog>, so Esc, sizing and focus return are checked here.
test('transfer dialog closes with Esc and returns focus', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: 'New transfer' })
  await button.click()

  const dialog = page.getByRole('dialog', { name: 'New transfer' })
  await expect(dialog).toBeVisible()
  const { width } = (await dialog.boundingBox())!
  expect(width).toBe(520)

  await page.keyboard.press('Escape')

  await expect(dialog).toBeHidden()
  await expect(button).toBeFocused()
})

test('transfer dialog is a full-screen sheet on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'New transfer' }).click()

  const box = (await page
    .getByRole('dialog', { name: 'New transfer' })
    .boundingBox())!
  expect(box).toEqual({ x: 0, y: 0, width: 390, height: 844 })
  await expect(page.getByRole('button', { name: 'Continue' })).toBeInViewport()
})
