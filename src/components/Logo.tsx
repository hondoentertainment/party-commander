import { cn } from './ui/utils'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** Show the wordmark next to the icon */
  wordmark?: boolean
}

const sizes = {
  xs: 'size-6',
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-14',
  xl: 'size-20',
} as const

/**
 * Party Commander brand mark — crown + lightning bolt.
 * Pure SVG, no external assets needed.
 */
export function LogoIcon({ size = 'md', className }: Omit<LogoProps, 'wordmark'>) {
  return (
    <div
      className={cn(
        'relative shrink-0 rounded-2xl overflow-hidden',
        sizes[size],
        className,
      )}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoBg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="logoCrown" x1="128" y1="120" x2="384" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="logoBolt" x1="230" y1="200" x2="290" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="512" height="512" rx="112" fill="url(#logoBg)" />
        <rect x="4" y="4" width="504" height="504" rx="108" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="2" />

        {/* Crown */}
        <path
          d="M 108 340 L 140 160 L 196 240 L 256 130 L 316 240 L 372 160 L 404 340 Z"
          fill="url(#logoCrown)"
          opacity="0.95"
        />
        <rect x="108" y="328" width="296" height="40" rx="8" fill="url(#logoCrown)" opacity="0.85" />

        {/* Crown jewels */}
        <circle cx="192" cy="290" r="12" fill="#fbbf24" opacity="0.9" />
        <circle cx="256" cy="260" r="14" fill="#fbbf24" opacity="0.95" />
        <circle cx="320" cy="290" r="12" fill="#fbbf24" opacity="0.9" />

        {/* Lightning bolt */}
        <path
          d="M 272 175 L 238 270 L 268 270 L 240 370 L 300 255 L 268 255 Z"
          fill="url(#logoBolt)"
          opacity="0.95"
        />

        {/* Sparkles */}
        <circle cx="148" cy="180" r="4" fill="#34d399" opacity="0.7" />
        <circle cx="364" cy="180" r="4" fill="#34d399" opacity="0.7" />
      </svg>
    </div>
  )
}

export function Logo({ size = 'md', wordmark = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoIcon size={size} />
      {wordmark && (
        <div className="min-w-0">
          <h1 className="text-base font-bold tracking-tight text-white">
            Party Commander
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">
            Command Center
          </p>
        </div>
      )}
    </div>
  )
}
