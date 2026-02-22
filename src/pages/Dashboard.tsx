import {
  compareAsc,
  differenceInHours,
  differenceInMinutes,
  differenceInDays,
  isAfter,
  parseISO,
} from 'date-fns'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useParty } from '../state/PartyContext'
import type { Theme } from '../state/types'

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
  const countdown = partyDate
    ? {
        days: differenceInDays(partyDate, new Date()),
        hours: differenceInHours(partyDate, new Date()) % 24,
        minutes: differenceInMinutes(partyDate, new Date()) % 60,
      }
    : null

  const readiness = [
    {
      label: 'Venue Reserved',
      ready: state.venue.amenities.some((amenity) => amenity.status === 'reserved'),
    },
    {
      label: 'Propane Ready',
      ready:
        state.venue.propane.noGrillFallback ||
        ['full', 'three_quarter', 'half'].includes(state.venue.propane.level),
    },
    { label: 'Menu Ready', ready: state.menu.items.length > 0 },
    { label: 'Drinks Ready', ready: state.drinks.suggestions.length > 0 },
    {
      label: 'Supplies Ready',
      ready: state.cleaning.bathroomSupplies.every((item) => item.status === 'done'),
    },
    { label: 'Music Ready', ready: Boolean(state.music.mainLink) },
    { label: 'Games Ready', ready: state.games.games.length > 0 },
    {
      label: 'Buzz-In Ready',
      ready: Boolean(state.entry.instructions || state.entry.butterflyLink),
    },
  ]

  const nextActions = state.timeline.tasks
    .filter((task) => task.status !== 'done')
    .slice(0, 3)

  const readyCount = readiness.filter((item) => item.ready).length
  const liveAlerts = Object.values(state.live.restockAlerts).filter(Boolean).length
  const liveLabel = liveAlerts === 0 ? 'Smooth sailing' : 'Restock needed'
  const readinessPercent = Math.round((readyCount / readiness.length) * 100)
  const now = new Date()
  const upcomingEvents = state.events.items
    .filter((event) => event.date)
    .map((event) => ({ ...event, parsed: parseISO(event.date) }))
    .filter((event) => isAfter(event.parsed, now))
    .sort((a, b) => compareAsc(a.parsed, b.parsed))
  const nextEvent = upcomingEvents[0]
  const archivedEvents = state.events.items.filter((event) => event.date).length - upcomingEvents.length

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="relative overflow-hidden p-6">
          <div className="glow-orb" />
          <CardHeader className="relative">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/70">
              Now Hosting
            </p>
            <CardTitle className="mt-3 text-3xl">
              {state.core.name || 'Party Command Center'}
            </CardTitle>
            <CardDescription className="mt-2">
              {state.core.location || 'Set your location and theme to unlock suggestions.'}
            </CardDescription>
          </CardHeader>
          <div className="relative mt-6 grid gap-4 md:grid-cols-3">
            <div
              className={[
                'rounded-2xl border p-4 transition',
                countdown
                  ? 'border-white/10 bg-black/30'
                  : 'border-amber-500/20 bg-amber-500/5 opacity-90',
              ].join(' ')}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">Countdown</p>
              <p
                className={[
                  'mt-2 text-2xl font-semibold',
                  countdown ? 'text-white' : 'text-amber-200/90',
                ].join(' ')}
              >
                {countdown
                  ? `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`
                  : 'Add party date'}
              </p>
              {!countdown ? (
                <p className="mt-1 text-xs text-amber-300/70">
                  Set date below to see countdown
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">Theme</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {state.core.theme === 'Custom'
                  ? state.core.customTheme || 'Custom'
                  : state.core.theme}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                Guest Count
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{state.invites.guestCount}</p>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-5">
          <CardHeader>
            <CardTitle>Now Playing</CardTitle>
            <CardDescription>Music link + live status.</CardDescription>
          </CardHeader>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Playlist</p>
            <p className="mt-2 text-sm text-white">
              {state.music.mainLink || 'Add your main playlist link.'}
            </p>
            {state.music.mainLink ? (
              <Button
                className="mt-3 w-full"
                onClick={() => window.open(state.music.mainLink, '_blank')}
              >
                Open playlist
              </Button>
            ) : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live status</p>
            <p className="mt-2 text-lg font-semibold text-white">{liveLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="success">{readyCount} / {readiness.length} ready</Badge>
              <Badge tone={liveAlerts === 0 ? 'success' : 'danger'}>
                {liveAlerts} alerts
              </Badge>
            </div>
          </div>
        </Card>
      </section>

      <SectionHeader
        title="Party Snapshot"
        subtitle="Countdown, readiness, and next steps."
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Next Event</CardTitle>
          {nextEvent ? (
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p className="text-lg font-semibold text-white">{nextEvent.name}</p>
              <p>{nextEvent.date}</p>
              <p>{nextEvent.location}</p>
              {nextEvent.link ? (
                <Button
                  className="mt-2"
                  onClick={() => window.open(nextEvent.link, '_blank')}
                >
                  Open event link
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No upcoming events yet.</p>
          )}
          <p className="mt-4 text-xs text-slate-500">Archived events: {Math.max(0, archivedEvents)}</p>
        </Card>

        <Card>
          <CardTitle>Readiness Badges</CardTitle>
          <div className="mt-4 rounded-full bg-white/5 p-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Overall readiness</span>
              <span>{readinessPercent}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-black/40">
              <div
                className="h-2 rounded-full bg-emerald-500/70"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {readiness.map((item) => (
              <Badge key={item.label} tone={item.ready ? 'success' : 'muted'}>
                {item.label}
              </Badge>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Next 3 Actions</CardTitle>
            <Link
              to="/timeline"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {nextActions.length === 0 ? (
              <li>
                <Link
                  to="/timeline"
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-300"
                >
                  Generate timeline tasks.
                  <ChevronRight size={16} className="shrink-0" />
                </Link>
              </li>
            ) : (
              nextActions.map((task) => (
                <li key={task.id}>
                  <Link
                    to="/timeline"
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 transition hover:bg-white/10 hover:text-white"
                  >
                    <span>{task.title}</span>
                    <ChevronRight size={16} className="shrink-0 text-slate-500" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Card>
      </section>

      <Card>
        <CardTitle>Party Details</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Party name
            <Input
              value={state.core.name}
              onChange={(event) =>
                dispatch({ type: 'update_core', payload: { name: event.target.value } })
              }
              className="mt-2"
              placeholder="Rooftop Night"
            />
          </label>
          <label className="text-sm text-slate-300">
            Party date/time
            <Input
              type="datetime-local"
              value={state.core.date}
              onChange={(event) =>
                dispatch({ type: 'update_core', payload: { date: event.target.value } })
              }
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300">
            Location
            <Input
              value={state.core.location}
              onChange={(event) =>
                dispatch({ type: 'update_core', payload: { location: event.target.value } })
              }
              className="mt-2"
              placeholder="123 Main St, Rooftop"
            />
          </label>
          <label className="text-sm text-slate-300">
            Theme
            <Select
              value={state.core.theme}
              onChange={(event) =>
                dispatch({ type: 'update_core', payload: { theme: event.target.value as Theme } })
              }
              className="mt-2"
            >
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </Select>
          </label>
          {state.core.theme === 'Custom' ? (
            <label className="text-sm text-slate-300 md:col-span-2">
              Custom theme description
              <Input
                value={state.core.customTheme}
                onChange={(event) =>
                  dispatch({ type: 'update_core', payload: { customTheme: event.target.value } })
                }
                className="mt-2"
                placeholder="Warm neutrals + candlelight"
              />
            </label>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
