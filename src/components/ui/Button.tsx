import type { ButtonHTMLAttributes } from 'react'
import { cn } from './utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 overflow-hidden group cursor-pointer',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-4 text-base',
        variant === 'primary' &&
          'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        variant === 'outline' &&
          'border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08] hover:border-white/20 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        variant === 'ghost' &&
          'text-slate-400 hover:text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        variant === 'danger' &&
          'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        className,
      )}
      {...props}
      aria-disabled={props.disabled}
    >
      <span className="relative z-10 flex items-center gap-2">{props.children}</span>
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  )
}
