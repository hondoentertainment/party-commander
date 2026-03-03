interface SectionHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
}

export function SectionHeader({ title, subtitle, eyebrow }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">{eyebrow}</p>
      ) : null}
      <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
      {subtitle ? <p className="text-sm text-slate-300">{subtitle}</p> : null}
    </div>
  )
}
