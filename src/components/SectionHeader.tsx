import { motion } from 'framer-motion'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
}

export function SectionHeader({ title, subtitle, eyebrow }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-6"
    >
      {eyebrow ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400/60">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
        {title}
      </h3>
      {subtitle ? (
        <p className="mt-0.5 text-sm font-medium text-slate-500">{subtitle}</p>
      ) : null}
    </motion.div>
  )
}
