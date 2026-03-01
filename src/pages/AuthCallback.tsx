import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase, AuthService } from '../services/auth'
import { Loader2, AlertCircle } from 'lucide-react'

/**
 * Handles OAuth and magic link redirects.
 * - OAuth: Supabase puts tokens in URL hash; client auto-restores session on load.
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

            if (tokenHash && type) {
                const { error } = await AuthService.verifyMagicLink(tokenHash, type)
                if (error) {
                    setError(error.message)
                    return
                }
            }

            // For OAuth, session is restored from hash by Supabase; for magic link, verifyOtp sets it.
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                navigate('/', { replace: true })
                return
            }

            if (!tokenHash && !type) {
                setError('Invalid auth callback. No session or verification params.')
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
