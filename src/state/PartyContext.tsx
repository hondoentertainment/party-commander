import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { applyEngines } from './engines'
import { defaultPartyState } from './defaults'
import { loadState, saveState } from './storage'
import type { PartyState } from './types'

type PartyAction =
  | { type: 'set_state'; payload: PartyState }
  | { type: 'update_core'; payload: Partial<PartyState['core']> }
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

function reducer(state: PartyState, action: PartyAction): PartyState {
  switch (action.type) {
    case 'set_state':
      return applyEngines(action.payload)
    case 'update_core':
      return applyEngines({ ...state, core: { ...state.core, ...action.payload } })
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
    default:
      return state
  }
}

const PartyContext = createContext<{
  state: PartyState
  dispatch: React.Dispatch<PartyAction>
} | null>(null)

export function PartyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultPartyState, () => {
    const stored = loadState()
    const merged = stored
      ? {
          ...defaultPartyState,
          ...stored,
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
    return applyEngines(merged)
  })

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <PartyContext.Provider value={value}>{children}</PartyContext.Provider>
}

export function useParty() {
  const context = useContext(PartyContext)
  if (!context) {
    throw new Error('useParty must be used within PartyProvider')
  }
  return context
}
