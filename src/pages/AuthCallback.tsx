import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase, AuthService } from '../services/auth'
import { Loader2, AlertCircle } from 'lucide-react'

/**
 * Handles OAuth and magic link redirects.
 * - OAuth: Supabase puts tokens in URL hash; client restores session async.
 * - Magic link: URL has token_hash&type; we call verifyOtp to establish session.
 */
export function AuthCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const run = async () => {
            const tokenHash = searchParams.get('token_hash')
            const type = searchParams.get('type')
            const isOAuthReturn = typeof window !== 'undefined' && window.location.hash.length > 0

            if (tokenHash && type) {
                const { error } = await AuthService.verifyOtp(tokenHash, type)
                if (error) {
                    setError(error.message)
                    return
                }
            }

            // For OAuth, Supabase processes the hash asynchronously; poll briefly for session.
            const maxAttempts = 10
            const delayMs = 150
            for (let i = 0; i < maxAttempts; i++) {
                const { data } = await supabase.auth.getSession()
                if (data.session) {
                    navigate('/', { replace: true })
                    return
                }
                if (!isOAuthReturn && !tokenHash) break
                await new Promise((r) => setTimeout(r, delayMs))
            }

            const { data } = await supabase.auth.getSession()
            if (data.session) {
                navigate('/', { replace: true })
                return
            }

            if (!tokenHash && !type && !isOAuthReturn) {
                setError('Invalid auth callback. No session or verification params.')
            } else if (isOAuthReturn || tokenHash) {
                setError('Sign-in could not be completed. Please try again.')
            }
        }

        run()
    }, [searchParams, navigate])

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-6">
                <AlertCircle className="size-12 text-rose-400" />
                <p className="mt-4 max-w-md text-center text-slate-300">{error}</p>
                <button
                    onClick={() => navigate('/', { replace: true })}
                    className="mt-6 rounded-xl bg-emerald-500/20 px-6 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30"
                >
                    Return home
                </button>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617]">
            <Loader2 className="size-10 animate-spin text-emerald-500" />
        </div>
    )
}
