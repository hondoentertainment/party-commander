interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Overview</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
      {subtitle ? <p className="text-sm text-slate-300">{subtitle}</p> : null}
    </div>
  )
}
