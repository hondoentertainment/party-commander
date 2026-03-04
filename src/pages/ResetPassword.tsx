import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthService, supabase } from '../services/auth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader2, KeyRound } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ResetPassword() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Check if we have a session. Since detectSessionInUrl is true,
        // Supabase might have already set the session from the hash.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If there's no session, they shouldn't be here (or haven't clicked a valid link)
                // However, let's just let it be, if update fails it will show an error.
            }
        })
    }, [])

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        setLoading(true)
        setError(null)

        try {
            const { error } = await AuthService.updateUser({ password })
            if (error) throw error
            setSuccess(true)
            setTimeout(() => {
                navigate('/', { replace: true })
            }, 2000)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-[#020617] px-6 py-12">
            <div className="glow-orb" />
            <div className="glow-sweep" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md text-center"
            >
                <div className="mx-auto flex size-16 items-center justify-center rounded-[2rem] bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <KeyRound className="size-8 text-emerald-400" />
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
                    Reset Password
                </h1>
                <p className="mt-2 text-slate-400 mb-8">
                    Enter your new password below.
                </p>

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
                            {success && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400"
                                >
                                    Password updated successfully! Redirecting...
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {!success && (
                            <form onSubmit={handleReset} className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">New Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="rounded-2xl border-white/5 bg-black/20 focus:bg-black/40"
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Confirm Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="rounded-2xl border-white/5 bg-black/20 focus:bg-black/40"
                                        minLength={6}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full rounded-2xl shadow-lg shadow-emerald-500/20"
                                    disabled={loading || password.length < 6 || password !== confirmPassword}
                                >
                                    {loading ? <Loader2 className="size-4 animate-spin" /> : 'Update Password'}
                                </Button>
                                <Link
                                    to="/"
                                    className="block w-full text-center text-sm text-slate-500 hover:text-emerald-400 transition-colors"
                                >
                                    Back to sign in
                                </Link>
                            </form>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
