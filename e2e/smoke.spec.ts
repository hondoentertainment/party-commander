import { test, expect } from '@playwright/test'

test.describe('Party Planning App', () => {
  test('loads home page and shows party command center', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Party Command|My Party/i })).toBeVisible()
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

  test('Budget remove shows confirmation and removes on confirm', async ({ page }) => {
    await page.goto('/budget')
    await page.getByPlaceholder(/ice, cups, napkins/i).fill('Test item')
    await page.getByPlaceholder(/24\.99/i).fill('25')
    await page.getByRole('button', { name: /add item/i }).click()
    await expect(page.getByDisplayValue('Test item')).toBeVisible()

    await page.getByRole('button', { name: /remove/i }).first().click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(/remove "test item"/i)).toBeVisible()

    await dialog.getByRole('button', { name: /^remove$/i }).click()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByDisplayValue('Test item')).not.toBeVisible()
  })
})
