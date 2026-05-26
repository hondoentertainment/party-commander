import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Download, Pencil } from 'lucide-react'
import type { DecorItem } from '../../state/types'

type DecorDraft = Omit<DecorItem, 'id'>
function emptyDraft(): DecorDraft {
  return {
    name: '',
    zone: 'entry',
    quantity: 1,
    buyLink: '',
    eta: '',
    cost: '',
    status: 'not_started',
    reusable: false,
    storageNote: '',
  }
}

export function DecorPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; name: string } | null>(null)
  const [editingItem, setEditingItem] = useState<{ id: string } | null>(null)
  const [draft, setDraft] = useState<DecorDraft>(emptyDraft)

  const addItem = () => {
    if (!draft.name.trim()) return
    if (editingItem) {
      const updated = state.decor.items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: draft.name.trim(),
              zone: draft.zone,
              quantity: draft.quantity,
              buyLink: draft.buyLink.trim(),
              eta: draft.eta.trim(),
              cost: draft.cost.trim(),
              status: draft.status,
              reusable: draft.reusable,
              storageNote: draft.storageNote.trim(),
            }
          : item,
      )
      dispatch({ type: 'update_decor', payload: { items: updated } })
      setEditingItem(null)
    } else {
      dispatch({
        type: 'update_decor',
        payload: {
          items: [
            ...state.decor.items,
            {
              id: uuid(),
              name: draft.name.trim(),
              zone: draft.zone,
              quantity: draft.quantity,
              buyLink: draft.buyLink.trim(),
              eta: draft.eta.trim(),
              cost: draft.cost.trim(),
              status: draft.status,
              reusable: draft.reusable,
              storageNote: draft.storageNote.trim(),
            },
          ],
        },
      })
    }
    setDraft(emptyDraft())
  }

  const startEdit = (item: (typeof state.decor.items)[0]) => {
    setEditingItem({ id: item.id })
    setDraft({
      name: item.name,
      zone: item.zone,
      quantity: item.quantity,
      buyLink: item.buyLink,
      eta: item.eta,
      cost: item.cost,
      status: item.status,
      reusable: item.reusable,
      storageNote: item.storageNote,
    })
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setDraft(emptyDraft())
  }

  const removeItem = (id: string) => {
    dispatch({
      type: 'update_decor',
      payload: { items: state.decor.items.filter((item) => item.id !== id) },
    })
    if (editingItem?.id === id) cancelEdit()
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Decor & Ambience</h3>
      <p className="text-sm text-slate-300">Track decor by zone with status and storage notes.</p>

      <Card>
        <CardTitle>{editingItem ? 'Edit decor item' : 'Add decor item'}</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Item
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2"
              placeholder="String lights"
            />
          </label>
          <label className="text-sm text-slate-300">
            Zone
            <Select
              value={draft.zone}
              onChange={(event) =>
                setDraft({ ...draft, zone: event.target.value as typeof draft.zone })
              }
              className="mt-2"
            >
              <option value="entry">Entry</option>
              <option value="living_room">Living room</option>
              <option value="table">Table</option>
              <option value="lighting">Lighting</option>
              <option value="bathroom">Bathroom</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Quantity
            <Input
              type="number"
              min={1}
              value={draft.quantity}
              onChange={(event) =>
                setDraft({ ...draft, quantity: Number(event.target.value) })
              }
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300">
            Status
            <Select
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as typeof draft.status })
              }
              className="mt-2"
            >
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Buy link
            <Input
              value={draft.buyLink}
              onChange={(event) => setDraft({ ...draft, buyLink: event.target.value })}
              className="mt-2"
              placeholder="https://..."
            />
          </label>
          <label className="text-sm text-slate-300">
            ETA
            <Input
              value={draft.eta}
              onChange={(event) => setDraft({ ...draft, eta: event.target.value })}
              className="mt-2"
              placeholder="Arrives Wed"
            />
          </label>
          <label className="text-sm text-slate-300">
            Cost
            <Input
              value={draft.cost}
              onChange={(event) => setDraft({ ...draft, cost: event.target.value })}
              className="mt-2"
              placeholder="$24"
            />
          </label>
          <label className="text-sm text-slate-300">
            Reusable
            <Select
              value={draft.reusable ? 'yes' : 'no'}
              onChange={(event) => setDraft({ ...draft, reusable: event.target.value === 'yes' })}
              className="mt-2"
            >
              <option value="no">Disposable</option>
              <option value="yes">Reusable</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Storage note
            <Input
              value={draft.storageNote}
              onChange={(event) => setDraft({ ...draft, storageNote: event.target.value })}
              className="mt-2"
              placeholder="Store with winter decor"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={addItem}>
            {editingItem ? 'Save changes' : 'Add decor'}
          </Button>
          {editingItem && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Decor list</CardTitle>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-slate-400">Track decor by zone with status.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const lines = state.decor.items.map(
                (i) => `${i.name} | ${i.zone.replace('_', ' ')} | qty ${i.quantity} | ${i.status}`,
              )
              const content = ['Decor List', '================', '', ...lines].join('\n')
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = 'decor-list.txt'
              link.click()
              URL.revokeObjectURL(url)
            }}
            disabled={state.decor.items.length === 0}
          >
            <Download className="mr-1 size-3" /> Export
          </Button>
        </div>
        {state.decor.items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No decor yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.decor.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs uppercase text-slate-400">
                    {item.zone.replace('_', ' ')} · qty {item.quantity} · {item.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="px-3 py-1 text-xs"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit ${item.name}`}
                  >
                    <Pencil className="mr-1 size-3" /> Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setConfirmingRemove({ id: item.id, name: item.name })}
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeItem(confirmingRemove.id) }}
        title="Remove decor item"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.name}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default DecorPage
