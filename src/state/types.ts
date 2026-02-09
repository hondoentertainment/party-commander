export type Theme =
  | 'Classic'
  | 'Rooftop'
  | 'Tropical'
  | 'Disco'
  | 'Game Night'
  | 'Cozy'
  | 'Minimal'
  | 'Custom'

export type ItemStatus = 'not_started' | 'in_progress' | 'done'
export type SourceType = 'make' | 'order' | 'potluck'

export interface PartyCore {
  name: string
  theme: Theme
  customTheme: string
  date: string
  location: string
}

export interface Invites {
  partifulLink: string
  guestCount: number
  messageTemplates: {
    arrival: string
    music: string
    rooftop: string
  }
}

export interface MenuItem {
  id: string
  name: string
  category: 'snacks' | 'mains' | 'dessert' | 'late_night'
  source: SourceType
  servings: number
  notes: string
}

export interface MenuState {
  items: MenuItem[]
}

export interface DrinkSuggestion {
  id: string
  name: string
  type: 'signature' | 'batch' | 'na'
  ingredients: string[]
  prep: string
}

export interface DrinksState {
  suggestions: DrinkSuggestion[]
  shoppingList: string[]
  extraItems: string[]
}

export interface DecorItem {
  id: string
  name: string
  zone: 'entry' | 'living_room' | 'table' | 'lighting' | 'bathroom'
  quantity: number
  buyLink: string
  eta: string
  cost: string
  status: ItemStatus
  reusable: boolean
  storageNote: string
}

export interface DecorState {
  items: DecorItem[]
}

export interface CleaningChecklist {
  id: string
  label: string
  phase: 'before' | 'during' | 'after'
  status: ItemStatus
}

export interface BathroomSupply {
  id: string
  name: string
  status: ItemStatus
}

export interface CleaningState {
  checklists: CleaningChecklist[]
  bathroomSupplies: BathroomSupply[]
}

export interface TimelineTask {
  id: string
  title: string
  offsetHours: number
  status: ItemStatus
}

export interface TimelineState {
  tasks: TimelineTask[]
}

export interface MusicState {
  mainLink: string
  playlists: {
    pregame: string
    arrival: string
    peak: string
    late: string
    windDown: string
  }
}

export interface Game {
  id: string
  name: string
  category: 'icebreaker' | 'main' | 'chaos' | 'wind_down'
  durationMins: number
  groupSize: string
  rules: string
  supplies: string[]
}

export interface GamesState {
  games: Game[]
}

export interface Amenity {
  id: string
  name: 'Party Room' | 'Rooftop' | 'Grill Area'
  status: 'not_checked' | 'pending' | 'reserved'
  reservationLink: string
  confirmationNote: string
}

export interface PropaneStatus {
  level: 'full' | 'three_quarter' | 'half' | 'quarter' | 'empty' | 'unknown'
  lastChecked: string
  noGrillFallback: boolean
}

export interface VenueState {
  amenities: Amenity[]
  propane: PropaneStatus
}

export interface EntryState {
  instructions: string
  butterflyLink: string
  arrivalTexts: string[]
}

export interface LiveState {
  restockAlerts: {
    ice: boolean
    cups: boolean
    mixers: boolean
    trash: boolean
  }
  quickNotes: string[]
}

export interface PostPartyState {
  cleanupChecklist: string[]
  leftovers: string[]
  notes: string
  favorites: {
    drinks: string[]
    games: string[]
    playlists: string[]
  }
}

export interface PartyState {
  core: PartyCore
  invites: Invites
  menu: MenuState
  drinks: DrinksState
  decor: DecorState
  cleaning: CleaningState
  timeline: TimelineState
  music: MusicState
  games: GamesState
  venue: VenueState
  entry: EntryState
  live: LiveState
  postParty: PostPartyState
}
