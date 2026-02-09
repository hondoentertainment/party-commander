import { SectionHeader } from '../components/SectionHeader'

export function PlaceholderPage({
  title,
  subtitle,
  hints,
}: {
  title: string
  subtitle: string
  hints: string[]
}) {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p className="font-medium text-slate-900">Next up</p>
        <ul className="mt-3 space-y-2">
          {hints.map((hint) => (
            <li key={hint} className="rounded-lg bg-slate-50 px-3 py-2">
              {hint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
