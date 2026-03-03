import type { TextareaHTMLAttributes } from 'react'
import { cn } from './utils'

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2.5 text-base text-white placeholder:text-slate-500 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  )
}
