import { describe, it, expect } from 'vitest'
import { buildDrinkSuggestions, buildTimelineTasks, getShoppingListItems, applyEngines } from './engines'
import { defaultPartyState } from './defaults'

describe('buildDrinkSuggestions', () => {
  it('returns theme-specific drinks for Classic', () => {
    const drinks = buildDrinkSuggestions('Classic')
    expect(drinks).toHaveLength(2) // Old Fashioned + NA
    expect(drinks[0].name).toBe('Old Fashioned')
    expect(drinks[1].type).toBe('na')
  })

  it('returns theme-specific drinks for Rooftop', () => {
    const drinks = buildDrinkSuggestions('Rooftop')
    expect(drinks.some((d) => d.name === 'Summer Spritz')).toBe(true)
  })

  it('always includes NA option', () => {
    const drinks = buildDrinkSuggestions('Minimal')
    expect(drinks.some((d) => d.type === 'na')).toBe(true)
  })

  it('returns NA only for Custom theme', () => {
    const drinks = buildDrinkSuggestions('Custom')
    expect(drinks).toHaveLength(1)
    expect(drinks[0].type).toBe('na')
  })
})

describe('buildTimelineTasks', () => {
  it('returns 4 default tasks', () => {
    const tasks = buildTimelineTasks()
    expect(tasks).toHaveLength(4)
    expect(tasks.map((t) => t.offsetHours)).toEqual([-48, -24, -6, -2])
  })
})

describe('getShoppingListItems', () => {
  it('computes ice/cups/napkins from guest count', () => {
    const state = {
      ...defaultPartyState,
      invites: { ...defaultPartyState.invites, guestCount: 10 },
    }
    const items = getShoppingListItems(state)
    const ice = items.find((i) => i.type === 'base' && i.key === 'ice')
    expect(ice).toBeDefined()
    if (ice && ice.type === 'base') {
      expect(ice.text).toContain('5') // ceil(10 * 0.5)
    }
  })
})

describe('applyEngines', () => {
  it('populates drinks from theme', () => {
    const state = applyEngines(defaultPartyState)
    expect(state.drinks.suggestions.length).toBeGreaterThan(0)
  })

  it('replaces empty timeline with defaults', () => {
    const state = applyEngines({
      ...defaultPartyState,
      timeline: { tasks: [] },
    })
    expect(state.timeline.tasks.length).toBe(4)
  })

  it('preserves existing timeline tasks', () => {
    const withTasks = {
      ...defaultPartyState,
      timeline: {
        tasks: [
          { id: 'custom', title: 'Custom task', offsetHours: -12, status: 'not_started' as const },
        ],
      },
    }
    const state = applyEngines(withTasks)
    expect(state.timeline.tasks).toHaveLength(1)
    expect(state.timeline.tasks[0].title).toBe('Custom task')
  })
})
