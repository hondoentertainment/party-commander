import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * E2E tests for Plan, Invites, Decor, and Cleaning modules.
 * Uses enterEventScope pattern: Continue locally → Initialize First Event.
 * Run with: npx playwright test e2e/plan-invites-decor-cleaning.spec.ts --workers=1
 */

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
    await eventNameInput.fill('E2E Plan Invites Decor Cleaning ' + Date.now())
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

function getEventId(page: Page): string {
  const url = page.url()
  const match = url.match(/\/event\/([^/?#]+)/)
  const eventId = match?.[1]
  if (!eventId) throw new Error('Expected to be at /event/:id after enterEventScope')
  return eventId
}

test.describe('Plan page', () => {
  test.describe.configure({ timeout: 60000 })

  test('creates and edits plan items (party concepts)', async ({ page }) => {
    await enterEventScope(page)
    const eventId = getEventId(page)
    await page.goto(`/event/${eventId}/plan`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Party concepts' })).toBeVisible()

    // Select a party concept (create plan item)
    const classicBtn = page.getByRole('button', { name: 'Classic' })
    await classicBtn.click()
    await expect(classicBtn).toHaveClass(/bg-emerald-500\/20|ring-emerald/)

    // Edit: select different concept
    const tropicalBtn = page.getByRole('button', { name: 'Tropical' })
    await tropicalBtn.click()
    await expect(tropicalBtn).toHaveClass(/bg-emerald-500\/20|ring-emerald/)

    // Edit: select Custom and enter custom concept name
    const customBtn = page.getByRole('button', { name: 'Custom' })
    await customBtn.click()
    const customInput = page.getByPlaceholder(/art deco speakeasy/i)
    await expect(customInput).toBeVisible()
    await customInput.fill('Art Deco Speakeasy')
    await expect(customInput).toHaveValue('Art Deco Speakeasy')
  })
})

test.describe('Invites page', () => {
  test.describe.configure({ timeout: 60000 })

  test('copy invite link and verify share flow', async ({ page }) => {
    await enterEventScope(page)
    const eventId = getEventId(page)
    await page.goto(`/event/${eventId}/invites`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: /invites hub/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Share Kit' })).toBeVisible()

    // Copy invite (share message) - button copies share message to clipboard
    const copyInviteBtn = page.getByRole('button', { name: /copy invite/i })
    await expect(copyInviteBtn).toBeVisible()
    await copyInviteBtn.click()
    // Button briefly shows "Copied" (may be too fast in headless) - verify share flow instead

    // Share flow: verify Share Kit section and read-only share message textarea
    await expect(page.getByText(/share kit/i)).toBeVisible()
    const shareMessageArea = page.locator('textarea[readonly]').first()
    await expect(shareMessageArea).toBeVisible()
    const shareContent = await shareMessageArea.inputValue()
    expect(shareContent.length).toBeGreaterThan(0)
    expect(shareContent).toMatch(/invited|party/i)
  })
})

test.describe('Decor page', () => {
  test.describe.configure({ timeout: 60000 })

  test('add decor item and edit via Edit button', async ({ page }) => {
    await enterEventScope(page)
    const eventId = getEventId(page)
    await page.goto(`/event/${eventId}/decor`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Decor & Ambience' })).toBeVisible()

    // Add decor item
    const itemInput = page.getByPlaceholder(/string lights/i)
    await itemInput.fill('E2E String Lights')
    await page.getByRole('button', { name: /add decor/i }).click()
    await expect(page.getByText('E2E String Lights')).toBeVisible()

    // Edit via Edit button
    const editBtn = page.getByRole('button', { name: /edit e2e string lights/i })
    await editBtn.click()

    // Form switches to Edit mode
    await expect(page.getByText(/edit decor item/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()

    const itemInputEditing = page.getByPlaceholder(/string lights/i)
    await itemInputEditing.clear()
    await itemInputEditing.fill('E2E Edited String Lights')
    await page.getByRole('button', { name: /save changes/i }).click()

    await expect(page.getByText('E2E Edited String Lights')).toBeVisible()
    await expect(page.getByText('E2E String Lights')).not.toBeVisible()
  })
})

test.describe('Cleaning page', () => {
  test.describe.configure({ timeout: 60000 })

  test('add checklist item and toggle status', async ({ page }) => {
    await enterEventScope(page)
    const eventId = getEventId(page)
    await page.goto(`/event/${eventId}/cleaning`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Cleaning & Bathroom' })).toBeVisible()
    await expect(page.getByText(/cleaning phase checklist/i)).toBeVisible()

    // Add checklist item
    const itemInput = page.getByPlaceholder(/sweep kitchen floor/i)
    await itemInput.fill('E2E Sweep kitchen floor')
    await page.getByRole('button', { name: /add to checklist/i }).first().click()
    await expect(page.getByText('E2E Sweep kitchen floor')).toBeVisible()

    // Toggle status: click the checklist item (cycles not_started -> in_progress -> done)
    await page.getByRole('button', { name: /e2e sweep kitchen floor.*status not_started/i }).click()
    await expect(page.getByRole('button', { name: /e2e sweep kitchen floor.*status in_progress/i })).toBeVisible()

    await page.getByRole('button', { name: /e2e sweep kitchen floor.*status in_progress/i }).click()
    await expect(page.getByRole('button', { name: /e2e sweep kitchen floor.*status done/i })).toBeVisible()

    await page.getByRole('button', { name: /e2e sweep kitchen floor.*status done/i }).click()
    await expect(page.getByRole('button', { name: /e2e sweep kitchen floor.*status not_started/i })).toBeVisible()
  })
})
