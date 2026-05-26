import { createClient } from '@supabase/supabase-js'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

/** Returns true if Supabase is properly configured; false if placeholders/missing */
export function validateSupabaseConfig(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  const isPlaceholder =
    !url ||
    !key ||
    url === PLACEHOLDER_URL ||
    key === PLACEHOLDER_KEY ||
    url.trim() === '' ||
    key.trim() === ''
  if (isPlaceholder) {
    const msg =
      '[Party Command Center] Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env. Auth features will not work.'
    console.warn(msg)
    return false
  }
  return true
}

// World-class security configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || PLACEHOLDER_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || PLACEHOLDER_KEY

// Validate on module load so developers see issues early
validateSupabaseConfig()

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        detectSessionInUrl: true, // Parse auth tokens from URL hash/params on callback
    },
})

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

    async resetPasswordForEmail(email: string) {
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}${base}/reset-password`,
        })
        return { error }
    },

    async updateUser(attributes: { password?: string }) {
        const { error } = await supabase.auth.updateUser(attributes)
        return { error }
    }
}
