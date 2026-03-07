import { describe, it, expect } from 'vitest'
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  buildIcsContent,
} from './calendar'

const task = { id: 't1', title: 'Buy ice', offsetHours: -6, status: 'not_started' as const }
const baseDate = '2026-06-15T18:00:00.000Z'

describe('buildGoogleCalendarUrl', () => {
  it('returns a valid Google Calendar URL', () => {
    const url = buildGoogleCalendarUrl(task, baseDate, 'Birthday Bash')
    expect(url).toContain('google.com/calendar/render')
    expect(url).toContain('Buy+ice')
    expect(url).toContain('Birthday+Bash')
  })

  it('returns empty string for invalid date', () => {
    expect(buildGoogleCalendarUrl(task, 'not-a-date', 'Party')).toBe('')
  })
})

describe('buildOutlookCalendarUrl', () => {
  it('returns a valid Outlook Calendar URL', () => {
    const url = buildOutlookCalendarUrl(task, baseDate, 'Birthday Bash')
    expect(url).toContain('outlook.live.com')
    expect(url).toContain('Buy+ice')
  })

  it('returns empty string for invalid date', () => {
    expect(buildOutlookCalendarUrl(task, 'bad', 'P')).toBe('')
  })
})

describe('buildIcsContent', () => {
  it('generates valid iCalendar content', () => {
    const ics = buildIcsContent([task], baseDate)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('SUMMARY:Buy ice')
    expect(ics).toContain('UID:t1')
  })

  it('handles multiple tasks', () => {
    const tasks = [
      task,
      { id: 't2', title: 'Set up decor', offsetHours: -2 },
    ]
    const ics = buildIcsContent(tasks, baseDate)
    expect(ics).toContain('SUMMARY:Buy ice')
    expect(ics).toContain('SUMMARY:Set up decor')
  })

  it('returns empty string for invalid date', () => {
    expect(buildIcsContent([task], 'nope')).toBe('')
  })
})
