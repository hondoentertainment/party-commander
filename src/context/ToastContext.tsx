import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

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

const variantConfig = {
  success: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    Icon: CheckCircle2,
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
  error: {
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
    text: 'text-rose-300',
    Icon: AlertCircle,
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
  },
  info: {
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    Icon: Info,
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (message: string, variant: Toast['variant'] = 'success') => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, variant }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    },
    [],
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <div
        className="fixed bottom-20 left-1/2 z-[70] flex flex-col gap-2 -translate-x-1/2 md:bottom-8 md:left-auto md:right-6 md:translate-x-0"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const config = variantConfig[t.variant ?? 'success']
            const Icon = config.Icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                role="status"
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium backdrop-blur-xl ${config.border} ${config.bg} ${config.text} ${config.glow}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{t.message}</span>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded-full p-0.5 transition-colors hover:bg-white/10"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  return ctx ?? { toasts: [], addToast: () => {} }
}
