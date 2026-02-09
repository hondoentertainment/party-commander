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
  invites: {
    partifulLink: '',
    guestCount: 0,
    messageTemplates: {
      arrival: 'Doors open at 7. Buzz in when you arrive.',
      music: 'Add your favorite song here: [playlist link]',
      rooftop: 'Rooftop rules: keep noise down after 10.',
    },
  },
  menu: {
    items: [],
  },
  drinks: {
    suggestions: [],
    shoppingList: [],
    extraItems: [],
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
      { id: 'freshener', name: 'Freshener', status: 'not_started' },
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
}
