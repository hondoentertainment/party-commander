import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function enterEventScope(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 })
  const continueLocally = page.getByRole('button', { name: 'Continue locally' })
  const guestBtn = page.getByRole('button', { name: /guest|local|continue without|skip/i }).first()
  if (await continueLocally.isVisible({ timeout: 8000 }).catch(() => false)) {
    await continueLocally.click()
  } else if (await guestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await guestBtn.click()
  } else if (await page.getByText(/continue locally|local|guest|offline/i).first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.getByText(/continue locally|local|guest|offline/i).first().click()
  }
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)

  const initFirstBtn = page.locator('button:has-text("Initialize First Event")')
  const initNewCard = page.locator('div:has-text("Initialize New Event")').first()
  const createBtn = page.getByRole('button', { name: /create|new.*event|add.*event/i }).first()
  if (await initFirstBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await initFirstBtn.click()
  } else if (await initNewCard.isVisible({ timeout: 2000 }).catch(() => false)) {
    await initNewCard.click()
  } else if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await createBtn.click()
  }
  await page.waitForLoadState('networkidle')

  const eventNameInput = page
    .getByLabel(/event name|party name|title/i)
    .or(page.getByPlaceholder(/event name|party name/i))
    .first()
  if (await eventNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await eventNameInput.fill('Smoke Test Event ' + Date.now())
    await page.getByRole('button', { name: /create|submit|save|continue/i }).first().click()
  }
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  try {
    await page.waitForURL(/\/event\//, { timeout: 15000 })
  } catch {
    throw new Error('enterEventScope: never reached /event/ - create flow may have failed')
  }
}

test.describe('Party Planning App', () => {
  test('loads home page and shows party command center or auth', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /Party Command|My Party|Create your account|Welcome back|Intelligence Hub/i })
    ).toBeVisible()
  })

  test('can navigate to Budget page', async ({ page }) => {
    await enterEventScope(page)
    const url = page.url()
    const match = url.match(/\/event\/([^/?#]+)/)
    const eventId = match?.[1]
    if (!eventId) throw new Error('Expected to be at /event/:id after enterEventScope')
    await page.goto(`/event/${eventId}/budget`)
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
    await enterEventScope(page)
    const url = page.url()
    const match = url.match(/\/event\/([^/?#]+)/)
    const eventId = match?.[1]
    if (!eventId) throw new Error('Expected to be at /event/:id after enterEventScope')
    await page.goto(`/event/${eventId}/budget`)
    await page.getByPlaceholder(/ice, cups, napkins/i).fill('Test item')
    await page.getByPlaceholder(/24\.99/i).fill('25')
    await page.getByRole('button', { name: /add item/i }).click()
    await expect(page.locator('input[value="Test item"]')).toBeVisible()

    await page.getByRole('button', { name: /remove/i }).first().click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(/remove "test item"/i)).toBeVisible()

    await dialog.getByRole('button', { name: /^remove$/i }).click()
    await expect(dialog).not.toBeVisible()
    await expect(page.locator('input[value="Test item"]')).not.toBeVisible()
  })
})
