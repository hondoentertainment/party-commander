import { useParty } from '../../state/PartyContext'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Sparkles } from 'lucide-react'

export function MusicPage() {
  const { state, dispatch } = useParty()
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Music Hub</h3>
      <p className="text-sm text-slate-300">Link playlists for each party phase.</p>

      <Card className="relative overflow-hidden border-emerald-500/10 bg-emerald-500/5">
        <div className="absolute -right-16 -top-16 size-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <CardTitle className="relative z-10 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Sparkles className="size-4 text-emerald-400" />
          </div>
          Now Playing
        </CardTitle>
        <div className="relative z-10 mt-6 flex items-center gap-6">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10">
            <div className="absolute inset-x-0 bottom-0 flex h-16 items-center justify-center gap-1.5 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-emerald-500/60"
                  style={{
                    height: `${20 + Math.random() * 60}%`,
                    animation: `pulseHeight ${0.5 + Math.random() * 1}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-white">Sonic Atmosphere</p>
            <p className="text-sm text-slate-400">Current Phase: {state.core.theme || 'Vibing'}</p>
            <div className="mt-4 flex items-center gap-4">
              <Button size="sm" variant="outline" className="rounded-xl border-white/5 bg-white/5">
                Spotify Hub
              </Button>
              <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Master Playlist Link</CardTitle>
        <div className="mt-4 space-y-4">
          <Input
            value={state.music.mainLink}
            onChange={(event) =>
              dispatch({ type: 'update_music', payload: { mainLink: event.target.value } })
            }
            placeholder="https://open.spotify.com/..."
          />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Link your master event playlist for one-tap access.
          </p>
        </div>
      </Card>

      <Card>
        <CardTitle>Phase playlists</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(['pregame', 'arrival', 'peak', 'late', 'windDown'] as const).map((phase) => (
            <label key={phase} className="text-sm text-slate-300">
              {phase}
              <Input
                value={state.music.playlists[phase]}
                onChange={(event) =>
                  dispatch({
                    type: 'update_music',
                    payload: {
                      playlists: { ...state.music.playlists, [phase]: event.target.value },
                    },
                  })
                }
                className="mt-2"
                placeholder="https://open.spotify.com/..."
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default MusicPage
