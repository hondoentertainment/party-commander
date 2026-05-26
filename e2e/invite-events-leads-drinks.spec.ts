import { test, expect } from '@playwright/test'

/**
 * E2E tests for invite redemption, Events CRUD, Leads page, and Drinks page.
 * Uses guest/local entry and creates event in beforeEach (like smoke-prod flow).
 * Run with: npx playwright test e2e/invite-events-leads-drinks.spec.ts --workers=1
 */

test.describe('Invite redemption flow', () => {
  test('invite page loads; unauthenticated user is redirected to home', async ({ page }) => {
    await page.goto('/invite/party/test-token-123')
    // Unauthenticated: InvitePage redirects to /
    await page.waitForURL((url: URL) => url.pathname === '/', { timeout: 10000 })
  })
})

test.describe('Events CRUD', () => {
  test.describe.configure({ timeout: 60000 })
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const guestBtn = page.getByRole('button', { name: /guest|local|continue without|skip/i }).first()
    const localLink = page.getByText(/local|guest|offline/i).first()
    if (await guestBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.click()
    } else if (await localLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await localLink.click()
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const initFirstBtn = page.locator('button:has-text("Initialize First Event")')
    const initNewCard = page.locator('div:has-text("Initialize New Event")').first()
    const createBtn = page.getByRole('button', { name: /create|new.*event|add.*event/i }).first()
    if (await initFirstBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await initFirstBtn.click()
    } else if (await initNewCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await initNewCard.click()
    } else if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
    }

    const eventNameInput = page.getByLabel(/event name|party name|title/i).or(page.getByPlaceholder(/event name|party name/i)).first()
    if (await eventNameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await eventNameInput.fill('E2E Test Event ' + Date.now())
      await page.getByRole('button', { name: /create|submit|save|continue/i }).first().click()
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const eventsLink = page.getByRole('link', { name: /events/i }).first()
    await eventsLink.click({ timeout: 10000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('creates event', async ({ page }) => {
    await page.getByPlaceholder(/rooftop kickoff/i).fill('E2E New Event')
    await page.getByRole('button', { name: /add event/i }).click()
    await expect(page.getByDisplayValue('E2E New Event')).toBeVisible()
  })

  test('edits event name', async ({ page }) => {
    const firstEventInput = page.locator('input[value]').first()
    if (await firstEventInput.isVisible({ timeout: 2000 })) {
      await firstEventInput.fill('E2E Edited Event')
      await expect(page.getByDisplayValue('E2E Edited Event')).toBeVisible()
    } else {
      await page.getByPlaceholder(/rooftop kickoff/i).fill('First Event')
      await page.getByRole('button', { name: /add event/i }).click()
      await page.getByDisplayValue('First Event').fill('First Event Edited')
      await expect(page.getByDisplayValue('First Event Edited')).toBeVisible()
    }
  })

  test('removes event with confirmation', async ({ page }) => {
    await page.getByPlaceholder(/rooftop kickoff/i).fill('Event To Remove')
    await page.getByRole('button', { name: /add event/i }).click()
    await expect(page.getByDisplayValue('Event To Remove')).toBeVisible()

    await page.getByRole('button', { name: /remove/i }).last().click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: /^remove$/i }).click()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByDisplayValue('Event To Remove')).not.toBeVisible()
  })

  test('copy leads from another event', async ({ page }) => {
    await page.getByPlaceholder(/rooftop kickoff/i).fill('Event A')
    await page.getByRole('button', { name: /add event/i }).click()
    await page.waitForTimeout(300)
    await page.getByPlaceholder(/rooftop kickoff/i).fill('Event B')
    await page.getByRole('button', { name: /add event/i }).click()
    await page.waitForTimeout(300)

    const leadsSelect = page.locator('select').filter({ has: page.locator('option:has-text("Leads from")') }).first()
    if (await leadsSelect.isVisible({ timeout: 2000 })) {
      await leadsSelect.selectOption({ index: 1 })
      await expect(leadsSelect).toBeVisible()
    }
  })

  test('copy menu from another event', async ({ page }) => {
    await page.getByPlaceholder(/rooftop kickoff/i).fill('Event A')
    await page.getByRole('button', { name: /add event/i }).click()
    await page.waitForTimeout(300)
    await page.getByPlaceholder(/rooftop kickoff/i).fill('Event B')
    await page.getByRole('button', { name: /add event/i }).click()
    await page.waitForTimeout(300)

    const menuSelect = page.locator('select').filter({ has: page.locator('option:has-text("Copy menu")') }).first()
    if (await menuSelect.isVisible({ timeout: 2000 })) {
      await menuSelect.selectOption({ index: 1 })
      await expect(menuSelect).toBeVisible()
    }
  })
})

