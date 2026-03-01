import { useRef, useState } from 'react'
import { useParty } from '../state/PartyContext'
import { cn } from '../components/ui/utils'
import { v4 as uuid } from 'uuid'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { Download, ImagePlus, Trash2, Sparkles, Loader2, Lightbulb, RotateCcw } from 'lucide-react'
import { getShoppingListItems } from '../state/engines'
import { generateBudgetOptimization } from '../services/ai'
import type { DrinkSuggestion, GalleryPhoto, ShoppingListBaseKey } from '../state/types'
import type { BudgetLineItem } from '../state/types'

/** Parse dollar amount from string like "$24" or "24.50" */
function parseCost(value: string): number {
  const cleaned = String(value).replace(/[$,]/g, '').trim()
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

/** Sum decor costs for display */
function sumDecorCosts(decorItems: { cost: string }[]): number {
  return decorItems.reduce((sum, item) => sum + parseCost(item.cost), 0)
}

export function BudgetPage() {
  const { state, dispatch } = useParty()
  const [loading, setLoading] = useState(false)
  const [tips, setTips] = useState<string[] | null>(null)
  const [draft, setDraft] = useState({
    label: '',
    category: 'decor' as BudgetLineItem['category'],
    amount: 0,
    notes: '',
  })

  const manualTotal = state.budget.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const decorTotal = sumDecorCosts(state.decor.items)
  const totalSpent = manualTotal + decorTotal
  const limit = state.budget.limit ?? 0
  const overBudget = limit > 0 && totalSpent > limit

  const handleOptimize = async () => {
    setLoading(true)
    try {
      const result = await generateBudgetOptimization(state.budget.lineItems, state.budget.limit)
      setTips(result || ['AI Analysis failed. Please try again.'])
    } catch (e) {
      setTips(['An unexpected error occurred.'])
    } finally {
      setLoading(false)
    }
  }

  const addLineItem = () => {
    if (!draft.label.trim() && draft.amount <= 0) return
    dispatch({
      type: 'update_budget',
      payload: {
        lineItems: [
          ...state.budget.lineItems,
          {
            id: uuid(),
            label: draft.label.trim() || 'Misc',
            category: draft.category,
            amount: draft.amount,
            notes: draft.notes.trim() || undefined,
          },
        ],
      },
    })
    setDraft({ label: '', category: 'decor', amount: 0, notes: '' })
  }

  const removeLineItem = (id: string) => {
    dispatch({
      type: 'update_budget',
      payload: {
        lineItems: state.budget.lineItems.filter((item) => item.id !== id),
      },
    })
  }

  const updateLineItem = (
    id: string,
    updates: Partial<BudgetLineItem>,
  ) => {
    dispatch({
      type: 'update_budget',
      payload: {
        lineItems: state.budget.lineItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h2 className="text-2xl font-semibold text-white">Budget</h2>
      <p className="text-sm text-slate-300">
        Track costs per category. Decor costs are automatically synced from the Decor module.
      </p>

      <Card>
        <CardTitle>Totals</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-400">Total spent</p>
            <p className="text-2xl font-bold text-white">
              ${totalSpent.toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Manual: ${manualTotal.toFixed(2)} · Decor: ${decorTotal.toFixed(2)}
            </p>
          </div>
          <label className="text-sm text-slate-300">
            Budget limit (optional)
            <Input
              type="number"
              min={0}
              step={0.01}
              value={state.budget.limit ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'update_budget',
                  payload: {
                    limit: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="mt-2"
              placeholder="e.g. 500"
            />
            {overBudget && limit > 0 ? (
              <p className="mt-2 text-sm text-rose-400">Over budget by ${(totalSpent - limit).toFixed(2)}</p>
            ) : null}
          </label>
        </div>
      </Card>

      <Card className="border-emerald-500/10 bg-emerald-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Sparkles className="size-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle>AI Optimizer</CardTitle>
              <p className="text-xs text-slate-400">Get world-class savings strategies.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleOptimize}
            disabled={loading || state.budget.lineItems.length === 0}
            className="rounded-xl"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Analyze Budget'}
          </Button>
        </div>

        {tips && (
          <div className="mt-6 space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-black/40 p-4 text-sm text-slate-300 border border-white/5 transition-all hover:bg-black/60 group">
                <Lightbulb className="size-5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Add line item</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Label
            <Input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              className="mt-2"
              placeholder="Ice, cups, napkins"
            />
          </label>
          <label className="text-sm text-slate-300">
            Category
            <Select
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as BudgetLineItem['category'] })
              }
              className="mt-2"
            >
              <option value="decor">Decor</option>
              <option value="food">Food</option>
              <option value="drinks">Drinks</option>
              <option value="venue">Venue</option>
              <option value="supplies">Supplies</option>
              <option value="other">Other</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Amount ($)
            <Input
              type="number"
              min={0}
              step={0.01}
              value={draft.amount || ''}
              onChange={(e) =>
                setDraft({ ...draft, amount: Number(e.target.value) || 0 })
              }
              className="mt-2"
              placeholder="24.99"
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Notes
            <Input
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              className="mt-2"
              placeholder="Optional"
            />
          </label>
        </div>
        <Button type="button" onClick={addLineItem} className="mt-4">
          Add item
        </Button>
      </Card>

      <Card>
        <CardTitle>Line items</CardTitle>
        {state.budget.lineItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No line items yet. Add costs above.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.budget.lineItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    value={item.label}
                    onChange={(e) => updateLineItem(item.id, { label: e.target.value })}
                    className="max-w-[200px]"
                  />
                  <Select
                    value={item.category}
                    onChange={(e) =>
                      updateLineItem(item.id, {
                        category: e.target.value as BudgetLineItem['category'],
                      })
                    }
                    className="w-32"
                  >
                    <option value="decor">Decor</option>
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="venue">Venue</option>
                    <option value="supplies">Supplies</option>
                    <option value="other">Other</option>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.amount || ''}
                    onChange={(e) =>
                      updateLineItem(item.id, { amount: Number(e.target.value) || 0 })
                    }
                    className="w-24"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
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

export function InvitesPage() {
  const { state, dispatch } = useParty()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

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

  const shareMessage = [
    `You're invited to ${state.core.name || 'our party'}!`,
    state.core.date ? `When: ${state.core.date}` : null,
    state.core.location ? `Where: ${state.core.location}` : null,
    state.invites.messageTemplates.arrival ? `Arrival: ${state.invites.messageTemplates.arrival}` : null,
    state.music.mainLink ? `Music: ${state.music.mainLink}` : null,
    state.invites.messageTemplates.rooftop
      ? `Rooftop: ${state.invites.messageTemplates.rooftop}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const hostBrief = [
    `Party: ${state.core.name || 'Untitled'}`,
    `Theme: ${state.core.theme === 'Custom' ? state.core.customTheme || 'Custom' : state.core.theme}`,
    `Date: ${state.core.date || 'TBD'}`,
    `Location: ${state.core.location || 'TBD'}`,
    `Guest count: ${state.invites.guestCount}`,
    '',
    'Menu:',
    state.menu.items.length
      ? state.menu.items.map((item) => `- ${item.name} (${item.category}, ${item.source})`).join('\n')
      : '- None yet',
    '',
    'Drinks:',
    state.drinks.suggestions.map((drink) => `- ${drink.name} (${drink.type})`).join('\n'),
    '',
    'Timeline:',
    state.timeline.tasks.length
      ? state.timeline.tasks.map((task) => `- ${task.title} (${task.offsetHours}h)`).join('\n')
      : '- None yet',
  ].join('\n')

  const copyShareMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 1500)
    } catch {
      setShareCopied(false)
    }
  }

  const downloadBrief = () => {
    const blob = new Blob([hostBrief], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'party-brief.txt'
    link.click()
    URL.revokeObjectURL(url)
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
              {key === 'arrival' && 'Arrival instructions (e.g. Buzz code)'}
              {key === 'music' && 'Music share link (Spotify/Apple Music)'}
              {key === 'rooftop' && 'Rooftop details (Rules & Access)'}
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

      <Card>
        <CardTitle>Share Kit</CardTitle>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <Textarea value={shareMessage} rows={6} readOnly />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copyShareMessage}>
              {shareCopied ? 'Copied' : 'Copy invite'}
            </Button>
            <Button type="button" variant="outline" onClick={downloadBrief}>
              Download host brief
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function EventsPage() {
  const { state, dispatch } = useParty()
  const [draft, setDraft] = useState({
    name: '',
    date: '',
    location: '',
    link: '',
    notes: '',
  })

  const addEvent = () => {
    if (!draft.name.trim()) return
    dispatch({
      type: 'update_events',
      payload: {
        items: [
          ...state.events.items,
          { id: uuid(), ...draft, name: draft.name.trim() },
        ],
      },
    })
    setDraft({ name: '', date: '', location: '', link: '', notes: '' })
  }

  const updateEvent = (id: string, updates: Partial<(typeof state.events.items)[0]>) => {
    dispatch({
      type: 'update_events',
      payload: {
        items: state.events.items.map((event) => (event.id === id ? { ...event, ...updates } : event)),
      },
    })
  }

  const removeEvent = (id: string) => {
    dispatch({
      type: 'update_events',
      payload: { items: state.events.items.filter((event) => event.id !== id) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Events</h3>
      <p className="text-sm text-slate-300">Add upcoming events and keep an archive.</p>

      <Card>
        <CardTitle>Add event</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Event name
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2"
              placeholder="Rooftop kickoff"
            />
          </label>
          <label className="text-sm text-slate-300">
            Date & time
            <Input
              type="datetime-local"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300">
            Location
            <Input
              value={draft.location}
              onChange={(event) => setDraft({ ...draft, location: event.target.value })}
              className="mt-2"
              placeholder="My apartment"
            />
          </label>
          <label className="text-sm text-slate-300">
            Link
            <Input
              value={draft.link}
              onChange={(event) => setDraft({ ...draft, link: event.target.value })}
              className="mt-2"
              placeholder="https://partiful.com/..."
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Notes
            <Textarea
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              rows={3}
              className="mt-2"
            />
          </label>
        </div>
        <Button type="button" onClick={addEvent} className="mt-4">
          Add event
        </Button>
      </Card>

      <Card>
        <CardTitle>Event list</CardTitle>
        {state.events.items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No events yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.events.items.map((event) => (
              <div key={event.id} className="rounded-xl bg-white/5 px-4 py-3 text-sm">
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    value={event.name}
                    onChange={(e) => updateEvent(event.id, { name: e.target.value })}
                  />
                  <Input
                    type="datetime-local"
                    value={event.date}
                    onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                  />
                  <Input
                    value={event.location}
                    onChange={(e) => updateEvent(event.id, { location: e.target.value })}
                    placeholder="Location"
                  />
                  <Input
                    value={event.link}
                    onChange={(e) => updateEvent(event.id, { link: e.target.value })}
                    placeholder="Link"
                  />
                  <Textarea
                    value={event.notes}
                    onChange={(e) => updateEvent(event.id, { notes: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" onClick={() => removeEvent(event.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export function LeadsPage() {
  const { state, dispatch } = useParty()

  const updateLead = (id: string, leadName: string) => {
    dispatch({
      type: 'update_leads',
      payload: {
        items: state.leads.items.map((lead) =>
          lead.id === id ? { ...lead, leadName } : lead,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Leads</h3>
      <p className="text-sm text-slate-300">Assign a lead to each function.</p>

      <Card>
        <CardTitle>Function leads</CardTitle>
        <div className="mt-4 space-y-3">
          {state.leads.items.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm"
            >
              <span className="font-semibold text-white">{lead.function}</span>
              <Input
                value={lead.leadName}
                onChange={(event) => updateLead(lead.id, event.target.value)}
                placeholder="Lead name"
                className="max-w-xs"
              />
            </div>
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
    const nextItems = [...state.menu.items, nextItem]
    dispatch({ type: 'update_menu', payload: { items: nextItems } })
    syncFoodTimeline(nextItems)
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
    if (state.invites.guestCount <= 0 || state.menu.items.length === 0) return
    const nextItems = state.menu.items.map((item) =>
      item.servings > 0
        ? item
        : { ...item, servings: getSuggestedServings(item.category, state.invites.guestCount) },
    )
    dispatch({ type: 'update_menu', payload: { items: nextItems } })
    syncFoodTimeline(nextItems)
  }

  const removeItem = (id: string) => {
    const nextItems = state.menu.items.filter((item) => item.id !== id)
    dispatch({ type: 'update_menu', payload: { items: nextItems } })
    syncFoodTimeline(nextItems)
  }

  const updateItem = (id: string, updates: Partial<(typeof state.menu.items)[0]>) => {
    const nextItems = state.menu.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    )
    dispatch({ type: 'update_menu', payload: { items: nextItems } })
    syncFoodTimeline(nextItems)
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Menu Builder</h3>
      <p className="text-sm text-slate-300">
        Add items by category and source to build prep lists.
      </p>

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
        <Button type="button" className="mt-4" onClick={applySuggestions}>
          Apply suggestions
        </Button>
      </Card>

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
  const customDrinks = state.drinks.customDrinks ?? []
  const drinkOverrides = state.drinks.drinkOverrides ?? {}

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
                    onClick={() => removeCustomDrink(drink.id)}
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
                  onClick={() => removeExtraItem(entry.index)}
                  className="text-xs shrink-0"
                >
                  Remove
                </Button>
              </li>
            ),
          )}
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

  const toggleChecklistStatus = (id: string) => {
    dispatch({
      type: 'update_cleaning',
      payload: {
        checklists: state.cleaning.checklists.map((task) =>
          task.id === id
            ? {
              ...task,
              status: (task.status === 'done' ? 'not_started' : 'done') as typeof task.status,
            }
            : task,
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
              <Button
                key={task.id}
                type="button"
                onClick={() => toggleChecklistStatus(task.id)}
                variant="outline"
                className={[
                  'flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold',
                  task.status === 'done' ? 'bg-emerald-500/20 text-emerald-200' : '',
                ].join(' ')}
                aria-pressed={task.status === 'done'}
                aria-label={task.status === 'done' ? `Mark ${task.label} as not done` : `Mark ${task.label} as done`}
              >
                <div>
                  <p className="text-white">{task.label}</p>
                  <p className="text-xs uppercase text-slate-400">{task.phase}</p>
                </div>
                <span className="text-xs uppercase">
                  {task.status === 'done' ? 'Done' : 'To do'}
                </span>
              </Button>
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

      <Card className="relative overflow-hidden border-emerald-500/10 bg-emerald-500/5">
        <div className="absolute -right-16 -top-16 size-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <CardTitle className="relative z-10 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Sparkles className="size-4 text-emerald-400" />
          </div>
          Now Playing
        </CardTitle>
        <div className="relative z-10 mt-6 flex items-center gap-6">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10">
            <div className="absolute inset-x-0 bottom-0 flex h-16 items-center justify-center gap-1.5 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-emerald-500/60"
                  style={{
                    height: `${20 + Math.random() * 60}%`,
                    animation: `pulseHeight ${0.5 + Math.random() * 1}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-white">Sonic Atmosphere</p>
            <p className="text-sm text-slate-400">Current Phase: {state.core.theme || 'Vibing'}</p>
            <div className="mt-4 flex items-center gap-4">
              <Button size="sm" variant="outline" className="rounded-xl border-white/5 bg-white/5">
                Spotify Hub
              </Button>
              <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Master Playlist Link</CardTitle>
        <div className="mt-4 space-y-4">
          <Input
            value={state.music.mainLink}
            onChange={(event) =>
              dispatch({ type: 'update_music', payload: { mainLink: event.target.value } })
            }
            placeholder="https://open.spotify.com/..."
          />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Link your master event playlist for one-tap access.
          </p>
        </div>
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

  const removeNote = (text: string) => {
    dispatch({
      type: 'update_live',
      payload: { quickNotes: state.live.quickNotes.filter((n) => n !== text) },
    })
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

      <Card className="border-emerald-500/10 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Sparkles className="size-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle>Operational Snapshot</CardTitle>
            <p className="text-xs text-slate-400">Active playlist: {state.music.mainLink ? 'Connected' : 'Disconnected'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Operational Alerts</CardTitle>
        <p className="mt-2 text-sm text-slate-400">Tap to flag items that need immediate attention from the leads.</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(state.live.restockAlerts).map(([key, value]) => (
            <button
              key={key}
              onClick={() => toggleAlert(key as keyof typeof state.live.restockAlerts)}
              className={cn(
                'group relative flex flex-col items-center gap-3 rounded-[2rem] border p-6 transition-all duration-300 active:scale-95',
                value
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
                  : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              <div className={cn(
                'flex size-12 items-center justify-center rounded-2xl transition-all duration-300',
                value ? 'bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-black/40'
              )}>
                {key === 'ice' && '🧊'}
                {key === 'cups' && '🥤'}
                {key === 'mixers' && '🍹'}
                {key === 'trash' && '🗑️'}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">{key}</span>
              {value && (
                <div className="absolute -right-1 -top-1 size-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse" />
              )}
            </button>
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
            <li
              key={entry}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              {entry}
              <Button
                variant="ghost"
                onClick={() => removeNote(entry)}
                className="text-xs"
                aria-label={`Remove note: ${entry}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

const MAX_IMAGE_DIM = 1200
function resizeDataUrl(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      if (width <= maxDim && height <= maxDim) {
        resolve(dataUrl)
        return
      }
      const scale = maxDim / Math.max(width, height)
      const w = Math.round(width * scale)
      const h = Math.round(height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

export function PhotoVideoPage() {
  const { state, dispatch } = useParty()
  const [draft, setDraft] = useState({
    title: '',
    type: 'photo' as const,
    notes: '',
  })
  const [equipmentItem, setEquipmentItem] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addShot = () => {
    if (!draft.title.trim()) return
    dispatch({
      type: 'update_photo_video',
      payload: {
        shots: [
          ...state.photoVideo.shots,
          {
            id: uuid(),
            title: draft.title.trim(),
            type: draft.type,
            status: 'not_started' as const,
            notes: draft.notes.trim(),
          },
        ],
      },
    })
    setDraft({ title: '', type: 'photo', notes: '' })
  }

  const updateShot = (
    id: string,
    updates: Partial<(typeof state.photoVideo.shots)[0]>,
  ) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        shots: state.photoVideo.shots.map((shot) =>
          shot.id === id ? { ...shot, ...updates } : shot,
        ),
      },
    })
  }

  const removeShot = (id: string) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        shots: state.photoVideo.shots.filter((shot) => shot.id !== id),
      },
    })
  }

  const addEquipment = () => {
    if (!equipmentItem.trim()) return
    dispatch({
      type: 'update_photo_video',
      payload: {
        equipment: [...state.photoVideo.equipment, equipmentItem.trim()],
      },
    })
    setEquipmentItem('')
  }

  const removeEquipment = (item: string) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        equipment: state.photoVideo.equipment.filter((entry) => entry !== item),
      },
    })
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return
    const newPhotos: GalleryPhoto[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const resized = await resizeDataUrl(dataUrl, MAX_IMAGE_DIM)
      newPhotos.push({
        id: uuid(),
        dataUrl: resized,
        caption: file.name.replace(/\.[^.]+$/, ''),
        addedAt: new Date().toISOString(),
        filename: file.name,
      })
    }
    if (newPhotos.length > 0) {
      dispatch({
        type: 'update_photo_video',
        payload: {
          photos: [...state.photoVideo.photos, ...newPhotos],
        },
      })
    }
    event.target.value = ''
  }

  const downloadPhoto = (photo: GalleryPhoto) => {
    const base64 = photo.dataUrl.split(',')[1]
    if (!base64) return
    const mime = photo.dataUrl.match(/data:([^;]+);/)?.[1] ?? 'image/jpeg'
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = photo.caption ? `${photo.caption}.jpg` : photo.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const removePhoto = (id: string) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        photos: state.photoVideo.photos.filter((p) => p.id !== id),
      },
    })
  }

  const updatePhotoCaption = (id: string, caption: string) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        photos: state.photoVideo.photos.map((p) =>
          p.id === id ? { ...p, caption } : p,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Photo/Video Shoot</h3>
      <p className="text-sm text-slate-300">
        Plan shots, track equipment, and capture the party.
      </p>

      <Card>
        <CardTitle>Add shot</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Shot idea
            <Input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="mt-2"
              placeholder="Group photo on rooftop"
            />
          </label>
          <label className="text-sm text-slate-300">
            Type
            <Select
              value={draft.type}
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value as typeof draft.type })
              }
              className="mt-2"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Notes
            <Input
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              className="mt-2"
              placeholder="Golden hour, face the city"
            />
          </label>
        </div>
        <Button type="button" onClick={addShot} className="mt-4">
          Add shot
        </Button>
      </Card>

      <Card>
        <CardTitle>Shot list</CardTitle>
        {state.photoVideo.shots.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No shots planned yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.photoVideo.shots.map((shot) => (
              <div
                key={shot.id}
                className="rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Input
                      value={shot.title}
                      onChange={(event) =>
                        updateShot(shot.id, { title: event.target.value })
                      }
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Select
                        value={shot.type}
                        onChange={(event) =>
                          updateShot(shot.id, {
                            type: event.target.value as typeof shot.type,
                          })
                        }
                        className="rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                      </Select>
                      <Select
                        value={shot.status}
                        onChange={(event) =>
                          updateShot(shot.id, {
                            status: event.target.value as typeof shot.status,
                          })
                        }
                        className="rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="not_started">Not started</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </Select>
                    </div>
                    <Input
                      value={shot.notes}
                      onChange={(event) =>
                        updateShot(shot.id, { notes: event.target.value })
                      }
                      className="mt-2 text-xs"
                      placeholder="Notes"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeShot(shot.id)}
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Photo Gallery</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Upload party photos. Images are resized to save space. Stored locally in your browser.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handlePhotoUpload}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4"
          variant="outline"
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Upload photos
        </Button>
        {state.photoVideo.photos.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No photos yet. Add some to build your gallery.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {state.photoVideo.photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-xl bg-white/5"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption || 'Party photo'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 p-2">
                  <Input
                    value={photo.caption}
                    onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                    placeholder="Add caption"
                    className="border-white/10 bg-white/5 text-xs"
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-1 py-1.5 text-xs"
                      onClick={() => downloadPhoto(photo)}
                      aria-label="Download photo"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
                      onClick={() => removePhoto(photo.id)}
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Equipment</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={equipmentItem}
            onChange={(event) => setEquipmentItem(event.target.value)}
            className="flex-1"
            placeholder="Camera, tripod, ring light..."
          />
          <Button type="button" onClick={addEquipment}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {state.photoVideo.equipment.map((item) => (
            <li
              key={item}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              <span>{item}</span>
              <Button
                variant="ghost"
                onClick={() => removeEquipment(item)}
                className="text-xs"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

const PLAYLIST_PHASES = [
  { key: 'pregame' as const, label: 'Pregame' },
  { key: 'arrival' as const, label: 'Arrival' },
  { key: 'peak' as const, label: 'Peak' },
  { key: 'late' as const, label: 'Late' },
  { key: 'windDown' as const, label: 'Wind down' },
]

export function PostPartyPage() {
  const { state, dispatch } = useParty()
  const [cleanupItem, setCleanupItem] = useState('')
  const [leftoverItem, setLeftoverItem] = useState('')

  const toggleFavoriteDrink = (drinkId: string) => {
    const favs = state.postParty.favorites.drinks
    const next = favs.includes(drinkId)
      ? favs.filter((id) => id !== drinkId)
      : [...favs, drinkId]
    dispatch({
      type: 'update_post_party',
      payload: { favorites: { ...state.postParty.favorites, drinks: next } },
    })
  }

  const toggleFavoriteGame = (gameId: string) => {
    const favs = state.postParty.favorites.games
    const next = favs.includes(gameId)
      ? favs.filter((id) => id !== gameId)
      : [...favs, gameId]
    dispatch({
      type: 'update_post_party',
      payload: { favorites: { ...state.postParty.favorites, games: next } },
    })
  }

  const toggleFavoritePlaylist = (phase: string) => {
    const favs = state.postParty.favorites.playlists
    const next = favs.includes(phase)
      ? favs.filter((p) => p !== phase)
      : [...favs, phase]
    dispatch({
      type: 'update_post_party',
      payload: { favorites: { ...state.postParty.favorites, playlists: next } },
    })
  }

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

  const removeCleanup = (item: string) => {
    dispatch({
      type: 'update_post_party',
      payload: {
        cleanupChecklist: state.postParty.cleanupChecklist.filter((i) => i !== item),
      },
    })
  }

  const removeLeftover = (item: string) => {
    dispatch({
      type: 'update_post_party',
      payload: { leftovers: state.postParty.leftovers.filter((i) => i !== item) },
    })
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
            <li
              key={item}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              {item}
              <Button
                variant="ghost"
                onClick={() => removeCleanup(item)}
                className="text-xs"
                aria-label={`Remove ${item}`}
              >
                Remove
              </Button>
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
            <li
              key={item}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              {item}
              <Button
                variant="ghost"
                onClick={() => removeLeftover(item)}
                className="text-xs"
                aria-label={`Remove ${item}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Favorites</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Mark what worked so you can reuse it next time.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase text-slate-400">Drinks</p>
            <div className="flex flex-wrap gap-2">
              {state.drinks.suggestions.map((drink) => {
                const isFav = state.postParty.favorites.drinks.includes(drink.id)
                return (
                  <Button
                    key={drink.id}
                    type="button"
                    variant="outline"
                    onClick={() => toggleFavoriteDrink(drink.id)}
                    className={
                      isFav ? 'bg-emerald-500/20 text-emerald-200' : ''
                    }
                    aria-pressed={isFav}
                    aria-label={isFav ? `Remove ${drink.name} from favorites` : `Add ${drink.name} to favorites`}
                  >
                    {drink.name}
                  </Button>
                )
              })}
              {state.drinks.suggestions.length === 0 ? (
                <span className="text-sm text-slate-500">Add drinks in Drinks hub first.</span>
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-slate-400">Games</p>
            <div className="flex flex-wrap gap-2">
              {state.games.games.map((game) => {
                const isFav = state.postParty.favorites.games.includes(game.id)
                return (
                  <Button
                    key={game.id}
                    type="button"
                    variant="outline"
                    onClick={() => toggleFavoriteGame(game.id)}
                    className={
                      isFav ? 'bg-emerald-500/20 text-emerald-200' : ''
                    }
                    aria-pressed={isFav}
                    aria-label={isFav ? `Remove ${game.name} from favorites` : `Add ${game.name} to favorites`}
                  >
                    {game.name}
                  </Button>
                )
              })}
              {state.games.games.length === 0 ? (
                <span className="text-sm text-slate-500">Add games in Games hub first.</span>
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-slate-400">Playlists</p>
            <div className="flex flex-wrap gap-2">
              {PLAYLIST_PHASES.map(({ key, label }) => {
                const isFav = state.postParty.favorites.playlists.includes(key)
                return (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    onClick={() => toggleFavoritePlaylist(key)}
                    className={
                      isFav ? 'bg-emerald-500/20 text-emerald-200' : ''
                    }
                    aria-pressed={isFav}
                    aria-label={isFav ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
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
