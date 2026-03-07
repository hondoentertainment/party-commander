import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'

export function MenuPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; name: string } | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [draft, setDraft] = useState({
    name: '',
    category: 'snacks' as const,
    source: 'make' as const,
    servings: 0,
    notes: '',
  })

  const isPartyScope = selectedEventId === null || selectedEventId === '__party__'
  const currentMenuItems = isPartyScope
    ? state.menu.items
    : (state.events.items.find((e) => e.id === selectedEventId)?.menuItems ?? [])

  const addItem = () => {
    if (!draft.name.trim()) return
    const nextItem = {
      id: uuid(),
      name: draft.name.trim(),
      category: draft.category,
      source: draft.source,
      servings: draft.servings,
      notes: draft.notes.trim(),
    }
    if (isPartyScope) {
      const nextItems = [...state.menu.items, nextItem]
      dispatch({ type: 'update_menu', payload: { items: nextItems } })
      syncFoodTimeline(nextItems)
    } else {
      const ev = state.events.items.find((e) => e.id === selectedEventId)
      if (!ev) return
      const nextItems = [...(ev.menuItems ?? []), nextItem]
      dispatch({
        type: 'update_events',
        payload: {
          items: state.events.items.map((e) =>
            e.id === selectedEventId ? { ...e, menuItems: nextItems } : e,
          ),
        },
      })
    }
    setDraft({ name: '', category: 'snacks', source: 'make', servings: 0, notes: '' })
  }

  const syncFoodTimeline = (items: typeof state.menu.items) => {
    const names = items.map((item) => item.name).filter(Boolean)
    const title =
      names.length === 0 ? 'Food items: add menu items' : `Food items: ${names.join(', ')}`
    const existing = state.timeline.tasks.find((task) => task.id === 'menu-food-task')
    const nextTask = {
      id: 'menu-food-task',
      title,
      offsetHours: existing?.offsetHours ?? -24,
      status: existing?.status ?? 'not_started',
    }
    const otherTasks = state.timeline.tasks.filter((task) => task.id !== 'menu-food-task')
    dispatch({ type: 'update_timeline', payload: { tasks: [...otherTasks, nextTask] } })
  }

  const getSuggestedServings = (
    category: typeof state.menu.items[number]['category'],
    guestCount: number,
  ) => {
    const count = Math.max(guestCount, 0)
    const multiplier =
      category === 'mains'
        ? 0.8
        : category === 'snacks'
          ? 0.5
          : category === 'dessert'
            ? 0.4
            : 0.3
    return Math.max(1, Math.ceil(count * multiplier))
  }

  const applySuggestions = () => {
    if (state.invites.guestCount <= 0 || currentMenuItems.length === 0) return
    const nextItems = currentMenuItems.map((item) =>
      item.servings > 0
        ? item
        : { ...item, servings: getSuggestedServings(item.category, state.invites.guestCount) },
    )
    if (isPartyScope) {
      dispatch({ type: 'update_menu', payload: { items: nextItems } })
      syncFoodTimeline(nextItems)
    } else {
      dispatch({
        type: 'update_events',
        payload: {
          items: state.events.items.map((e) =>
            e.id === selectedEventId ? { ...e, menuItems: nextItems } : e,
          ),
        },
      })
    }
  }

  const removeItem = (id: string) => {
    const nextItems = currentMenuItems.filter((item) => item.id !== id)
    if (isPartyScope) {
      dispatch({ type: 'update_menu', payload: { items: nextItems } })
      syncFoodTimeline(nextItems)
    } else {
      dispatch({
        type: 'update_events',
        payload: {
          items: state.events.items.map((e) =>
            e.id === selectedEventId ? { ...e, menuItems: nextItems } : e,
          ),
        },
      })
    }
  }

  const updateItem = (id: string, updates: Partial<(typeof state.menu.items)[0]>) => {
    const nextItems = currentMenuItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    )
    if (isPartyScope) {
      dispatch({ type: 'update_menu', payload: { items: nextItems } })
      syncFoodTimeline(nextItems)
    } else {
      dispatch({
        type: 'update_events',
        payload: {
          items: state.events.items.map((e) =>
            e.id === selectedEventId ? { ...e, menuItems: nextItems } : e,
          ),
        },
      })
    }
  }

  const copyMenuToEvent = (targetEventId: string) => {
    const menuItems = currentMenuItems.map((m) => ({ ...m, id: uuid() }))
    dispatch({
      type: 'update_events',
      payload: {
        items: state.events.items.map((e) =>
          e.id === targetEventId ? { ...e, menuItems } : e,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Menu Builder</h3>
      <p className="text-sm text-slate-300">
        Add items by category and source to build prep lists. Menus are per event.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400">Scope:</span>
        <Select
          value={selectedEventId ?? '__party__'}
          onChange={(e) => setSelectedEventId(e.target.value === '__party__' ? null : e.target.value)}
          className="w-48"
        >
          <option value="__party__">Main party</option>
          {state.events.items.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name || 'Unnamed event'}</option>
          ))}
        </Select>
        {currentMenuItems.length > 0 && (
          <Select
            value=""
            onChange={(e) => {
              const target = e.target.value
              if (target) {
                copyMenuToEvent(target)
                e.target.value = ''
              }
            }}
            className="w-40 text-sm"
          >
            <option value="">Copy menu to event...</option>
            {state.events.items
              .filter((ev) => ev.id !== selectedEventId)
              .map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name || 'Unnamed'}</option>
              ))}
          </Select>
        )}
      </div>

      <Card>
        <CardTitle>Suggested servings</CardTitle>
        <p className="mt-2 text-sm text-slate-300">
          Based on {state.invites.guestCount || 'your'} guests. Apply suggestions to items with
          0 servings.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          <span>Snacks: ~0.5 per guest</span>
          <span>Mains: ~0.8 per guest</span>
          <span>Dessert: ~0.4 per guest</span>
          <span>Late-night: ~0.3 per guest</span>
        </div>
        <Button type="button" className="mt-4" onClick={applySuggestions} disabled={currentMenuItems.length === 0}>
          Apply suggestions
        </Button>
      </Card>

      <Card>
        <CardTitle>Add menu item{!isPartyScope ? ` (${state.events.items.find((e) => e.id === selectedEventId)?.name || 'Event'})` : ''}</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Item name
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2"
              placeholder="Buffalo sliders"
            />
          </label>
          <label className="text-sm text-slate-300">
            Category
            <Select
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value as typeof draft.category })
              }
              className="mt-2"
            >
              <option value="snacks">Snacks</option>
              <option value="mains">Mains</option>
              <option value="dessert">Dessert</option>
              <option value="late_night">Late-night snacks</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Source
            <Select
              value={draft.source}
              onChange={(event) =>
                setDraft({ ...draft, source: event.target.value as typeof draft.source })
              }
              className="mt-2"
            >
              <option value="make">Make</option>
              <option value="order">Order</option>
              <option value="potluck">Potluck</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Servings
            <Input
              type="number"
              min={0}
              value={draft.servings}
              onChange={(event) =>
                setDraft({ ...draft, servings: Number(event.target.value) })
              }
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Notes
            <Input
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              className="mt-2"
              placeholder="Order by Friday"
            />
          </label>
        </div>
        <Button type="button" onClick={addItem} className="mt-4">
          Add item
        </Button>
      </Card>

      <Card>
        <CardTitle>Menu list</CardTitle>
        {currentMenuItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No items yet. Add items above or copy from another event.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {currentMenuItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div>
                  <Input
                    value={item.name}
                    onChange={(event) => updateItem(item.id, { name: event.target.value })}
                    className="mb-2"
                  />
                  <div className="grid gap-2 md:grid-cols-3">
                    <Select
                      value={item.category}
                      onChange={(event) =>
                        updateItem(item.id, {
                          category: event.target.value as typeof item.category,
                        })
                      }
                    >
                      <option value="snacks">Snacks</option>
                      <option value="mains">Mains</option>
                      <option value="dessert">Dessert</option>
                      <option value="late_night">Late-night</option>
                    </Select>
                    <Select
                      value={item.source}
                      onChange={(event) =>
                        updateItem(item.id, { source: event.target.value as typeof item.source })
                      }
                    >
                      <option value="make">Make</option>
                      <option value="order">Order</option>
                      <option value="potluck">Potluck</option>
                    </Select>
                    <Input
                      type="number"
                      min={0}
                      value={item.servings}
                      onChange={(event) =>
                        updateItem(item.id, { servings: Number(event.target.value) })
                      }
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Suggested servings:{' '}
                    {getSuggestedServings(item.category, state.invites.guestCount)}
                  </p>
                  <Input
                    value={item.notes}
                    onChange={(event) => updateItem(item.id, { notes: event.target.value })}
                    className="mt-2"
                    placeholder="Notes"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setConfirmingRemove({ id: item.id, name: item.name })}
                  variant="outline"
                  className="px-3 py-1 text-xs"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeItem(confirmingRemove.id) }}
        title="Remove menu item"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.name}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default MenuPage
