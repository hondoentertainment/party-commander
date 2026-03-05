import type { InputHTMLAttributes } from 'react'
import { cn } from './utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-base text-white placeholder:text-slate-600 transition-all duration-200 focus:border-emerald-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  )
}
