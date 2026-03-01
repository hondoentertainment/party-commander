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
import { supabase } from '../services/auth'
import { PartyProfileService, type PartyProfile } from '../services/partyProfile'
import { PartyService, type PartyRow } from '../services/parties'
import { applyEngines } from './engines'
import { defaultPartyState } from './defaults'
import { getLastPartyId, loadState, saveState, setLastPartyId } from './storage'
import type { PartyState } from './types'

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
  const [partyProfile, setPartyProfile] = useState<PartyProfile | null>(null)
  const [currentPartyId, setCurrentPartyId] = useState<string | null>(null)
  const [parties, setParties] = useState<PartyRow[]>([])
  const [partyLoading, setPartyLoading] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [state, dispatch] = useReducer(reducer, defaultPartyState, () => {
    const stored = loadState()
    return mergeStoredWithDefaults(stored)
  })

  const refreshParties = useCallback(async () => {
    if (!partyProfile) return
    const user = state.auth.user as { id: string } | null
    const list = await PartyService.list(partyProfile.id, user?.id)
    setParties(list)
  }, [partyProfile, state.auth.user])

  const switchParty = useCallback(
    async (id: string) => {
      const row = await PartyService.get(id)
      if (!row) return
      const stored = row.state as Partial<PartyState>
      const merged = mergeStoredWithDefaults(stored)
      dispatch({
        type: 'set_state',
        payload: { ...merged, auth: state.auth },
      })
      setCurrentPartyId(id)
      setLastPartyId(id)
    },
    [state.auth]
  )

  const createParty = useCallback(
    async (useCurrentState = true) => {
      if (!partyProfile) throw new Error('No party profile')
      const initialState = useCurrentState ? state : { ...defaultPartyState, core: { ...defaultPartyState.core, name: '' }, auth: state.auth }
      const row = await PartyService.create(partyProfile.id, initialState)
      setCurrentPartyId(row.id)
      setLastPartyId(row.id)
      setParties((prev) => [row, ...prev])
      if (!useCurrentState) {
        dispatch({ type: 'set_state', payload: { ...applyEngines(initialState), auth: state.auth } })
      }
      return row.id
    },
    [partyProfile, state]
  )

  // Auth state change
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'update_auth', payload: { user: session?.user ?? null, initialized: true } })
    })
    return () => subscription.unsubscribe()
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

        const list = await PartyService.list(profile.id, user.id)
        if (cancelled) return
        setParties(list)

        const lastId = getLastPartyId()
        const toLoad = list.find((p) => p.id === lastId) ?? list[0]
        if (toLoad) {
          const row = await PartyService.get(toLoad.id)
          if (cancelled || !row) return
          const stored = row.state as Partial<PartyState>
          const merged = mergeStoredWithDefaults(stored)
          dispatch({
            type: 'set_state',
            payload: { ...merged, auth },
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
        if (!cancelled) console.error('Failed to load party profile:', err)
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
      PartyService.update(currentPartyId, state).catch(console.error)
      saveTimeoutRef.current = null
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [state, currentPartyId, state.auth.user])

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
