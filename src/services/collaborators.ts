import { supabase } from './auth'

export interface PartyCollaborator {
  id: string
  party_id: string
  user_id: string
  invited_by: string | null
  created_at: string
}

const INVITE_EXPIRY_DAYS = 7

export const CollaboratorService = {
  async list(partyId: string): Promise<PartyCollaborator[]> {
    const { data, error } = await supabase
      .from('party_collaborators')
      .select('id, party_id, user_id, invited_by, created_at')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []) as PartyCollaborator[]
  },

  async add(partyId: string, userId: string): Promise<void> {
    const { data } = await supabase.auth.getSession()
    const userIdInviter = data.session?.user?.id ?? null
    const { error } = await supabase
      .from('party_collaborators')
      .insert({ party_id: partyId, user_id: userId, invited_by: userIdInviter })

    if (error) throw error
  },

  async remove(partyId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('party_collaborators')
      .delete()
      .eq('party_id', partyId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async createInviteToken(partyId: string): Promise<string> {
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS)

    const { data } = await supabase.auth.getSession()
    const createdBy = data.session?.user?.id ?? null
    const { error } = await supabase
      .from('party_invite_tokens')
      .insert({
        party_id: partyId,
        token,
        expires_at: expiresAt.toISOString(),
        created_by: createdBy,
      })

    if (error) throw error
    return token
  },

  async redeemInviteToken(token: string): Promise<string> {
    const { data, error } = await supabase.rpc('redeem_party_invite', { p_token: token })

    if (error) throw error
    if (!data) throw new Error('Failed to redeem invite')
    return data as string
  },
}
