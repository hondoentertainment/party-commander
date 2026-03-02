import { supabase } from './auth'
import type { PartyEvent } from '../state/types'

interface PartyEventRow {
  id: string
  party_id: string
  name: string
  date: string
  location: string
  link: string
  notes: string
  lead_name: string | null
  created_at: string
  updated_at: string
}

function rowToEvent(row: PartyEventRow): PartyEvent {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    location: row.location,
    link: row.link,
    notes: row.notes,
    leadName: row.lead_name ?? undefined,
  }
}

export const EventService = {
  async listByParty(partyId: string): Promise<PartyEvent[]> {
    const { data, error } = await supabase
      .from('party_events')
      .select('id, party_id, name, date, location, link, notes, lead_name, created_at, updated_at')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []).map(rowToEvent)
  },

  async sync(partyId: string, items: PartyEvent[]): Promise<void> {
    if (items.length === 0) {
      const { error } = await supabase.from('party_events').delete().eq('party_id', partyId)
      if (error) throw error
      return
    }

    const now = new Date().toISOString()
    const rows = items.map((e) => ({
      id: e.id,
      party_id: partyId,
      name: e.name ?? '',
      date: e.date ?? '',
      location: e.location ?? '',
      link: e.link ?? '',
      notes: e.notes ?? '',
      lead_name: e.leadName ?? null,
      updated_at: now,
    }))

    const { error: deleteError } = await supabase
      .from('party_events')
      .delete()
      .eq('party_id', partyId)
    if (deleteError) throw deleteError

    const { error: insertError } = await supabase.from('party_events').insert(rows)
    if (insertError) throw insertError
  },
}
