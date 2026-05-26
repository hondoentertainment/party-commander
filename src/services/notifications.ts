import type { PartyState, TimelineTask } from '../state/types'

/** Check if the browser supports the Notifications API */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/** Get the current notification permission state */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

/** Request notification permission from the user */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'
  const result = await Notification.requestPermission()
  return result
}

/** Send a browser notification */
export function sendNotification(title: string, options?: NotificationOptions): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return null
  return new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options,
  })
}

export interface ReminderCheck {
  task: TimelineTask
  eventName: string
  dueDate: Date
  hoursUntilDue: number
}

/** Check which tasks are coming up within the given threshold (in hours) */
export function getUpcomingReminders(
  state: PartyState,
  thresholdHours = 24,
): ReminderCheck[] {
  const now = new Date()
  const reminders: ReminderCheck[] = []

  const checkTasks = (tasks: TimelineTask[], baseDate: string, eventName: string) => {
    if (!baseDate) return
    const base = new Date(baseDate)
    if (isNaN(base.getTime())) return

    for (const task of tasks) {
      if (task.status === 'done') continue
      const dueDate = new Date(base.getTime() + task.offsetHours * 60 * 60 * 1000)
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      if (hoursUntilDue > 0 && hoursUntilDue <= thresholdHours) {
        reminders.push({ task, eventName, dueDate, hoursUntilDue })
      }
    }
  }

  // Check main party tasks
  checkTasks(state.timeline.tasks, state.core.date, state.core.name || 'Main party')

  // Check per-event tasks
  for (const event of state.events.items) {
    if (event.tasks) {
      checkTasks(event.tasks, event.date, event.name || 'Event')
    }
  }

  // Check restock alerts
  if (state.live.restockAlerts.ice || state.live.restockAlerts.cups ||
      state.live.restockAlerts.mixers || state.live.restockAlerts.trash) {
    const alerts = Object.entries(state.live.restockAlerts)
      .filter(([, active]) => active)
      .map(([item]) => item)
    if (alerts.length > 0) {
      reminders.push({
        task: {
          id: 'restock-alert',
          title: `Restock needed: ${alerts.join(', ')}`,
          offsetHours: 0,
          status: 'not_started',
        },
        eventName: 'Live Party',
        dueDate: now,
        hoursUntilDue: 0,
      })
    }
  }

  return reminders.sort((a, b) => a.hoursUntilDue - b.hoursUntilDue)
}

/** Send reminder notifications for upcoming tasks */
export function sendTaskReminders(state: PartyState, thresholdHours = 24): void {
  const reminders = getUpcomingReminders(state, thresholdHours)
  for (const reminder of reminders) {
    const hours = Math.round(reminder.hoursUntilDue)
    const body = hours > 0
      ? `Due in ~${hours}h for ${reminder.eventName}`
      : `Active alert for ${reminder.eventName}`
    sendNotification(reminder.task.title, { body, tag: reminder.task.id })
  }
}
