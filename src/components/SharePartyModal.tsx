import { useState, useEffect, useRef } from 'react'
import { Users, Copy, Loader2, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { CollaboratorService, type PartyCollaborator } from '../services/collaborators'
import { ProfileService } from '../services/profile'
import { useParty } from '../state/PartyContext'
import { cn } from './ui/utils'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface SharePartyModalProps {
  open: boolean
  onClose: () => void
}

export function SharePartyModal({ open, onClose }: SharePartyModalProps) {
  const { currentPartyId, parties, partyProfile } = useParty()
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [collaborators, setCollaborators] = useState<PartyCollaborator[]>([])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmingRemove, setConfirmingRemove] = useState<{ userId: string; displayName: string } | null>(null)
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({})
  const dialogRef = useRef<HTMLDivElement>(null)

  const currentParty = parties.find((p) => p.id === currentPartyId)
  const isOwner = currentParty && partyProfile && currentParty.party_profile_id === partyProfile.id

  useEffect(() => {
    if (!open || !currentPartyId || !isOwner) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await CollaboratorService.list(currentPartyId)
        setCollaborators(list)
        const names: Record<string, string> = {}
        await Promise.all(
          list.map(async (c) => {
            const profile = await ProfileService.get(c.user_id)
            names[c.user_id] = profile?.display_name ?? c.user_id.slice(0, 8)
          }),
        )
        setDisplayNames(names)
      } catch {
        setError('Failed to load collaborators')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [open, currentPartyId, isOwner])

  useEffect(() => {
    if (!open) return
    const el = dialogRef.current
    if (!el) return

    const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const previouslyFocused = document.activeElement as HTMLElement | null
    first?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        previouslyFocused?.focus()
        return
      }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
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
  }, [open, onClose])

  const handleCreateLink = async () => {
    if (!currentPartyId) return
    setLoading(true)
    setError(null)
    try {
      const token = await CollaboratorService.createInviteToken(currentPartyId)
      const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''
      const baseUrl = window.location.origin + (basePath ? (basePath.startsWith('/') ? basePath : `/${basePath}`) : '')
      setInviteLink(`${baseUrl}/invite/party/${token}`)
    } catch {
      setError('Failed to create invite link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy')
    }
  }

  const doRemoveCollaborator = async (userId: string) => {
    if (!currentPartyId) return
    setRemovingId(userId)
    setError(null)
    setConfirmingRemove(null)
    try {
      await CollaboratorService.remove(currentPartyId, userId)
      setCollaborators((prev) => prev.filter((c) => c.user_id !== userId))
    } catch {
      setError('Failed to remove collaborator')
    } finally {
      setRemovingId(null)
    }
  }

  if (!open) return null
  if (!isOwner) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-party-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="share-party-title" className="flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="size-5 text-emerald-400" />
            Invite team members
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Share access so teammates can view and edit this event.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-400">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {!inviteLink ? (
            <Button
              onClick={handleCreateLink}
              disabled={loading}
              className="w-full justify-center rounded-xl"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Create invite link'}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-300"
                />
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0 rounded-xl"
                  aria-label={copied ? 'Copied' : 'Copy link'}
                >
                  {copied ? (
                    <span className="text-emerald-400">Copied</span>
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs font-medium text-emerald-400" role="status">
                  Link copied to clipboard.
                </p>
              )}
            </div>
          )}

          {inviteLink && (
            <p className="text-xs text-slate-500">
              Link expires in 7 days. Anyone with the link can join after signing in.
            </p>
          )}
        </div>

        {collaborators.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Team members ({collaborators.length})
            </h3>
            <ul className="mt-3 space-y-2">
              {collaborators.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2.5"
                >
                  <span className="text-sm text-slate-300">
                    {displayNames[c.user_id] ?? c.user_id.slice(0, 8)}…
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmingRemove({
                        userId: c.user_id,
                        displayName: displayNames[c.user_id] ?? c.user_id.slice(0, 8),
                      })
                    }
                    disabled={removingId === c.user_id}
                    className={cn(
                      'rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/20 hover:text-rose-400',
                      removingId === c.user_id && 'opacity-50'
                    )}
                    aria-label="Remove collaborator"
                  >
                    {removingId === c.user_id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading && !inviteLink && collaborators.length === 0 && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="size-6 animate-spin text-emerald-500" />
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={async () => {
          if (confirmingRemove) await doRemoveCollaborator(confirmingRemove.userId)
        }}
        title="Remove team member"
        description={
          confirmingRemove
            ? `Remove ${confirmingRemove.displayName} from this party? They will lose access.`
            : ''
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        isLoading={!!removingId}
      />
    </>
  )
}
