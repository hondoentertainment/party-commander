import {
  compareAsc,
  differenceInHours,
  differenceInMinutes,
  differenceInDays,
  isAfter,
  parseISO,
} from 'date-fns'
import { Link } from 'react-router-dom'
import { ChevronRight, Music, AlertCircle, CheckCircle2, LayoutDashboard, Calendar, Utensils, GlassWater, Sparkles, MapPin } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useParty } from '../state/PartyContext'
import { cn } from '../components/ui/utils'
import type { Theme } from '../state/types'
import { SwarmConsole } from '../components/SwarmConsole'
import { OnboardingWizard } from '../components/OnboardingWizard'
import { supabase } from '../services/auth'
import { ShieldCheck } from 'lucide-react'

const themes: Theme[] = [
  'Classic',
  'Rooftop',
  'Tropical',
  'Disco',
  'Game Night',
  'Cozy',
  'Minimal',
  'Custom',
]

export function Dashboard() {
  const { state, dispatch } = useParty()

  const partyDate = state.core.date ? parseISO(state.core.date) : null
  const isValidDate = partyDate && !isNaN(partyDate.getTime())

  const countdown = isValidDate
    ? {
      days: differenceInDays(partyDate, new Date()),
      hours: differenceInHours(partyDate, new Date()) % 24,
      minutes: differenceInMinutes(partyDate, new Date()) % 60,
    }
    : null

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
    { label: 'Menu', ready: state.menu.items.length > 0, icon: <Utensils className="size-4" /> },
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

  const readyCount = readiness.filter((item) => item.ready).length
  const liveAlerts = Object.values(state.live.restockAlerts).filter(Boolean).length
  const liveLabel = liveAlerts === 0 ? 'Optimal Flow' : 'Action Required'
  const readinessPercent = Math.round((readyCount / readiness.length) * 100)
  const now = new Date()
  const upcomingEvents = state.events.items
    .filter((event) => event.date)
    .map((event) => ({ ...event, parsed: parseISO(event.date) }))
    .filter((event) => !isNaN(event.parsed.getTime()) && isAfter(event.parsed, now))
    .sort((a, b) => compareAsc(a.parsed, b.parsed))
  const nextEvent = upcomingEvents[0]
  const archivedEvents =
    state.events.items.filter((event) => {
      if (!event.date) return false
      const d = parseISO(event.date)
      return !isNaN(d.getTime()) && !isAfter(d, now)
    }).length

  return (
    <div className="space-y-8 pb-32">
      <OnboardingWizard />
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-950/50 p-8 md:p-12">
        <div className="glow-orb" />
        <div className="glow-sweep" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[2fr_1.2fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="size-3" />
              Intelligence Mode Active
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
                {state.core.name || 'Party Command'}
              </h1>
              <p className="text-lg font-medium text-slate-400">
                {state.core.location || 'Your next world-class event starts here.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-2xl px-8 shadow-lg shadow-emerald-500/20">
                Quick Action
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl px-8">
                View Timeline
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-white/5 bg-black/40 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Readiness</span>
                <span className="text-lg font-bold text-emerald-400">{readinessPercent}%</span>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-400">
                {readyCount} of {readiness.length} key milestones completed
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/5 bg-black/40 p-5 backdrop-blur-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Impact</span>
                <p className="mt-2 text-2xl font-bold text-white">{state.invites.guestCount}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Guests Confirmed</span>
                  {countdown && (
                    <span className="text-emerald-500 font-bold">
                      T-{countdown.days}d {countdown.hours}h
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-white/5 bg-black/40 p-5 backdrop-blur-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</span>
                <p className="mt-2 text-xl font-bold text-emerald-400">{liveLabel}</p>
                <p className="text-[10px] text-slate-500">
                  {liveAlerts} active alerts · {archivedEvents} archived
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence War Room */}
      <section className="space-y-6">
        <SectionHeader
          title="Swarm Intelligence"
          subtitle="Autonomous agents collaborating on zero-friction event logic."
        />
        <SwarmConsole />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Middle Column: Status Ticker & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader
            title="Operational Snapshot"
            subtitle="Real-time preparation metrics and upcoming milestones."
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
                    <span className="text-[11px] font-bold uppercase tracking-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-rose-500/10 bg-rose-500/5 mt-8">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-rose-400">Security Terminal</h4>
                  <p className="text-[10px] text-slate-500">Operator Identity: {state.auth.user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => supabase.auth.signOut()}
                  className="text-rose-400 hover:bg-rose-500/10"
                >
                  Logout
                </Button>
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="size-5 text-emerald-400" />
                Critical Path
              </CardTitle>
              <Link to="/timeline" className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
                Override View
              </Link>
            </div>
            <div className="space-y-3">
              {nextActions.length === 0 ? (
                <Link to="/timeline" className="flex items-center justify-center rounded-2xl border-2 border-dashed border-white/5 py-12 text-sm font-medium text-slate-500 hover:border-emerald-500/20 hover:text-slate-400 transition-all">
                  Initialize Timeline Protocol
                </Link>
              ) : (
                nextActions.map((task) => (
                  <Link key={task.id} to="/timeline" className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
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

        {/* Right Column: Settings & Quick Config */}
        <div className="space-y-6">
          <SectionHeader
            title="Registry"
            subtitle="Core event parameters."
          />

          <Card>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Event Name</label>
                <Input
                  value={state.core.name}
                  onChange={(event) => dispatch({ type: 'update_core', payload: { name: event.target.value } })}
                  className="rounded-xl border-white/5 bg-black/20 focus:bg-black/40"
                  placeholder="e.g. My Awesome Party"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={state.core.date}
                  onChange={(event) => dispatch({ type: 'update_core', payload: { date: event.target.value } })}
                  className="rounded-xl border-white/5 bg-black/20 focus:bg-black/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Party Theme</label>
                <Select
                  value={state.core.theme}
                  onChange={(event) => dispatch({ type: 'update_core', payload: { theme: event.target.value as Theme } })}
                  className="rounded-xl border-white/5 bg-black/20"
                >
                  {themes.map((theme) => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Location</label>
                <Input
                  value={state.core.location}
                  onChange={(event) => dispatch({ type: 'update_core', payload: { location: event.target.value } })}
                  className="rounded-xl border-white/5 bg-black/20 focus:bg-black/40"
                  placeholder="e.g. My Place"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
