import { supabase } from './auth'
import type { PartyState } from '../state/types'

export interface PartyRow {
  id: string
  party_profile_id: string
  name: string
  state: unknown
  created_at: string
  updated_at: string
}

/** Omit auth from state when storing (restored from session on load) */
function stateForStorage(state: PartyState): Omit<PartyState, 'auth'> {
  const { auth: _auth, ...rest } = state
  return rest
}

export const PartyService = {
  async list(partyProfileId: string, userId?: string): Promise<PartyRow[]> {
    const [ownedRes, collaboratedRes] = await Promise.all([
      supabase
        .from('parties')
        .select('id, party_profile_id, name, state, created_at, updated_at')
        .eq('party_profile_id', partyProfileId)
        .order('updated_at', { ascending: false }),
      userId
        ? supabase
            .from('party_collaborators')
            .select('party_id')
            .eq('user_id', userId)
            .then(async ({ data: collabIds, error: ce }) => {
              if (ce || !collabIds?.length) return [] as PartyRow[]
              const ids = collabIds.map((r) => r.party_id)
              const { data, error } = await supabase
                .from('parties')
                .select('id, party_profile_id, name, state, created_at, updated_at')
                .in('id', ids)
                .order('updated_at', { ascending: false })
              if (error) return []
              return (data ?? []) as PartyRow[]
            })
        : Promise.resolve([] as PartyRow[]),
    ])

    if (ownedRes.error) throw ownedRes.error
    const owned = (ownedRes.data ?? []) as PartyRow[]
    const collaborated = collaboratedRes

    const seen = new Set(owned.map((p) => p.id))
    const merged = [...owned]
    for (const p of collaborated) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        merged.push(p)
      }
    }
    merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    return merged
  },

  async get(partyId: string): Promise<PartyRow | null> {
    const { data, error } = await supabase
      .from('parties')
      .select('id, party_profile_id, name, state, created_at, updated_at')
      .eq('id', partyId)
      .single()

    if (error || !data) return null
    return data as PartyRow
  },

  async create(partyProfileId: string, initialState: PartyState): Promise<PartyRow> {
    const { data, error } = await supabase
      .from('parties')
      .insert({
        party_profile_id: partyProfileId,
        name: initialState.core.name || 'New Party',
        state: stateForStorage(initialState),
      })
      .select()
      .single()

    if (error) throw error
    return data as PartyRow
  },

  async update(partyId: string, state: PartyState): Promise<PartyRow> {
    const { data, error } = await supabase
      .from('parties')
      .update({
        name: state.core.name || 'New Party',
        state: stateForStorage(state),
        updated_at: new Date().toISOString(),
      })
      .eq('id', partyId)
      .select()
      .single()

    if (error) throw error
    return data as PartyRow
  },

  async delete(partyId: string): Promise<void> {
    const { error } = await supabase.from('parties').delete().eq('id', partyId)
    if (error) throw error
  },
}
