import { test, expect } from '@playwright/test'

test.describe('Party Planning App', () => {
  test('loads home page and shows party command center', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /plan, run, and wrap/i })).toBeVisible()
  })

  test('can navigate to Budget page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /budget/i }).click()
    await expect(page.getByRole('heading', { level: 2, name: /budget/i })).toBeVisible()
    await expect(page.getByText(/total spent/i)).toBeVisible()
  })

  test('skip link is focusable and activates via keyboard', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: /skip to main content/i })
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeInViewport()
  })
})
