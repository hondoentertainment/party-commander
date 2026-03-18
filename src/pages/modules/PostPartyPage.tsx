import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { Star } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { cn } from '../../components/ui/utils'

const PLAYLIST_PHASES = [
  { key: 'pregame' as const, label: 'Pregame' },
  { key: 'arrival' as const, label: 'Arrival' },
  { key: 'peak' as const, label: 'Peak' },
  { key: 'late' as const, label: 'Late' },
  { key: 'windDown' as const, label: 'Wind down' },
]

type PostPartyConfirming =
  | { type: 'cleanup'; item: string }
  | { type: 'leftover'; item: string }
  | null

export function PostPartyPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<PostPartyConfirming>(null)
  const [cleanupItem, setCleanupItem] = useState('')
  const [leftoverItem, setLeftoverItem] = useState('')
  const [feedbackDraft, setFeedbackDraft] = useState('')
  const [feedbackType, setFeedbackType] = useState<'worked' | 'didnt'>('worked')

  const toggleFavoriteDrink = (drinkId: string) => {
    const favs = state.postParty.favorites.drinks
    const next = favs.includes(drinkId)
      ? favs.filter((id) => id !== drinkId)
      : [...favs, drinkId]
    dispatch({
      type: 'update_post_party',
      payload: { favorites: { ...state.postParty.favorites, drinks: next } },
    })
  }

  const toggleFavoriteGame = (gameId: string) => {
    const favs = state.postParty.favorites.games
    const next = favs.includes(gameId)
      ? favs.filter((id) => id !== gameId)
      : [...favs, gameId]
    dispatch({
      type: 'update_post_party',
      payload: { favorites: { ...state.postParty.favorites, games: next } },
    })
  }

  const toggleFavoritePlaylist = (phase: string) => {
    const favs = state.postParty.favorites.playlists
    const next = favs.includes(phase)
      ? favs.filter((p) => p !== phase)
      : [...favs, phase]
    dispatch({
      type: 'update_post_party',
      payload: { favorites: { ...state.postParty.favorites, playlists: next } },
    })
  }

  const addCleanup = () => {
    if (!cleanupItem.trim()) return
    dispatch({
      type: 'update_post_party',
      payload: { cleanupChecklist: [...state.postParty.cleanupChecklist, cleanupItem.trim()] },
    })
    setCleanupItem('')
  }

  const addLeftover = () => {
    if (!leftoverItem.trim()) return
    dispatch({
      type: 'update_post_party',
      payload: { leftovers: [...state.postParty.leftovers, leftoverItem.trim()] },
    })
    setLeftoverItem('')
  }

  const removeCleanup = (item: string) => {
    dispatch({
      type: 'update_post_party',
      payload: {
        cleanupChecklist: state.postParty.cleanupChecklist.filter((i) => i !== item),
      },
    })
  }

  const removeLeftover = (item: string) => {
    dispatch({
      type: 'update_post_party',
      payload: { leftovers: state.postParty.leftovers.filter((i) => i !== item) },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Post-Party Wrap</h3>
      <p className="text-sm text-slate-300">Capture what worked and save favorites.</p>

      <Card>
        <CardTitle>Cleanup checklist</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={cleanupItem}
            onChange={(event) => setCleanupItem(event.target.value)}
            className="flex-1"
            placeholder="Take out recycling"
          />
          <Button type="button" onClick={addCleanup}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {state.postParty.cleanupChecklist.map((item) => (
            <li
              key={item}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              {item}
              <Button
                variant="ghost"
                onClick={() => setConfirmingRemove({ type: 'cleanup', item })}
                className="text-xs"
                aria-label={`Remove ${item}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Leftovers</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={leftoverItem}
            onChange={(event) => setLeftoverItem(event.target.value)}
            className="flex-1"
            placeholder="Half tray of sliders"
          />
          <Button type="button" onClick={addLeftover}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {state.postParty.leftovers.map((item) => (
            <li
              key={item}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              {item}
              <Button
                variant="ghost"
                onClick={() => setConfirmingRemove({ type: 'leftover', item })}
                className="text-xs"
                aria-label={`Remove ${item}`}
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
        onConfirm={() => {
          if (!confirmingRemove) return
          if (confirmingRemove.type === 'cleanup') removeCleanup(confirmingRemove.item)
          else removeLeftover(confirmingRemove.item)
        }}
        title="Remove item"
        description={
          confirmingRemove
            ? `Remove "${confirmingRemove.item}"? This cannot be undone.`
            : ''
        }
      />

      <Card>
        <CardTitle>Favorites</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Mark what worked so you can reuse it next time.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase text-slate-400">Drinks</p>
            <div className="flex flex-wrap gap-2">
              {state.drinks.suggestions.map((drink) => {
                const isFav = state.postParty.favorites.drinks.includes(drink.id)
                return (
                  <Button
                    key={drink.id}
                    type="button"
                    variant="outline"
                    onClick={() => toggleFavoriteDrink(drink.id)}
                    className={
                      isFav ? 'bg-emerald-500/20 text-emerald-200' : ''
                    }
                    aria-pressed={isFav}
                    aria-label={isFav ? `Remove ${drink.name} from favorites` : `Add ${drink.name} to favorites`}
                  >
                    {drink.name}
                  </Button>
                )
              })}
              {state.drinks.suggestions.length === 0 ? (
                <span className="text-sm text-slate-500">Add drinks in Drinks hub first.</span>
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-slate-400">Games</p>
            <div className="flex flex-wrap gap-2">
              {state.games.games.map((game) => {
                const isFav = state.postParty.favorites.games.includes(game.id)
                return (
                  <Button
                    key={game.id}
                    type="button"
                    variant="outline"
                    onClick={() => toggleFavoriteGame(game.id)}
                    className={
                      isFav ? 'bg-emerald-500/20 text-emerald-200' : ''
                    }
                    aria-pressed={isFav}
                    aria-label={isFav ? `Remove ${game.name} from favorites` : `Add ${game.name} to favorites`}
                  >
                    {game.name}
                  </Button>
                )
              })}
              {state.games.games.length === 0 ? (
                <span className="text-sm text-slate-500">Add games in Games hub first.</span>
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-slate-400">Playlists</p>
            <div className="flex flex-wrap gap-2">
              {PLAYLIST_PHASES.map(({ key, label }) => {
                const isFav = state.postParty.favorites.playlists.includes(key)
                return (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    onClick={() => toggleFavoritePlaylist(key)}
                    className={
                      isFav ? 'bg-emerald-500/20 text-emerald-200' : ''
                    }
                    aria-pressed={isFav}
                    aria-label={isFav ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Structured Feedback</CardTitle>
        <p className="mt-1 text-xs text-slate-400">Capture specific wins and areas to improve.</p>
        <div className="mt-4 flex gap-2">
          <Select
            value={feedbackType}
            onChange={(e) => { setFeedbackType(e.target.value as 'worked' | 'didnt') }}
            className="w-36 text-xs"
          >
            <option value="worked">What worked</option>
            <option value="didnt">What didn&apos;t</option>
          </Select>
          <Input
            value={feedbackDraft}
            onChange={(e) => setFeedbackDraft(e.target.value)}
            className="flex-1"
            placeholder={feedbackType === 'worked' ? 'e.g. Signature cocktails were a hit' : 'e.g. Ran out of ice early'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && feedbackDraft.trim()) {
                const feedback = state.postParty.feedback ?? { whatWorked: [], whatDidnt: [] }
                dispatch({
                  type: 'update_post_party',
                  payload: {
                    feedback: feedbackType === 'worked'
                      ? { ...feedback, whatWorked: [...feedback.whatWorked, feedbackDraft.trim()] }
                      : { ...feedback, whatDidnt: [...feedback.whatDidnt, feedbackDraft.trim()] },
                  },
                })
                setFeedbackDraft('')
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              if (!feedbackDraft.trim()) return
              const feedback = state.postParty.feedback ?? { whatWorked: [], whatDidnt: [] }
              dispatch({
                type: 'update_post_party',
                payload: {
                  feedback: feedbackType === 'worked'
                    ? { ...feedback, whatWorked: [...feedback.whatWorked, feedbackDraft.trim()] }
                    : { ...feedback, whatDidnt: [...feedback.whatDidnt, feedbackDraft.trim()] },
                },
              })
              setFeedbackDraft('')
            }}
          >
            Add
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-emerald-400">What worked</p>
            <ul className="space-y-1">
              {(state.postParty.feedback?.whatWorked ?? []).map((item, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-emerald-500/5 px-3 py-1.5 text-sm text-emerald-200">
                  {item}
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-white"
                    onClick={() => {
                      const feedback = state.postParty.feedback ?? { whatWorked: [], whatDidnt: [] }
                      dispatch({
                        type: 'update_post_party',
                        payload: {
                          feedback: { ...feedback, whatWorked: feedback.whatWorked.filter((_, idx) => idx !== i) },
                        },
                      })
                    }}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-rose-400">What didn&apos;t</p>
            <ul className="space-y-1">
              {(state.postParty.feedback?.whatDidnt ?? []).map((item, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-rose-500/5 px-3 py-1.5 text-sm text-rose-200">
                  {item}
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-white"
                    onClick={() => {
                      const feedback = state.postParty.feedback ?? { whatWorked: [], whatDidnt: [] }
                      dispatch({
                        type: 'update_post_party',
                        payload: {
                          feedback: { ...feedback, whatDidnt: feedback.whatDidnt.filter((_, idx) => idx !== i) },
                        },
                      })
                    }}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Budget Reconciliation</CardTitle>
        <p className="mt-1 text-xs text-slate-400">Compare planned vs actual spend.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <p className="text-xs text-slate-400">Planned</p>
            <p className="text-xl font-bold text-white">
              ${state.budget.lineItems.reduce((s, i) => s + i.amount, 0).toFixed(0)}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <p className="text-xs text-slate-400">Actual</p>
            <Input
              type="number"
              min={0}
              value={state.postParty.actualSpent ?? ''}
              onChange={(e) =>
                dispatch({ type: 'update_post_party', payload: { actualSpent: Number(e.target.value) || undefined } })
              }
              className="mt-1 text-center text-lg font-bold"
              placeholder="$0"
            />
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <p className="text-xs text-slate-400">Difference</p>
            {state.postParty.actualSpent != null ? (
              <p className={cn(
                'text-xl font-bold',
                state.postParty.actualSpent <= state.budget.lineItems.reduce((s, i) => s + i.amount, 0) ? 'text-emerald-400' : 'text-rose-400',
              )}>
                {state.postParty.actualSpent <= state.budget.lineItems.reduce((s, i) => s + i.amount, 0) ? '-' : '+'}
                ${Math.abs(state.postParty.actualSpent - state.budget.lineItems.reduce((s, i) => s + i.amount, 0)).toFixed(0)}
              </p>
            ) : (
              <p className="text-xl font-bold text-slate-600">&mdash;</p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Overall Rating</CardTitle>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  const feedback = state.postParty.feedback ?? { whatWorked: [], whatDidnt: [] }
                  dispatch({
                    type: 'update_post_party',
                    payload: { feedback: { ...feedback, overallRating: n } },
                  })
                }}
                className={cn(
                  'text-2xl transition',
                  (state.postParty.feedback?.overallRating ?? 0) >= n ? 'text-yellow-400' : 'text-slate-700',
                )}
              >
                <Star className={cn('size-7', (state.postParty.feedback?.overallRating ?? 0) >= n ? 'fill-yellow-400' : '')} />
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'text-xs',
              state.postParty.feedback?.wouldRepeat ? 'bg-emerald-500/20 text-emerald-200' : '',
            )}
            onClick={() => {
              const feedback = state.postParty.feedback ?? { whatWorked: [], whatDidnt: [] }
              dispatch({
                type: 'update_post_party',
                payload: { feedback: { ...feedback, wouldRepeat: !feedback.wouldRepeat } },
              })
            }}
          >
            {state.postParty.feedback?.wouldRepeat ? '\u2713 Would repeat' : 'Would repeat?'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Notes</CardTitle>
        <Textarea
          value={state.postParty.notes}
          onChange={(event) =>
            dispatch({ type: 'update_post_party', payload: { notes: event.target.value } })
          }
          rows={4}
          className="mt-3"
          placeholder="General notes and reflections"
        />
      </Card>
    </div>
  )
}

export default PostPartyPage
