import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Download, ChevronLeft, ChevronRight, CalendarDays, ExternalLink } from 'lucide-react'
import { cn } from '../../components/ui/utils'
import { buildGoogleCalendarUrl, buildIcsContent, downloadIcsFile } from '../../services/calendar'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  differenceInDays,
  parseISO,
  isBefore,
  startOfDay,
} from 'date-fns'

function exportTaskAsIcs(
  task: { id: string; title: string; offsetHours: number; status: string },
  baseDate: Date,
  filename: string,
) {
  const start = new Date(baseDate.getTime() + task.offsetHours * 60 * 60 * 1000)
  const iso = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${task.id}`,
    `DTSTAMP:${iso}`,
    `DTSTART:${iso}`,
    `SUMMARY:${task.title}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function TimelinePage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; title: string } | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [draft, setDraft] = useState({
    title: '',
    offsetHours: -24,
  })

  const isPartyScope = selectedEventId === null || selectedEventId === '__party__'
  const referenceDate = isPartyScope && state.core.date
    ? parseISO(state.core.date)
    : state.events.items.find((e) => e.id === selectedEventId)?.date
      ? parseISO(state.events.items.find((e) => e.id === selectedEventId)!.date)
      : null
  const currentTasks = isPartyScope
    ? state.timeline.tasks
    : (state.events.items.find((e) => e.id === selectedEventId)?.tasks ?? [])

  const addTask = () => {
    if (!draft.title.trim()) return
    const newTask = {
      id: uuid(),
      title: draft.title.trim(),
      offsetHours: Number(draft.offsetHours),
      status: 'not_started' as const,
    }
    if (isPartyScope) {
      dispatch({
        type: 'update_timeline',
        payload: { tasks: [...state.timeline.tasks, newTask] },
      })
    } else {
      const ev = state.events.items.find((e) => e.id === selectedEventId)
      if (!ev) return
      const nextTasks = [...(ev.tasks ?? []), newTask]
      dispatch({
        type: 'update_events',
        payload: {
          items: state.events.items.map((e) =>
            e.id === selectedEventId ? { ...e, tasks: nextTasks } : e,
          ),
        },
      })
    }
    setDraft({ title: '', offsetHours: -24 })
  }

  const removeTask = (id: string) => {
    if (isPartyScope) {
      dispatch({
        type: 'update_timeline',
        payload: { tasks: state.timeline.tasks.filter((task) => task.id !== id) },
      })
    } else {
      dispatch({
        type: 'update_events',
        payload: {
          items: state.events.items.map((e) =>
            e.id === selectedEventId
              ? { ...e, tasks: (e.tasks ?? []).filter((t) => t.id !== id) }
              : e,
          ),
        },
      })
    }
  }

  const exportCalendar = () => {
    if (!state.core.date) return
    const content = buildIcsContent(state.timeline.tasks, state.core.date)
    if (content) downloadIcsFile(content, 'party-timeline.ics')
  }

  const getBaseDateString = (): string => {
    if (isPartyScope) return state.core.date
    const ev = state.events.items.find((e) => e.id === selectedEventId)
    return ev?.date ?? state.core.date
  }

  const referencePartyDate = referenceDate ?? (state.core.date ? parseISO(state.core.date) : null)
  const isValidPartyDate = referencePartyDate && !isNaN(referencePartyDate.getTime())
  const today = startOfDay(new Date())
  const daysToEvent = isValidPartyDate
    ? differenceInDays(startOfDay(referencePartyDate), today)
    : null
  const isEventUpcoming = daysToEvent !== null && daysToEvent >= 0

  const [calendarMonth, setCalendarMonth] = useState(() =>
    isValidPartyDate ? startOfMonth(referencePartyDate) : startOfMonth(new Date()),
  )
  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOffset = monthStart.getDay()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const allTasksForCalendar = [
    ...state.timeline.tasks.map((t) => ({ ...t, eventName: state.core.name, date: state.core.date })),
    ...state.events.items.flatMap((ev) =>
      (ev.tasks ?? []).map((t) => ({ ...t, eventName: ev.name, date: ev.date })),
    ),
  ]
  const remainingTasks = allTasksForCalendar.filter((t) => t.status !== 'done')
  const tasksByDay = remainingTasks.reduce<Record<string, typeof remainingTasks>>((acc, t) => {
    if (!t.date) return acc
    const d = parseISO(t.date)
    if (isNaN(d.getTime())) return acc
    const dayStart = startOfDay(new Date(d.getTime() + t.offsetHours * 60 * 60 * 1000))
    const key = format(dayStart, 'yyyy-MM-dd')
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Timeline</h3>
      <p className="text-sm text-slate-300">Tasks relative to party or event start. Each task is exportable.</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400">Tasks for:</span>
        <Select
          value={selectedEventId ?? '__party__'}
          onChange={(e) => setSelectedEventId(e.target.value === '__party__' ? null : e.target.value)}
          className="w-48"
        >
          <option value="__party__">Main party</option>
          {state.events.items.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name || 'Unnamed event'}</option>
          ))}
        </Select>
      </div>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5 text-emerald-400" />
          Days to event
        </CardTitle>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          {isValidPartyDate && (
            <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-emerald-500/10 px-8 py-6 ring-1 ring-emerald-500/20">
              {isEventUpcoming ? (
                <>
                  <span className="text-5xl font-bold tabular-nums text-emerald-400">
                    {daysToEvent}
                  </span>
                  <span className="mt-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
                    {daysToEvent === 0
                      ? "Today's the day!"
                      : daysToEvent === 1
                        ? 'day to go'
                        : 'days to go'}
                  </span>
                </>
              ) : (
                <span className="text-lg font-semibold text-slate-400">Event passed</span>
              )}
              <span className="mt-2 text-xs text-slate-500">
                {format(referencePartyDate, 'EEEE, MMM d, yyyy')}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm font-semibold text-white">
                {format(calendarMonth, 'MMMM yyyy')}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-white/5">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const isPartyDay = Boolean(isValidPartyDate && isSameDay(day, referencePartyDate))
                const isEventDay = state.events.items.some((e) => {
                  if (!e.date) return false
                  const ed = parseISO(e.date)
                  return !isNaN(ed.getTime()) && isSameDay(day, startOfDay(ed))
                })
                const isToday = isSameDay(day, today)
                const isPast = isBefore(day, today) && !isSameDay(day, today)
                const dayKey = format(day, 'yyyy-MM-dd')
                const dayTasks = tasksByDay[dayKey] ?? []
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-center gap-0.5 text-xs font-medium transition',
                      !isSameMonth(day, calendarMonth) && 'text-slate-600',
                      isPartyDay && 'rounded-lg bg-emerald-500 text-white ring-2 ring-emerald-400/50',
                      isEventDay && !isPartyDay && 'rounded-lg bg-emerald-500/30 ring-1 ring-emerald-400/30',
                      isToday && !isPartyDay && !isEventDay && 'rounded-lg ring-1 ring-slate-500 text-slate-200',
                      isPast && !isPartyDay && !isEventDay && 'text-slate-600 opacity-60',
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    {dayTasks.length > 0 && (
                      <span className="rounded bg-black/30 px-1 text-[10px]" title={dayTasks.map((t) => t.title).join(', ')}>
                        {dayTasks.length}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {!state.core.date && (
              <p className="mt-3 text-xs text-slate-500">
                Set your party date in the dashboard to see the countdown.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Add timeline task</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-300 md:col-span-2">
            Task title
            <Input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="mt-2"
              placeholder="Order ice and mixers"
            />
          </label>
          <label className="text-sm text-slate-300">
            Hours from start
            <Input
              type="number"
              value={draft.offsetHours}
              onChange={(event) =>
                setDraft({ ...draft, offsetHours: Number(event.target.value) })
              }
              className="mt-2"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={addTask}>
            Add task
          </Button>
          <Button
            type="button"
            onClick={exportCalendar}
            disabled={!state.core.date}
            variant="outline"
          >
            Export calendar
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Remaining activities (calendar)</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Tasks not yet done, across all events. Export any task to add to your calendar.
        </p>
        {remainingTasks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No remaining tasks. Add tasks below or mark completed ones done.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {remainingTasks.map((task) => {
              const baseDate = task.date ? parseISO(task.date) : null
              const isValid = baseDate && !isNaN(baseDate.getTime())
              return (
                <div
                  key={`${task.eventName}-${task.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold text-white">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.eventName} · {task.offsetHours}h from start</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="px-2 py-1 text-xs"
                      onClick={() => isValid && exportTaskAsIcs(task, baseDate!, `task-${task.title.replace(/\s+/g, '-')}.ics`)}
                      disabled={!isValid}
                    >
                      <Download className="mr-1 size-3" /> .ics
                    </Button>
                    {isValid && (
                      <a
                        href={buildGoogleCalendarUrl(task, task.date, task.eventName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                      >
                        <ExternalLink className="size-3" /> Google
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Timeline tasks{!isPartyScope ? ` (${state.events.items.find((e) => e.id === selectedEventId)?.name || 'Event'})` : ''}</CardTitle>
        {currentTasks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No tasks yet. Add tasks above.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {currentTasks.map((task) => {
              const baseDate = referenceDate && !isNaN(referenceDate.getTime()) ? referenceDate : new Date()
              return (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-white">{task.title}</p>
                    <p className="text-xs uppercase text-slate-400">
                      {task.offsetHours}h from start
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="px-2 py-1 text-xs"
                      onClick={() => exportTaskAsIcs(task, baseDate, `task-${task.title.replace(/\s+/g, '-')}.ics`)}
                    >
                      <Download className="mr-1 size-3" /> .ics
                    </Button>
                    {getBaseDateString() && (
                      <a
                        href={buildGoogleCalendarUrl(task, getBaseDateString(), state.core.name || 'Party')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                      >
                        <ExternalLink className="size-3" /> Google
                      </a>
                    )}
                    <Button
                      type="button"
                      onClick={() => setConfirmingRemove({ id: task.id, title: task.title })}
                      variant="outline"
                      className="px-3 py-1 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeTask(confirmingRemove.id) }}
        title="Remove task"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.title}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default TimelinePage