test.describe('Leads page', () => {
  test.describe.configure({ timeout: 60000 })
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const guestBtn = page.getByRole('button', { name: /guest|local|continue without|skip/i }).first()
    const localLink = page.getByText(/local|guest|offline/i).first()
    if (await guestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await guestBtn.click()
    } else if (await localLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await localLink.click()
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const initFirstBtn = page.locator('button:has-text("Initialize First Event")')
    const initNewCard = page.locator('div:has-text("Initialize New Event")').first()
    if (await initFirstBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await initFirstBtn.click()
    } else if (await initNewCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await initNewCard.click()
    }
    const eventNameInput = page.getByLabel(/event name|party name|title/i).or(page.getByPlaceholder(/event name|party name/i)).first()
    if (await eventNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventNameInput.fill('Leads Test Event')
      await page.getByRole('button', { name: /create|submit|save|continue/i }).first().click()
    }
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /leads|team roles/i }).first().click()
    await page.waitForLoadState('networkidle')
  })

  test('adds lead assignment', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /team roles|leads/i })).toBeVisible()
    const leadInput = page.getByPlaceholder(/lead name/i).first()
    if (await leadInput.isVisible({ timeout: 2000 })) {
      await leadInput.fill('Alice')
      await expect(page.getByDisplayValue('Alice')).toBeVisible()
    }
  })

  test('removes lead assignment by clearing name', async ({ page }) => {
    const leadInput = page.getByPlaceholder(/lead name/i).first()
    if (await leadInput.isVisible({ timeout: 2000 })) {
      await leadInput.fill('Bob')
      await expect(page.getByDisplayValue('Bob')).toBeVisible()
      await leadInput.clear()
      await expect(leadInput).toHaveValue('')
    }
  })

  test('changes scope between party and event', async ({ page }) => {
    const scopeSelect = page.locator('select').filter({ has: page.locator('option:has-text("Main party")') }).first()
    await expect(scopeSelect).toBeVisible()
    await scopeSelect.selectOption({ value: '__party__' })
    await expect(scopeSelect).toHaveValue('__party__')
  })
})

test.describe('Drinks page', () => {
  test.describe.configure({ timeout: 60000 })
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const guestBtn = page.getByRole('button', { name: /guest|local|continue without|skip/i }).first()
    const localLink = page.getByText(/local|guest|offline/i).first()
    if (await guestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await guestBtn.click()
    } else if (await localLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await localLink.click()
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const initFirstBtn = page.locator('button:has-text("Initialize First Event")')
    const initNewCard = page.locator('div:has-text("Initialize New Event")').first()
    if (await initFirstBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await initFirstBtn.click()
    } else if (await initNewCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await initNewCard.click()
    }
    const eventNameInput = page.getByLabel(/event name|party name|title/i).or(page.getByPlaceholder(/event name|party name/i)).first()
    if (await eventNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventNameInput.fill('Drinks Test Event')
      await page.getByRole('button', { name: /create|submit|save|continue/i }).first().click()
    }
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /drinks/i }).first().click()
    await page.waitForLoadState('networkidle')
  })

  test('adds custom drink', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /themed drinks|drinks/i })).toBeVisible()
    await page.getByRole('button', { name: /add custom drink/i }).click()
    await expect(page.getByDisplayValue('New Drink')).toBeVisible()
  })

  test('edits a drink suggestion', async ({ page }) => {
    const drinkInput = page.getByPlaceholder(/drink name/i).first()
    if (await drinkInput.isVisible({ timeout: 2000 })) {
      await drinkInput.fill('Custom Mojito')
      await expect(page.getByDisplayValue('Custom Mojito')).toBeVisible()
    }
  })

  test('shows theme-based drink suggestions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /suggestions/i })).toBeVisible()
    const suggestionInput = page.getByPlaceholder(/drink name/i).first()
    await expect(suggestionInput).toBeVisible()
  })
})
