import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { cn } from '../../components/ui/utils'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Trash2 } from 'lucide-react'

export function CleaningPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; name: string } | null>(null)
  const [extraName, setExtraName] = useState('')
  const [extraQty, setExtraQty] = useState(1)
  const bathroomExtras = state.cleaning.bathroomExtras ?? []

  const toggleBathroomSupply = (id: string) => {
    dispatch({
      type: 'update_cleaning',
      payload: {
        bathroomSupplies: state.cleaning.bathroomSupplies.map((item) =>
          item.id === id
            ? { ...item, status: item.status === 'done' ? 'not_started' : 'done' }
            : item,
        ),
      },
    })
  }

  const addBathroomExtra = () => {
    if (!extraName.trim()) return
    dispatch({
      type: 'update_cleaning',
      payload: {
        bathroomExtras: [
          ...bathroomExtras,
          { id: uuid(), name: extraName.trim(), quantity: extraQty, status: 'not_started' as const },
        ],
      },
    })
    setExtraName('')
    setExtraQty(1)
  }

  const toggleBathroomExtra = (id: string) => {
    dispatch({
      type: 'update_cleaning',
      payload: {
        bathroomExtras: bathroomExtras.map((item) =>
          item.id === id
            ? { ...item, status: item.status === 'done' ? 'not_started' : 'done' }
            : item,
        ),
      },
    })
  }

  const removeBathroomExtra = (id: string) => {
    dispatch({
      type: 'update_cleaning',
      payload: { bathroomExtras: bathroomExtras.filter((i) => i.id !== id) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Cleaning & Bathroom</h3>
      <p className="text-sm text-slate-300">Bathroom essentials checklist. Add more items below if needed.</p>

      <Card>
        <CardTitle>Bathroom essentials</CardTitle>
        <div className="mt-4 space-y-2">
          {state.cleaning.bathroomSupplies.map((item) => (
            <label
              key={item.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                item.status === 'done'
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10',
              )}
            >
              <input
                type="checkbox"
                checked={item.status === 'done'}
                onChange={() => toggleBathroomSupply(item.id)}
                className="size-4 shrink-0 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/50"
                aria-label={item.name}
              />
              <span className={cn(item.status === 'done' && 'line-through opacity-80')}>
                {item.name}
              </span>
            </label>
          ))}
        </div>
          {bathroomExtras.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Additional items</p>
              <div className="space-y-2">
                {bathroomExtras.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-2"
                  >
                    <label
                      className={cn(
                        'flex flex-1 cursor-pointer items-center gap-3 text-sm',
                        item.status === 'done' && 'text-emerald-300 line-through opacity-80',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={item.status === 'done'}
                        onChange={() => toggleBathroomExtra(item.id)}
                        className="size-4 shrink-0 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/50"
                        aria-label={`${item.name} quantity ${item.quantity}`}
                      />
                      {item.name} × {item.quantity}
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-slate-400 hover:text-rose-400"
                      onClick={() => setConfirmingRemove({ id: item.id, name: item.name })}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 p-4">
            <label className="text-sm text-slate-300">
              Item
              <Input
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                className="mt-1"
                placeholder="e.g. Paper towels"
              />
            </label>
            <label className="text-sm text-slate-300">
              Qty
              <Input
                type="number"
                min={1}
                value={extraQty}
                onChange={(e) => setExtraQty(Number(e.target.value) || 1)}
                className="mt-1 w-20"
              />
            </label>
            <Button type="button" size="sm" onClick={addBathroomExtra} disabled={!extraName.trim()}>
              Add to checklist
            </Button>
          </div>
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeBathroomExtra(confirmingRemove.id) }}
        title="Remove item"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.name}" from checklist? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default CleaningPage
