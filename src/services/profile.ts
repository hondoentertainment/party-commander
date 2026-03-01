import { supabase } from './auth'

export interface Profile {
    id: string
    display_name: string | null
    avatar_url: string | null
    updated_at: string
}

export const ProfileService = {
    async get(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, updated_at')
            .eq('id', userId)
            .single()

        if (error || !data) return null
        return data as Profile
    },

    async upsert(userId: string, updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert(
                {
                    id: userId,
                    ...updates,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
            )
            .select()
            .single()

        if (error) throw error
        return data as Profile
    },
}
