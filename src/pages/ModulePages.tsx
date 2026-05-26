import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useParty } from '../state/PartyContext'
import { cn } from '../components/ui/utils'
import { v4 as uuid } from 'uuid'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import {
  Copy,
  Download,
  ImagePlus,
  Trash2,
  Sparkles,
  RotateCcw,
  Music2,
} from 'lucide-react'
import { SpotifyEmbedModal, type SpotifyTarget } from '../components/SpotifyEmbedModal'
import { AuthService } from '../services/auth'
import { uploadPartyPhoto, deletePartyPhoto, getPhotoPublicUrl } from '../services/photoStorage'
import { isLocalParty } from '../state/storage'
import { parseISO, isBefore, startOfDay } from 'date-fns'
import { getShoppingListItems } from '../state/engines'
import { spotifyUrlToEmbed, isSpotifyUrl } from '../utils/spotify'
import type { DrinkSuggestion, GalleryPhoto, ShoppingListBaseKey } from '../state/types'
import type { Theme } from '../state/types'

export { BudgetPage } from './modules/BudgetPage'

const PARTY_CONCEPTS: Theme[] = [
  'Classic',
  'Rooftop',
  'Tropical',
  'Disco',
  'Game Night',
  'Cozy',
  'Minimal',
  'Custom',
]

