import type { ButtonHTMLAttributes } from 'react'
import { cn } from './utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-semibold transition',
        variant === 'primary' && 'bg-emerald-500 text-black hover:bg-emerald-400',
        variant === 'outline' &&
          'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        variant === 'ghost' && 'text-slate-300 hover:text-white',
        className,
      )}
      {...props}
    />
  )
}
