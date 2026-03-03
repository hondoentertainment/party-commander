import { useEffect, useState } from 'react'

export function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      setSyncing(true)
      setTimeout(() => setSyncing(false), 3000)
    }
    const handleOffline = () => {
      setOnline(false)
      setSyncing(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { online, syncing }
}
