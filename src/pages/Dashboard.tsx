import { differenceInHours, differenceInMinutes, differenceInDays, parseISO } from 'date-fns'
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
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">Countdown</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {countdown
                  ? `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`
                  : 'Add party date'}
              </p>
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
          <CardTitle>Readiness Badges</CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {readiness.map((item) => (
              <Badge key={item.label} tone={item.ready ? 'success' : 'muted'}>
                {item.label}
              </Badge>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Next 3 Actions</CardTitle>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {nextActions.length === 0 ? (
              <li className="rounded-lg bg-white/5 px-3 py-2">Generate timeline tasks.</li>
            ) : (
              nextActions.map((task) => (
                <li key={task.id} className="rounded-lg bg-white/5 px-3 py-2">
                  {task.title}
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
