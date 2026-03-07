import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { cn } from '../../components/ui/utils'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Sparkles } from 'lucide-react'

export function LivePage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const toggleAlert = (key: keyof typeof state.live.restockAlerts) => {
    dispatch({
      type: 'update_live',
      payload: {
        restockAlerts: {
          ...state.live.restockAlerts,
          [key]: !state.live.restockAlerts[key],
        },
      },
    })
  }

  const addNote = () => {
    if (!note.trim()) return
    dispatch({
      type: 'update_live',
      payload: { quickNotes: [...state.live.quickNotes, note.trim()] },
    })
    setNote('')
  }

  const removeNote = (text: string) => {
    dispatch({
      type: 'update_live',
      payload: { quickNotes: state.live.quickNotes.filter((n) => n !== text) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Live Party Mode</h3>
      <p className="text-sm text-slate-300">One-tap controls for the night.</p>

      <Card>
        <CardTitle>Now playing</CardTitle>
        <p className="mt-2 text-sm text-slate-300">
          {state.music.mainLink ? state.music.mainLink : 'Add a main playlist link.'}
        </p>
      </Card>

      <Card className="border-emerald-500/10 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Sparkles className="size-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle>Operational Snapshot</CardTitle>
            <p className="text-xs text-slate-400">Active playlist: {state.music.mainLink ? 'Connected' : 'Disconnected'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Operational Alerts</CardTitle>
        <p className="mt-2 text-sm text-slate-400">Tap to flag items that need immediate attention from the leads.</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(state.live.restockAlerts).map(([key, value]) => (
            <button
              key={key}
              onClick={() => toggleAlert(key as keyof typeof state.live.restockAlerts)}
              className={cn(
                'group relative flex flex-col items-center gap-3 rounded-[2rem] border p-6 transition-all duration-300 active:scale-95',
                value
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
                  : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              <div className={cn(
                'flex size-12 items-center justify-center rounded-2xl transition-all duration-300',
                value ? 'bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-black/40'
              )}>
                {key === 'ice' && '🧊'}
                {key === 'cups' && '🥤'}
                {key === 'mixers' && '🍹'}
                {key === 'trash' && '🗑️'}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">{key}</span>
              {value && (
                <div className="absolute -right-1 -top-1 size-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Quick notes</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="flex-1"
            placeholder="Need more ice by 9 PM"
          />
          <Button type="button" onClick={addNote}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {state.live.quickNotes.map((entry) => (
            <li
              key={entry}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              {entry}
              <Button
                variant="ghost"
                onClick={() => setConfirmingRemove(entry)}
                className="text-xs"
                aria-label={`Remove note: ${entry}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => { if (confirmingRemove) removeNote(confirmingRemove) }}
        title="Remove note"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default LivePage
