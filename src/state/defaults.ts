import type { CleaningChecklist, LeadAssignment, PartyState, Theme } from './types'

/** Default cleaning checklist items by phase */
export const defaultCleaningChecklists: CleaningChecklist[] = [
  { id: 'before-1', label: 'Vacuum and dust', phase: 'before', status: 'not_started' },
  { id: 'before-2', label: 'Clear clutter and put away valuables', phase: 'before', status: 'not_started' },
  { id: 'before-3', label: 'Stock bathroom supplies', phase: 'before', status: 'not_started' },
  { id: 'before-4', label: 'Set up trash cans with liners', phase: 'before', status: 'not_started' },
  { id: 'before-5', label: 'Prepare hand towels and napkins', phase: 'before', status: 'not_started' },
  { id: 'during-1', label: 'Wipe down bathroom surfaces', phase: 'during', status: 'not_started' },
  { id: 'during-2', label: 'Empty trash if getting full', phase: 'during', status: 'not_started' },
  { id: 'during-3', label: 'Refresh hand soap and paper products', phase: 'during', status: 'not_started' },
  { id: 'during-4', label: 'Quick sweep of high-traffic areas', phase: 'during', status: 'not_started' },
  { id: 'after-1', label: 'Collect and take out trash', phase: 'after', status: 'not_started' },
  { id: 'after-2', label: 'Wipe down surfaces and tables', phase: 'after', status: 'not_started' },
  { id: 'after-3', label: 'Vacuum or sweep floors', phase: 'after', status: 'not_started' },
  { id: 'after-4', label: 'Restock bathroom for next day', phase: 'after', status: 'not_started' },
  { id: 'after-5', label: 'Put away decorations and supplies', phase: 'after', status: 'not_started' },
]

const defaultTheme: Theme = 'Classic'

/** Default lead roles for copying to new events */
export const defaultLeadsTemplate: LeadAssignment[] = [
  { id: 'budget', function: 'Budget', leadName: '' },
  { id: 'invites', function: 'Invites', leadName: '' },
  { id: 'events', function: 'Events', leadName: '' },
  { id: 'leads', function: 'Leads', leadName: '' },
  { id: 'food', function: 'Food', leadName: '' },
  { id: 'drinks', function: 'Drinks', leadName: '' },
  { id: 'decor', function: 'Decor & Ambience', leadName: '' },
  { id: 'cleaning', function: 'Cleaning & Bathroom', leadName: '' },
  { id: 'timeline', function: 'Timeline & Calendar', leadName: '' },
  { id: 'music', function: 'Music Hub', leadName: '' },
  { id: 'games', function: 'Game Generator', leadName: '' },
  { id: 'venue', function: 'Venue & Rooftop', leadName: '' },
  { id: 'entry', function: 'Entry Mode', leadName: '' },
  { id: 'live', function: 'Live Party', leadName: '' },
  { id: 'post_party', function: 'Post-Party Wrap', leadName: '' },
  { id: 'photo_video', function: 'Photo/Video Shoot', leadName: '' },
]

export const defaultPartyState: PartyState = {
  core: {
    name: 'My Party',
    theme: defaultTheme,
    customTheme: '',
    date: '',
    location: '',
  },
  budget: {
    lineItems: [],
    limit: undefined,
  },
  invites: {
    partifulLink: '',
    guestCount: 0,
    messageTemplates: {
      arrival: 'Doors open at 7. Buzz in when you arrive.',
      music: 'Add your favorite song here:',
      rooftop: 'Rooftop rules: keep noise down after 10.',
    },
  },
  events: {
    items: [],
  },
  leads: { items: defaultLeadsTemplate },
  menu: {
    items: [],
  },
  drinks: {
    suggestions: [],
    shoppingList: [],
    extraItems: [],
    quantities: [],
    shoppingListOverrides: {},
    hiddenBaseItems: [],
    drinkOverrides: {},
    customDrinks: [],
  },
  decor: {
    items: [],
  },
  cleaning: {
    checklists: defaultCleaningChecklists,
    bathroomExtras: [],
    bathroomSupplies: [
      { id: 'tp', name: 'Toilet paper', status: 'not_started' },
      { id: 'soap', name: 'Hand soap', status: 'not_started' },
      { id: 'towels', name: 'Towels', status: 'not_started' },
      { id: 'liners', name: 'Trash liners', status: 'not_started' },
      { id: 'freshener', name: 'Air Freshener', status: 'not_started' },
    ],
  },
  timeline: {
    tasks: [],
  },
  music: {
    mainLink: '',
    playlists: {
      pregame: '',
      arrival: '',
      peak: '',
      late: '',
      windDown: '',
    },
  },
  games: {
    games: [],
  },
  venue: {
    amenities: [
      {
        id: 'party-room',
        name: 'Party Room',
        status: 'not_checked',
        reservationLink: '',
        confirmationNote: '',
      },
      {
        id: 'apartment',
        name: 'My Apartment',
        status: 'reserved',
        reservationLink: '',
        confirmationNote: '',
      },
      {
        id: 'rooftop',
        name: 'Rooftop',
        status: 'not_checked',
        reservationLink: '',
        confirmationNote: '',
      },
      {
        id: 'grill-area',
        name: 'Grill Area',
        status: 'not_checked',
        reservationLink: '',
        confirmationNote: '',
      },
    ],
    propane: {
      level: 'unknown',
      lastChecked: '',
      noGrillFallback: false,
    },
  },
  entry: {
    instructions: '',
    butterflyLink: '',
    arrivalTexts: ['Buzz in when you arrive', 'Text me when you are downstairs'],
  },
  live: {
    restockAlerts: {
      ice: false,
      cups: false,
      mixers: false,
      trash: false,
    },
    quickNotes: [],
  },
  postParty: {
    cleanupChecklist: [],
    leftovers: [],
    notes: '',
    favorites: {
      drinks: [],
      games: [],
      playlists: [],
    },
  },
  photoVideo: {
    shots: [],
    equipment: [],
    photos: [],
  },
  admin: {
    modules: {
      home: true,
      plan: true,
      budget: true,
      invites: true,
      events: true,
      leads: true,
      food: true,
      drinks: true,
      decor: true,
      cleaning: true,
      timeline: true,
      music: true,
      games: true,
      venue: true,
      entry: true,
      live: true,
      photo_video: true,
      post_party: true,
      profile: true,
      admin: true,
    },
  },
  auth: {
    user: null,
    initialized: false,
  },
}
