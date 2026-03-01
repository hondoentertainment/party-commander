import type { PartyState, Theme } from './types'

const defaultTheme: Theme = 'Classic'

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
    partifulLink: 'https://partiful.com/e/7prpqOz68SjhM3qC4Cdk?c=09OfrcKm',
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
  leads: {
    items: [
      { id: 'budget', function: 'Budget', leadName: '' },
      { id: 'invites', function: 'Invites', leadName: '' },
      { id: 'events', function: 'Events', leadName: '' },
      { id: 'leads', function: 'Leads', leadName: '' },
      { id: 'menu', function: 'Menu', leadName: '' },
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
    ],
  },
  menu: {
    items: [],
  },
  drinks: {
    suggestions: [],
    shoppingList: [],
    extraItems: [],
    shoppingListOverrides: {},
    hiddenBaseItems: [],
    drinkOverrides: {},
    customDrinks: [],
  },
  decor: {
    items: [],
  },
  cleaning: {
    checklists: [],
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
      profile: true,
      budget: true,
      invites: true,
      events: true,
      leads: true,
      menu: true,
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
      admin: true,
    },
  },
  auth: {
    user: null,
    initialized: false,
  },
}
