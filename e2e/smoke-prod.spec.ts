import { test, expect } from '@playwright/test'

test.describe('Production Smoke Test - Party Commander', () => {
  test('1. Landing/auth screen loads without blank page or crash', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    page.on('pageerror', err => {
      errors.push(`Runtime error: ${err.message}`)
    })

    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })
    
    // Check page is not blank
    const body = await page.locator('body')
    await expect(body).not.toBeEmpty()
    
    // Check for visible content (auth or landing screen)
    const hasContent = await page.locator('h1, h2, button, input').count()
    expect(hasContent).toBeGreaterThan(0)
    
    // Log any console errors
    if (errors.length > 0) {
      console.log('Console errors detected:', errors)
    }
  })

  test('2-5. Guest entry → Create event → Event dashboard → Module page', async ({ page }) => {
    const errors: string[] = []
    const consoleMessages: string[] = []
    
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`)
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    page.on('pageerror', err => {
      errors.push(`Runtime error: ${err.message}`)
    })

    // Step 2: Use local/guest entry path
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Look for guest/local entry options
    const guestButton = page.getByRole('button', { name: /guest|local|continue without|skip/i }).first()
    const localStorageLink = page.getByText(/local|guest|offline/i).first()
    
    let entryFound = false
    if (await guestButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestButton.click()
      entryFound = true
      console.log('✓ Used guest button entry')
    } else if (await localStorageLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await localStorageLink.click()
      entryFound = true
      console.log('✓ Used local storage entry')
    } else {
      // Check if we're already on dashboard/home
      const dashboardHeading = page.getByRole('heading', { name: /dashboard|my events|party command/i }).first()
      if (await dashboardHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
        entryFound = true
        console.log('✓ Already on dashboard (no auth gate)')
      }
    }
    
    if (!entryFound) {
      throw new Error('No guest/local entry path found and not on dashboard')
    }

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle')
    
    // Step 3: Create a new event
    // Try multiple selectors for different button types
    let createFound = false
    
    // Wait a moment for any animations to complete
    await page.waitForTimeout(1000)
    
    // Try the "Initialize First Event" button (visible for empty state)
    const initFirstEventBtn = page.locator('button:has-text("Initialize First Event")')
    if (await initFirstEventBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await initFirstEventBtn.click()
      createFound = true
      console.log('✓ Clicked "Initialize First Event" button')
    }
    
    // Try the clickable "Initialize New Event" card (for when events exist)
    if (!createFound) {
      const initNewEventCard = page.locator('div:has-text("Initialize New Event")').first()
      if (await initNewEventCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await initNewEventCard.click()
        createFound = true
        console.log('✓ Clicked "Initialize New Event" card')
      }
    }
    
    // Try generic create buttons
    if (!createFound) {
      const createEventButton = page.getByRole('button', { name: /create.*event|new.*event|add.*event|\+ event/i }).first()
      if (await createEventButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createEventButton.click()
        createFound = true
        console.log('✓ Clicked create event button')
      }
    }
    
    // Try links
    if (!createFound) {
      const createEventLink = page.getByRole('link', { name: /create.*event|new.*event|\+ event/i }).first()
      if (await createEventLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createEventLink.click()
        createFound = true
        console.log('✓ Clicked create event link')
      }
    }
    
    if (!createFound) {
      // Save screenshot for debugging
      await page.screenshot({ path: 'debug-dashboard.png', fullPage: true })
      console.log('Saved debug screenshot: debug-dashboard.png')
      throw new Error('No create event button or link found on dashboard')
    }

    // Fill in event creation form (if present)
    const eventNameInput = page.getByLabel(/event name|party name|title/i).or(page.getByPlaceholder(/event name|party name/i)).first()
    if (await eventNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventNameInput.fill('Smoke Test Event ' + Date.now())
      console.log('✓ Filled event name')
      
      // Look for submit/create button
      const submitButton = page.getByRole('button', { name: /create|submit|save|continue/i }).first()
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click()
        console.log('✓ Submitted event creation')
      }
    }

    await page.waitForLoadState('networkidle')

    // Step 4: Verify navigation into event dashboard
    const eventDashboardHeading = page.getByRole('heading', { name: /smoke test event|event dashboard|overview/i }).first()
    const eventTabs = page.getByRole('link', { name: /plan|budget|guests|events/i }).first()
    
    const onEventDashboard = 
      await eventDashboardHeading.isVisible({ timeout: 5000 }).catch(() => false) ||
      await eventTabs.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (!onEventDashboard) {
      throw new Error('Event dashboard did not load after creating event')
    }
    console.log('✓ Event dashboard loaded')

    // Step 5: Open an event-scoped module page (prefer Events, Plan, or Budget)
    const moduleLinks = [
      page.getByRole('link', { name: /^events$/i }),
      page.getByRole('link', { name: /^plan$/i }),
      page.getByRole('link', { name: /^budget$/i }),
      page.getByRole('link', { name: /guests/i }),
      page.getByRole('link', { name: /ideas/i }),
    ]

    let moduleOpened = false
    for (const link of moduleLinks) {
      if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
        const linkText = await link.textContent()
        await link.click()
        await page.waitForLoadState('networkidle')
        console.log(`✓ Opened module: ${linkText}`)
        moduleOpened = true
        
        // Verify module page loaded
        const moduleContent = await page.locator('h1, h2, h3').count()
        expect(moduleContent).toBeGreaterThan(0)
        break
      }
    }

    if (!moduleOpened) {
      throw new Error('No event-scoped module pages found or accessible')
    }

    // Log errors summary
    if (errors.length > 0) {
      console.log('\n❌ Errors detected during flow:', errors)
      throw new Error(`Flow completed but encountered ${errors.length} error(s)`)
    } else {
      console.log('\n✓ All steps completed without errors')
    }
  })
})
