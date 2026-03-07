import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Sparkles, Loader2, Zap, PartyPopper } from 'lucide-react'
import { useParty } from '../state/PartyContext'
import { getLocalParties } from '../state/storage'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SectionHeader } from '../components/SectionHeader'
import { AnimatedList, AnimatedItem } from '../components/ui/AnimatedList'

export function GlobalDashboard() {
  const { parties, createParty, partyProfile, partyLoading, state } = useParty()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (creating) return
    setCreating(true)
    setCreateError(null)
    try {
      const isFirstParty = parties.length === 0
      const id = await createParty(false)
      navigate(isFirstParty ? `/event/${id}?welcome=1` : `/event/${id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create event'
      if (msg.includes('No party profile') || msg.includes('profile')) {
        setCreateError(
          'Please wait a moment for your profile to load, then try again.',
        )
      } else if (msg.includes('does not exist') || msg.includes('relation')) {
        setCreateError(
          'Database setup may be incomplete. Run Supabase migrations.',
        )
      } else {
        setCreateError(msg)
      }
    } finally {
      setCreating(false)
    }
  }

  const canCreate = !partyLoading && !creating
  const profileFailed = !partyLoading && !partyProfile && state.auth.user
  const localIds = new Set(getLocalParties().map((p) => p.id))
  const hasLocalParties =
    partyProfile && parties.some((p) => localIds.has(p.id))

  return (
    <div className="space-y-8 pb-32">
      {hasLocalParties && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
        >
          <span className="text-sm text-amber-300">
            Some events are saved locally. Run Supabase migrations to sync to
            the cloud.
          </span>
        </motion.div>
      )}
      {profileFailed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-4 sm:flex-row sm:items-center"
        >
          <p className="text-sm text-rose-300">
            Unable to load your profile. Check your connection or try signing
            out and back in.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="shrink-0 rounded-xl bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/25"
          >
            Refresh
          </button>
        </motion.div>
      )}

      <SectionHeader
        title="Intelligence Hub"
        subtitle="Manage your entire portfolio of premium events."
        eyebrow="Global"
      />

      <AnimatedList className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {parties.map((party) => {
          const isSharedWithMe =
            partyProfile && party.party_profile_id !== partyProfile.id
          const isLocal = localIds.has(party.id)
          return (
            <AnimatedItem key={party.id}>
              <Link to={`/event/${party.id}`} className="block h-full">
                <Card className="group flex h-full flex-col transition-colors hover:border-emerald-500/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="truncate pr-2">
                        {party.name || 'Unnamed Event'}
                      </CardTitle>
                      <div className="flex shrink-0 gap-1.5">
                        {isLocal && <Badge variant="amber">Local</Badge>}
                        {isSharedWithMe && <Badge variant="slate">Shared</Badge>}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">
                      Last updated:{' '}
                      {new Date(party.updated_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <div className="mt-auto pt-2">
                    <span className="inline-flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition group-hover:border-emerald-500/20 group-hover:bg-emerald-500/10 group-hover:text-white">
                      <span className="flex items-center gap-2">
                        <Zap size={14} className="text-emerald-400" />
                        Enter Protocol
                      </span>
                      <Sparkles className="size-4 text-slate-500 transition-colors group-hover:text-emerald-300" />
                    </span>
                  </div>
                </Card>
              </Link>
            </AnimatedItem>
          )
        })}

        <AnimatedItem>
          <Card
            className={`flex h-full flex-col items-center justify-center border-dashed border-2 py-12 cursor-pointer ${
              canCreate
                ? 'text-slate-500 hover:border-emerald-500/20 hover:text-emerald-400'
                : 'text-slate-600 cursor-not-allowed opacity-60'
            }`}
            onClick={canCreate ? handleCreate : undefined}
          >
            {createError && (
              <p className="mb-4 max-w-xs text-center text-sm text-rose-400">
                {createError}
              </p>
            )}
            <motion.div
              whileHover={canCreate ? { scale: 1.05 } : {}}
              whileTap={canCreate ? { scale: 0.95 } : {}}
              className="mb-4 rounded-2xl bg-white/[0.03] p-5 transition-colors group-hover:bg-emerald-500/10"
            >
              {creating ? (
                <Loader2 className="size-8 animate-spin text-emerald-400" />
              ) : (
                <Plus className="size-8" />
              )}
            </motion.div>
            <span className="font-semibold tracking-wide">
              {creating ? 'Creating…' : 'Initialize New Event'}
            </span>
          </Card>
        </AnimatedItem>
      </AnimatedList>

      {/* Empty state when no parties exist */}
      {parties.length === 0 && !partyLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.06] bg-white/[0.01] py-20 text-center"
        >
          <div className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6">
            <PartyPopper className="size-12 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">
            Ready to command a party?
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Create your first event to start planning menus, drinks, music,
            games, and everything in between.
          </p>
          <Button onClick={handleCreate} className="mt-6" disabled={!canCreate}>
            <Plus size={16} />
            Initialize First Event
          </Button>
        </motion.div>
      )}
    </div>
  )
}
