import { useState } from 'react'
import { useParty } from '../state/PartyContext'
import { v4 as uuid } from 'uuid'

export function InvitesPage() {
  const { state, dispatch } = useParty()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = async (key: 'arrival' | 'music' | 'rooftop') => {
    const value = state.invites.messageTemplates[key]
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      setCopiedKey(null)
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Invites Hub</h3>
      <p className="text-sm text-slate-500">
        Track the Partiful link, RSVP count, and reusable message templates.
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Event Details</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            Partiful link
            <input
              value={state.invites.partifulLink}
              onChange={(event) =>
                dispatch({ type: 'update_invites', payload: { partifulLink: event.target.value } })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="https://partiful.com/e/..."
            />
          </label>
          <label className="text-sm text-slate-600">
            RSVP guest count
            <input
              type="number"
              min={0}
              value={state.invites.guestCount}
              onChange={(event) =>
                dispatch({
                  type: 'update_invites',
                  payload: { guestCount: Number(event.target.value) },
                })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Message Templates</h4>
        <div className="mt-4 space-y-4">
          {(['arrival', 'music', 'rooftop'] as const).map((key) => (
            <label key={key} className="block text-sm text-slate-600">
              {key === 'arrival' && 'Arrival instructions'}
              {key === 'music' && 'Music share link'}
              {key === 'rooftop' && 'Rooftop details'}
              <div className="mt-2 flex gap-2">
                <textarea
                  value={state.invites.messageTemplates[key]}
                  onChange={(event) =>
                    dispatch({
                      type: 'update_invites',
                      payload: {
                        messageTemplates: {
                          ...state.invites.messageTemplates,
                          [key]: event.target.value,
                        },
                      },
                    })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(key)}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedKey === key ? 'Copied' : 'Copy'}
                </button>
              </div>
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}

export function MenuPage() {
  const { state, dispatch } = useParty()
  const [draft, setDraft] = useState({
    name: '',
    category: 'snacks' as const,
    source: 'make' as const,
    servings: 0,
    notes: '',
  })

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
    dispatch({
      type: 'update_menu',
      payload: { items: [...state.menu.items, nextItem] },
    })
    setDraft({ name: '', category: 'snacks', source: 'make', servings: 0, notes: '' })
  }

  const removeItem = (id: string) => {
    dispatch({
      type: 'update_menu',
      payload: { items: state.menu.items.filter((item) => item.id !== id) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Menu Builder</h3>
      <p className="text-sm text-slate-500">
        Add items by category and source to build prep lists.
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Add menu item</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            Item name
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Buffalo sliders"
            />
          </label>
          <label className="text-sm text-slate-600">
            Category
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value as typeof draft.category })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="snacks">Snacks</option>
              <option value="mains">Mains</option>
              <option value="dessert">Dessert</option>
              <option value="late_night">Late-night</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Source
            <select
              value={draft.source}
              onChange={(event) =>
                setDraft({ ...draft, source: event.target.value as typeof draft.source })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="make">Make</option>
              <option value="order">Order</option>
              <option value="potluck">Potluck</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Servings
            <input
              type="number"
              min={0}
              value={draft.servings}
              onChange={(event) =>
                setDraft({ ...draft, servings: Number(event.target.value) })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600 md:col-span-2">
            Notes
            <input
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Order by Friday"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Add item
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Menu list</h4>
        {state.menu.items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No items yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.menu.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs uppercase text-slate-500">
                    {item.category} · {item.source} · {item.servings} servings
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function DrinksPage() {
  const { state, dispatch } = useParty()
  const [extraItem, setExtraItem] = useState('')

  const addExtraItem = () => {
    if (!extraItem.trim()) return
    dispatch({
      type: 'update_drinks',
      payload: { extraItems: [...state.drinks.extraItems, extraItem.trim()] },
    })
    setExtraItem('')
  }

  const removeExtraItem = (item: string) => {
    dispatch({
      type: 'update_drinks',
      payload: { extraItems: state.drinks.extraItems.filter((entry) => entry !== item) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Themed Drinks</h3>
      <p className="text-sm text-slate-500">
        Auto-suggestions based on theme plus a customizable shopping list.
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Suggestions</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {state.drinks.suggestions.map((drink) => (
            <li key={drink.id} className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{drink.name}</p>
                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs uppercase text-slate-600">
                  {drink.type}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {drink.ingredients.join(', ')}
              </p>
              <p className="mt-2 text-xs text-slate-500">{drink.prep}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Shopping List</h4>
        <div className="mt-4 flex gap-2">
          <input
            value={extraItem}
            onChange={(event) => setExtraItem(event.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Add extra garnish"
          />
          <button
            type="button"
            onClick={addExtraItem}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {state.drinks.shoppingList.map((item) => (
            <li key={item} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>{item}</span>
              {state.drinks.extraItems.includes(item) ? (
                <button
                  type="button"
                  onClick={() => removeExtraItem(item)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function DecorPage() {
  const { state, dispatch } = useParty()
  const [draft, setDraft] = useState({
    name: '',
    zone: 'entry' as const,
    quantity: 1,
    buyLink: '',
    eta: '',
    cost: '',
    status: 'not_started' as const,
    reusable: false,
    storageNote: '',
  })

  const addItem = () => {
    if (!draft.name.trim()) return
    dispatch({
      type: 'update_decor',
      payload: {
        items: [
          ...state.decor.items,
          {
            id: uuid(),
            name: draft.name.trim(),
            zone: draft.zone,
            quantity: draft.quantity,
            buyLink: draft.buyLink.trim(),
            eta: draft.eta.trim(),
            cost: draft.cost.trim(),
            status: draft.status,
            reusable: draft.reusable,
            storageNote: draft.storageNote.trim(),
          },
        ],
      },
    })
    setDraft({
      name: '',
      zone: 'entry',
      quantity: 1,
      buyLink: '',
      eta: '',
      cost: '',
      status: 'not_started',
      reusable: false,
      storageNote: '',
    })
  }

  const removeItem = (id: string) => {
    dispatch({
      type: 'update_decor',
      payload: { items: state.decor.items.filter((item) => item.id !== id) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Decor & Ambience</h3>
      <p className="text-sm text-slate-500">Track decor by zone with status and storage notes.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Add decor item</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            Item
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="String lights"
            />
          </label>
          <label className="text-sm text-slate-600">
            Zone
            <select
              value={draft.zone}
              onChange={(event) =>
                setDraft({ ...draft, zone: event.target.value as typeof draft.zone })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="entry">Entry</option>
              <option value="living_room">Living room</option>
              <option value="table">Table</option>
              <option value="lighting">Lighting</option>
              <option value="bathroom">Bathroom</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Quantity
            <input
              type="number"
              min={1}
              value={draft.quantity}
              onChange={(event) =>
                setDraft({ ...draft, quantity: Number(event.target.value) })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600">
            Status
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as typeof draft.status })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Buy link
            <input
              value={draft.buyLink}
              onChange={(event) => setDraft({ ...draft, buyLink: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>
          <label className="text-sm text-slate-600">
            ETA
            <input
              value={draft.eta}
              onChange={(event) => setDraft({ ...draft, eta: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Arrives Wed"
            />
          </label>
          <label className="text-sm text-slate-600">
            Cost
            <input
              value={draft.cost}
              onChange={(event) => setDraft({ ...draft, cost: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="$24"
            />
          </label>
          <label className="text-sm text-slate-600">
            Reusable
            <select
              value={draft.reusable ? 'yes' : 'no'}
              onChange={(event) => setDraft({ ...draft, reusable: event.target.value === 'yes' })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="no">Disposable</option>
              <option value="yes">Reusable</option>
            </select>
          </label>
          <label className="text-sm text-slate-600 md:col-span-2">
            Storage note
            <input
              value={draft.storageNote}
              onChange={(event) => setDraft({ ...draft, storageNote: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Store with winter decor"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add decor
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Decor list</h4>
        {state.decor.items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No decor yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.decor.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs uppercase text-slate-500">
                    {item.zone.replace('_', ' ')} · qty {item.quantity} · {item.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function CleaningPage() {
  const { state, dispatch } = useParty()
  const [draft, setDraft] = useState({
    label: '',
    phase: 'before' as const,
  })

  const addChecklist = () => {
    if (!draft.label.trim()) return
    dispatch({
      type: 'update_cleaning',
      payload: {
        checklists: [
          ...state.cleaning.checklists,
          {
            id: uuid(),
            label: draft.label.trim(),
            phase: draft.phase,
            status: 'not_started',
          },
        ],
      },
    })
    setDraft({ label: '', phase: 'before' })
  }

  const toggleBathroomSupply = (id: string) => {
    dispatch({
      type: 'update_cleaning',
      payload: {
        bathroomSupplies: state.cleaning.bathroomSupplies.map((item) =>
          item.id === id
            ? { ...item, status: item.status === 'done' ? 'not_started' : 'done' }
            : item,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Cleaning & Bathroom</h3>
      <p className="text-sm text-slate-500">Phase-based checklists and supply tracking.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Bathroom essentials</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {state.cleaning.bathroomSupplies.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleBathroomSupply(item.id)}
              className={[
                'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold',
                item.status === 'done'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-50 text-slate-600',
              ].join(' ')}
            >
              {item.name}
              <span className="text-xs uppercase">
                {item.status === 'done' ? 'ready' : 'needs'}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Phase checklist</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-600">
            Task
            <input
              value={draft.label}
              onChange={(event) => setDraft({ ...draft, label: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Stock extra towels"
            />
          </label>
          <label className="text-sm text-slate-600">
            Phase
            <select
              value={draft.phase}
              onChange={(event) =>
                setDraft({ ...draft, phase: event.target.value as typeof draft.phase })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="before">Before</option>
              <option value="during">During</option>
              <option value="after">After</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={addChecklist}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add task
            </button>
          </div>
        </div>

        {state.cleaning.checklists.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No cleaning tasks yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {state.cleaning.checklists.map((task) => (
              <div key={task.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-900">{task.label}</p>
                <p className="text-xs uppercase text-slate-500">{task.phase}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function TimelinePage() {
  const { state, dispatch } = useParty()
  const [draft, setDraft] = useState({
    title: '',
    offsetHours: -24,
  })

  const addTask = () => {
    if (!draft.title.trim()) return
    dispatch({
      type: 'update_timeline',
      payload: {
        tasks: [
          ...state.timeline.tasks,
          {
            id: uuid(),
            title: draft.title.trim(),
            offsetHours: Number(draft.offsetHours),
            status: 'not_started',
          },
        ],
      },
    })
    setDraft({ title: '', offsetHours: -24 })
  }

  const removeTask = (id: string) => {
    dispatch({
      type: 'update_timeline',
      payload: { tasks: state.timeline.tasks.filter((task) => task.id !== id) },
    })
  }

  const exportCalendar = () => {
    if (!state.core.date) return
    const partyStart = new Date(state.core.date)
    const events = state.timeline.tasks.map((task) => {
      const start = new Date(partyStart.getTime() + task.offsetHours * 60 * 60 * 1000)
      const iso = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      return [
        'BEGIN:VEVENT',
        `UID:${task.id}`,
        `DTSTAMP:${iso}`,
        `DTSTART:${iso}`,
        `SUMMARY:${task.title}`,
        'END:VEVENT',
      ].join('\n')
    })

    const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events, 'END:VCALENDAR'].join('\n')
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'party-timeline.ics'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Timeline</h3>
      <p className="text-sm text-slate-500">Tasks relative to party start.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Add timeline task</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-600 md:col-span-2">
            Task title
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Order ice and mixers"
            />
          </label>
          <label className="text-sm text-slate-600">
            Hours from start
            <input
              type="number"
              value={draft.offsetHours}
              onChange={(event) =>
                setDraft({ ...draft, offsetHours: Number(event.target.value) })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addTask}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add task
          </button>
          <button
            type="button"
            onClick={exportCalendar}
            disabled={!state.core.date}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export calendar
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Timeline tasks</h4>
        {state.timeline.tasks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No tasks yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.timeline.tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs uppercase text-slate-500">
                    {task.offsetHours}h from start
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function MusicPage() {
  const { state, dispatch } = useParty()
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Music Hub</h3>
      <p className="text-sm text-slate-500">Link playlists for each party phase.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Main link</h4>
        <input
          value={state.music.mainLink}
          onChange={(event) =>
            dispatch({ type: 'update_music', payload: { mainLink: event.target.value } })
          }
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="https://open.spotify.com/..."
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Phase playlists</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(['pregame', 'arrival', 'peak', 'late', 'windDown'] as const).map((phase) => (
            <label key={phase} className="text-sm text-slate-600">
              {phase}
              <input
                value={state.music.playlists[phase]}
                onChange={(event) =>
                  dispatch({
                    type: 'update_music',
                    payload: {
                      playlists: { ...state.music.playlists, [phase]: event.target.value },
                    },
                  })
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://open.spotify.com/..."
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}

export function GamesPage() {
  const { state, dispatch } = useParty()
  const [draft, setDraft] = useState({
    name: '',
    category: 'icebreaker' as const,
    durationMins: 15,
    groupSize: '4-8',
    rules: '',
    supplies: '',
  })

  const addGame = () => {
    if (!draft.name.trim()) return
    dispatch({
      type: 'update_games',
      payload: {
        games: [
          ...state.games.games,
          {
            id: uuid(),
            name: draft.name.trim(),
            category: draft.category,
            durationMins: draft.durationMins,
            groupSize: draft.groupSize.trim(),
            rules: draft.rules.trim(),
            supplies: draft.supplies
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          },
        ],
      },
    })
    setDraft({
      name: '',
      category: 'icebreaker',
      durationMins: 15,
      groupSize: '4-8',
      rules: '',
      supplies: '',
    })
  }

  const removeGame = (id: string) => {
    dispatch({
      type: 'update_games',
      payload: { games: state.games.games.filter((game) => game.id !== id) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Game Generator</h3>
      <p className="text-sm text-slate-500">Add games with supplies and timing.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Add game</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            Game name
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Two truths and a lie"
            />
          </label>
          <label className="text-sm text-slate-600">
            Category
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value as typeof draft.category })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="icebreaker">Icebreaker</option>
              <option value="main">Main game</option>
              <option value="chaos">Optional chaos</option>
              <option value="wind_down">Wind-down</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Duration (mins)
            <input
              type="number"
              min={5}
              value={draft.durationMins}
              onChange={(event) =>
                setDraft({ ...draft, durationMins: Number(event.target.value) })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600">
            Group size
            <input
              value={draft.groupSize}
              onChange={(event) => setDraft({ ...draft, groupSize: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="6-12"
            />
          </label>
          <label className="text-sm text-slate-600 md:col-span-2">
            Rules
            <textarea
              value={draft.rules}
              onChange={(event) => setDraft({ ...draft, rules: event.target.value })}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Each person shares two truths and one lie..."
            />
          </label>
          <label className="text-sm text-slate-600 md:col-span-2">
            Supplies (comma separated)
            <input
              value={draft.supplies}
              onChange={(event) => setDraft({ ...draft, supplies: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Cards, markers"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={addGame}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add game
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Game list</h4>
        {state.games.games.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No games yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.games.games.map((game) => (
              <div key={game.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{game.name}</p>
                    <p className="text-xs uppercase text-slate-500">
                      {game.category} · {game.durationMins} mins · {game.groupSize}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGame(game.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                  >
                    Remove
                  </button>
                </div>
                {game.supplies.length ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Supplies: {game.supplies.join(', ')}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function VenuePage() {
  const { state, dispatch } = useParty()

  const updateAmenity = (id: string, updates: Partial<(typeof state.venue.amenities)[0]>) => {
    dispatch({
      type: 'update_venue',
      payload: {
        amenities: state.venue.amenities.map((amenity) =>
          amenity.id === id ? { ...amenity, ...updates } : amenity,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Venue & Rooftop Readiness</h3>
      <p className="text-sm text-slate-500">Track amenities and propane status.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Amenities</h4>
        <div className="mt-4 space-y-4">
          {state.venue.amenities.map((amenity) => (
            <div key={amenity.id} className="rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{amenity.name}</p>
                <select
                  value={amenity.status}
                  onChange={(event) =>
                    updateAmenity(amenity.id, {
                      status: event.target.value as typeof amenity.status,
                    })
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs"
                >
                  <option value="not_checked">Not checked</option>
                  <option value="pending">Pending</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  value={amenity.reservationLink}
                  onChange={(event) =>
                    updateAmenity(amenity.id, { reservationLink: event.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  placeholder="Reservation link"
                />
                <input
                  value={amenity.confirmationNote}
                  onChange={(event) =>
                    updateAmenity(amenity.id, { confirmationNote: event.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  placeholder="Confirmation note"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Grill Propane</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-600">
            Tank level
            <select
              value={state.venue.propane.level}
              onChange={(event) =>
                dispatch({
                  type: 'update_venue',
                  payload: {
                    propane: { ...state.venue.propane, level: event.target.value as typeof state.venue.propane.level },
                  },
                })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="full">Full</option>
              <option value="three_quarter">3/4</option>
              <option value="half">1/2</option>
              <option value="quarter">1/4</option>
              <option value="empty">Empty</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Last checked
            <input
              type="datetime-local"
              value={state.venue.propane.lastChecked}
              onChange={(event) =>
                dispatch({
                  type: 'update_venue',
                  payload: {
                    propane: { ...state.venue.propane, lastChecked: event.target.value },
                  },
                })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600">
            No-grill fallback
            <select
              value={state.venue.propane.noGrillFallback ? 'yes' : 'no'}
              onChange={(event) =>
                dispatch({
                  type: 'update_venue',
                  payload: {
                    propane: {
                      ...state.venue.propane,
                      noGrillFallback: event.target.value === 'yes',
                    },
                  },
                })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
        </div>
      </section>
    </div>
  )
}

export function EntryPage() {
  const { state, dispatch } = useParty()
  const [textDraft, setTextDraft] = useState('')

  const addText = () => {
    if (!textDraft.trim()) return
    dispatch({
      type: 'update_entry',
      payload: { arrivalTexts: [...state.entry.arrivalTexts, textDraft.trim()] },
    })
    setTextDraft('')
  }

  const removeText = (text: string) => {
    dispatch({
      type: 'update_entry',
      payload: { arrivalTexts: state.entry.arrivalTexts.filter((item) => item !== text) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Entry Mode</h3>
      <p className="text-sm text-slate-500">Buzz-in instructions and arrival texts.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Building access</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            ButterflyMX link
            <input
              value={state.entry.butterflyLink}
              onChange={(event) =>
                dispatch({ type: 'update_entry', payload: { butterflyLink: event.target.value } })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="butterflymx://..."
            />
          </label>
          <label className="text-sm text-slate-600 md:col-span-2">
            Entry instructions
            <textarea
              value={state.entry.instructions}
              onChange={(event) =>
                dispatch({ type: 'update_entry', payload: { instructions: event.target.value } })
              }
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Call box 1203, then take the elevator to the roof."
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Arrival texts</h4>
        <div className="mt-4 flex gap-2">
          <input
            value={textDraft}
            onChange={(event) => setTextDraft(event.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Buzz in and come up!"
          />
          <button
            type="button"
            onClick={addText}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {state.entry.arrivalTexts.map((text) => (
            <div
              key={text}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span>{text}</span>
              <button
                type="button"
                onClick={() => removeText(text)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function LivePage() {
  const { state, dispatch } = useParty()
  const [note, setNote] = useState('')

  const toggleAlert = (key: keyof typeof state.live.restockAlerts) => {
    dispatch({
      type: 'update_live',
      payload: {
        restockAlerts: {
          ...state.live.restockAlerts,
          [key]: !state.live.restockAlerts[key],
        },
      },
    })
  }

  const addNote = () => {
    if (!note.trim()) return
    dispatch({
      type: 'update_live',
      payload: { quickNotes: [...state.live.quickNotes, note.trim()] },
    })
    setNote('')
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Live Party Mode</h3>
      <p className="text-sm text-slate-500">One-tap controls for the night.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Now playing</h4>
        <p className="mt-2 text-sm text-slate-600">
          {state.music.mainLink ? state.music.mainLink : 'Add a main playlist link.'}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Restock alerts</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(state.live.restockAlerts).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleAlert(key as keyof typeof state.live.restockAlerts)}
              className={[
                'rounded-xl px-4 py-3 text-sm font-semibold',
                value ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-600',
              ].join(' ')}
            >
              {key}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Quick notes</h4>
        <div className="mt-4 flex gap-2">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Need more ice by 9 PM"
          />
          <button
            type="button"
            onClick={addNote}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {state.live.quickNotes.map((entry) => (
            <li key={entry} className="rounded-lg bg-slate-50 px-3 py-2">
              {entry}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function PostPartyPage() {
  const { state, dispatch } = useParty()
  const [cleanupItem, setCleanupItem] = useState('')
  const [leftoverItem, setLeftoverItem] = useState('')

  const addCleanup = () => {
    if (!cleanupItem.trim()) return
    dispatch({
      type: 'update_post_party',
      payload: { cleanupChecklist: [...state.postParty.cleanupChecklist, cleanupItem.trim()] },
    })
    setCleanupItem('')
  }

  const addLeftover = () => {
    if (!leftoverItem.trim()) return
    dispatch({
      type: 'update_post_party',
      payload: { leftovers: [...state.postParty.leftovers, leftoverItem.trim()] },
    })
    setLeftoverItem('')
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-xl font-semibold text-slate-900">Post-Party Wrap</h3>
      <p className="text-sm text-slate-500">Capture what worked and save favorites.</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Cleanup checklist</h4>
        <div className="mt-4 flex gap-2">
          <input
            value={cleanupItem}
            onChange={(event) => setCleanupItem(event.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Take out recycling"
          />
          <button
            type="button"
            onClick={addCleanup}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {state.postParty.cleanupChecklist.map((item) => (
            <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Leftovers</h4>
        <div className="mt-4 flex gap-2">
          <input
            value={leftoverItem}
            onChange={(event) => setLeftoverItem(event.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Half tray of sliders"
          />
          <button
            type="button"
            onClick={addLeftover}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {state.postParty.leftovers.map((item) => (
            <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Notes</h4>
        <textarea
          value={state.postParty.notes}
          onChange={(event) =>
            dispatch({ type: 'update_post_party', payload: { notes: event.target.value } })
          }
          rows={4}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="What worked? What didn’t?"
        />
      </section>
    </div>
  )
}
