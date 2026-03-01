import { useState } from 'react'
import { ChevronDown, Plus, Users } from 'lucide-react'
import { useParty } from '../state/PartyContext'
import { Button } from './ui/Button'
import { SharePartyModal } from './SharePartyModal'
import { cn } from './ui/utils'

export function PartySwitcher() {
  const { partyProfile, parties, currentPartyId, switchParty, createParty, state } = useParty()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  if (!partyProfile || parties.length === 0) return null

  const current = parties.find((p) => p.id === currentPartyId) ?? parties[0]
  const isOwner = current && partyProfile && current.party_profile_id === partyProfile.id

  const handleSwitch = async (id: string) => {
    if (id === currentPartyId) return
    await switchParty(id)
    setOpen(false)
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      await createParty(false)
      setOpen(false)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/40 focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-[#0b0f14]"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch party"
      >
        <span className="truncate max-w-[160px]">{current?.name || state.core.name || 'Party'}</span>
        <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            className="absolute right-0 top-full z-50 mt-2 min-w-[220px] rounded-2xl border border-white/10 bg-slate-900/95 py-2 shadow-xl backdrop-blur-xl"
          >
            <div className="max-h-64 overflow-y-auto">
              {parties.map((p) => {
                const isSharedWithMe = partyProfile && p.party_profile_id !== partyProfile.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={p.id === currentPartyId}
                    onClick={() => handleSwitch(p.id)}
                    className={cn(
                      'w-full px-4 py-2.5 text-left text-sm transition flex items-center justify-between gap-2',
                      p.id === currentPartyId
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span className="truncate">{p.name}</span>
                    {isSharedWithMe && (
                      <Users className="size-3 shrink-0 text-slate-500" aria-label="Shared with you" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="border-t border-white/5 space-y-1 px-2 pt-2">
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center rounded-xl"
                  onClick={() => {
                    setShareOpen(true)
                    setOpen(false)
                  }}
                >
                  <Users className="size-4" />
                  Invite team
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center rounded-xl"
                onClick={handleCreate}
                disabled={creating}
              >
                <Plus className="size-4" />
                New party
              </Button>
            </div>
          </div>
        </>
      )}
      <SharePartyModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}
