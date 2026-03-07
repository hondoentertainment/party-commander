import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import type { BudgetLineItem } from '../../state/types'

/** Parse dollar amount from string like "$24" or "24.50" */
function parseCost(value: string): number {
  const cleaned = String(value).replace(/[$,]/g, '').trim()
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

/** Sum decor costs for display */
function sumDecorCosts(decorItems: { cost: string }[]): number {
  return decorItems.reduce((sum, item) => sum + parseCost(item.cost), 0)
}

export function BudgetPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; label: string } | null>(null)
  const [draft, setDraft] = useState({
    label: '',
    category: 'decor' as BudgetLineItem['category'],
    amount: 0,
    notes: '',
  })

  const manualTotal = state.budget.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const decorTotal = sumDecorCosts(state.decor.items)
  const totalSpent = manualTotal + decorTotal
  const limit = state.budget.limit ?? 0
  const overBudget = limit > 0 && totalSpent > limit

  const addLineItem = () => {
    if (!draft.label.trim() && draft.amount <= 0) return
    dispatch({
      type: 'update_budget',
      payload: {
        lineItems: [
          ...state.budget.lineItems,
          {
            id: uuid(),
            label: draft.label.trim() || 'Misc',
            category: draft.category,
            amount: draft.amount,
            notes: draft.notes.trim() || undefined,
          },
        ],
      },
    })
    setDraft({ label: '', category: 'decor', amount: 0, notes: '' })
  }

  const removeLineItem = (id: string) => {
    dispatch({
      type: 'update_budget',
      payload: {
        lineItems: state.budget.lineItems.filter((item) => item.id !== id),
      },
    })
  }
  const doRemoveLineItem = (id: string) => {
    removeLineItem(id)
    setConfirmingRemove(null)
  }

  const updateLineItem = (
    id: string,
    updates: Partial<BudgetLineItem>,
  ) => {
    dispatch({
      type: 'update_budget',
      payload: {
        lineItems: state.budget.lineItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h2 className="text-2xl font-semibold text-white">Budget</h2>
      <p className="text-sm text-slate-300">
        Track costs per category. Decor costs are automatically synced from the Decor module.
      </p>

      <Card>
        <CardTitle>Totals</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-400">Total spent</p>
            <p className="text-2xl font-bold text-white">
              ${totalSpent.toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Manual: ${manualTotal.toFixed(2)} · Decor: ${decorTotal.toFixed(2)}
            </p>
          </div>
          <label className="text-sm text-slate-300">
            Budget limit (optional)
            <Input
              type="number"
              min={0}
              step={0.01}
              value={state.budget.limit ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'update_budget',
                  payload: {
                    limit: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="mt-2"
              placeholder="e.g. 500"
            />
            {overBudget && limit > 0 ? (
              <p className="mt-2 text-sm text-rose-400">Over budget by ${(totalSpent - limit).toFixed(2)}</p>
            ) : null}
          </label>
        </div>
      </Card>

      <Card>
        <CardTitle>Add line item</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Label
            <Input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              className="mt-2"
              placeholder="Ice, cups, napkins"
            />
          </label>
          <label className="text-sm text-slate-300">
            Category
            <Select
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as BudgetLineItem['category'] })
              }
              className="mt-2"
            >
              <option value="decor">Decor</option>
              <option value="food">Food</option>
              <option value="drinks">Drinks</option>
              <option value="venue">Venue</option>
              <option value="supplies">Supplies</option>
              <option value="other">Other</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Amount ($)
            <Input
              type="number"
              min={0}
              step={0.01}
              value={draft.amount || ''}
              onChange={(e) =>
                setDraft({ ...draft, amount: Number(e.target.value) || 0 })
              }
              className="mt-2"
              placeholder="24.99"
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Notes
            <Input
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              className="mt-2"
              placeholder="Optional"
            />
          </label>
        </div>
        <Button type="button" onClick={addLineItem} className="mt-4">
          Add item
        </Button>
      </Card>

      <Card>
        <CardTitle>Line items</CardTitle>
        {state.budget.lineItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No line items yet. Add costs above.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.budget.lineItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    value={item.label}
                    onChange={(e) => updateLineItem(item.id, { label: e.target.value })}
                    className="max-w-[200px]"
                  />
                  <Select
                    value={item.category}
                    onChange={(e) =>
                      updateLineItem(item.id, {
                        category: e.target.value as BudgetLineItem['category'],
                      })
                    }
                    className="w-32"
                  >
                    <option value="decor">Decor</option>
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="venue">Venue</option>
                    <option value="supplies">Supplies</option>
                    <option value="other">Other</option>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.amount || ''}
                    onChange={(e) =>
                      updateLineItem(item.id, { amount: Number(e.target.value) || 0 })
                    }
                    className="w-24"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setConfirmingRemove({ id: item.id, label: item.label })}
                  variant="outline"
                  className="px-3 py-1 text-xs"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) doRemoveLineItem(confirmingRemove.id) }}
        title="Remove line item"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.label}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default BudgetPage
