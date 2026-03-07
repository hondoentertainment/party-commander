import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Card, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'

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

export default LeadsPage
