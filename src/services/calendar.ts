import type { TimelineTask } from '../state/types'

/** Build a Google Calendar "Add Event" URL for a task */
export function buildGoogleCalendarUrl(
  task: TimelineTask,
  baseDate: string,
  partyName: string,
): string {
  const base = new Date(baseDate)
  if (isNaN(base.getTime())) return ''

  const start = new Date(base.getTime() + task.offsetHours * 60 * 60 * 1000)
  const end = new Date(start.getTime() + 60 * 60 * 1000) // 1-hour default duration

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Task for ${partyName} (${task.offsetHours}h from event start)`,
  })

  return `https://www.google.com/calendar/render?${params.toString()}`
}

/** Build an Outlook Web "Add Event" URL for a task */
export function buildOutlookCalendarUrl(
  task: TimelineTask,
  baseDate: string,
  partyName: string,
): string {
  const base = new Date(baseDate)
  if (isNaN(base.getTime())) return ''

  const start = new Date(base.getTime() + task.offsetHours * 60 * 60 * 1000)
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: task.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: `Task for ${partyName} (${task.offsetHours}h from event start)`,
  })

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`
}

/** Generate an .ics file content string for one or more tasks */
export function buildIcsContent(
  tasks: { id: string; title: string; offsetHours: number }[],
  baseDate: string,
): string {
  const base = new Date(baseDate)
  if (isNaN(base.getTime())) return ''

  const events = tasks.map((task) => {
    const start = new Date(base.getTime() + task.offsetHours * 60 * 60 * 1000)
    const iso = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    return [
      'BEGIN:VEVENT',
      `UID:${task.id}`,
      `DTSTAMP:${iso}`,
      `DTSTART:${iso}`,
      `SUMMARY:${task.title}`,
      'END:VEVENT',
    ].join('\n')
  })

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PartyCommander//EN', ...events, 'END:VCALENDAR'].join('\n')
}

/** Trigger a download of an .ics file */
export function downloadIcsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
