import { useParty } from '../../state/PartyContext'
import { cn } from '../../components/ui/utils'
import { Card, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { Theme } from '../../state/types'

const PARTY_CONCEPTS: Theme[] = [
  'Classic',
  'Rooftop',
  'Tropical',
  'Disco',
  'Game Night',
  'Cozy',
  'Minimal',
  'Custom',
]

export function PlanPage() {
  const { state, dispatch } = useParty()

  const setTheme = (theme: Theme) => {
    dispatch({
      type: 'update_core',
      payload: { theme, customTheme: theme === 'Custom' ? state.core.customTheme : '' },
    })
  }

  const setCustomTheme = (customTheme: string) => {
    dispatch({ type: 'update_core', payload: { customTheme } })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Plan</h3>
      <p className="text-sm text-slate-300">
        Pick a party concept for your event. This sets the vibe for drinks and decor.
      </p>

      <Card>
        <CardTitle>Party concepts</CardTitle>
        <ul className="mt-4 space-y-2">
          {PARTY_CONCEPTS.map((concept) => (
            <li key={concept}>
              <button
                type="button"
                onClick={() => setTheme(concept)}
                className={cn(
                  'w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition',
                  state.core.theme === concept
                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                {concept}
              </button>
            </li>
          ))}
        </ul>
        {state.core.theme === 'Custom' && (
          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-400">Custom concept name</span>
            <Input
              value={state.core.customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              className="mt-2"
              placeholder="e.g. Art Deco Speakeasy"
            />
          </label>
        )}
      </Card>
    </div>
  )
}

export default PlanPage
