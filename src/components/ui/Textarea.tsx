import type { TextareaHTMLAttributes } from 'react'
import { cn } from './utils'

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-500',
        className,
      )}
      {...props}
    />
  )
}
