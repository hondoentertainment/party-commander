import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { cn } from '../../components/ui/utils'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Trash2 } from 'lucide-react'

type CleaningPhase = 'before' | 'during' | 'after'
const CLEANING_PHASES: { key: CleaningPhase; title: string }[] = [
  { key: 'before', title: 'Before party' },
  { key: 'during', title: 'During party' },
  { key: 'after', title: 'After party' },
]
const STATUS_ORDER: Array<'not_started' | 'in_progress' | 'done'> = ['not_started', 'in_progress', 'done']

export function CleaningPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; name: string } | null>(null)
  const [confirmingChecklistRemove, setConfirmingChecklistRemove] = useState<{ id: string; label: string } | null>(null)
  const [extraName, setExtraName] = useState('')
  const [extraQty, setExtraQty] = useState(1)
  const [checklistLabel, setChecklistLabel] = useState('')
  const [checklistPhase, setChecklistPhase] = useState<CleaningPhase>('before')
  const bathroomExtras = state.cleaning.bathroomExtras ?? []
  const checklists = state.cleaning.checklists ?? []

  const toggleChecklistStatus = (id: string) => {
    const item = checklists.find((c) => c.id === id)
    if (!item) return
    const idx = STATUS_ORDER.indexOf(item.status)
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
    dispatch({
      type: 'update_cleaning',
      payload: {
        checklists: checklists.map((c) => (c.id === id ? { ...c, status: next } : c)),
      },
    })
  }

  const addChecklistItem = () => {
    if (!checklistLabel.trim()) return
    dispatch({
      type: 'update_cleaning',
      payload: {
        checklists: [
          ...checklists,
          { id: uuid(), label: checklistLabel.trim(), phase: checklistPhase, status: 'not_started' as const },
        ],
      },
    })
    setChecklistLabel('')
  }

  const removeChecklistItem = (id: string) => {
    dispatch({
      type: 'update_cleaning',
      payload: { checklists: checklists.filter((c) => c.id !== id) },
    })
    setConfirmingChecklistRemove(null)
  }

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
      <p className="text-sm text-slate-300">Phase checklists and bathroom essentials.</p>

      <Card>
        <CardTitle>Cleaning phase checklists</CardTitle>
        <p className="mt-1 text-sm text-slate-400">Check off tasks before, during, and after the party.</p>
        {CLEANING_PHASES.map(({ key, title }) => {
          const phaseItems = checklists.filter((c) => c.phase === key)
          return (
            <div key={key} className="mt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase text-slate-400">{title}</h4>
              {phaseItems.length === 0 ? (
                <p className=" rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-500">No items yet.</p>
              ) : (
                <div className="space-y-2">
                  {phaseItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm transition-colors',
                        item.status === 'done' && 'bg-emerald-500/20 text-emerald-200',
                        item.status === 'in_progress' && 'bg-amber-500/20 text-amber-200',
                        (item.status === 'not_started' || (!item.status)) && 'bg-white/5 text-slate-300 hover:bg-white/10',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleChecklistStatus(item.id)}
                        className="flex flex-1 items-center gap-3 text-left"
                        aria-label={`${item.label}, status ${item.status}`}
                      >
                        <span
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded border text-xs',
                            item.status === 'done' && 'border-emerald-500/50 bg-emerald-500/30',
                            item.status === 'in_progress' && 'border-amber-500/50 bg-amber-500/30',
                            (item.status === 'not_started' || (!item.status)) && 'border-white/20 bg-white/5',
                          )}
                        >
                          {item.status === 'done' ? '✓' : item.status === 'in_progress' ? '…' : ''}
                        </span>
                        <span className={cn(item.status === 'done' && 'line-through opacity-80')}>{item.label}</span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-slate-400 hover:text-rose-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmingChecklistRemove({ id: item.id, label: item.label })
                        }}
                        aria-label={`Remove ${item.label}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 p-4">
          <label className="text-sm text-slate-300">
            Item
            <Input
              value={checklistLabel}
              onChange={(e) => setChecklistLabel(e.target.value)}
              className="mt-1"
              placeholder="e.g. Sweep kitchen floor"
            />
          </label>
          <label className="text-sm text-slate-300">
            Phase
            <Select
              value={checklistPhase}
              onChange={(e) => setChecklistPhase(e.target.value as CleaningPhase)}
              className="mt-1"
            >
              <option value="before">Before party</option>
              <option value="during">During party</option>
              <option value="after">After party</option>
            </Select>
          </label>
          <Button type="button" size="sm" onClick={addChecklistItem} disabled={!checklistLabel.trim()}>
            Add to checklist
          </Button>
        </div>
      </Card>

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
      <ConfirmDialog
        open={!!confirmingChecklistRemove}
        onClose={() => setConfirmingChecklistRemove(null)}
        onConfirm={() => { if (confirmingChecklistRemove) removeChecklistItem(confirmingChecklistRemove.id) }}
        title="Remove checklist item"
        description={
          confirmingChecklistRemove
            ? `Remove "${confirmingChecklistRemove.label}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default CleaningPage
