import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { isSpotifyUrl } from '../utils/spotify'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export type SpotifyTarget = 'mainLink' | 'pregame' | 'arrival' | 'peak' | 'late' | 'windDown'

interface SpotifyEmbedModalProps {
  open: boolean
  onClose: () => void
  onSave: (url: string, target: SpotifyTarget) => void
  initialUrl?: string
  target?: SpotifyTarget
}

const TARGET_LABELS: Record<SpotifyTarget, string> = {
  mainLink: 'Master Playlist',
  pregame: 'Pregame',
  arrival: 'Arrival',
  peak: 'Peak',
  late: 'Late',
  windDown: 'Wind Down',
}

export function SpotifyEmbedModal({
  open,
  onClose,
  onSave,
  initialUrl = '',
  target = 'mainLink',
}: SpotifyEmbedModalProps) {
  const [url, setUrl] = useState(initialUrl)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setUrl(initialUrl)
      setError(null)
    }
  }, [open, initialUrl])

  useEffect(() => {
    if (!open) return
    const el = dialogRef.current
    if (!el) return

    const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const previouslyFocused = document.activeElement as HTMLElement | null
    first?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        previouslyFocused?.focus()
        return
      }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Enter a Spotify track or playlist URL.')
      return
    }
    if (!isSpotifyUrl(trimmed)) {
      setError('Please enter a valid Spotify URL (e.g. open.spotify.com/playlist/...)')
      return
    }
    onSave(trimmed, target)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spotify-modal-title"
            aria-describedby="spotify-modal-desc"
            className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <h2 id="spotify-modal-title" className="text-lg font-bold text-white">
              Add Spotify – {TARGET_LABELS[target]}
            </h2>
            <p id="spotify-modal-desc" className="mt-2 text-sm text-slate-400">
              Paste a Spotify track or playlist URL. We&apos;ll embed it so you can play it right here.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError(null)
                }}
                placeholder="https://open.spotify.com/playlist/..."
                className="w-full"
                autoFocus
                aria-invalid={!!error}
                aria-describedby={error ? 'spotify-error' : undefined}
              />
              {error && (
                <p id="spotify-error" className="text-sm text-rose-400" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Add to {TARGET_LABELS[target]}</Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
