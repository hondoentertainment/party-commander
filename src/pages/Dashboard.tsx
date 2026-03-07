import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { compareAsc, isAfter, parseISO } from 'date-fns'
import { Link, useSearchParams, useParams } from 'react-router-dom'
import {
  ChevronRight,
  Music,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  Calendar,
  Utensils,
  GlassWater,
  Sparkles,
  MapPin,
  User,
  Wand2,
  DollarSign,
  Users,
  X,
} from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { AnimatedList, AnimatedItem } from '../components/ui/AnimatedList'
import { useParty } from '../state/PartyContext'
import { cn } from '../components/ui/utils'

export function Dashboard() {
  const { state, switchParty } = useParty()
  const { eventId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const partyIdFromUrl = searchParams.get('party')
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  useEffect(() => {
    if (!partyIdFromUrl || !switchParty) return
    switchParty(partyIdFromUrl)
      .then(() => {
        const next = new URLSearchParams(searchParams)
        next.delete('party')
        setSearchParams(next, { replace: true })
      })
      .catch(() => {})
  }, [partyIdFromUrl, switchParty])

  const showWelcome = useMemo(
    () => searchParams.get('welcome') === '1' && !welcomeDismissed,
    [searchParams, welcomeDismissed],
  )

  const dismissWelcome = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('welcome')
    setSearchParams(next, { replace: true })
    setWelcomeDismissed(true)
  }

  const readiness = [
    {
      label: 'Venue',
      ready: state.venue.amenities.some(
        (amenity) => amenity.status === 'reserved',
      ),
      icon: <MapPin className="size-4" />,
    },
    {
      label: 'Grill',
      ready:
        state.venue.propane.noGrillFallback ||
        ['full', 'three_quarter', 'half'].includes(state.venue.propane.level),
      icon: <Sparkles className="size-4" />,
    },
    {
      label: 'Food',
      ready: state.menu.items.length > 0,
      icon: <Utensils className="size-4" />,
    },
    {
      label: 'Drinks',
      ready: state.drinks.suggestions.length > 0,
      icon: <GlassWater className="size-4" />,
    },
    {
      label: 'Supplies',
      ready: state.cleaning.bathroomSupplies.every(
        (item) => item.status === 'done',
      ),
      icon: <CheckCircle2 className="size-4" />,
    },
    {
      label: 'Music',
      ready: Boolean(state.music.mainLink),
      icon: <Music className="size-4" />,
    },
    {
      label: 'Games',
      ready: state.games.games.length > 0,
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      label: 'Access',
      ready: Boolean(state.entry.instructions || state.entry.butterflyLink),
      icon: <AlertCircle className="size-4" />,
    },
  ]

  const readyCount = readiness.filter((r) => r.ready).length
  const readyPercent = Math.round((readyCount / readiness.length) * 100)

  const nextActions = state.timeline.tasks
    .filter((task) => task.status !== 'done')
    .slice(0, 3)

  const now = new Date()
  const upcomingEvents = state.events.items
    .filter((event) => event.date)
    .map((event) => ({ ...event, parsed: parseISO(event.date) }))
    .filter(
      (event) => !isNaN(event.parsed.getTime()) && isAfter(event.parsed, now),
    )
    .sort((a, b) => compareAsc(a.parsed, b.parsed))

  const nextEvent =
    upcomingEvents[0] ??
    (state.events.items.length === 0 &&
    (state.core.name || state.core.date || state.core.location)
      ? {
          name: state.core.name || 'My Party',
          date: state.core.date,
          location: state.core.location,
          link: '',
          leadName: undefined as string | undefined,
        }
      : null)

  return (
    <div className="space-y-8 pb-32">
      <AnimatedList className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SectionHeader
            title="Operational Snapshot"
            subtitle="Real-time preparation metrics and upcoming milestones."
            eyebrow="Overview"
          />

          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-blue-500/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
                      <Sparkles className="size-3.5" />
                      Welcome
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">
                        Your first event is ready.
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm text-slate-300">
                        Start with the essentials, then expand into the rest of the command center as your plan comes together.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <Link
                        to={`/event/${eventId}/plan`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/20 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-2 text-emerald-300">
                          <Wand2 className="size-4" />
                          <span className="text-sm font-semibold">Pick the vibe</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          Set the name, theme, and overall feel for the event.
                        </p>
                      </Link>
                      <Link
                        to={`/event/${eventId}/events`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/20 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-2 text-emerald-300">
                          <Users className="size-4" />
                          <span className="text-sm font-semibold">Add event details</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          Lock in the date, location, and key details people need.
                        </p>
                      </Link>
                      <Link
                        to={`/event/${eventId}/budget`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/20 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-2 text-emerald-300">
                          <DollarSign className="size-4" />
                          <span className="text-sm font-semibold">Set your budget</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          Create a spending guardrail before invites and shopping ramp up.
                        </p>
                      </Link>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={dismissWelcome}
                    className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                    aria-label="Dismiss welcome panel"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          <AnimatedList className="grid gap-6 md:grid-cols-2">
            {/* Next Event card */}
            <AnimatedItem>
              <Card className="flex h-full flex-col justify-between">
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
                        <p className="text-xl font-bold text-white">
                          {nextEvent.name}
                        </p>
                        <p className="text-sm font-medium text-slate-400">
                          {nextEvent.date}
                        </p>
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
                    <p className="text-sm text-slate-600">
                      Initialize your next event to track progress.
                    </p>
                  )}
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  {nextEvent?.link && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => window.open(nextEvent.link, '_blank')}
                    >
                      Open Event Protocol
                    </Button>
                  )}
                  <Link to={`/event/${eventId}/events`}>
                    <Button variant="outline" className="w-full rounded-xl" size="sm">
                      {state.events.items.length === 0 ? 'Add your first event' : 'Manage events'}
                    </Button>
                  </Link>
                </div>
              </Card>
            </AnimatedItem>

            {/* Readiness Matrix card */}
            <AnimatedItem>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    Readiness Matrix
                  </CardTitle>
                </CardHeader>

                {/* Progress ring */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative size-12">
                    <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="3"
                      />
                      <motion.circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="rgb(16,185,129)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${readyPercent} 100`}
                        initial={{ strokeDasharray: '0 100' }}
                        animate={{
                          strokeDasharray: `${readyPercent} 100`,
                        }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {readyPercent}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {readyCount}/{readiness.length} ready
                    </p>
                    <p className="text-xs text-slate-500">
                      {readyPercent === 100 ? 'All systems go!' : 'In progress'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {readiness.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border p-2.5 transition-all duration-200',
                        item.ready
                          ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-300'
                          : 'border-white/[0.04] bg-white/[0.02] text-slate-600',
                      )}
                    >
                      {item.ready ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        item.icon
                      )}
                      <span className="text-xs font-bold uppercase tracking-tight">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </AnimatedItem>
          </AnimatedList>

          {/* Quick Actions */}
          <AnimatedItem>
            <Card>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-emerald-400" />
                Quick Actions
              </CardTitle>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                {[
                  { to: `food`, label: 'Add food', icon: <Utensils className="size-4" /> },
                  { to: `drinks`, label: 'Add drinks', icon: <GlassWater className="size-4" /> },
                  { to: `budget`, label: 'Set budget', icon: <DollarSign className="size-4" /> },
                  { to: `invites`, label: 'Invites', icon: <Users className="size-4" /> },
                ].map((action) => (
                  <Link
                    key={action.to}
                    to={`/event/${eventId}/${action.to}`}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-sm font-medium text-slate-300 transition hover:border-emerald-500/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {action.icon}
                    {action.label}
                  </Link>
                ))}
              </div>
            </Card>
          </AnimatedItem>

          {/* Critical Path card */}
          <AnimatedItem>
            <Card>
              <div className="mb-6 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="size-5 text-emerald-400" />
                  Critical Path
                </CardTitle>
                <Link
                  to={`/event/${eventId}/timeline`}
                  className="text-xs font-bold uppercase tracking-widest text-emerald-400/80 transition-colors hover:text-emerald-300"
                >
                  View full timeline
                </Link>
              </div>
              <div className="space-y-2">
                {nextActions.length === 0 ? (
                  <Link
                    to={`/event/${eventId}/timeline`}
                    className="flex items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.04] py-12 text-sm font-medium text-slate-600 transition-all hover:border-emerald-500/15 hover:text-slate-400"
                  >
                    Initialize Timeline Protocol
                  </Link>
                ) : (
                  nextActions.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                    >
                      <Link
                        to={`/event/${eventId}/timeline`}
                        className="group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.03] transition-colors group-hover:bg-emerald-500/10">
                            <Sparkles className="size-4 text-emerald-500" />
                          </div>
                          <span className="font-semibold text-white">
                            {task.title}
                          </span>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-400"
                        />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </AnimatedItem>
        </div>
      </AnimatedList>
    </div>
  )
}
