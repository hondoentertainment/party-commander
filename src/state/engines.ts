import type {
  DrinkSuggestion,
  PartyState,
  ShoppingListBaseKey,
  Theme,
  TimelineTask,
} from './types'

const themeDrinks: Record<Theme, DrinkSuggestion[]> = {
  Classic: [
    {
      id: 'old-fashioned',
      name: 'Old Fashioned',
      type: 'signature',
      ingredients: ['bourbon', 'bitters', 'sugar cube', 'orange peel'],
      prep: 'Batch spirit + bitters, garnish to order.',
    },
  ],
  Rooftop: [
    {
      id: 'spritz',
      name: 'Summer Spritz',
      type: 'batch',
      ingredients: ['aperitif', 'sparkling wine', 'soda', 'citrus'],
      prep: 'Mix base ahead, top with bubbles on arrival.',
    },
  ],
  Tropical: [
    {
      id: 'pineapple-fizz',
      name: 'Pineapple Fizz',
      type: 'signature',
      ingredients: ['rum', 'pineapple juice', 'lime', 'club soda'],
      prep: 'Shake and top with soda.',
    },
  ],
  Disco: [
    {
      id: 'sparkle-martini',
      name: 'Sparkle Martini',
      type: 'signature',
      ingredients: ['vodka', 'elderflower', 'lemon', 'glitter garnish'],
      prep: 'Chill, shake, serve in coupe.',
    },
  ],
  'Game Night': [
    {
      id: 'citrus-punch',
      name: 'Citrus Punch',
      type: 'batch',
      ingredients: ['vodka', 'orange', 'lime', 'ginger ale'],
      prep: 'Combine in pitcher, serve over ice.',
    },
  ],
  Cozy: [
    {
      id: 'spiced-mule',
      name: 'Spiced Mule',
      type: 'signature',
      ingredients: ['ginger beer', 'vodka', 'cinnamon', 'lime'],
      prep: 'Build in mug with garnish.',
    },
  ],
  Minimal: [
    {
      id: 'highball',
      name: 'Simple Highball',
      type: 'signature',
      ingredients: ['whiskey', 'soda', 'lemon'],
      prep: 'Build over ice.',
    },
  ],
  Custom: [],
}

export function buildDrinkSuggestions(theme: Theme): DrinkSuggestion[] {
  const picks = themeDrinks[theme] ?? []
  const na: DrinkSuggestion = {
    id: 'sparkling-citrus',
    name: 'Sparkling Citrus',
    type: 'na',
    ingredients: ['sparkling water', 'orange', 'lime', 'mint'],
    prep: 'Build over ice, garnish with mint.',
  }
  return [...picks, na]
}

export function buildTimelineTasks(): TimelineTask[] {
  return [
    { id: 't-48', title: 'Confirm venue + propane check', offsetHours: -48, status: 'not_started' },
    { id: 't-24', title: 'Finalize menu + order items', offsetHours: -24, status: 'not_started' },
    { id: 't-6', title: 'Set up decor + chill drinks', offsetHours: -6, status: 'not_started' },
    { id: 't-2', title: 'Ice, cups, and mixers on deck', offsetHours: -2, status: 'not_started' },
  ]
}

const BASE_KEYS: ShoppingListBaseKey[] = ['ice', 'cups', 'napkins']

export type ShoppingListItem =
  | { type: 'base'; key: ShoppingListBaseKey; text: string }
  | { type: 'extra'; text: string; index: number }

/** Returns shopping list items with metadata for editing (base vs extra). */
export function getShoppingListItems(state: PartyState): ShoppingListItem[] {
  const guestCount = Math.max(0, state.invites.guestCount)
  const overrides = state.drinks.shoppingListOverrides ?? {}
  const hidden = new Set(state.drinks.hiddenBaseItems ?? [])

  const defaults: Record<ShoppingListBaseKey, string> = {
    ice: `Ice (${Math.ceil(guestCount * 0.5)} bags)`,
    cups: `Cups (${Math.ceil(guestCount * 1.5)} units)`,
    napkins: `Napkins (${Math.ceil(guestCount * 1.5)} units)`,
  }

  const baseItems: ShoppingListItem[] = BASE_KEYS.filter((key) => !hidden.has(key)).map(
    (key) => ({ type: 'base' as const, key, text: overrides[key] ?? defaults[key] }),
  )
  const extraItems: ShoppingListItem[] = state.drinks.extraItems.map((text, index) => ({
    type: 'extra' as const,
    text,
    index,
  }))

  return [...baseItems, ...extraItems]
}

export function buildShoppingList(state: PartyState): string[] {
  return getShoppingListItems(state).map((item) => item.text)
}

export function applyEngines(state: PartyState): PartyState {
  const theme = state.core.theme
  return {
    ...state,
    drinks: {
      ...state.drinks,
      suggestions: buildDrinkSuggestions(theme),
      shoppingList: buildShoppingList(state),
    },
    timeline: {
      ...state.timeline,
      tasks: state.timeline.tasks.length ? state.timeline.tasks : buildTimelineTasks(),
    },
  }
}
