import { AIAssistant } from '../components/AIAssistant'

export function PlanPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h2 className="text-2xl font-semibold text-white">Plan</h2>
      <p className="text-sm text-slate-300">
        Use the Strategy Engine to get AI-powered suggestions for your event.
      </p>
      <AIAssistant />
    </div>
  )
}
