import { supabase } from './auth'

export interface PartyProfile {
  id: string
  owner_id: string
  name: string
  created_at: string
  updated_at: string
}

export const PartyProfileService = {
  async getByOwner(userId: string): Promise<PartyProfile | null> {
    const { data, error } = await supabase
      .from('party_profiles')
      .select('id, owner_id, name, created_at, updated_at')
      .eq('owner_id', userId)
      .single()

    if (error || !data) return null
    return data as PartyProfile
  },

  async ensureForUser(userId: string): Promise<PartyProfile> {
    const existing = await this.getByOwner(userId)
    if (existing) return existing

    const { data, error } = await supabase
      .from('party_profiles')
      .insert({ owner_id: userId, name: 'My Party Profile' })
      .select()
      .single()

    if (error) throw error
    return data as PartyProfile
  },

  async update(profileId: string, updates: Partial<Pick<PartyProfile, 'name'>>) {
    const { data, error } = await supabase
      .from('party_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select()
      .single()

    if (error) throw error
    return data as PartyProfile
  },
}
