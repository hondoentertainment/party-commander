import { differenceInHours, differenceInMinutes, differenceInDays, parseISO } from 'date-fns'
import { SectionHeader } from '../components/SectionHeader'
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

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <SectionHeader
        title="Party Snapshot"
        subtitle="Countdown, readiness, and next steps."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Countdown</p>
          <p className="text-lg font-semibold text-slate-900">
            {countdown
              ? `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`
              : 'Add party date'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Theme</p>
          <p className="text-lg font-semibold text-slate-900">
            {state.core.theme === 'Custom' ? state.core.customTheme || 'Custom' : state.core.theme}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Guest Count</p>
          <p className="text-lg font-semibold text-slate-900">{state.invites.guestCount}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-base font-semibold text-slate-900">Readiness Badges</h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {readiness.map((item) => (
              <span
                key={item.label}
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  item.ready ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                ].join(' ')}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-base font-semibold text-slate-900">Next 3 Actions</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {nextActions.length === 0 ? (
              <li className="rounded-lg bg-slate-50 px-3 py-2">Generate timeline tasks.</li>
            ) : (
              nextActions.map((task) => (
                <li key={task.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  {task.title}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Party Details</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            Party name
            <input
              value={state.core.name}
              onChange={(event) =>
                dispatch({ type: 'update_core', payload: { name: event.target.value } })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rooftop Night"
            />
          </label>
          <label className="text-sm text-slate-600">
            Party date/time
            <input
              type="datetime-local"
              value={state.core.date}
              onChange={(event) =>
                dispatch({ type: 'update_core', payload: { date: event.target.value } })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600">
            Location
            <input
              value={state.core.location}
              onChange={(event) =>
                dispatch({ type: 'update_core', payload: { location: event.target.value } })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="123 Main St, Rooftop"
            />
          </label>
          <label className="text-sm text-slate-600">
            Theme
            <select
              value={state.core.theme}
              onChange={(event) =>
                dispatch({ type: 'update_core', payload: { theme: event.target.value as Theme } })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </label>
          {state.core.theme === 'Custom' ? (
            <label className="text-sm text-slate-600 md:col-span-2">
              Custom theme description
              <input
                value={state.core.customTheme}
                onChange={(event) =>
                  dispatch({ type: 'update_core', payload: { customTheme: event.target.value } })
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Warm neutrals + candlelight"
              />
            </label>
          ) : null}
        </div>
      </section>
    </div>
  )
}
