import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'

export function EntryPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null)
  const [textDraft, setTextDraft] = useState('')

  const addText = () => {
    if (!textDraft.trim()) return
    dispatch({
      type: 'update_entry',
      payload: { arrivalTexts: [...state.entry.arrivalTexts, textDraft.trim()] },
    })
    setTextDraft('')
  }

  const removeText = (text: string) => {
    dispatch({
      type: 'update_entry',
      payload: { arrivalTexts: state.entry.arrivalTexts.filter((item) => item !== text) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Entry Mode</h3>
      <p className="text-sm text-slate-300">Buzz-in instructions and arrival texts.</p>

      <Card>
        <CardTitle>Building access</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            ButterflyMX link
            <Input
              value={state.entry.butterflyLink}
              onChange={(event) =>
                dispatch({ type: 'update_entry', payload: { butterflyLink: event.target.value } })
              }
              className="mt-2"
              placeholder="butterflymx://..."
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Entry instructions
            <Textarea
              value={state.entry.instructions}
              onChange={(event) =>
                dispatch({ type: 'update_entry', payload: { instructions: event.target.value } })
              }
              rows={3}
              placeholder="Call box 1203, then take the elevator to the roof."
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardTitle>Arrival texts</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={textDraft}
            onChange={(event) => setTextDraft(event.target.value)}
            className="flex-1"
            placeholder="Buzz in and come up!"
          />
          <Button type="button" onClick={addText}>
            Add
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {state.entry.arrivalTexts.map((text) => (
            <div
              key={text}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
            >
              <span>{text}</span>
              <Button
                variant="ghost"
                onClick={() => setConfirmingRemove(text)}
                className="text-xs"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeText(confirmingRemove) }}
        title="Remove arrival text"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default EntryPage
