import { cn } from './utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate'
  className?: string
  /** Adds a subtle pulsing glow effect */
  pulse?: boolean
}

const variantStyles: Record<string, string> = {
  emerald:
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  amber:
    'bg-amber-500/15 text-amber-400 border-amber-500/20',
  rose:
    'bg-rose-500/15 text-rose-400 border-rose-500/20',
  blue:
    'bg-blue-500/15 text-blue-400 border-blue-500/20',
  slate:
    'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

export function Badge({
  children,
  variant = 'emerald',
  className,
  pulse,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors',
        variantStyles[variant],
        pulse && 'animate-pulse',
        className,
      )}
    >
      {children}
    </span>
  )
}
