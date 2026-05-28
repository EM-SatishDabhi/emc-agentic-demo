import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// A11y: WCAG 2.1 AA conformance (TESTING.md §a11y)
test.describe('App — accessibility', () => {
  test('no WCAG violations on main page', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
})
