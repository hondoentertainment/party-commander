import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { cn } from '../../components/ui/utils'

function EntryQRCode({ url }: { url: string }) {
  const encoded = encodeURIComponent(url)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encoded}`
  return (
    <div className="mt-2 flex flex-col items-center gap-2 rounded-lg bg-white/5 p-3">
      <img src={qrUrl} alt="QR code for entry link" className="size-32 rounded" />
      <p className="text-xs text-slate-400">Scan to open entry link</p>
    </div>
  )
}

export function EntryPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null)
  const [textDraft, setTextDraft] = useState('')
  const [guestDraft, setGuestDraft] = useState('')

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
            {state.entry.butterflyLink && <EntryQRCode url={state.entry.butterflyLink} />}
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
      <Card>
        <CardTitle>Guest Check-in</CardTitle>
        <p className="mt-1 text-xs text-slate-400">Track who has arrived.</p>
        <div className="mt-4 flex gap-2">
          <Input
            value={guestDraft}
            onChange={(event) => setGuestDraft(event.target.value)}
            className="flex-1"
            placeholder="Guest name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && guestDraft.trim()) {
                dispatch({
                  type: 'update_entry',
                  payload: {
                    guestCheckin: [
                      ...(state.entry.guestCheckin ?? []),
                      { id: uuid(), name: guestDraft.trim(), checkedIn: false },
                    ],
                  },
                })
                setGuestDraft('')
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              if (!guestDraft.trim()) return
              dispatch({
                type: 'update_entry',
                payload: {
                  guestCheckin: [
                    ...(state.entry.guestCheckin ?? []),
                    { id: uuid(), name: guestDraft.trim(), checkedIn: false },
                  ],
                },
              })
              setGuestDraft('')
            }}
          >
            Add
          </Button>
        </div>
        {(state.entry.guestCheckin ?? []).length > 0 && (
          <div className="mt-2 text-xs text-slate-400">
            {(state.entry.guestCheckin ?? []).filter((g) => g.checkedIn).length} / {(state.entry.guestCheckin ?? []).length} checked in
          </div>
        )}
        <div className="mt-4 space-y-2">
          {(state.entry.guestCheckin ?? []).map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
            >
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'update_entry',
                    payload: {
                      guestCheckin: (state.entry.guestCheckin ?? []).map((g) =>
                        g.id === guest.id
                          ? { ...g, checkedIn: !g.checkedIn, checkinTime: !g.checkedIn ? new Date().toISOString() : undefined }
                          : g,
                      ),
                    },
                  })
                }
                className={cn(
                  'flex items-center gap-2 transition',
                  guest.checkedIn ? 'text-emerald-300' : 'text-slate-300',
                )}
              >
                <span className={cn(
                  'flex size-5 items-center justify-center rounded border text-xs',
                  guest.checkedIn ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/20',
                )}>
                  {guest.checkedIn ? '\u2713' : ''}
                </span>
                {guest.name}
                {guest.plusOnes ? ` (+${guest.plusOnes})` : ''}
              </button>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={guest.plusOnes ?? ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'update_entry',
                      payload: {
                        guestCheckin: (state.entry.guestCheckin ?? []).map((g) =>
                          g.id === guest.id ? { ...g, plusOnes: Number(e.target.value) || undefined } : g,
                        ),
                      },
                    })
                  }
                  className="w-16 text-xs"
                  placeholder="+1s"
                />
                <Button
                  variant="ghost"
                  className="text-xs"
                  onClick={() =>
                    dispatch({
                      type: 'update_entry',
                      payload: {
                        guestCheckin: (state.entry.guestCheckin ?? []).filter((g) => g.id !== guest.id),
                      },
                    })
                  }
                >
                  Remove
                </Button>
              </div>
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
