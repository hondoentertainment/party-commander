import { createClient } from '@supabase/supabase-js'

// World-class security configuration
// In a production environment, these would be retrieved from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/** Base URL for auth redirects (used for OAuth callback and magic link) */
export const getAuthRedirectUrl = () =>
    `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '') || ''}/auth/callback`

export interface UserProfile {
    id: string
    email?: string
    lastSignIn: string
}

export const AuthService = {
    isConfigured(): boolean {
        return (
            import.meta.env.VITE_SUPABASE_URL !== undefined &&
            import.meta.env.VITE_SUPABASE_ANON_KEY !== undefined
        )
    },

    async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: getAuthRedirectUrl(),
            },
        })
        return { data, error }
    },

    async signInWithPassword(email: string, password: string) {
        return await supabase.auth.signInWithPassword({ email, password })
    },

    async signInWithMagicLink(email: string) {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: getAuthRedirectUrl(),
                shouldCreateUser: true,
            },
        })
        return { error }
    },

    async verifyOtp(token_hash: string, type: string) {
        // Map URL types to verifyOtp types: signup/magiclink -> email, recovery -> recovery
        const otpType =
            type === 'recovery' ? 'recovery' as const
            : (type === 'signup' || type === 'magiclink') ? 'email' as const
            : (type === 'invite' ? 'invite' as const : 'email' as const)
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: otpType,
        })
        return { error }
    },

    async signOut() {
        return await supabase.auth.signOut()
    },

    onAuthStateChange(callback: (user: unknown) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user ?? null)
        })
    },
}
