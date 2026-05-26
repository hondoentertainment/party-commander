import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { v4 as uuid } from 'uuid'
import { supabase } from '../services/auth'
import { PartyProfileService, type PartyProfile } from '../services/partyProfile'
import { PartyService, type PartyRow } from '../services/parties'
import { EventService } from '../services/events'
import { useToast } from '../context/ToastContext'
import { applyEngines } from './engines'
import { defaultPartyState } from './defaults'
import { getLastPartyId, getLocalParties, addLocalParty, updateLocalParty, isLocalParty, loadState, saveState, setLastPartyId } from './storage'
import type { PartyState } from './types'
import type { PartyEvent } from './types'

/** Ensure each event has a unique id for shareability and sync across collaborators */
function normalizeEvents(items: PartyEvent[] | undefined): PartyEvent[] {
  if (!Array.isArray(items)) return []
  const seen = new Set<string>()
  return items.map((e) => {
    const id = e?.id && typeof e.id === 'string' && !seen.has(e.id) ? e.id : uuid()
    seen.add(id)
    return { ...e, id }
  })
}

function getLocalPartyOwnerKeys(profileId: string | null, userId: string | null): string[] {
  return [profileId, userId ? `local:${userId}` : null, 'local'].filter(
    (value): value is string => Boolean(value),
  )
}

function getLocalPartiesForOwner(profileId: string | null, userId: string | null): PartyRow[] {
  const ownerKeys = new Set(getLocalPartyOwnerKeys(profileId, userId))
  return getLocalParties().filter((party) => ownerKeys.has(party.party_profile_id)) as PartyRow[]
}

function mergePartyLists(remote: PartyRow[], local: PartyRow[]): PartyRow[] {
  const seen = new Set(remote.map((party) => party.id))
  const merged = [...remote]
  for (const party of local) {
    if (!seen.has(party.id)) {
      seen.add(party.id)
      merged.unshift(party)
    }
  }
  merged.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )
  return merged
}

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

function mergeStoredWithDefaults(stored: Partial<PartyState> | null): PartyState {
  const base = stored
    ? {
        ...defaultPartyState,
        ...stored,
        budget: {
          ...defaultPartyState.budget,
          ...(stored.budget ?? {}),
          lineItems: stored.budget?.lineItems ?? defaultPartyState.budget.lineItems,
        },
        events: {
          ...defaultPartyState.events,
          ...stored.events,
          items: normalizeEvents(stored.events?.items),
        },
        photoVideo: {
          ...defaultPartyState.photoVideo,
          ...stored.photoVideo,
          photos: stored.photoVideo?.photos ?? defaultPartyState.photoVideo.photos,
        },
        admin: {
          ...defaultPartyState.admin,
          ...stored.admin,
          modules: {
            ...defaultPartyState.admin.modules,
            ...(stored.admin?.modules ?? {}),
          },
        },
      }
    : defaultPartyState
  return applyEngines(base)
}

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

type PartyContextValue = {
  state: PartyState
  dispatch: React.Dispatch<PartyAction>
  partyProfile: PartyProfile | null
  currentPartyId: string | null
  parties: PartyRow[]
  partyLoading: boolean
  switchParty: (id: string) => Promise<void>
  createParty: (useCurrentState?: boolean) => Promise<string>
  refreshParties: () => Promise<void>
}

const PartyContext = createContext<PartyContextValue | null>(null)

