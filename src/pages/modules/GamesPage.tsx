import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'

function GameQRCode({ url }: { url: string }) {
  const encoded = encodeURIComponent(url)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encoded}`
  return (
    <div className="mt-2 flex flex-col items-center gap-2 rounded-lg bg-white/5 p-3">
      <img src={qrUrl} alt="QR code for game link" className="size-32 rounded" />
      <p className="text-xs text-slate-400">Scan to open game link</p>
    </div>
  )
}

export function GamesPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<{ id: string; name: string } | null>(null)
  const [draft, setDraft] = useState({
    name: '',
    category: 'icebreaker' as const,
    durationMins: 15,
    groupSize: '4-8',
    rules: '',
    supplies: '',
    link: '',
  })

  const addGame = () => {
    if (!draft.name.trim()) return
    dispatch({
      type: 'update_games',
      payload: {
        games: [
          ...state.games.games,
          {
            id: uuid(),
            name: draft.name.trim(),
            category: draft.category,
            durationMins: draft.durationMins,
            groupSize: draft.groupSize.trim(),
            rules: draft.rules.trim(),
            supplies: draft.supplies
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            link: draft.link.trim() || undefined,
          },
        ],
      },
    })
    setDraft({
      name: '',
      category: 'icebreaker',
      durationMins: 15,
      groupSize: '4-8',
      rules: '',
      supplies: '',
      link: '',
    })
  }

  const removeGame = (id: string) => {
    dispatch({
      type: 'update_games',
      payload: { games: state.games.games.filter((game) => game.id !== id) },
    })
  }

  const updateGameLink = (id: string, link: string) => {
    dispatch({
      type: 'update_games',
      payload: {
        games: state.games.games.map((g) => (g.id === id ? { ...g, link: link.trim() || undefined } : g)),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Game Generator</h3>
      <p className="text-sm text-slate-300">Add games with supplies and timing.</p>

      <Card>
        <CardTitle>Add game</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Game name
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-2"
              placeholder="Two truths and a lie"
            />
          </label>
          <label className="text-sm text-slate-300">
            Category
            <Select
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value as typeof draft.category })
              }
              className="mt-2"
            >
              <option value="icebreaker">Icebreaker</option>
              <option value="main">Main game</option>
              <option value="chaos">Optional chaos</option>
              <option value="wind_down">Wind-down</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Duration (mins)
            <Input
              type="number"
              min={5}
              value={draft.durationMins}
              onChange={(event) =>
                setDraft({ ...draft, durationMins: Number(event.target.value) })
              }
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300">
            Group size
            <Input
              value={draft.groupSize}
              onChange={(event) => setDraft({ ...draft, groupSize: event.target.value })}
              className="mt-2"
              placeholder="6-12"
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Rules
            <Textarea
              value={draft.rules}
              onChange={(event) => setDraft({ ...draft, rules: event.target.value })}
              rows={3}
              placeholder="Each person shares two truths and one lie..."
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Supplies (comma separated)
            <Input
              value={draft.supplies}
              onChange={(event) => setDraft({ ...draft, supplies: event.target.value })}
              className="mt-2"
              placeholder="Cards, markers"
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Game link (rules, instructions, or external game URL)
            <Input
              value={draft.link}
              onChange={(event) => setDraft({ ...draft, link: event.target.value })}
              className="mt-2"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-slate-500">Add a link to generate a QR code for guests to scan.</p>
          </label>
        </div>
        <Button type="button" onClick={addGame} className="mt-4">
          Add game
        </Button>
      </Card>

      <Card>
        <CardTitle>Game list</CardTitle>
        {state.games.games.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No games yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.games.games.map((game) => (
              <div key={game.id} className="rounded-xl bg-white/5 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{game.name}</p>
                    <p className="text-xs uppercase text-slate-400">
                      {game.category} · {game.durationMins} mins · {game.groupSize}
                    </p>
                    {game.supplies.length ? (
                      <p className="mt-2 text-xs text-slate-400">
                        Supplies: {game.supplies.join(', ')}
                      </p>
                    ) : null}
                    <label className="mt-2 block">
                      <span className="text-xs text-slate-500">Game link (for QR code)</span>
                      <Input
                        value={game.link ?? ''}
                        onChange={(e) => updateGameLink(game.id, e.target.value)}
                        className="mt-1"
                        placeholder="https://..."
                      />
                    </label>
                    {game.link && <GameQRCode url={game.link} />}
                  </div>
                  <Button
                    type="button"
                    onClick={() => setConfirmingRemove({ id: game.id, name: game.name })}
                    variant="outline"
                    className="shrink-0 px-3 py-1 text-xs"
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
        onConfirm={() => { if (confirmingRemove) removeGame(confirmingRemove.id) }}
        title="Remove game"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.name}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default GamesPage
