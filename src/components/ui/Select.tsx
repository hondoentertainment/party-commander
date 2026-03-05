import type { SelectHTMLAttributes } from 'react'
import { cn } from './utils'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white transition-all duration-200 focus:border-emerald-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  )
}
