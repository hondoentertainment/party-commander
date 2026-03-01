import type { HTMLAttributes } from 'react'
import { cn } from './utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'glass-morphism group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] rounded-2xl p-6',
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10">{props.children}</div>
    </div>
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-6 flex flex-col gap-1.5', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn('text-lg font-bold tracking-tight text-white', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm font-medium text-slate-400/90', className)} {...props} />
}
