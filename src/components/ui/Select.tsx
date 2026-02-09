import type { SelectHTMLAttributes } from 'react'
import { cn } from './utils'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white',
        className,
      )}
      {...props}
    />
  )
}
