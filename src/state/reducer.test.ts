import { describe, it, expect } from 'vitest'
import { defaultPartyState } from './defaults'
import { applyEngines } from './engines'
import type { PartyState } from './types'

// Extract and test the reducer logic directly (it's not exported, so we replicate it)
type PartyAction =
  | { type: 'set_state'; payload: PartyState }
  | { type: 'update_core'; payload: Partial<PartyState['core']> }
  | { type: 'update_budget'; payload: Partial<PartyState['budget']> }
  | { type: 'update_invites'; payload: Partial<PartyState['invites']> }
  | { type: 'update_events'; payload: Partial<PartyState['events']> }
  | { type: 'update_leads'; payload: Partial<PartyState['leads']> }
  | { type: 'update_music'; payload: Partial<PartyState['music']> }
  | { type: 'update_menu'; payload: Partial<PartyState['menu']> }
  | { type: 'update_drinks'; payload: Partial<PartyState['drinks']> }
  | { type: 'update_decor'; payload: Partial<PartyState['decor']> }
  | { type: 'update_cleaning'; payload: Partial<PartyState['cleaning']> }
  | { type: 'update_timeline'; payload: Partial<PartyState['timeline']> }
  | { type: 'update_games'; payload: Partial<PartyState['games']> }
  | { type: 'update_venue'; payload: Partial<PartyState['venue']> }
  | { type: 'update_entry'; payload: Partial<PartyState['entry']> }
  | { type: 'update_live'; payload: Partial<PartyState['live']> }
  | { type: 'update_post_party'; payload: Partial<PartyState['postParty']> }
  | { type: 'update_photo_video'; payload: Partial<PartyState['photoVideo']> }
  | { type: 'update_admin'; payload: Partial<PartyState['admin']> }
  | { type: 'update_auth'; payload: Partial<PartyState['auth']> }

function reducer(state: PartyState, action: PartyAction): PartyState {
  switch (action.type) {
    case 'set_state':
      return applyEngines(action.payload)
    case 'update_core':
      return applyEngines({ ...state, core: { ...state.core, ...action.payload } })
    case 'update_budget':
      return applyEngines({ ...state, budget: { ...state.budget, ...action.payload } })
    case 'update_invites':
      return applyEngines({ ...state, invites: { ...state.invites, ...action.payload } })
    case 'update_events':
      return applyEngines({ ...state, events: { ...state.events, ...action.payload } })
    case 'update_leads':
      return applyEngines({ ...state, leads: { ...state.leads, ...action.payload } })
    case 'update_music':
      return applyEngines({ ...state, music: { ...state.music, ...action.payload } })
    case 'update_menu':
      return applyEngines({ ...state, menu: { ...state.menu, ...action.payload } })
    case 'update_drinks':
      return applyEngines({ ...state, drinks: { ...state.drinks, ...action.payload } })
    case 'update_decor':
      return applyEngines({ ...state, decor: { ...state.decor, ...action.payload } })
    case 'update_cleaning':
      return applyEngines({ ...state, cleaning: { ...state.cleaning, ...action.payload } })
    case 'update_timeline':
      return applyEngines({ ...state, timeline: { ...state.timeline, ...action.payload } })
    case 'update_games':
      return applyEngines({ ...state, games: { ...state.games, ...action.payload } })
    case 'update_venue':
      return applyEngines({ ...state, venue: { ...state.venue, ...action.payload } })
    case 'update_entry':
      return applyEngines({ ...state, entry: { ...state.entry, ...action.payload } })
    case 'update_live':
      return applyEngines({ ...state, live: { ...state.live, ...action.payload } })
    case 'update_post_party':
      return applyEngines({ ...state, postParty: { ...state.postParty, ...action.payload } })
    case 'update_photo_video':
      return applyEngines({ ...state, photoVideo: { ...state.photoVideo, ...action.payload } })
    case 'update_admin':
      return applyEngines({ ...state, admin: { ...state.admin, ...action.payload } })
    case 'update_auth':
      return applyEngines({ ...state, auth: { ...state.auth, ...action.payload } })
    default:
      return state
  }
}

const baseState = applyEngines(defaultPartyState)

