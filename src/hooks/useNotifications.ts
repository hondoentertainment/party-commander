import { useCallback, useEffect, useRef, useState } from 'react'
import { useParty } from '../state/PartyContext'
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTaskReminders,
  getUpcomingReminders,
  isNotificationSupported,
  type ReminderCheck,
} from '../services/notifications'

const CHECK_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes
const REMINDER_THRESHOLD_HOURS = 24

export function useNotifications() {
  const { state } = useParty()
  const [permission, setPermission] = useState(getNotificationPermission)
  const [reminders, setReminders] = useState<ReminderCheck[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const supported = isNotificationSupported()

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    return result
  }, [])

  const checkReminders = useCallback(() => {
    const upcoming = getUpcomingReminders(state, REMINDER_THRESHOLD_HOURS)
    setReminders(upcoming)
    return upcoming
  }, [state])

  // Send notifications when permission is granted
  const sendReminders = useCallback(() => {
    if (permission !== 'granted') return
    sendTaskReminders(state, REMINDER_THRESHOLD_HOURS)
  }, [state, permission])

  // Periodic reminder check
  useEffect(() => {
    if (!supported) return

    // Use setTimeout(0) for initial check to avoid synchronous setState in effect
    const initialTimer = setTimeout(() => checkReminders(), 0)

    intervalRef.current = setInterval(() => {
      checkReminders()
      if (permission === 'granted') {
        sendTaskReminders(state, REMINDER_THRESHOLD_HOURS)
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      clearTimeout(initialTimer)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [supported, permission, state, checkReminders])

  return {
    supported,
    permission,
    reminders,
    requestPermission,
    checkReminders,
    sendReminders,
  }
}
