import { Navigate } from 'react-router-dom'
import { useParty } from '../state/PartyContext'
import { isAdminEmail } from '../utils/admin'

/** Redirects non-admin users away from admin routes. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { state } = useParty()
  const email = state.auth.user?.email ?? null

  if (!isAdminEmail(email)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
