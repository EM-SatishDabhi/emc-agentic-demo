import { test, expect } from '@playwright/test'

// Smoke: is the app alive? Max 30s total, ≤5 specs (TESTING.md §smoke)
test('app loads and returns 200', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('#root')).not.toBeEmpty()
})
