import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

export interface Toast {
  id: string
  message: string
  variant?: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, variant?: Toast['variant']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: Toast['variant'] = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <div
        className="fixed bottom-20 left-1/2 z-[70] flex flex-col gap-2 -translate-x-1/2 md:bottom-8"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={[
              'rounded-xl border px-4 py-2 text-sm font-medium shadow-lg',
              t.variant === 'error' && 'border-rose-500/30 bg-rose-500/20 text-rose-200',
              t.variant === 'info' && 'border-blue-500/30 bg-blue-500/20 text-blue-200',
              (!t.variant || t.variant === 'success') &&
                'border-emerald-500/30 bg-emerald-500/20 text-emerald-200',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  return ctx ?? { toasts: [], addToast: () => {} }
}
