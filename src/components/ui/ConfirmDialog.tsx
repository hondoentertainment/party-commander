import { useEffect, useState } from 'react'
import { Button } from './Button'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  isLoading?: boolean
}

function trapFocus(container: HTMLElement | null, onClose?: () => void) {
  if (!container) return () => {}

  const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE)
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const previouslyFocused = document.activeElement as HTMLElement | null

  first?.focus()

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
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

  container.addEventListener('keydown', handleKeyDown)
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
    previouslyFocused?.focus()
  }
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Remove',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading: externalLoading = false,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  useEffect(() => {
    if (!open) return
    const dialog = document.getElementById('confirm-dialog')
    return trapFocus(dialog, onClose)
  }, [open, onClose])

  const handleConfirm = async () => {
    setInternalLoading(true)
    try {
      await Promise.resolve(onConfirm())
      onClose()
    } finally {
      setInternalLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        id="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="mt-2 text-sm text-slate-400">
          {description}
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Removing…' : confirmLabel}
          </Button>
        </div>
      </div>
    </>
  )
}
