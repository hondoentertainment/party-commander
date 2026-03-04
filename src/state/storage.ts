import type { PartyState } from './types'

const STORAGE_KEY = 'party-command-center'
const LAST_PARTY_KEY = 'party-command-center-last-party'
const STORAGE_VERSION = 1

interface StoredState {
  version: number
  data: PartyState
}

export function loadState(): PartyState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredState
    if (parsed.version !== STORAGE_VERSION) return null
    return parsed.data
  } catch {
    return null
  }
}

export function saveState(state: PartyState) {
  const payload: StoredState = {
    version: STORAGE_VERSION,
    data: state,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function getLastPartyId(): string | null {
  return localStorage.getItem(LAST_PARTY_KEY)
}

export function setLastPartyId(partyId: string | null) {
  if (partyId) localStorage.setItem(LAST_PARTY_KEY, partyId)
  else localStorage.removeItem(LAST_PARTY_KEY)
}

const HIDDEN_FROM_HOME_KEY = 'party-command-center-hidden-from-home'

export function getHiddenFromHomePartyIds(): string[] {
  try {
    const raw = localStorage.getItem(HIDDEN_FROM_HOME_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function addPartyToHiddenFromHome(partyId: string): void {
  const ids = new Set(getHiddenFromHomePartyIds())
  ids.add(partyId)
  localStorage.setItem(HIDDEN_FROM_HOME_KEY, JSON.stringify([...ids]))
}

export function removePartyFromHiddenFromHome(partyId: string): void {
  const ids = getHiddenFromHomePartyIds().filter((id) => id !== partyId)
  localStorage.setItem(HIDDEN_FROM_HOME_KEY, JSON.stringify(ids))
}

const LOCAL_PARTIES_KEY = 'party-command-center-local-parties'

export interface LocalPartyRow {
  id: string
  party_profile_id: string
  name: string
  state: unknown
  created_at: string
  updated_at: string
}

export function getLocalParties(): LocalPartyRow[] {
  try {
    const raw = localStorage.getItem(LOCAL_PARTIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalParties(rows: LocalPartyRow[]): void {
  localStorage.setItem(LOCAL_PARTIES_KEY, JSON.stringify(rows))
}

export function addLocalParty(row: LocalPartyRow): void {
  const rows = getLocalParties().filter((r) => r.id !== row.id)
  rows.unshift(row)
  saveLocalParties(rows)
}

export function updateLocalParty(partyId: string, state: unknown): void {
  const rows = getLocalParties()
  const idx = rows.findIndex((r) => r.id === partyId)
  if (idx < 0) return
  rows[idx] = { ...rows[idx], state, updated_at: new Date().toISOString() }
  saveLocalParties(rows)
}

export function isLocalParty(partyId: string): boolean {
  return getLocalParties().some((p) => p.id === partyId)
}
