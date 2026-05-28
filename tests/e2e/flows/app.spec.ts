import { test, expect } from '@playwright/test'

test.describe('App — critical flow', () => {
  test('shows greeting on load', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Hello from Satish')).toBeVisible()
  })

  test('page title is set', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/EMC Agentic Demo/i)
  })
})
