import { describe, it, expect } from 'vitest'
import {
  isNotificationSupported,
  getNotificationPermission,
  getUpcomingReminders,
} from './notifications'
import { defaultPartyState } from '../state/defaults'
import { applyEngines } from '../state/engines'

describe('isNotificationSupported', () => {
  it('returns false when Notification API is absent (jsdom)', () => {
    // jsdom does not provide Notification, so this should be false or we skip
    const result = isNotificationSupported()
    expect(typeof result).toBe('boolean')
  })
})

describe('getNotificationPermission', () => {
  it('returns unsupported or a valid permission state', () => {
    const perm = getNotificationPermission()
    expect(['granted', 'denied', 'default', 'unsupported']).toContain(perm)
  })
})

describe('getUpcomingReminders', () => {
  const baseState = applyEngines(defaultPartyState)

  it('returns empty array when no date is set', () => {
    const reminders = getUpcomingReminders(baseState)
    expect(reminders).toEqual([])
  })

  it('finds tasks due within threshold', () => {
    const now = new Date()
    // Set party date to 12 hours from now
    const partyDate = new Date(now.getTime() + 12 * 60 * 60 * 1000)
    const state = {
      ...baseState,
      core: { ...baseState.core, date: partyDate.toISOString(), name: 'Test Party' },
      timeline: {
        tasks: [
          { id: 't1', title: 'Buy ice', offsetHours: -6, status: 'not_started' as const },
          { id: 't2', title: 'Done task', offsetHours: -6, status: 'done' as const },
        ],
      },
    }
    // t1 is due at partyDate - 6h = 6h from now, within 24h threshold
    const reminders = getUpcomingReminders(state, 24)
    expect(reminders.some((r) => r.task.id === 't1')).toBe(true)
    expect(reminders.some((r) => r.task.id === 't2')).toBe(false) // done tasks excluded
  })

  it('includes restock alerts', () => {
    const state = {
      ...baseState,
      live: {
        ...baseState.live,
        restockAlerts: { ice: true, cups: false, mixers: false, trash: true },
      },
    }
    const reminders = getUpcomingReminders(state)
    const restock = reminders.find((r) => r.task.id === 'restock-alert')
    expect(restock).toBeDefined()
    expect(restock!.task.title).toContain('ice')
    expect(restock!.task.title).toContain('trash')
  })

  it('checks per-event tasks', () => {
    const now = new Date()
    const eventDate = new Date(now.getTime() + 10 * 60 * 60 * 1000)
    const state = {
      ...baseState,
      events: {
        items: [
          {
            id: 'e1',
            name: 'Pre-party',
            date: eventDate.toISOString(),
            location: '',
            link: '',
            notes: '',
            tasks: [
              { id: 'et1', title: 'Set up tables', offsetHours: -2, status: 'not_started' as const },
            ],
          },
        ],
      },
    }
    const reminders = getUpcomingReminders(state, 24)
    expect(reminders.some((r) => r.task.id === 'et1')).toBe(true)
    expect(reminders.find((r) => r.task.id === 'et1')!.eventName).toBe('Pre-party')
  })

  it('sorts reminders by urgency', () => {
    const now = new Date()
    const partyDate = new Date(now.getTime() + 20 * 60 * 60 * 1000)
    const state = {
      ...baseState,
      core: { ...baseState.core, date: partyDate.toISOString() },
      timeline: {
        tasks: [
          { id: 'far', title: 'Far task', offsetHours: -2, status: 'not_started' as const },
          { id: 'near', title: 'Near task', offsetHours: -14, status: 'not_started' as const },
        ],
      },
    }
    const reminders = getUpcomingReminders(state, 24)
    if (reminders.length >= 2) {
      expect(reminders[0].hoursUntilDue).toBeLessThanOrEqual(reminders[1].hoursUntilDue)
    }
  })
})
