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
  /** Set when user completes onboarding wizard; hides the wizard even before party is created */
  onboardingComplete?: boolean
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

export type ShoppingListBaseKey = 'ice' | 'cups' | 'napkins'

/** Drink quantity for planning (name, number of servings/batches) */
export interface DrinkQuantity {
  id: string
  name: string
  quantity: number
}

export interface DrinksState {
  suggestions: DrinkSuggestion[]
  shoppingList: string[]
  extraItems: string[]
  /** Table of drink names and quantities for planning */
  quantities?: DrinkQuantity[]
  /** User overrides for base shopping list items (ice, cups, napkins) */
  shoppingListOverrides?: Partial<Record<ShoppingListBaseKey, string>>
  /** Base items to hide from the list */
  hiddenBaseItems?: ShoppingListBaseKey[]
  /** Per-drink overrides (by id) - merges with theme suggestions */
  drinkOverrides?: Partial<Record<string, Partial<DrinkSuggestion>>>
  /** User-added custom drinks */
  customDrinks?: DrinkSuggestion[]
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
  quantity?: number
}

/** Extra bathroom item added by user */
export interface BathroomExtraItem {
  id: string
  name: string
  quantity: number
  status: ItemStatus
}

export interface CleaningState {
  checklists: CleaningChecklist[]
  bathroomSupplies: BathroomSupply[]
  /** Additional bathroom items added by user */
  bathroomExtras?: BathroomExtraItem[]
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
  /** Optional link to access the game (e.g. rules page, external game) */
  link?: string
}

export interface GamesState {
  games: Game[]
}

export interface Amenity {
  id: string
  name: 'Party Room' | 'Rooftop' | 'Grill Area' | 'My Apartment'
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

export interface PhotoVideoShot {
  id: string
  title: string
  type: 'photo' | 'video'
  status: ItemStatus
  notes: string
}

export interface GalleryPhoto {
  id: string
  /** @deprecated Use storagePath + url for new uploads. Kept for backward compatibility. */
  dataUrl?: string
  /** Storage path in Supabase (e.g. partyId/photoId.jpg) */
  storagePath?: string
  /** Public URL from Supabase Storage */
  url?: string
  caption: string
  addedAt: string
  filename: string
}

export interface PhotoVideoState {
  shots: PhotoVideoShot[]
  equipment: string[]
  photos: GalleryPhoto[]
}

export interface AdminState {
  modules: Record<string, boolean>
}

export interface BudgetLineItem {
  id: string
  label: string
  category: 'decor' | 'food' | 'drinks' | 'venue' | 'supplies' | 'other'
  amount: number
  notes?: string
}

export interface BudgetState {
  lineItems: BudgetLineItem[]
  /** Optional budget limit in dollars */
  limit?: number
}

export interface PartyProfileInfo {
  id: string
  name: string
  owner_id: string
}

export interface PartySummary {
  id: string
  name: string
  updated_at: string
  party_profile_id: string
}

export interface PartyState {
  core: PartyCore
  invites: Invites
  budget: BudgetState
  events: {
    items: PartyEvent[]
  }
  leads: {
    items: LeadAssignment[]
  }
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
  photoVideo: PhotoVideoState
  admin: AdminState
  auth: {
    user: any | null
    initialized: boolean
  }
}

export interface LeadAssignment {
  id: string
  function: string
  leadName: string
}

export interface PartyEvent {
  id: string
  name: string
  date: string
  location: string
  link: string
  notes: string
  /** Person responsible for this event */
  leadName?: string
  /** Per-event tasks (timeline tasks for this event) */
  tasks?: TimelineTask[]
  /** Per-event lead assignments */
  leads?: LeadAssignment[]
  /** Per-event menu items */
  menuItems?: MenuItem[]
}
