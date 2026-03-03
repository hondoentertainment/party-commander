import { Link, useNavigate } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import { useParty } from '../state/PartyContext'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { SectionHeader } from '../components/SectionHeader'

export function GlobalDashboard() {
    const { parties, createParty, partyProfile } = useParty()
    const navigate = useNavigate()

    const handleCreate = async () => {
        const id = await createParty(false)
        navigate(`/event/${id}`)
    }

    return (
        <div className="space-y-8 pb-32">
            <SectionHeader
                title="Intelligence Hub"
                subtitle="Manage your entire portfolio of premium events."
                eyebrow="Global"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {parties.map((party) => {
                    const isSharedWithMe = partyProfile && party.party_profile_id !== partyProfile.id
                    return (
                        <Card key={party.id} className="flex flex-col hover:border-emerald-500/30 transition-colors">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="truncate pr-4">{party.name || 'Unnamed Event'}</CardTitle>
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

                <Card className="flex flex-col items-center justify-center border-dashed border-2 py-12 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors cursor-pointer group" onClick={handleCreate}>
                    <div className="rounded-full bg-slate-900 p-4 mb-4 group-hover:bg-emerald-500/10 transition-colors">
                        <Plus className="size-8" />
                    </div>
                    <span className="font-semibold tracking-wide">Initialize New Event</span>
                </Card>
            </div>
        </div>
    )
}
