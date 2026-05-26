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
import { Copy } from 'lucide-react'
import { parseISO, isBefore, startOfDay } from 'date-fns'
import { DEFAULT_LEADS } from '../../constants/leads'

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

export default EventsPage
