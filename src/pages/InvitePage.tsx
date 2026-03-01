import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CollaboratorService } from '../services/collaborators'
import { supabase } from '../services/auth'
import { Loader2, AlertCircle, Users } from 'lucide-react'

/**
 * Redeems a party invite token and adds the current user as a collaborator.
 * Requires authentication.
 */
export function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setError('Invalid invite link')
        setStatus('error')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        sessionStorage.setItem('inviteReturnTo', window.location.pathname)
        navigate('/', { replace: true })
        return
      }

      try {
        const partyId = await CollaboratorService.redeemInviteToken(token)
        setStatus('success')
        navigate(`/?party=${partyId}`, { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join party')
        setStatus('error')
      }
    }

    run()
  }, [token, navigate])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-[#0b0f14] px-6">
        <Loader2 className="size-12 animate-spin text-emerald-500" />
        <p className="mt-4 text-sm text-slate-400">Joining party...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-[#0b0f14] px-6">
        <AlertCircle className="size-12 text-rose-400" />
        <p className="mt-4 max-w-md text-center text-slate-300">{error}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="mt-6 rounded-xl bg-emerald-500/20 px-6 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30"
        >
          Return home
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-[#0b0f14] px-6">
      <Users className="size-12 text-emerald-500" />
      <p className="mt-4 text-sm text-slate-400">Redirecting to party...</p>
    </div>
  )
}