export function PartyProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast()
  const [partyProfile, setPartyProfile] = useState<PartyProfile | null>(null)
  const [currentPartyId, setCurrentPartyId] = useState<string | null>(null)
  const [parties, setParties] = useState<PartyRow[]>([])
  const [partyLoading, setPartyLoading] = useState(true)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [state, dispatch] = useReducer(reducer, defaultPartyState, () => {
    const stored = loadState()
    return mergeStoredWithDefaults(stored)
  })

  const restockAlertsRef = useRef(state.live.restockAlerts)
  restockAlertsRef.current = state.live.restockAlerts

  const RESTOCK_LABELS: Record<string, string> = {
    ice: 'Ice',
    cups: 'Cups',
    mixers: 'Mixers',
    trash: 'Trash',
  }

  const refreshParties = useCallback(async () => {
    const user = state.auth.user as { id: string } | null
    const localParties = getLocalPartiesForOwner(partyProfile?.id ?? null, user?.id ?? null)
    if (!partyProfile) {
      setParties(localParties)
      return
    }
    const remoteParties = await PartyService.list(partyProfile.id, user?.id)
    setParties(mergePartyLists(remoteParties, localParties))
  }, [partyProfile, state.auth.user])

  const switchParty = useCallback(
    async (id: string) => {
      let row = await PartyService.get(id)
      if (!row) {
        const local = getLocalParties().find((p) => p.id === id)
        if (local) row = local as PartyRow
      }
      if (!row) {
        throw new Error('Party not found')
      }
      const stored = row.state as Partial<PartyState>
      const merged = mergeStoredWithDefaults(stored)
      let events = merged.events.items
      try {
        const dbEvents = await EventService.listByParty(id)
        if (dbEvents.length > 0) {
          events = dbEvents.map((dbEv) => {
            const stateEv = merged.events.items.find((e) => e.id === dbEv.id)
            return {
              ...dbEv,
              tasks: stateEv?.tasks,
              leads: stateEv?.leads,
              menuItems: stateEv?.menuItems,
            }
          })
        }
      } catch {
        // Fallback to embedded events from party state
      }
      dispatch({
        type: 'set_state',
        payload: { ...merged, events: { items: events }, auth: state.auth },
      })
      setCurrentPartyId(id)
      setLastPartyId(id)
      setParties((prev) => mergePartyLists(prev, [row]))
    },
    [state.auth]
  )

  const createParty = useCallback(
    async (useCurrentState = true): Promise<string> => {
      const user = state.auth.user as { id: string } | null
      const initialState = useCurrentState ? state : { ...defaultPartyState, core: { ...defaultPartyState.core, name: '' }, auth: state.auth }
      const localOwnerKey = partyProfile?.id ?? (user?.id ? `local:${user.id}` : 'local')

      // Try Supabase first if we have a real profile
      if (partyProfile) {
        try {
          const row = await PartyService.create(partyProfile.id, initialState)
          setCurrentPartyId(row.id)
          setLastPartyId(row.id)
          setParties((prev) => mergePartyLists(prev, [row]))
          if (!useCurrentState) {
            dispatch({ type: 'set_state', payload: { ...applyEngines(initialState), auth: state.auth } })
          }
          return row.id
        } catch (error) {
          console.error('Falling back to local party creation:', error)
          // Fall through to local creation
        }
      }

      // Fallback: create locally
      const id = uuid()
      const now = new Date().toISOString()
      const { auth: _a, ...stateForStore } = initialState
      const row: PartyRow = {
        id,
        party_profile_id: localOwnerKey,
        name: initialState.core.name || 'New Party',
        state: stateForStore,
        created_at: now,
        updated_at: now,
      }
      addLocalParty(row)
      setCurrentPartyId(id)
      setLastPartyId(id)
      setParties((prev) => mergePartyLists(prev, [row]))
      if (!useCurrentState) {
        dispatch({ type: 'set_state', payload: { ...applyEngines(initialState), auth: state.auth } })
      }
      return id
    },
    [partyProfile, state]
  )

  // Auth state change + bootstrap getSession (prevents infinite spinner if callback is delayed)
  useEffect(() => {
    let mounted = true
    const init = (user: unknown) => {
      if (mounted) dispatch({ type: 'update_auth', payload: { user, initialized: true } })
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => init(session?.user ?? null))
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) init(session?.user ?? null)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Load party profile and parties when user logs in
  useEffect(() => {
    const user = state.auth.user as { id: string } | null
    if (!user?.id || !state.auth.initialized) {
      setPartyProfile(null)
      setCurrentPartyId(null)
      setParties([])
      setPartyLoading(false)
      return
    }

    const auth = state.auth
    let cancelled = false
    setPartyLoading(true)

    ;(async () => {
      try {
        const profile = await PartyProfileService.ensureForUser(user.id)
        if (cancelled) return
        setPartyProfile(profile)

        const remoteParties = await PartyService.list(profile.id, user.id)
        const localForProfile = getLocalPartiesForOwner(profile.id, user.id)
        const list = mergePartyLists(remoteParties, localForProfile)
        if (cancelled) return
        setParties(list)

        const lastId = getLastPartyId()
        const toLoad = list.find((p) => p.id === lastId) ?? list[0]
        if (toLoad) {
          let row = await PartyService.get(toLoad.id)
          if (!row && isLocalParty(toLoad.id)) row = toLoad
          if (cancelled || !row) return
          const stored = row.state as Partial<PartyState>
          const merged = mergeStoredWithDefaults(stored)
          let events = merged.events.items
          try {
            const dbEvents = await EventService.listByParty(row.id)
            if (dbEvents.length > 0) {
              events = dbEvents.map((dbEv) => {
                const stateEv = merged.events.items.find((e) => e.id === dbEv.id)
                return {
                  ...dbEv,
                  tasks: stateEv?.tasks,
                  leads: stateEv?.leads,
                  menuItems: stateEv?.menuItems,
                }
              })
            }
          } catch {
            // Fallback to embedded events from party state
          }
          dispatch({
            type: 'set_state',
            payload: { ...merged, events: { items: events }, auth },
          })
          setCurrentPartyId(row.id)
          setLastPartyId(row.id)
        } else {
          dispatch({
            type: 'set_state',
            payload: {
              ...defaultPartyState,
              core: { ...defaultPartyState.core, name: '' },
              auth,
            },
          })
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load party profile:', err)
          const localParties = getLocalPartiesForOwner(null, user.id)
          setPartyProfile(null)
          setParties(localParties)
          const toLoad = localParties.find((party) => party.id === getLastPartyId()) ?? localParties[0]
          if (toLoad) {
            const stored = toLoad.state as Partial<PartyState>
            const merged = mergeStoredWithDefaults(stored)
            dispatch({
              type: 'set_state',
              payload: { ...merged, auth },
            })
            setCurrentPartyId(toLoad.id)
            setLastPartyId(toLoad.id)
          } else {
            dispatch({
              type: 'set_state',
              payload: {
                ...defaultPartyState,
                core: { ...defaultPartyState.core, name: '' },
                auth,
              },
            })
          }
        }
      } finally {
        if (!cancelled) setPartyLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [state.auth.user?.id, state.auth.initialized])

  // Persist: localStorage (always) + Supabase (when logged in with current party)
  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const user = state.auth.user as { id: string } | null
    if (!user || !currentPartyId) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      if (isLocalParty(currentPartyId)) {
        const { auth: _a, ...rest } = state
        updateLocalParty(currentPartyId, rest)
      } else {
        PartyService.update(currentPartyId, state).catch((err) => {
          console.error('PartyService.update failed:', err)
          addToast('Could not save – check connection', 'error')
        })
        EventService.sync(currentPartyId, state.events.items).catch((err) => {
          console.error('EventService.sync failed:', err)
          addToast('Could not sync events', 'error')
        })
      }
      saveTimeoutRef.current = null
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [state, currentPartyId, state.auth.user, addToast])

  // Supabase Realtime: subscribe to party updates from co-hosts for live restock alerts
  useEffect(() => {
    if (!currentPartyId || isLocalParty(currentPartyId) || !state.auth.user) return

    const channel = supabase
      .channel(`party:${currentPartyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'parties',
          filter: `id=eq.${currentPartyId}`,
        },
        (payload) => {
          const row = payload.new as PartyRow | undefined
          const remoteState = row?.state as { live?: { restockAlerts?: Record<string, boolean> } } | undefined
          const newAlerts = remoteState?.live?.restockAlerts

          if (!newAlerts || typeof newAlerts !== 'object') return

          const prevAlerts = restockAlertsRef.current
          const merged = { ...prevAlerts, ...newAlerts }

          const prevMap = prevAlerts as Record<string, boolean>
          const newlySet = (Object.keys(newAlerts) as (keyof typeof prevAlerts)[]).filter(
            (key) => newAlerts[key] === true && prevMap[key] === false,
          )

          if (newlySet.length > 0) {
            dispatch({
              type: 'update_live',
              payload: { restockAlerts: merged },
            })
            for (const key of newlySet) {
              const label = RESTOCK_LABELS[key] ?? key
              addToast(`Co-host marked ${label} needs restocking`, 'info')
            }
          } else if (JSON.stringify(merged) !== JSON.stringify(prevAlerts)) {
            dispatch({
              type: 'update_live',
              payload: { restockAlerts: merged },
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentPartyId, state.auth.user, addToast])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      partyProfile,
      currentPartyId,
      parties,
      partyLoading,
      switchParty,
      createParty,
      refreshParties,
    }),
    [
      state,
      partyProfile,
      currentPartyId,
      parties,
      partyLoading,
      switchParty,
      createParty,
      refreshParties,
    ]
  )

  return <PartyContext.Provider value={value}>{children}</PartyContext.Provider>
}

export function useParty() {
  const context = useContext(PartyContext)
  if (!context) {
    throw new Error('useParty must be used within PartyProvider')
  }
  return context
}
