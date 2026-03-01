import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { supabase, AuthService, getAuthRedirectUrl } from '../services/auth'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Sparkles, Lock, Loader2, ShieldCheck, Mail, MailCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParty } from '../state/PartyContext'

export function AuthGate() {
    const { state } = useParty()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'signin' | 'signup'>('signup')
    const [authMethod, setAuthMethod] = useState<'password' | 'magic' | null>(null)
    const [magicLinkSent, setMagicLinkSent] = useState(false)
    const [emailConfirmationSent, setEmailConfirmationSent] = useState(false)

    if (!state.auth.initialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020617]">
                <Loader2 className="size-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    if (state.auth.user) {
        return <Outlet />
    }

    const handlePasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = mode === 'signin'
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: getAuthRedirectUrl() },
                })

            if (result.error) throw result.error

            // Sign up with email confirmation: success but no session until user confirms
            if (mode === 'signup' && result.data.user && !result.data.session) {
                setEmailConfirmationSent(true)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMagicLinkSent(false)

        try {
            const { error } = await AuthService.signInWithMagicLink(email)
            if (error) throw error
            setMagicLinkSent(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send magic link')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError(null)
        try {
            const { error } = await AuthService.signInWithGoogle()
            if (error) throw error
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed')
        } finally {
            setLoading(false)
        }
    }

    const handleSimulate = () => {
        supabase.auth.signInWithPassword({ email: 'demo@party.com', password: 'password' })
    }

    const showPasswordForm = authMethod === 'password' || (!authMethod && !magicLinkSent && !emailConfirmationSent)
    const showMagicForm = authMethod === 'magic' && !magicLinkSent
    const showMagicSuccess = authMethod === 'magic' && magicLinkSent
    const showEmailConfirmSuccess = emailConfirmationSent

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-12">
            <div className="glow-orb" />
            <div className="glow-sweep" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="mb-8 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-[2rem] bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <Lock className="size-8 text-emerald-400" />
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className="mt-2 text-slate-400">
                        {mode === 'signup'
                            ? 'Sign up to create your party profile and plan events.'
                            : 'Sign in to access your party command center.'}
                    </p>
                    <div className="mt-6 flex rounded-2xl border border-white/10 bg-black/20 p-1">
                        <button
                            type="button"
                            onClick={() => { setMode('signin'); setEmailConfirmationSent(false) }}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('signup'); setEmailConfirmationSent(false) }}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                <Card className="border-white/5 bg-black/40 backdrop-blur-2xl">
                    {/* Google Sign In */}
                    <div className="space-y-4">
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-400"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <svg className="size-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest text-slate-500">
                                <span className="bg-black/40 px-3">or</span>
                            </div>
                        </div>

                        {/* Email confirmation required (sign up with confirm enabled) */}
                        <AnimatePresence>
                            {showEmailConfirmSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <MailCheck className="size-5 shrink-0 text-emerald-400" />
                                        <div>
                                            <p className="font-semibold text-emerald-200">Check your email</p>
                                            <p className="mt-1 text-sm text-slate-300">
                                                We sent a confirmation link to <span className="font-medium text-white">{email}</span>. Click the link to activate your account.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setEmailConfirmationSent(false)}
                                                className="mt-3 text-xs font-medium text-emerald-400 hover:underline"
                                            >
                                                Use a different email
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Magic link success */}
                        <AnimatePresence>
                            {showMagicSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <MailCheck className="size-5 shrink-0 text-emerald-400" />
                                        <div>
                                            <p className="font-semibold text-emerald-200">Check your email</p>
                                            <p className="mt-1 text-sm text-slate-300">
                                                We sent a sign-in link to <span className="font-medium text-white">{email}</span>
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMagicLinkSent(false)
                                                    setAuthMethod(null)
                                                }}
                                                className="mt-3 text-xs font-medium text-emerald-400 hover:underline"
                                            >
                                                Use a different method
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Magic link form */}
                        {showMagicForm && (
                            <form onSubmit={handleMagicLink} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="rounded-2xl border-white/5 bg-black/20 focus:bg-black/40"
                                    />
                                </div>
                                <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={loading}>
                                    {loading ? <Loader2 className="size-4 animate-spin" /> : <><Mail className="size-4" /> Send magic link</>}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod(null)}
                                    className="w-full text-xs text-slate-500 hover:text-emerald-400"
                                >
                                    Use password instead
                                </button>
                            </form>
                        )}

                        {/* Password form */}
                        {showPasswordForm && !showMagicSuccess && (
                            <form onSubmit={handlePasswordAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="operator@party.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="rounded-2xl border-white/5 bg-black/20 focus:bg-black/40"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="rounded-2xl border-white/5 bg-black/20 focus:bg-black/40"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full rounded-2xl shadow-lg shadow-emerald-500/20"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="size-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Create account'}
                                </Button>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setAuthMethod('magic')}
                                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-500/60 hover:text-emerald-400 transition-colors"
                                    >
                                        <Mail className="size-3" />
                                        Magic link instead
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="flex justify-center pt-2">
                            <button
                                type="button"
                                onClick={handleSimulate}
                                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors"
                            >
                                <Sparkles className="size-3" />
                                Quick demo
                            </button>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-3" />
                        AES-256 Validated
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-3" />
                        Supabase Secure
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
