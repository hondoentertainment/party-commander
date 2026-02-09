import { useState } from 'react'
import { useParty } from '../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'

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
      <h3 className="text-2xl font-semibold text-white">Invites Hub</h3>
      <p className="text-sm text-slate-300">
        Track the Partiful link, RSVP count, and reusable message templates.
      </p>

      <Card>
        <CardTitle>Event Details</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Partiful link
            <Input
              value={state.invites.partifulLink}
              onChange={(event) =>
                dispatch({ type: 'update_invites', payload: { partifulLink: event.target.value } })
              }
              className="mt-2"
              placeholder="https://partiful.com/e/..."
            />
          </label>
          <label className="text-sm text-slate-300">
            RSVP guest count
            <Input
              type="number"
              min={0}
              value={state.invites.guestCount}
              onChange={(event) =>
                dispatch({
                  type: 'update_invites',
                  payload: { guestCount: Number(event.target.value) },
                })
              }
              className="mt-2"
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardTitle>Message Templates</CardTitle>
        <div className="mt-4 space-y-4">
          {(['arrival', 'music', 'rooftop'] as const).map((key) => (
            <label key={key} className="block text-sm text-slate-300">
              {key === 'arrival' && 'Arrival instructions'}
              {key === 'music' && 'Music share link'}
              {key === 'rooftop' && 'Rooftop details'}
              <div className="mt-2 flex gap-2">
                <Textarea
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
                />
                <Button
                  type="button"
                  onClick={() => handleCopy(key)}
                  variant="outline"
                  className="h-10 px-3 text-xs"
                >
                  {copiedKey === key ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </label>
          ))}
        </div>
      </Card>
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
      <h3 className="text-2xl font-semibold text-white">Menu Builder</h3>
      <p className="text-sm text-slate-300">
        Add items by category and source to build prep lists.
      </p>

      <Card>
        <CardTitle>Add menu item</CardTitle>
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
              <option value="late_night">Late-night</option>
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
        {state.menu.items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No items yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.menu.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs uppercase text-slate-400">
                    {item.category} · {item.source} · {item.servings} servings
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => removeItem(item.id)}
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
      <h3 className="text-2xl font-semibold text-white">Themed Drinks</h3>
      <p className="text-sm text-slate-300">
        Auto-suggestions based on theme plus a customizable shopping list.
      </p>

      <Card>
        <CardTitle>Suggestions</CardTitle>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {state.drinks.suggestions.map((drink) => (
            <li key={drink.id} className="rounded-xl bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{drink.name}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs uppercase text-slate-300">
                  {drink.type}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {drink.ingredients.join(', ')}
              </p>
              <p className="mt-2 text-xs text-slate-400">{drink.prep}</p>
            </li>
          ))}
        </ul>
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
          {state.drinks.shoppingList.map((item) => (
            <li key={item} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span>{item}</span>
              {state.drinks.extraItems.includes(item) ? (
                <Button variant="ghost" onClick={() => removeExtraItem(item)} className="text-xs">
                  Remove
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
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
      <h3 className="text-2xl font-semibold text-white">Decor & Ambience</h3>
      <p className="text-sm text-slate-300">Track decor by zone with status and storage notes.</p>

      <Card>
        <CardTitle>Add decor item</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Item
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2"
              placeholder="String lights"
            />
          </label>
          <label className="text-sm text-slate-300">
            Zone
            <Select
              value={draft.zone}
              onChange={(event) =>
                setDraft({ ...draft, zone: event.target.value as typeof draft.zone })
              }
              className="mt-2"
            >
              <option value="entry">Entry</option>
              <option value="living_room">Living room</option>
              <option value="table">Table</option>
              <option value="lighting">Lighting</option>
              <option value="bathroom">Bathroom</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Quantity
            <Input
              type="number"
              min={1}
              value={draft.quantity}
              onChange={(event) =>
                setDraft({ ...draft, quantity: Number(event.target.value) })
              }
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300">
            Status
            <Select
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as typeof draft.status })
              }
              className="mt-2"
            >
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Buy link
            <Input
              value={draft.buyLink}
              onChange={(event) => setDraft({ ...draft, buyLink: event.target.value })}
              className="mt-2"
              placeholder="https://..."
            />
          </label>
          <label className="text-sm text-slate-300">
            ETA
            <Input
              value={draft.eta}
              onChange={(event) => setDraft({ ...draft, eta: event.target.value })}
              className="mt-2"
              placeholder="Arrives Wed"
            />
          </label>
          <label className="text-sm text-slate-300">
            Cost
            <Input
              value={draft.cost}
              onChange={(event) => setDraft({ ...draft, cost: event.target.value })}
              className="mt-2"
              placeholder="$24"
            />
          </label>
          <label className="text-sm text-slate-300">
            Reusable
            <Select
              value={draft.reusable ? 'yes' : 'no'}
              onChange={(event) => setDraft({ ...draft, reusable: event.target.value === 'yes' })}
              className="mt-2"
            >
              <option value="no">Disposable</option>
              <option value="yes">Reusable</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Storage note
            <Input
              value={draft.storageNote}
              onChange={(event) => setDraft({ ...draft, storageNote: event.target.value })}
              className="mt-2"
              placeholder="Store with winter decor"
            />
          </label>
        </div>
        <Button type="button" onClick={addItem} className="mt-4">
          Add decor
        </Button>
      </Card>

      <Card>
        <CardTitle>Decor list</CardTitle>
        {state.decor.items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No decor yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.decor.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs uppercase text-slate-400">
                    {item.zone.replace('_', ' ')} · qty {item.quantity} · {item.status}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => removeItem(item.id)}
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
      <h3 className="text-2xl font-semibold text-white">Cleaning & Bathroom</h3>
      <p className="text-sm text-slate-300">Phase-based checklists and supply tracking.</p>

      <Card>
        <CardTitle>Bathroom essentials</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {state.cleaning.bathroomSupplies.map((item) => (
            <Button
              key={item.id}
              type="button"
              onClick={() => toggleBathroomSupply(item.id)}
              variant="outline"
              className={[
                'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold',
                item.status === 'done' ? 'bg-emerald-500/20 text-emerald-200' : '',
              ].join(' ')}
            >
              {item.name}
              <span className="text-xs uppercase">
                {item.status === 'done' ? 'ready' : 'needs'}
              </span>
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Phase checklist</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-300">
            Task
            <Input
              value={draft.label}
              onChange={(event) => setDraft({ ...draft, label: event.target.value })}
              className="mt-2"
              placeholder="Stock extra towels"
            />
          </label>
          <label className="text-sm text-slate-300">
            Phase
            <Select
              value={draft.phase}
              onChange={(event) =>
                setDraft({ ...draft, phase: event.target.value as typeof draft.phase })
              }
              className="mt-2"
            >
              <option value="before">Before</option>
              <option value="during">During</option>
              <option value="after">After</option>
            </Select>
          </label>
          <div className="flex items-end">
            <Button type="button" onClick={addChecklist} className="w-full">
              Add task
            </Button>
          </div>
        </div>

        {state.cleaning.checklists.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No cleaning tasks yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {state.cleaning.checklists.map((task) => (
              <div key={task.id} className="rounded-xl bg-white/5 px-4 py-3 text-sm">
                <p className="font-semibold text-white">{task.label}</p>
                <p className="text-xs uppercase text-slate-400">{task.phase}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
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
      <h3 className="text-2xl font-semibold text-white">Timeline</h3>
      <p className="text-sm text-slate-300">Tasks relative to party start.</p>

      <Card>
        <CardTitle>Add timeline task</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-300 md:col-span-2">
            Task title
            <Input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="mt-2"
              placeholder="Order ice and mixers"
            />
          </label>
          <label className="text-sm text-slate-300">
            Hours from start
            <Input
              type="number"
              value={draft.offsetHours}
              onChange={(event) =>
                setDraft({ ...draft, offsetHours: Number(event.target.value) })
              }
              className="mt-2"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={addTask}>
            Add task
          </Button>
          <Button
            type="button"
            onClick={exportCalendar}
            disabled={!state.core.date}
            variant="outline"
          >
            Export calendar
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Timeline tasks</CardTitle>
        {state.timeline.tasks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No tasks yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.timeline.tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">{task.title}</p>
                  <p className="text-xs uppercase text-slate-400">
                    {task.offsetHours}h from start
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => removeTask(task.id)}
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
    </div>
  )
}

export function MusicPage() {
  const { state, dispatch } = useParty()
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Music Hub</h3>
      <p className="text-sm text-slate-300">Link playlists for each party phase.</p>

      <Card>
        <CardTitle>Main link</CardTitle>
        <Input
          value={state.music.mainLink}
          onChange={(event) =>
            dispatch({ type: 'update_music', payload: { mainLink: event.target.value } })
          }
          className="mt-3"
          placeholder="https://open.spotify.com/..."
        />
      </Card>

      <Card>
        <CardTitle>Phase playlists</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(['pregame', 'arrival', 'peak', 'late', 'windDown'] as const).map((phase) => (
            <label key={phase} className="text-sm text-slate-300">
              {phase}
              <Input
                value={state.music.playlists[phase]}
                onChange={(event) =>
                  dispatch({
                    type: 'update_music',
                    payload: {
                      playlists: { ...state.music.playlists, [phase]: event.target.value },
                    },
                  })
                }
                className="mt-2"
                placeholder="https://open.spotify.com/..."
              />
            </label>
          ))}
        </div>
      </Card>
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
      <h3 className="text-2xl font-semibold text-white">Game Generator</h3>
      <p className="text-sm text-slate-300">Add games with supplies and timing.</p>

      <Card>
        <CardTitle>Add game</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Game name
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2"
              placeholder="Two truths and a lie"
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
              <option value="icebreaker">Icebreaker</option>
              <option value="main">Main game</option>
              <option value="chaos">Optional chaos</option>
              <option value="wind_down">Wind-down</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Duration (mins)
            <Input
              type="number"
              min={5}
              value={draft.durationMins}
              onChange={(event) =>
                setDraft({ ...draft, durationMins: Number(event.target.value) })
              }
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300">
            Group size
            <Input
              value={draft.groupSize}
              onChange={(event) => setDraft({ ...draft, groupSize: event.target.value })}
              className="mt-2"
              placeholder="6-12"
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Rules
            <Textarea
              value={draft.rules}
              onChange={(event) => setDraft({ ...draft, rules: event.target.value })}
              rows={3}
              placeholder="Each person shares two truths and one lie..."
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Supplies (comma separated)
            <Input
              value={draft.supplies}
              onChange={(event) => setDraft({ ...draft, supplies: event.target.value })}
              className="mt-2"
              placeholder="Cards, markers"
            />
          </label>
        </div>
        <Button type="button" onClick={addGame} className="mt-4">
          Add game
        </Button>
      </Card>

      <Card>
        <CardTitle>Game list</CardTitle>
        {state.games.games.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No games yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.games.games.map((game) => (
              <div key={game.id} className="rounded-xl bg-white/5 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{game.name}</p>
                    <p className="text-xs uppercase text-slate-400">
                      {game.category} · {game.durationMins} mins · {game.groupSize}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeGame(game.id)}
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    Remove
                  </Button>
                </div>
                {game.supplies.length ? (
                  <p className="mt-2 text-xs text-slate-400">
                    Supplies: {game.supplies.join(', ')}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
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
      <h3 className="text-2xl font-semibold text-white">Venue & Rooftop Readiness</h3>
      <p className="text-sm text-slate-300">Track amenities and propane status.</p>

      <Card>
        <CardTitle>Amenities</CardTitle>
        <div className="mt-4 space-y-4">
          {state.venue.amenities.map((amenity) => (
            <div key={amenity.id} className="rounded-xl bg-white/5 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-white">{amenity.name}</p>
                <Select
                  value={amenity.status}
                  onChange={(event) =>
                    updateAmenity(amenity.id, {
                      status: event.target.value as typeof amenity.status,
                    })
                  }
                  className="rounded-lg px-3 py-1 text-xs"
                >
                  <option value="not_checked">Not checked</option>
                  <option value="pending">Pending</option>
                  <option value="reserved">Reserved</option>
                </Select>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Input
                  value={amenity.reservationLink}
                  onChange={(event) =>
                    updateAmenity(amenity.id, { reservationLink: event.target.value })
                  }
                  className="text-xs"
                  placeholder="Reservation link"
                />
                <Input
                  value={amenity.confirmationNote}
                  onChange={(event) =>
                    updateAmenity(amenity.id, { confirmationNote: event.target.value })
                  }
                  className="text-xs"
                  placeholder="Confirmation note"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Grill Propane</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-300">
            Tank level
            <Select
              value={state.venue.propane.level}
              onChange={(event) =>
                dispatch({
                  type: 'update_venue',
                  payload: {
                    propane: { ...state.venue.propane, level: event.target.value as typeof state.venue.propane.level },
                  },
                })
              }
              className="mt-2"
            >
              <option value="full">Full</option>
              <option value="three_quarter">3/4</option>
              <option value="half">1/2</option>
              <option value="quarter">1/4</option>
              <option value="empty">Empty</option>
              <option value="unknown">Unknown</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Last checked
            <Input
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
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300">
            No-grill fallback
            <Select
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
              className="mt-2"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </label>
        </div>
      </Card>
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
      <h3 className="text-2xl font-semibold text-white">Entry Mode</h3>
      <p className="text-sm text-slate-300">Buzz-in instructions and arrival texts.</p>

      <Card>
        <CardTitle>Building access</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            ButterflyMX link
            <Input
              value={state.entry.butterflyLink}
              onChange={(event) =>
                dispatch({ type: 'update_entry', payload: { butterflyLink: event.target.value } })
              }
              className="mt-2"
              placeholder="butterflymx://..."
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Entry instructions
            <Textarea
              value={state.entry.instructions}
              onChange={(event) =>
                dispatch({ type: 'update_entry', payload: { instructions: event.target.value } })
              }
              rows={3}
              placeholder="Call box 1203, then take the elevator to the roof."
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardTitle>Arrival texts</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={textDraft}
            onChange={(event) => setTextDraft(event.target.value)}
            className="flex-1"
            placeholder="Buzz in and come up!"
          />
          <Button type="button" onClick={addText}>
            Add
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {state.entry.arrivalTexts.map((text) => (
            <div
              key={text}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
            >
              <span>{text}</span>
              <Button variant="ghost" onClick={() => removeText(text)} className="text-xs">
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>
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
      <h3 className="text-2xl font-semibold text-white">Live Party Mode</h3>
      <p className="text-sm text-slate-300">One-tap controls for the night.</p>

      <Card>
        <CardTitle>Now playing</CardTitle>
        <p className="mt-2 text-sm text-slate-300">
          {state.music.mainLink ? state.music.mainLink : 'Add a main playlist link.'}
        </p>
      </Card>

      <Card>
        <CardTitle>Restock alerts</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(state.live.restockAlerts).map(([key, value]) => (
            <Button
              key={key}
              type="button"
              onClick={() => toggleAlert(key as keyof typeof state.live.restockAlerts)}
              variant="outline"
              className={value ? 'bg-rose-500/20 text-rose-200' : 'bg-white/5 text-slate-300'}
            >
              {key}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Quick notes</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="flex-1"
            placeholder="Need more ice by 9 PM"
          />
          <Button type="button" onClick={addNote}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {state.live.quickNotes.map((entry) => (
            <li key={entry} className="rounded-lg bg-white/5 px-3 py-2">
              {entry}
            </li>
          ))}
        </ul>
      </Card>
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
      <h3 className="text-2xl font-semibold text-white">Post-Party Wrap</h3>
      <p className="text-sm text-slate-300">Capture what worked and save favorites.</p>

      <Card>
        <CardTitle>Cleanup checklist</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={cleanupItem}
            onChange={(event) => setCleanupItem(event.target.value)}
            className="flex-1"
            placeholder="Take out recycling"
          />
          <Button type="button" onClick={addCleanup}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {state.postParty.cleanupChecklist.map((item) => (
            <li key={item} className="rounded-lg bg-white/5 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Leftovers</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={leftoverItem}
            onChange={(event) => setLeftoverItem(event.target.value)}
            className="flex-1"
            placeholder="Half tray of sliders"
          />
          <Button type="button" onClick={addLeftover}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {state.postParty.leftovers.map((item) => (
            <li key={item} className="rounded-lg bg-white/5 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Notes</CardTitle>
        <Textarea
          value={state.postParty.notes}
          onChange={(event) =>
            dispatch({ type: 'update_post_party', payload: { notes: event.target.value } })
          }
          rows={4}
          className="mt-3"
          placeholder="What worked? What didn’t?"
        />
      </Card>
    </div>
  )
}
