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
        'relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-4 text-base',
        variant === 'primary' &&
        'bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        variant === 'outline' &&
        'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        variant === 'ghost' &&
        'text-slate-300 hover:text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        variant === 'danger' &&
        'bg-rose-500 text-white hover:bg-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        className,
      )}
      {...props}
    >
      <span className="relative z-10">{props.children}</span>
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}
