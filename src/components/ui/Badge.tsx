import type { HTMLAttributes } from 'react'
import { cn } from './utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'accent' | 'success' | 'muted' | 'danger'
}

export function Badge({ className, tone = 'muted', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
        tone === 'accent' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        tone === 'success' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        tone === 'muted' && 'border-white/5 bg-white/5 text-slate-400',
        tone === 'danger' && 'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
        className,
      )}
      {...props}
    />
  )
}
