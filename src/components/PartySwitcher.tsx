import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Plus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useParty } from '../state/PartyContext'
import { getHiddenFromHomePartyIds } from '../state/storage'
import { Button } from './ui/Button'
import { SharePartyModal } from './SharePartyModal'
import { cn } from './ui/utils'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function PartySwitcher() {
  const { partyProfile, parties, currentPartyId, createParty, state } = useParty()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const hidden = new Set(getHiddenFromHomePartyIds())
  const visibleParties = parties.filter((p) => !hidden.has(p.id))

  if (!partyProfile || parties.length === 0) return null

  const current = parties.find((p) => p.id === currentPartyId) ?? parties[0]
  const isOwner = current && partyProfile && current.party_profile_id === partyProfile.id

  const handleSwitch = async (id: string) => {
    if (id === currentPartyId) return
    navigate(`/event/${id}`)
    setOpen(false)
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const id = await createParty(false)
      navigate(`/event/${id}`)
      setOpen(false)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (!el) return

    const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const previouslyFocused = document.activeElement as HTMLElement | null
    first?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        previouslyFocused?.focus()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = focusable.indexOf(document.activeElement as HTMLElement)
        const nextIdx = idx < 0 ? 0 : Math.min(idx + 1, focusable.length - 1)
        focusable[nextIdx]?.focus()
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const idx = focusable.indexOf(document.activeElement as HTMLElement)
        const prevIdx = idx <= 0 ? focusable.length - 1 : idx - 1
        focusable[prevIdx]?.focus()
        return
      }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    el.addEventListener('keydown', handleKeyDown)
    return () => {
      el.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [open])

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
            ref={listRef}
            role="listbox"
            aria-label="Switch party"
            className="absolute right-0 top-full z-50 mt-2 min-w-[220px] rounded-2xl border border-white/10 bg-slate-900/95 py-2 shadow-xl backdrop-blur-xl"
          >
            <div className="max-h-64 overflow-y-auto">
              {visibleParties.map((p) => {
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
