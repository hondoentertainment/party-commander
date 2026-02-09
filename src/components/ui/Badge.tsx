import type { HTMLAttributes } from 'react'
import { cn } from './utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'accent' | 'success' | 'muted' | 'danger'
}

export function Badge({ className, tone = 'muted', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-semibold',
        tone === 'accent' && 'bg-emerald-500/20 text-emerald-200',
        tone === 'success' && 'bg-emerald-500/20 text-emerald-200',
        tone === 'muted' && 'bg-white/10 text-slate-300',
        tone === 'danger' && 'bg-rose-500/20 text-rose-200',
        className,
      )}
      {...props}
    />
  )
}