export function PlanPage() {
  const { state, dispatch } = useParty()

  const setTheme = (theme: Theme) => {
    dispatch({
      type: 'update_core',
      payload: { theme, customTheme: theme === 'Custom' ? state.core.customTheme : '' },
    })
  }

  const setCustomTheme = (customTheme: string) => {
    dispatch({ type: 'update_core', payload: { customTheme } })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Plan</h3>
      <p className="text-sm text-slate-300">
        Pick a party concept for your event. This sets the vibe for drinks and decor.
      </p>

      <Card>
        <CardTitle>Party concepts</CardTitle>
        <ul className="mt-4 space-y-2">
          {PARTY_CONCEPTS.map((concept) => (
            <li key={concept}>
              <button
                type="button"
                onClick={() => setTheme(concept)}
                className={cn(
                  'w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition',
                  state.core.theme === concept
                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                {concept}
              </button>
            </li>
          ))}
        </ul>
        {state.core.theme === 'Custom' && (
          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-400">Custom concept name</span>
            <Input
              value={state.core.customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              className="mt-2"
              placeholder="e.g. Art Deco Speakeasy"
            />
          </label>
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

const DEFAULT_LEADS = [
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
] as const

export function EventsPage() {
  const { state, dispatch, currentPartyId, parties } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; name: string } | null>(null)
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null)
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [draft, setDraft] = useState({
    name: '',
    date: '',
    location: '',
    link: '',
    notes: '',
    leadName: '',
  })

  const today = startOfDay(new Date())
  const activeEvents = state.events.items.filter((e) => {
    if (!e.date) return true
    const d = parseISO(e.date)
    return !isNaN(d.getTime()) && !isBefore(startOfDay(d), today)
  })
  const pastEvents = state.events.items.filter((e) => {
    if (!e.date) return false
    const d = parseISO(e.date)
    return !isNaN(d.getTime()) && isBefore(startOfDay(d), today)
  })
  const displayedEvents = showActiveOnly ? activeEvents : state.events.items

  const copyEventId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedEventId(id)
      window.setTimeout(() => setCopiedEventId(null), 1500)
    } catch {
      setCopiedEventId(null)
    }
  }

  const addEvent = () => {
    if (!draft.name.trim()) return
    dispatch({
      type: 'update_events',
      payload: {
        items: [
          ...state.events.items,
          { id: uuid(), ...draft, name: draft.name.trim(), leadName: draft.leadName.trim() || undefined },
        ],
      },
    })
    setDraft({ name: '', date: '', location: '', link: '', notes: '', leadName: '' })
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

  const copyLeadsToEvent = (sourceEventId: string, targetEventId: string) => {
    const source = state.events.items.find((e) => e.id === sourceEventId)
    const leads = source?.leads?.length ? [...source.leads] : DEFAULT_LEADS.map((l) => ({ ...l, id: uuid() }))
    const targetLeads = leads.map((l) => ({ ...l, id: uuid() }))
    updateEvent(targetEventId, { leads: targetLeads })
  }

  const copyPartyLeadsToEvent = (targetEventId: string) => {
    const leads = state.leads.items.map((l) => ({ ...l, id: uuid() }))
    updateEvent(targetEventId, { leads })
  }

  const copyMenuToEvent = (sourceEventId: string, targetEventId: string) => {
    const source = state.events.items.find((e) => e.id === sourceEventId)
    const menuItems = source?.menuItems?.length ? source.menuItems.map((m) => ({ ...m, id: uuid() })) : state.menu.items.map((m) => ({ ...m, id: uuid() }))
    updateEvent(targetEventId, { menuItems })
  }

  const copyPartyMenuToEvent = (targetEventId: string) => {
    const menuItems = state.menu.items.map((m) => ({ ...m, id: uuid() }))
    updateEvent(targetEventId, { menuItems })
  }

  const needsParty = !currentPartyId

  if (needsParty) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <h3 className="text-2xl font-semibold text-white">Events</h3>
        <p className="text-sm text-slate-300">Add upcoming events and keep an archive.</p>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm text-amber-200">
            {parties.length > 0
              ? 'Select a party from the home page to manage its events.'
              : 'Create your first party from the home page to get started.'}
          </span>
          <Link
            to="/"
            className="shrink-0 rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Events</h3>
      <p className="text-sm text-slate-300">Add upcoming events and keep an archive.</p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={showActiveOnly ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowActiveOnly(true)}
        >
          Active events ({activeEvents.length})
        </Button>
        <Button
          type="button"
          variant={!showActiveOnly ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowActiveOnly(false)}
        >
          All events
        </Button>
      </div>

        <Card>
        <CardTitle>Add event</CardTitle>
        {state.events.items.length === 0 && (state.core.name || state.core.date || state.core.location) && (
          <div className="mt-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                dispatch({
                  type: 'update_events',
                  payload: {
                    items: [{
                      id: uuid(),
                      name: state.core.name || 'My Party',
                      date: state.core.date,
                      location: state.core.location,
                      link: '',
                      notes: '',
                    }],
                  },
                })
              }}
            >
              Initialize from party details
            </Button>
            <p className="mt-2 text-xs text-slate-500">One event, same as your party</p>
          </div>
        )}
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
          <label className="text-sm text-slate-300">
            Lead
            <Input
              value={draft.leadName}
              onChange={(event) => setDraft({ ...draft, leadName: event.target.value })}
              className="mt-2"
              placeholder="Person responsible"
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
        {displayedEvents.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            {showActiveOnly && pastEvents.length > 0 ? 'No active events. Switch to "All events" to see past ones.' : 'No events yet.'}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {displayedEvents.map((event) => (
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
                  <Input
                    value={event.leadName ?? ''}
                    onChange={(e) => updateEvent(event.id, { leadName: e.target.value || undefined })}
                    placeholder="Lead"
                  />
                  <Textarea
                    value={event.notes}
                    onChange={(e) => updateEvent(event.id, { notes: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">Copy to this event:</span>
                    <Select
                      value=""
                      onChange={(e) => {
                        const src = e.target.value
                        if (src) {
                          if (src === '__party__') copyPartyLeadsToEvent(event.id)
                          else copyLeadsToEvent(src, event.id)
                          e.target.value = ''
                        }
                      }}
                      className="h-7 text-xs"
                    >
                      <option value="">Leads from...</option>
                      {state.events.items.filter((ev) => ev.id !== event.id).map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.name || 'Unnamed'}</option>
                      ))}
                      <option value="__party__">Party default</option>
                    </Select>
                    <Select
                      value=""
                      onChange={(e) => {
                        const src = e.target.value
                        if (src) {
                          if (src === '__party__') copyPartyMenuToEvent(event.id)
                          else copyMenuToEvent(src, event.id)
                          e.target.value = ''
                        }
                      }}
                      className="h-7 text-xs"
                    >
                      <option value="">Menu from...</option>
                      {state.events.items.filter((ev) => ev.id !== event.id).map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.name || 'Unnamed'}</option>
                      ))}
                      <option value="__party__">Party menu</option>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyEventId(event.id)}
                      className="text-xs text-slate-400 hover:text-white"
                      title="Copy event ID to share with collaborators"
                    >
                      {copiedEventId === event.id ? 'Copied' : <> <Copy className="mr-1.5 size-3.5" aria-hidden />Copy event ID</>}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmingRemove({ id: event.id, name: event.name || 'this event' })}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => {
          if (confirmingRemove) removeEvent(confirmingRemove.id)
        }}
        title="Remove event"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.name}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export function LeadsPage() {
  const { state, dispatch } = useParty()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const isPartyScope = selectedEventId === null || selectedEventId === '__party__'
  const selectedEvent = selectedEventId ? state.events.items.find((e) => e.id === selectedEventId) : null
  const currentLeads = isPartyScope
    ? state.leads.items
    : (selectedEvent?.leads ?? DEFAULT_LEADS.map((l) => ({ ...l, id: uuid() })))

  const updatePartyLead = (id: string, leadName: string) => {
    dispatch({
      type: 'update_leads',
      payload: {
        items: state.leads.items.map((lead) =>
          lead.id === id ? { ...lead, leadName } : lead,
        ),
      },
    })
  }

  const updateEventLead = (id: string, leadName: string) => {
    if (!selectedEventId || isPartyScope) return
    dispatch({
      type: 'update_events',
      payload: {
        items: state.events.items.map((ev) =>
          ev.id === selectedEventId
            ? {
                ...ev,
                leads: (ev.leads ?? DEFAULT_LEADS.map((l) => ({ ...l, id: uuid() }))).map((l) =>
                  l.id === id ? { ...l, leadName } : l,
                ),
              }
            : ev,
        ),
      },
    })
  }

  const updateLead = (id: string, leadName: string) => {
    if (isPartyScope) updatePartyLead(id, leadName)
    else updateEventLead(id, leadName)
  }

  const copyLeadsToEvent = (targetEventId: string) => {
    const leads = currentLeads.map((l) => ({ ...l, id: uuid() }))
    const target = state.events.items.find((e) => e.id === targetEventId)
    if (!target) return
    dispatch({
      type: 'update_events',
      payload: {
        items: state.events.items.map((ev) =>
          ev.id === targetEventId ? { ...ev, leads } : ev,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Team Roles</h3>
      <p className="text-sm text-slate-300">Assign roles to team members. Leads are per event.</p>

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
        {currentLeads.length > 0 && (
          <Select
            value=""
            onChange={(e) => {
              const target = e.target.value
              if (target) {
                copyLeadsToEvent(target)
                e.target.value = ''
              }
            }}
            className="w-40 text-sm"
          >
            <option value="">Copy to event...</option>
            {state.events.items
              .filter((ev) => ev.id !== selectedEventId)
              .map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name || 'Unnamed'}</option>
              ))}
          </Select>
        )}
      </div>

      <Card>
        <CardTitle>Function leads{!isPartyScope ? ` (${state.events.items.find((e) => e.id === selectedEventId)?.name || 'Event'})` : ''}</CardTitle>
        <div className="mt-4 space-y-3">
          {currentLeads.map((lead) => (
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

export { DecorPage } from './modules/DecorPage'
export { CleaningPage } from './modules/CleaningPage'


export { TimelinePage } from './modules/TimelinePage'
export function MusicPage() {
  const { state, dispatch } = useParty()
  const [spotifyModalOpen, setSpotifyModalOpen] = useState(false)
  const [spotifyModalTarget, setSpotifyModalTarget] = useState<SpotifyTarget>('mainLink')

  const activeSpotifyUrl =
    (state.music.mainLink && isSpotifyUrl(state.music.mainLink) ? state.music.mainLink : null) ||
    Object.values(state.music.playlists).find((url) => url && isSpotifyUrl(url)) ||
    null
  const embedUrl = activeSpotifyUrl ? spotifyUrlToEmbed(activeSpotifyUrl) : null

  const openSpotifyModal = (target: SpotifyTarget) => {
    setSpotifyModalTarget(target)
    setSpotifyModalOpen(true)
  }

  const handleSpotifySave = (url: string, target: SpotifyTarget) => {
    if (target === 'mainLink') {
      dispatch({ type: 'update_music', payload: { mainLink: url } })
    } else {
      dispatch({
        type: 'update_music',
        payload: {
          playlists: { ...state.music.playlists, [target]: url },
        },
      })
    }
  }

  const getUrlForTarget = (target: SpotifyTarget): string =>
    target === 'mainLink' ? state.music.mainLink : state.music.playlists[target]

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
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-white/5 bg-white/5"
                onClick={() => openSpotifyModal('mainLink')}
              >
                <Music2 className="size-3.5" />
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

      {embedUrl && (
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="size-4" />
            Spotify Player
          </CardTitle>
          <div className="mt-4 rounded-xl overflow-hidden bg-black/40">
            <iframe
              src={embedUrl}
              title="Spotify embed"
              width="100%"
              height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border-0"
            />
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Master Playlist Link</CardTitle>
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              value={state.music.mainLink}
              onChange={(event) =>
                dispatch({ type: 'update_music', payload: { mainLink: event.target.value } })
              }
              placeholder="https://open.spotify.com/..."
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => openSpotifyModal('mainLink')}
              title="Add via Spotify Hub"
            >
              Add
            </Button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Link your master event playlist for one-tap access. Paste a Spotify playlist or track URL.
          </p>
        </div>
      </Card>

      <Card>
        <CardTitle>Phase playlists</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(['pregame', 'arrival', 'peak', 'late', 'windDown'] as const).map((phase) => (
            <label key={phase} className="text-sm text-slate-300">
              {phase}
              <div className="mt-2 flex gap-2">
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
                  className="flex-1"
                  placeholder="https://open.spotify.com/..."
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openSpotifyModal(phase)}
                  title="Add via Spotify Hub"
                >
                  Add
                </Button>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <SpotifyEmbedModal
        open={spotifyModalOpen}
        onClose={() => setSpotifyModalOpen(false)}
        onSave={handleSpotifySave}
        initialUrl={getUrlForTarget(spotifyModalTarget)}
        target={spotifyModalTarget}
      />
    </div>
  )
}

function GameQRCode({ url }: { url: string }) {
  const encoded = encodeURIComponent(url)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encoded}`
  return (
    <div className="mt-2 flex flex-col items-center gap-2 rounded-lg bg-white/5 p-3">
      <img src={qrUrl} alt="QR code for game link" className="size-32 rounded" />
      <p className="text-xs text-slate-400">Scan to open game link</p>
    </div>
  )
}

export function GamesPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; name: string } | null>(null)
  const [draft, setDraft] = useState({
    name: '',
    category: 'icebreaker' as const,
    durationMins: 15,
    groupSize: '4-8',
    rules: '',
    supplies: '',
    link: '',
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
            link: draft.link.trim() || undefined,
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
      link: '',
    })
  }

  const removeGame = (id: string) => {
    dispatch({
      type: 'update_games',
      payload: { games: state.games.games.filter((game) => game.id !== id) },
    })
  }

  const updateGameLink = (id: string, link: string) => {
    dispatch({
      type: 'update_games',
      payload: {
        games: state.games.games.map((g) => (g.id === id ? { ...g, link: link.trim() || undefined } : g)),
      },
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
          <label className="text-sm text-slate-300 md:col-span-2">
            Game link (rules, instructions, or external game URL)
            <Input
              value={draft.link}
              onChange={(event) => setDraft({ ...draft, link: event.target.value })}
              className="mt-2"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-slate-500">Add a link to generate a QR code for guests to scan.</p>
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
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{game.name}</p>
                    <p className="text-xs uppercase text-slate-400">
                      {game.category} · {game.durationMins} mins · {game.groupSize}
                    </p>
                    {game.supplies.length ? (
                      <p className="mt-2 text-xs text-slate-400">
                        Supplies: {game.supplies.join(', ')}
                      </p>
                    ) : null}
                    <label className="mt-2 block">
                      <span className="text-xs text-slate-500">Game link (for QR code)</span>
                      <Input
                        value={game.link ?? ''}
                        onChange={(e) => updateGameLink(game.id, e.target.value)}
                        className="mt-1"
                        placeholder="https://..."
                      />
                    </label>
                    {game.link && <GameQRCode url={game.link} />}
                  </div>
                  <Button
                    type="button"
                    onClick={() => setConfirmingRemove({ id: game.id, name: game.name })}
                    variant="outline"
                    className="shrink-0 px-3 py-1 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeGame(confirmingRemove.id) }}
        title="Remove game"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.name}"? This cannot be undone.`
            : ''
        }
      />
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
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null)
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
              <Button
                variant="ghost"
                onClick={() => setConfirmingRemove(text)}
                className="text-xs"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeText(confirmingRemove) }}
        title="Remove arrival text"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export function LivePage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null)
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
                onClick={() => setConfirmingRemove(entry)}
                className="text-xs"
                aria-label={`Remove note: ${entry}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeNote(confirmingRemove) }}
        title="Remove note"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove}"? This cannot be undone.`
            : ''
        }
      />
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

type PhotoVideoConfirming =
  | { type: 'shot'; id: string; name: string }
  | { type: 'photo'; id: string }
  | { type: 'equipment'; item: string }
  | null

/** Resolve display URL for a gallery photo (Storage URL or legacy dataUrl) */
function getPhotoDisplayUrl(photo: GalleryPhoto): string {
  if (photo.url) return photo.url
  if (photo.storagePath) return getPhotoPublicUrl(photo.storagePath)
  if (photo.dataUrl) return photo.dataUrl
  return ''
}

export function PhotoVideoPage() {
  const { state, dispatch, currentPartyId } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<PhotoVideoConfirming>(null)
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

  const canUseStorage =
    !!currentPartyId &&
    !isLocalParty(currentPartyId) &&
    !!state.auth.user &&
    AuthService.isConfigured()

  // Migrate legacy base64 photos to Supabase Storage when possible
  const hasMigratedRef = useRef(false)
  useEffect(() => {
    if (!canUseStorage || !currentPartyId || hasMigratedRef.current) return
    const currentPhotos = state.photoVideo.photos
    const toMigrate = currentPhotos.filter((p) => p.dataUrl && !p.url)
    if (toMigrate.length === 0) return
    hasMigratedRef.current = true
    ;(async () => {
      const updates = new Map<string, GalleryPhoto>()
      for (const photo of toMigrate) {
        if (!photo.dataUrl) continue
        try {
          const blob = await (await fetch(photo.dataUrl)).blob()
          const { storagePath, url } = await uploadPartyPhoto(
            currentPartyId,
            photo.id,
            blob,
            photo.filename || 'image.jpg',
          )
          updates.set(photo.id, {
            ...photo,
            storagePath,
            url,
            dataUrl: undefined,
          })
        } catch {
          // Keep dataUrl on failure; no update
        }
      }
      if (updates.size > 0) {
        const nextPhotos = currentPhotos.map((p) => updates.get(p.id) ?? p)
        dispatch({
          type: 'update_photo_video',
          payload: { photos: nextPhotos },
        })
      }
    })()
  }, [canUseStorage, currentPartyId, state.photoVideo.photos, dispatch])

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
      const photoId = uuid()
      const caption = file.name.replace(/\.[^.]+$/, '')
      const addedAt = new Date().toISOString()

      if (canUseStorage) {
        try {
          const blob = await (await fetch(resized)).blob()
          const { storagePath, url } = await uploadPartyPhoto(
            currentPartyId,
            photoId,
            blob,
            file.name,
          )
          newPhotos.push({
            id: photoId,
            storagePath,
            url,
            caption,
            addedAt,
            filename: file.name,
          })
        } catch (err) {
          console.warn('Storage upload failed, falling back to base64:', err)
          newPhotos.push({
            id: photoId,
            dataUrl: resized,
            caption,
            addedAt,
            filename: file.name,
          })
        }
      } else {
        newPhotos.push({
          id: photoId,
          dataUrl: resized,
          caption,
          addedAt,
          filename: file.name,
        })
      }
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

  const downloadPhoto = async (photo: GalleryPhoto) => {
    const downloadName = photo.caption ? `${photo.caption}.jpg` : photo.filename
    if (photo.url) {
      try {
        const res = await fetch(photo.url)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = downloadName
        link.click()
        URL.revokeObjectURL(url)
      } catch {
        window.open(photo.url, '_blank')
      }
      return
    }
    const base64 = photo.dataUrl?.split(',')[1]
    if (!base64) return
    const mime = photo.dataUrl!.match(/data:([^;]+);/)?.[1] ?? 'image/jpeg'
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = downloadName
    link.click()
    URL.revokeObjectURL(url)
  }

  const removePhoto = (id: string) => {
    const photo = state.photoVideo.photos.find((p) => p.id === id)
    if (photo?.storagePath && canUseStorage) {
      deletePartyPhoto(photo.storagePath).catch((err) =>
        console.warn('Failed to delete photo from storage:', err),
      )
    }
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
                    onClick={() => setConfirmingRemove({ type: 'shot', id: shot.id, name: shot.title })}
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
          Upload party photos. Images are resized to save space.
          {canUseStorage
            ? ' Stored in the cloud and synced across devices.'
            : ' Stored locally in your browser.'}
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
                    src={getPhotoDisplayUrl(photo)}
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
                      onClick={() => setConfirmingRemove({ type: 'photo', id: photo.id })}
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
                onClick={() => setConfirmingRemove({ type: 'equipment', item })}
                className="text-xs"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => {
          if (!confirmingRemove) return
          if (confirmingRemove.type === 'shot') removeShot(confirmingRemove.id)
          else if (confirmingRemove.type === 'photo') removePhoto(confirmingRemove.id)
          else if (confirmingRemove.type === 'equipment') removeEquipment(confirmingRemove.item)
        }}
        title="Remove item"
        description={
          confirmingRemove
            ? confirmingRemove.type === 'shot'
              ? `Remove shot "${confirmingRemove.name}"? This cannot be undone.`
              : confirmingRemove.type === 'photo'
                ? 'Remove this photo? This cannot be undone.'
                : `Remove "${confirmingRemove.item}"? This cannot be undone.`
            : ''
        }
      />
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

type PostPartyConfirming =
  | { type: 'cleanup'; item: string }
  | { type: 'leftover'; item: string }
  | null

export function PostPartyPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<PostPartyConfirming>(null)
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
                onClick={() => setConfirmingRemove({ type: 'cleanup', item })}
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
                onClick={() => setConfirmingRemove({ type: 'leftover', item })}
                className="text-xs"
                aria-label={`Remove ${item}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => {
          if (!confirmingRemove) return
          if (confirmingRemove.type === 'cleanup') removeCleanup(confirmingRemove.item)
          else removeLeftover(confirmingRemove.item)
        }}
        title="Remove item"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.item}"? This cannot be undone.`
            : ''
        }
      />

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
