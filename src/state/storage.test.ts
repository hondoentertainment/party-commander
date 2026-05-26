import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadState,
  saveState,
  getLastPartyId,
  setLastPartyId,
  isGuestModeEnabled,
  setGuestModeEnabled,
  getHiddenFromHomePartyIds,
  addPartyToHiddenFromHome,
  removePartyFromHiddenFromHome,
  getLocalParties,
  saveLocalParties,
  addLocalParty,
  updateLocalParty,
  isLocalParty,
} from './storage'
import { defaultPartyState } from './defaults'

beforeEach(() => {
  localStorage.clear()
})

describe('loadState / saveState', () => {
  it('returns null when nothing is stored', () => {
    expect(loadState()).toBeNull()
  })

  it('round-trips state through save and load', () => {
    const state = { ...defaultPartyState, core: { ...defaultPartyState.core, name: 'Test' } }
    saveState(state)
    const loaded = loadState()
    expect(loaded).not.toBeNull()
    expect(loaded!.core.name).toBe('Test')
  })

  it('returns null for corrupted JSON', () => {
    localStorage.setItem('party-command-center', '{bad json')
    expect(loadState()).toBeNull()
  })

  it('returns null for wrong version', () => {
    localStorage.setItem('party-command-center', JSON.stringify({ version: 999, data: {} }))
    expect(loadState()).toBeNull()
  })
})

describe('lastPartyId', () => {
  it('returns null when not set', () => {
    expect(getLastPartyId()).toBeNull()
  })

  it('stores and retrieves party ID', () => {
    setLastPartyId('party-123')
    expect(getLastPartyId()).toBe('party-123')
  })

  it('clears party ID when set to null', () => {
    setLastPartyId('party-123')
    setLastPartyId(null)
    expect(getLastPartyId()).toBeNull()
  })
})

describe('guestMode', () => {
  it('defaults to false', () => {
    expect(isGuestModeEnabled()).toBe(false)
  })

  it('enables guest mode', () => {
    setGuestModeEnabled(true)
    expect(isGuestModeEnabled()).toBe(true)
  })

  it('disables guest mode', () => {
    setGuestModeEnabled(true)
    setGuestModeEnabled(false)
    expect(isGuestModeEnabled()).toBe(false)
  })
})

describe('hiddenFromHome', () => {
  it('returns empty array by default', () => {
    expect(getHiddenFromHomePartyIds()).toEqual([])
  })

  it('adds party to hidden list', () => {
    addPartyToHiddenFromHome('p1')
    expect(getHiddenFromHomePartyIds()).toEqual(['p1'])
  })

  it('deduplicates party IDs', () => {
    addPartyToHiddenFromHome('p1')
    addPartyToHiddenFromHome('p1')
    expect(getHiddenFromHomePartyIds()).toEqual(['p1'])
  })

  it('removes party from hidden list', () => {
    addPartyToHiddenFromHome('p1')
    addPartyToHiddenFromHome('p2')
    removePartyFromHiddenFromHome('p1')
    expect(getHiddenFromHomePartyIds()).toEqual(['p2'])
  })

  it('handles corrupted storage gracefully', () => {
    localStorage.setItem('party-command-center-hidden-from-home', '{bad}')
    expect(getHiddenFromHomePartyIds()).toEqual([])
  })
})

describe('localParties', () => {
  const makeRow = (id: string, name: string) => ({
    id,
    party_profile_id: 'local',
    name,
    state: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  it('returns empty array by default', () => {
    expect(getLocalParties()).toEqual([])
  })

  it('saves and retrieves local parties', () => {
    const rows = [makeRow('p1', 'Party 1')]
    saveLocalParties(rows)
    expect(getLocalParties()).toHaveLength(1)
    expect(getLocalParties()[0].name).toBe('Party 1')
  })

  it('adds a local party at the beginning', () => {
    addLocalParty(makeRow('p1', 'First'))
    addLocalParty(makeRow('p2', 'Second'))
    const parties = getLocalParties()
    expect(parties[0].id).toBe('p2')
    expect(parties[1].id).toBe('p1')
  })

  it('replaces existing party with same ID on add', () => {
    addLocalParty(makeRow('p1', 'First'))
    addLocalParty(makeRow('p1', 'Updated'))
    const parties = getLocalParties()
    expect(parties).toHaveLength(1)
    expect(parties[0].name).toBe('Updated')
  })

  it('updates local party state', () => {
    addLocalParty(makeRow('p1', 'First'))
    updateLocalParty('p1', { newData: true })
    const parties = getLocalParties()
    expect(parties[0].state).toEqual({ newData: true })
  })

  it('does nothing when updating non-existent party', () => {
    addLocalParty(makeRow('p1', 'First'))
    updateLocalParty('p999', { data: true })
    expect(getLocalParties()).toHaveLength(1)
  })

  it('detects local parties', () => {
    addLocalParty(makeRow('p1', 'First'))
    expect(isLocalParty('p1')).toBe(true)
    expect(isLocalParty('p999')).toBe(false)
  })

  it('handles corrupted storage gracefully', () => {
    localStorage.setItem('party-command-center-local-parties', 'not json')
    expect(getLocalParties()).toEqual([])
  })
})
