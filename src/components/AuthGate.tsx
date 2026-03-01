import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { supabase, AuthService } from '../services/auth'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Sparkles, Lock, Loader2, ShieldCheck, Mail, MailCheck, ShieldX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParty } from '../state/PartyContext'

/** Parse the VITE_ALLOWED_EMAIL_DOMAINS env var into a lowercase domain list. */
function getAllowedDomains(): string[] {
    return (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || '')
        .split(',')
        .map((d: string) => d.trim().toLowerCase())
        .filter(Boolean)
}

/** Return true if the given email is permitted to access the command center. */
function isDomainAllowed(email: string): boolean {
    const domains = getAllowedDomains()
    if (domains.length === 0) return true
    const domain = email.split('@')[1]?.toLowerCase() ?? ''
    return domains.includes(domain)
}

function AccessDenied({ email }: { email: string }) {
    const domain = email.split('@')[1] ?? ''
    const allowed = getAllowedDomains()

    const handleSignOut = () => supabase.auth.signOut()

    return (
        <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-[#020617] px-6 py-12">
            <div className="glow-orb" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md text-center"
            >
                <div className="mx-auto flex size-16 items-center justify-center rounded-[2rem] bg-rose-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <ShieldX className="size-8 text-rose-400" />
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Access Denied</h1>
                <p className="mt-2 text-slate-400">
                    Your email domain{' '}
                    <span className="font-semibold text-rose-400">@{domain}</span>{' '}
                    is not authorized to access this command center.
                </p>

                {allowed.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-500">
                        Allowed:{' '}
                        {allowed.map((d) => (
                            <span key={d} className="mx-1 font-mono text-slate-400">@{d}</span>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full rounded-2xl border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        onClick={handleSignOut}
                    >
                        Sign out &amp; try a different account
                    </Button>
                </div>

                <p className="mt-6 text-xs text-slate-600">
                    Signed in as <span className="text-slate-500">{email}</span>
                </p>
            </motion.div>
        </div>
    )
}

export function AuthGate() {
    const { state } = useParty()
    const navigate = useNavigate()

    useEffect(() => {
        if (!state.auth.user) return
        const returnTo = sessionStorage.getItem('inviteReturnTo')
        if (returnTo) {
            sessionStorage.removeItem('inviteReturnTo')
            navigate(returnTo, { replace: true })
        }
    }, [state.auth.user, navigate])
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'signin' | 'signup'>('signup')
    const [authMethod, setAuthMethod] = useState<'password' | 'magic' | null>(null)
    const [magicLinkSent, setMagicLinkSent] = useState(false)
    const [emailConfirmationSent, setEmailConfirmationSent] = useState(false)
    const [demoLoading, setDemoLoading] = useState(false)

    if (!state.auth.initialized) {
        return (
            <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-[#020617]">
                <Loader2 className="size-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    if (state.auth.user) {
        const userEmail: string = state.auth.user.email ?? ''
        if (!isDomainAllowed(userEmail)) {
            return <AccessDenied email={userEmail} />
        }
        return <Outlet />
    }

    const handlePasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = mode === 'signin'
                ? await AuthService.signInWithPassword(email, password)
                : await AuthService.signUp(email, password)

            if (result.error) throw result.error

            // Sign up with email confirmation: success but no session until user confirms
            if (mode === 'signup' && result.data?.user && !result.data?.session) {
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

    const handleSimulate = async () => {
        setDemoLoading(true)
        setError(null)
        try {
            const { error } = await supabase.auth.signInWithPassword({ email: 'demo@party.com', password: 'password' })
            if (error) throw error
        } catch {
            setError('Demo account not available. Sign up or use magic link.')
        } finally {
            setDemoLoading(false)
        }
    }

    const showPasswordForm = authMethod === 'password' || (!authMethod && !magicLinkSent && !emailConfirmationSent)
    const showMagicForm = authMethod === 'magic' && !magicLinkSent
    const showMagicSuccess = authMethod === 'magic' && magicLinkSent
    const showEmailConfirmSuccess = emailConfirmationSent

    return (
        <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-[#020617] px-6 py-12">
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
                    {getAllowedDomains().length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                            Requires an email ending in{' '}
                            {getAllowedDomains().map((d, i, arr) => (
                                <span key={d}>
                                    <span className="font-mono text-emerald-500/70">@{d}</span>
                                    {i < arr.length - 1 ? ' or ' : ''}
                                </span>
                            ))}
                        </p>
                    )}
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
                                disabled={demoLoading}
                                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                            >
                                {demoLoading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
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
