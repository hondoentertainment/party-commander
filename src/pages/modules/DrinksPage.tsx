import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { ImagePlus, Trash2, RotateCcw } from 'lucide-react'
import { getShoppingListItems } from '../../state/engines'
import type { DrinkSuggestion, ShoppingListBaseKey } from '../../state/types'

type DrinksConfirming =
  | { type: 'customDrink'; id: string; name: string }
  | { type: 'extraItem'; index: number; name: string }
  | { type: 'quantity'; id: string; name: string }
  | null

export function DrinksPage() {
  const { state, dispatch, currentPartyId } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<DrinksConfirming>(null)
  const [extraItem, setExtraItem] = useState('')
  const [qtyDraft, setQtyDraft] = useState({ name: '', quantity: 1 })
  const customDrinks = state.drinks.customDrinks ?? []
  const drinkOverrides = state.drinks.drinkOverrides ?? {}
  const quantities = state.drinks.quantities ?? []
  const allDrinks: DrinkSuggestion[] = [...state.drinks.suggestions, ...customDrinks]

  const isCustomDrink = (drinkId: string) => customDrinks.some((d) => d.id === drinkId)
  const hasOverride = (drinkId: string) => drinkId in drinkOverrides

  const updateDrink = (drinkId: string, updates: Partial<DrinkSuggestion>) => {
    if (isCustomDrink(drinkId)) {
      const next = customDrinks.map((d) =>
        d.id === drinkId ? { ...d, ...updates } : d,
      )
      dispatch({ type: 'update_drinks', payload: { customDrinks: next } })
    } else {
      dispatch({
        type: 'update_drinks',
        payload: {
          drinkOverrides: {
            ...drinkOverrides,
            [drinkId]: { ...(drinkOverrides[drinkId] ?? {}), ...updates },
          },
        },
      })
    }
  }

  const addCustomDrink = () => {
    dispatch({
      type: 'update_drinks',
      payload: {
        customDrinks: [
          ...customDrinks,
          {
            id: uuid(),
            name: 'New Drink',
            type: 'signature' as const,
            ingredients: [],
            prep: '',
          } satisfies DrinkSuggestion,
        ],
      },
    })
  }

  const removeCustomDrink = (drinkId: string) => {
    if (!isCustomDrink(drinkId)) return
    dispatch({
      type: 'update_drinks',
      payload: { customDrinks: customDrinks.filter((d) => d.id !== drinkId) },
    })
  }

  const resetDrinkOverride = (drinkId: string) => {
    const { [drinkId]: _, ...rest } = drinkOverrides
    dispatch({ type: 'update_drinks', payload: { drinkOverrides: rest } })
  }

  const addExtraItem = () => {
    if (!extraItem.trim()) return
    dispatch({
      type: 'update_drinks',
      payload: { extraItems: [...state.drinks.extraItems, extraItem.trim()] },
    })
    setExtraItem('')
  }

  const removeExtraItem = (index: number) => {
    dispatch({
      type: 'update_drinks',
      payload: {
        extraItems: state.drinks.extraItems.filter((_, i) => i !== index),
      },
    })
  }

  const updateBaseItem = (key: ShoppingListBaseKey, text: string, resetIfEmpty = false) => {
    const val = text.trim()
    if (resetIfEmpty && !val) {
      const { [key]: _, ...rest } = state.drinks.shoppingListOverrides ?? {}
      dispatch({
        type: 'update_drinks',
        payload: { shoppingListOverrides: rest },
      })
      return
    }
    dispatch({
      type: 'update_drinks',
      payload: {
        shoppingListOverrides: {
          ...state.drinks.shoppingListOverrides,
          [key]: val || text,
        },
      },
    })
  }

  const updateExtraItem = (index: number, text: string, removeIfEmpty = false) => {
    const trimmed = text.trim()
    if (removeIfEmpty && !trimmed) {
      removeExtraItem(index)
      return
    }
    const next = [...state.drinks.extraItems]
    next[index] = trimmed || text
    dispatch({
      type: 'update_drinks',
      payload: { extraItems: next },
    })
  }

  const hideBaseItem = (key: ShoppingListBaseKey) => {
    const hidden = state.drinks.hiddenBaseItems ?? []
    dispatch({
      type: 'update_drinks',
      payload: {
        hiddenBaseItems: [...hidden, key],
        shoppingListOverrides: { ...state.drinks.shoppingListOverrides, [key]: undefined },
      },
    })
  }

  const addDrinkQuantity = () => {
    if (!qtyDraft.name.trim()) return
    dispatch({
      type: 'update_drinks',
      payload: {
        quantities: [...quantities, { id: uuid(), name: qtyDraft.name.trim(), quantity: qtyDraft.quantity }],
      },
    })
    setQtyDraft({ name: '', quantity: 1 })
  }

  const updateDrinkQuantity = (id: string, updates: { name?: string; quantity?: number }) => {
    dispatch({
      type: 'update_drinks',
      payload: {
        quantities: quantities.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      },
    })
  }

  const removeDrinkQuantity = (id: string) => {
    dispatch({
      type: 'update_drinks',
      payload: { quantities: quantities.filter((q) => q.id !== id) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Themed Drinks</h3>
      <p className="text-sm text-slate-300">
        Auto-suggestions based on theme plus a customizable shopping list.
      </p>

      <Card>
        <CardTitle>Suggestions</CardTitle>
        <p className="mt-1 text-sm text-slate-400">
          Edit any drink to customize it. Add your own or reset theme drinks to default.
        </p>
        <div className="mt-4 space-y-3">
          {state.drinks.suggestions.map((drink) => (
            <div
              key={drink.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
            >
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={drink.name}
                    onChange={(e) => updateDrink(drink.id, { name: e.target.value })}
                    placeholder="Drink name"
                    className="flex-1 min-w-[140px]"
                  />
                  <Select
                    value={drink.type}
                    onChange={(e) =>
                      updateDrink(drink.id, {
                        type: e.target.value as DrinkSuggestion['type'],
                      })
                    }
                  >
                    <option value="signature">Signature</option>
                    <option value="batch">Batch</option>
                    <option value="na">NA</option>
                  </Select>
                </div>
                <Input
                  value={drink.ingredients.join(', ')}
                  onChange={(e) =>
                    updateDrink(drink.id, {
                      ingredients: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Ingredients (comma-separated)"
                  className="w-full"
                />
                <Input
                  value={drink.prep}
                  onChange={(e) => updateDrink(drink.id, { prep: e.target.value })}
                  placeholder="Preparation notes"
                  className="w-full"
                />
              </div>
              <div className="flex shrink-0 gap-1">
                {hasOverride(drink.id) && !isCustomDrink(drink.id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => resetDrinkOverride(drink.id)}
                    className="px-2 py-1 text-xs"
                    title="Reset to default"
                    aria-label={`Reset ${drink.name} to default`}
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                )}
                {isCustomDrink(drink.id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmingRemove({ type: 'customDrink', id: drink.id, name: drink.name })}
                    className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                    title="Remove drink"
                    aria-label={`Remove ${drink.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addCustomDrink}
          className="mt-4"
        >
          Add custom drink
        </Button>
      </Card>

      <Card>
        <CardTitle>Shopping List</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={extraItem}
            onChange={(event) => setExtraItem(event.target.value)}
            className="flex-1"
            placeholder="Add extra garnish"
          />
          <Button type="button" onClick={addExtraItem}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {getShoppingListItems(state).map((entry) =>
            entry.type === 'base' ? (
              <li
                key={entry.key}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"
              >
                <Input
                  value={entry.text}
                  onChange={(e) => updateBaseItem(entry.key, e.target.value)}
                  onBlur={(e) => updateBaseItem(entry.key, e.target.value, true)}
                  className="flex-1 border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-1"
                  placeholder={entry.key}
                />
                <Button
                  variant="ghost"
                  onClick={() => hideBaseItem(entry.key)}
                  className="text-xs shrink-0"
                >
                  Remove
                </Button>
              </li>
            ) : (
              <li
                key={`extra-${entry.index}`}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"
              >
                <Input
                  value={entry.text}
                  onChange={(e) => updateExtraItem(entry.index, e.target.value)}
                  onBlur={(e) => updateExtraItem(entry.index, e.target.value, true)}
                  className="flex-1 border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-1"
                  placeholder="Item name"
                />
                <Button
                  variant="ghost"
                  onClick={() =>
                    setConfirmingRemove({ type: 'extraItem', index: entry.index, name: entry.text || 'this item' })
                  }
                  className="text-xs shrink-0"
                >
                  Remove
                </Button>
              </li>
            ),
          )}
        </ul>
      </Card>

      <Card>
        <CardTitle>Drink quantities</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Track drink names and quantities (batches, servings, bottles) for planning.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            value={qtyDraft.name}
            onChange={(e) => setQtyDraft({ ...qtyDraft, name: e.target.value })}
            placeholder="Drink name"
            className="w-40"
          />
          <Input
            type="number"
            min={1}
            value={qtyDraft.quantity}
            onChange={(e) => setQtyDraft({ ...qtyDraft, quantity: Number(e.target.value) || 1 })}
            placeholder="Qty"
            className="w-24"
          />
          <Button type="button" onClick={addDrinkQuantity} disabled={!qtyDraft.name.trim()}>
            Add
          </Button>
        </div>
        {quantities.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-slate-400">
                  <th className="py-2 pr-4">Drink</th>
                  <th className="py-2 pr-4">Quantity</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {quantities.map((q) => (
                  <tr key={q.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">
                      <Input
                        value={q.name}
                        onChange={(e) => updateDrinkQuantity(q.id, { name: e.target.value })}
                        className="border-0 bg-transparent py-1"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <Input
                        type="number"
                        min={1}
                        value={q.quantity}
                        onChange={(e) => updateDrinkQuantity(q.id, { quantity: Number(e.target.value) || 1 })}
                        className="w-20 border-0 bg-transparent py-1"
                      />
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-rose-400"
                        onClick={() =>
                          setConfirmingRemove({ type: 'quantity', id: q.id, name: q.name })
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {allDrinks.length > 0 && (
        <Card>
          <CardTitle>Cost & Yield Tracker</CardTitle>
          <p className="mt-1 text-xs text-slate-400">Track cost per drink and batch yields for budgeting.</p>
          <div className="mt-4 space-y-2">
            {allDrinks.map((drink) => {
              const costPerDrink = state.drinks.costPerDrink?.[drink.id] ?? 0
              const batchYield = state.drinks.batchYield?.[drink.id] ?? 0
              return (
                <div key={`cost-${drink.id}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-white/5 px-4 py-2 text-sm">
                  <span className="min-w-[8rem] font-medium text-slate-300">{drink.name}</span>
                  <label className="flex items-center gap-1 text-xs text-slate-400">
                    $/drink
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={costPerDrink || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'update_drinks',
                          payload: {
                            costPerDrink: { ...state.drinks.costPerDrink, [drink.id]: Number(e.target.value) || 0 },
                          },
                        })
                      }
                      className="w-20"
                      placeholder="0"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-slate-400">
                    Batch yield
                    <Input
                      type="number"
                      min={0}
                      value={batchYield || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'update_drinks',
                          payload: {
                            batchYield: { ...state.drinks.batchYield, [drink.id]: Number(e.target.value) || 0 },
                          },
                        })
                      }
                      className="w-20"
                      placeholder="0"
                    />
                  </label>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Bar Layout Notes</CardTitle>
        <Textarea
          value={state.drinks.barLayoutNotes ?? ''}
          onChange={(e) =>
            dispatch({ type: 'update_drinks', payload: { barLayoutNotes: e.target.value } })
          }
          rows={3}
          className="mt-3"
          placeholder="Describe your bar setup: ice station placement, drink stations, garnish area..."
        />
      </Card>

      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => {
          if (!confirmingRemove) return
          if (confirmingRemove.type === 'customDrink') removeCustomDrink(confirmingRemove.id)
          else if (confirmingRemove.type === 'extraItem') removeExtraItem(confirmingRemove.index)
          else if (confirmingRemove.type === 'quantity') removeDrinkQuantity(confirmingRemove.id)
        }}
        title="Remove item"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.name}"? This cannot be undone.`
            : ''
        }
      />

      <Card>
        <CardTitle>Drink pictures</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Store and view drink photos in the Photo/Video module.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="rounded-xl bg-white/5 p-4 text-center">
            <ImagePlus className="mx-auto size-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-white">
              {state.photoVideo.photos.length} photo{state.photoVideo.photos.length !== 1 ? 's' : ''} stored
            </p>
            <Link to={currentPartyId ? `/event/${currentPartyId}/photo-video` : '/events'}>
              <Button variant="outline" size="sm" className="mt-2">
                Open Photo Gallery
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DrinksPage
