import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { parseISO, format, isPast } from 'date-fns'
import { useParty } from '../state/PartyContext'
import { ProfileService, type Profile } from '../services/profile'
import { AuthService } from '../services/auth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { User, Loader2, LogOut, Calendar, ChevronRight, Users } from 'lucide-react'

export function ProfilePage() {
    const navigate = useNavigate()
    const { state, parties, partyProfile, currentPartyId, switchParty } = useParty()
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

            {partyProfile && parties.length > 0 && (
                <Card className="border-white/5 bg-black/40 p-6 backdrop-blur-2xl">
                    <h2 className="text-lg font-semibold text-white">Events I'm planning</h2>
                    <p className="mt-1 text-sm text-slate-400">All parties you own or are invited to.</p>
                    <ul className="mt-4 divide-y divide-white/5">
                        {parties.map((p) => {
                            const core = (p.state as { core?: { date?: string; name?: string } })?.core
                            const dateStr = core?.date
                            const date = dateStr ? parseISO(dateStr) : null
                            const isValidDate = date && !isNaN(date.getTime())
                            const past = isValidDate && isPast(date)
                            const isShared = p.party_profile_id !== partyProfile.id

                            return (
                                <li key={p.id}>
                                    <Link
                                        to="/"
                                        onClick={(e) => {
                                            if (p.id !== currentPartyId) {
                                                e.preventDefault()
                                                switchParty(p.id).then(() => navigate('/'))
                                            }
                                        }}
                                        className="flex items-center gap-3 py-4 text-left transition hover:bg-white/5 -mx-2 px-2 rounded-xl"
                                    >
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                                            <Calendar className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-white truncate">
                                                {p.name || core?.name || 'Untitled party'}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                {isValidDate
                                                    ? format(date, 'MMM d, yyyy')
                                                    : 'No date set'}
                                                {isShared && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-slate-500">
                                                        <Users className="size-3" />
                                                        Shared with you
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <span
                                            className={past
                                                ? 'rounded-full bg-slate-500/20 px-2.5 py-1 text-xs font-medium text-slate-400'
                                                : 'rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400'
                                            }
                                        >
                                            {past ? 'Past' : 'Planning'}
                                        </span>
                                        <ChevronRight className="size-4 shrink-0 text-slate-500" />
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                    <Link
                        to="/"
                        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        Go to dashboard
                        <ChevronRight className="size-4" />
                    </Link>
                </Card>
            )}
        </div>
    )
}
