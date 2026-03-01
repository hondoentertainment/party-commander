import { useEffect, useState } from 'react'
import { useParty } from '../state/PartyContext'
import { ProfileService, type Profile } from '../services/profile'
import { AuthService } from '../services/auth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { User, Loader2, LogOut } from 'lucide-react'

export function ProfilePage() {
    const { state } = useParty()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [displayName, setDisplayName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const user = state.auth.user as { id: string; email?: string; user_metadata?: { avatar_url?: string; full_name?: string } } | null

    useEffect(() => {
        if (!user?.id) return

        let cancelled = false
        ProfileService.get(user.id)
            .then((p) => {
                if (cancelled) return
                setProfile(p)
                setDisplayName(p?.display_name ?? user.user_metadata?.full_name ?? '')
            })
            .catch(() => {
                if (cancelled) return
                setProfile(null)
                setDisplayName(user.user_metadata?.full_name ?? '')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [user?.id, user?.user_metadata?.full_name])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.id) return
        setSaving(true)
        try {
            const updated = await ProfileService.upsert(user.id, { display_name: displayName || null })
            setProfile(updated)
        } catch {
            // ignore
        } finally {
            setSaving(false)
        }
    }

    const handleSignOut = () => {
        AuthService.signOut()
    }

    if (!user) return null

    const avatarUrl = profile?.avatar_url ?? user.user_metadata?.avatar_url

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Profile</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">Your account</h1>
                <p className="mt-1 text-slate-400">Manage your profile and sign out.</p>
            </div>

            <Card className="border-white/5 bg-black/40 p-6 backdrop-blur-2xl">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-emerald-500" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <User className="size-10 text-slate-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                    {profile?.display_name || user.user_metadata?.full_name || 'Guest'}
                                </p>
                                {user.email && (
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Display name
                            </label>
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                className="rounded-2xl border-white/5 bg-black/20"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save changes'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSignOut}
                                className="gap-2 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                            >
                                <LogOut className="size-4" />
                                Sign out
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    )
}