describe('reducer', () => {
  describe('set_state', () => {
    it('replaces entire state and runs engines', () => {
      const newState = { ...defaultPartyState, core: { ...defaultPartyState.core, name: 'New Party' } }
      const result = reducer(baseState, { type: 'set_state', payload: newState })
      expect(result.core.name).toBe('New Party')
      expect(result.drinks.suggestions.length).toBeGreaterThan(0)
    })
  })

  describe('update_core', () => {
    it('updates party name', () => {
      const result = reducer(baseState, { type: 'update_core', payload: { name: 'Birthday Bash' } })
      expect(result.core.name).toBe('Birthday Bash')
      expect(result.core.theme).toBe('Classic') // unchanged
    })

    it('updates theme and refreshes drink suggestions', () => {
      const result = reducer(baseState, { type: 'update_core', payload: { theme: 'Tropical' } })
      expect(result.core.theme).toBe('Tropical')
      expect(result.drinks.suggestions.some((d) => d.name === 'Pineapple Fizz')).toBe(true)
    })

    it('preserves other core fields when updating one', () => {
      const withDate = reducer(baseState, { type: 'update_core', payload: { date: '2026-04-01' } })
      const result = reducer(withDate, { type: 'update_core', payload: { location: 'Rooftop' } })
      expect(result.core.date).toBe('2026-04-01')
      expect(result.core.location).toBe('Rooftop')
    })
  })

  describe('update_budget', () => {
    it('adds line items', () => {
      const items = [
        { id: '1', label: 'DJ', category: 'other' as const, amount: 200 },
      ]
      const result = reducer(baseState, { type: 'update_budget', payload: { lineItems: items } })
      expect(result.budget.lineItems).toHaveLength(1)
      expect(result.budget.lineItems[0].label).toBe('DJ')
    })

    it('sets budget limit', () => {
      const result = reducer(baseState, { type: 'update_budget', payload: { limit: 500 } })
      expect(result.budget.limit).toBe(500)
    })
  })

  describe('update_invites', () => {
    it('updates guest count and recalculates shopping list', () => {
      const result = reducer(baseState, { type: 'update_invites', payload: { guestCount: 20 } })
      expect(result.invites.guestCount).toBe(20)
      // Shopping list should reflect 20 guests
      const iceItem = result.drinks.shoppingList.find((s) => s.includes('Ice'))
      expect(iceItem).toContain('10') // ceil(20 * 0.5)
    })

    it('updates message templates partially', () => {
      const result = reducer(baseState, {
        type: 'update_invites',
        payload: {
          messageTemplates: {
            ...baseState.invites.messageTemplates,
            arrival: 'New arrival instructions',
          },
        },
      })
      expect(result.invites.messageTemplates.arrival).toBe('New arrival instructions')
      expect(result.invites.messageTemplates.music).toBe(baseState.invites.messageTemplates.music)
    })
  })

  describe('update_events', () => {
    it('adds events', () => {
      const events = [
        { id: 'e1', name: 'Pre-party', date: '2026-04-01', location: 'Bar', link: '', notes: '' },
      ]
      const result = reducer(baseState, { type: 'update_events', payload: { items: events } })
      expect(result.events.items).toHaveLength(1)
      expect(result.events.items[0].name).toBe('Pre-party')
    })
  })

  describe('update_leads', () => {
    it('updates lead assignments', () => {
      const items = baseState.leads.items.map((l) =>
        l.id === 'budget' ? { ...l, leadName: 'Alice' } : l,
      )
      const result = reducer(baseState, { type: 'update_leads', payload: { items } })
      const budget = result.leads.items.find((l) => l.id === 'budget')
      expect(budget?.leadName).toBe('Alice')
    })
  })

  describe('update_menu', () => {
    it('adds menu items', () => {
      const items = [
        { id: 'm1', name: 'Sliders', category: 'mains' as const, source: 'make' as const, servings: 20, notes: '' },
      ]
      const result = reducer(baseState, { type: 'update_menu', payload: { items } })
      expect(result.menu.items).toHaveLength(1)
    })
  })

  describe('update_drinks', () => {
    it('adds extra shopping items', () => {
      const result = reducer(baseState, {
        type: 'update_drinks',
        payload: { extraItems: ['Limes (2 bags)'] },
      })
      expect(result.drinks.extraItems).toEqual(['Limes (2 bags)'])
      expect(result.drinks.shoppingList).toContain('Limes (2 bags)')
    })

    it('adds custom drinks', () => {
      const custom = [
        { id: 'c1', name: 'My Special', type: 'signature' as const, ingredients: ['vodka'], prep: 'Shake' },
      ]
      const result = reducer(baseState, { type: 'update_drinks', payload: { customDrinks: custom } })
      expect(result.drinks.suggestions.some((d) => d.name === 'My Special')).toBe(true)
    })
  })

  describe('update_decor', () => {
    it('adds decor items', () => {
      const items = [
        {
          id: 'd1', name: 'Fairy lights', zone: 'lighting' as const, quantity: 3,
          buyLink: '', eta: '', cost: '$15', status: 'not_started' as const,
          reusable: true, storageNote: '',
        },
      ]
      const result = reducer(baseState, { type: 'update_decor', payload: { items } })
      expect(result.decor.items).toHaveLength(1)
      expect(result.decor.items[0].name).toBe('Fairy lights')
    })
  })

  describe('update_cleaning', () => {
    it('updates bathroom supply status', () => {
      const supplies = baseState.cleaning.bathroomSupplies.map((s) =>
        s.id === 'tp' ? { ...s, status: 'done' as const } : s,
      )
      const result = reducer(baseState, { type: 'update_cleaning', payload: { bathroomSupplies: supplies } })
      const tp = result.cleaning.bathroomSupplies.find((s) => s.id === 'tp')
      expect(tp?.status).toBe('done')
    })
  })

  describe('update_timeline', () => {
    it('adds custom tasks', () => {
      const tasks = [
        ...baseState.timeline.tasks,
        { id: 'custom', title: 'Pick up cake', offsetHours: -4, status: 'not_started' as const },
      ]
      const result = reducer(baseState, { type: 'update_timeline', payload: { tasks } })
      expect(result.timeline.tasks.length).toBe(baseState.timeline.tasks.length + 1)
    })
  })

  describe('update_games', () => {
    it('adds games', () => {
      const games = [
        {
          id: 'g1', name: 'Two Truths', category: 'icebreaker' as const,
          durationMins: 15, groupSize: '4-10', rules: 'Standard', supplies: [],
        },
      ]
      const result = reducer(baseState, { type: 'update_games', payload: { games } })
      expect(result.games.games).toHaveLength(1)
    })
  })

  describe('update_venue', () => {
    it('updates amenity status', () => {
      const amenities = baseState.venue.amenities.map((a) =>
        a.id === 'rooftop' ? { ...a, status: 'reserved' as const } : a,
      )
      const result = reducer(baseState, { type: 'update_venue', payload: { amenities } })
      const rooftop = result.venue.amenities.find((a) => a.id === 'rooftop')
      expect(rooftop?.status).toBe('reserved')
    })

    it('updates propane status', () => {
      const result = reducer(baseState, {
        type: 'update_venue',
        payload: { propane: { ...baseState.venue.propane, level: 'half' } },
      })
      expect(result.venue.propane.level).toBe('half')
    })
  })

  describe('update_entry', () => {
    it('updates arrival texts', () => {
      const result = reducer(baseState, {
        type: 'update_entry',
        payload: { arrivalTexts: ['Call me when here'] },
      })
      expect(result.entry.arrivalTexts).toEqual(['Call me when here'])
    })
  })

  describe('update_live', () => {
    it('toggles restock alerts', () => {
      const result = reducer(baseState, {
        type: 'update_live',
        payload: { restockAlerts: { ...baseState.live.restockAlerts, ice: true } },
      })
      expect(result.live.restockAlerts.ice).toBe(true)
    })

    it('adds quick notes', () => {
      const result = reducer(baseState, {
        type: 'update_live',
        payload: { quickNotes: ['More ice needed'] },
      })
      expect(result.live.quickNotes).toEqual(['More ice needed'])
    })
  })

  describe('update_post_party', () => {
    it('updates post party notes', () => {
      const result = reducer(baseState, {
        type: 'update_post_party',
        payload: { notes: 'Great party!' },
      })
      expect(result.postParty.notes).toBe('Great party!')
    })

    it('records favorite drinks', () => {
      const result = reducer(baseState, {
        type: 'update_post_party',
        payload: { favorites: { ...baseState.postParty.favorites, drinks: ['Old Fashioned'] } },
      })
      expect(result.postParty.favorites.drinks).toEqual(['Old Fashioned'])
    })
  })

  describe('update_photo_video', () => {
    it('adds shot list items', () => {
      const shots = [
        { id: 's1', title: 'Group photo', type: 'photo' as const, status: 'not_started' as const, notes: '' },
      ]
      const result = reducer(baseState, { type: 'update_photo_video', payload: { shots } })
      expect(result.photoVideo.shots).toHaveLength(1)
    })
  })

  describe('update_admin', () => {
    it('toggles module visibility', () => {
      const result = reducer(baseState, {
        type: 'update_admin',
        payload: { modules: { ...baseState.admin.modules, games: false } },
      })
      expect(result.admin.modules.games).toBe(false)
      expect(result.admin.modules.budget).toBe(true) // unchanged
    })
  })

  describe('update_auth', () => {
    it('sets user', () => {
      const user = { id: 'user-1', email: 'test@example.com' }
      const result = reducer(baseState, { type: 'update_auth', payload: { user } })
      expect(result.auth.user).toEqual(user)
    })

    it('marks initialized', () => {
      const result = reducer(baseState, { type: 'update_auth', payload: { initialized: true } })
      expect(result.auth.initialized).toBe(true)
    })
  })

  describe('unknown action', () => {
    it('returns state unchanged', () => {
      const result = reducer(baseState, { type: 'unknown' } as unknown as PartyAction)
      expect(result).toBe(baseState)
    })
  })
})
