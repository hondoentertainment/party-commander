import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Sparkles, Loader2 } from 'lucide-react'
import { useParty } from '../state/PartyContext'
import { getLocalParties } from '../state/storage'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { SectionHeader } from '../components/SectionHeader'

export function GlobalDashboard() {
    const { parties, createParty, partyProfile, partyLoading, state } = useParty()
    const navigate = useNavigate()
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!partyProfile || creating) return
        setCreating(true)
        setCreateError(null)
        try {
            const id = await createParty(false)
            navigate(`/event/${id}`)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to create event'
            if (msg.includes('No party profile') || msg.includes('profile')) {
                setCreateError('Please wait a moment for your profile to load, then try again.')
            } else if (msg.includes('does not exist') || msg.includes('relation')) {
                setCreateError('Database setup may be incomplete. Run Supabase migrations.')
            } else {
                setCreateError(msg)
            }
        } finally {
            setCreating(false)
        }
    }

    const canCreate = partyProfile && !partyLoading && !creating
    const profileFailed = !partyLoading && !partyProfile && state.auth.user
    const localIds = new Set(getLocalParties().map((p) => p.id))
    const hasLocalParties = partyProfile && parties.some((p) => localIds.has(p.id))

    return (
        <div className="space-y-8 pb-32">
            {hasLocalParties && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
                    <span className="text-sm text-amber-200">
                        Some events are saved locally. Run Supabase migrations to sync to the cloud.
                    </span>
                </div>
            )}
            {profileFailed && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-sm text-rose-200">Unable to load your profile. Check your connection or try signing out and back in.</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="shrink-0 rounded-xl bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/30"
                    >
                        Refresh
                    </button>
                </div>
            )}
            <SectionHeader
                title="Intelligence Hub"
                subtitle="Manage your entire portfolio of premium events."
                eyebrow="Global"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {parties.map((party) => {
                    const isSharedWithMe = partyProfile && party.party_profile_id !== partyProfile.id
                    const isLocal = localIds.has(party.id)
                    return (
                        <Card key={party.id} className="flex flex-col hover:border-emerald-500/30 transition-colors">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="truncate pr-4">{party.name || 'Unnamed Event'}</CardTitle>
                                    {isLocal && (
                                        <span className="shrink-0 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                            Local
                                        </span>
                                    )}
                                    {isSharedWithMe && (
                                        <span className="shrink-0 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Shared
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400">
                                    Last updated: {new Date(party.updated_at).toLocaleDateString()}
                                </p>
                            </CardHeader>
                            <div className="mt-auto p-6 pt-0">
                                <Link to={`/event/${party.id}`}>
                                    <Button className="w-full flex justify-between items-center bg-white/5 hover:bg-emerald-500 hover:text-white border-white/10" variant="outline">
                                        Enter Protocol
                                        <Sparkles className="size-4" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    )
                })}

                <Card
                    className={`flex flex-col items-center justify-center border-dashed border-2 py-12 transition-colors cursor-pointer group ${
                        canCreate
                            ? 'text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400'
                            : 'text-slate-600 cursor-not-allowed opacity-60'
                    }`}
                    onClick={canCreate ? handleCreate : undefined}
                >
                    {createError && (
                        <p className="mb-4 text-sm text-rose-400 max-w-xs text-center">{createError}</p>
                    )}
                    <div className="rounded-full bg-slate-900 p-4 mb-4 group-hover:bg-emerald-500/10 transition-colors">
                        {creating ? (
                            <Loader2 className="size-8 animate-spin text-emerald-400" />
                        ) : (
                            <Plus className="size-8" />
                        )}
                    </div>
                    <span className="font-semibold tracking-wide">
                        {creating ? 'Creating…' : 'Initialize New Event'}
                    </span>
                </Card>
            </div>
        </div>
    )
}
