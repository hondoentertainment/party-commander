import { useEffect } from 'react'
import { compareAsc, isAfter, parseISO } from 'date-fns'
import { Link, useSearchParams, useParams } from 'react-router-dom'
import { ChevronRight, Music, AlertCircle, CheckCircle2, LayoutDashboard, Calendar, Utensils, GlassWater, Sparkles, MapPin, User } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { useParty } from '../state/PartyContext'
import { cn } from '../components/ui/utils'
export function Dashboard() {
  const { state, switchParty } = useParty()
  const { eventId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const partyIdFromUrl = searchParams.get('party')

  useEffect(() => {
    if (!partyIdFromUrl || !switchParty) return
    switchParty(partyIdFromUrl).then(() => {
      const next = new URLSearchParams(searchParams)
      next.delete('party')
      setSearchParams(next, { replace: true })
    }).catch(() => { })
  }, [partyIdFromUrl, switchParty])

  const readiness = [
    {
      label: 'Venue',
      ready: state.venue.amenities.some((amenity) => amenity.status === 'reserved'),
      icon: <MapPin className="size-4" />,
    },
    {
      label: 'Grill',
      ready:
        state.venue.propane.noGrillFallback ||
        ['full', 'three_quarter', 'half'].includes(state.venue.propane.level),
      icon: <Sparkles className="size-4" />,
    },
    { label: 'Food', ready: state.menu.items.length > 0, icon: <Utensils className="size-4" /> },
    { label: 'Drinks', ready: state.drinks.suggestions.length > 0, icon: <GlassWater className="size-4" /> },
    {
      label: 'Supplies',
      ready: state.cleaning.bathroomSupplies.every((item) => item.status === 'done'),
      icon: <CheckCircle2 className="size-4" />,
    },
    { label: 'Music', ready: Boolean(state.music.mainLink), icon: <Music className="size-4" /> },
    { label: 'Games', ready: state.games.games.length > 0, icon: <LayoutDashboard className="size-4" /> },
    {
      label: 'Access',
      ready: Boolean(state.entry.instructions || state.entry.butterflyLink),
      icon: <AlertCircle className="size-4" />,
    },
  ]

  const nextActions = state.timeline.tasks
    .filter((task) => task.status !== 'done')
    .slice(0, 3)

  const now = new Date()
  const upcomingEvents = state.events.items
    .filter((event) => event.date)
    .map((event) => ({ ...event, parsed: parseISO(event.date) }))
    .filter((event) => !isNaN(event.parsed.getTime()) && isAfter(event.parsed, now))
    .sort((a, b) => compareAsc(a.parsed, b.parsed))
  /** For single-event mode: when no events exist, treat party core as the active event */
  const nextEvent = upcomingEvents[0] ?? (state.events.items.length === 0 && (state.core.name || state.core.date || state.core.location)
    ? { name: state.core.name || 'My Party', date: state.core.date, location: state.core.location, link: '', leadName: undefined as string | undefined }
    : null)

  return (
    <div className="space-y-8 pb-32">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SectionHeader
            title="Operational Snapshot"
            subtitle="Real-time preparation metrics and upcoming milestones."
            eyebrow="Overview"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5 text-emerald-400" />
                    Next Event
                  </CardTitle>
                </CardHeader>
                {nextEvent ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-white">{nextEvent.name}</p>
                      <p className="text-sm font-medium text-slate-400">{nextEvent.date}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <MapPin className="size-4 text-slate-500" />
                      {nextEvent.location}
                    </div>
                    {nextEvent.leadName && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <User className="size-4 text-slate-500" />
                        Lead: {nextEvent.leadName}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Initialize your next event to track progress.</p>
                )}
              </div>
              {nextEvent?.link && (
                <Button variant="outline" className="mt-6 w-full rounded-xl" onClick={() => window.open(nextEvent.link, '_blank')}>
                  Open Event Protocol
                </Button>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-400" />
                  Readiness Matrix
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 gap-3">
                {readiness.map((item) => (
                  <div key={item.label} className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5 transition-colors",
                    item.ready ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-white/5 bg-white/5 text-slate-500"
                  )}>
                    {item.ready ? <CheckCircle2 className="size-3" /> : item.icon}
                    <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="size-5 text-emerald-400" />
                Critical Path
              </CardTitle>
              <Link to={`/event/${eventId}/timeline`} className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
                View full timeline
              </Link>
            </div>
            <div className="space-y-3">
              {nextActions.length === 0 ? (
                <Link to={`/event/${eventId}/timeline`} className="flex items-center justify-center rounded-2xl border-2 border-dashed border-white/5 py-12 text-sm font-medium text-slate-500 hover:border-emerald-500/20 hover:text-slate-400 transition-all">
                  Initialize Timeline Protocol
                </Link>
              ) : (
                nextActions.map((task) => (
                  <Link key={task.id} to={`/event/${eventId}/timeline`} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 group-hover:bg-emerald-500/20 transition-colors">
                        <Sparkles className="size-4 text-emerald-500" />
                      </div>
                      <span className="font-semibold text-white">{task.title}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
