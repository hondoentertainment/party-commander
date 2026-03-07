import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useParty } from '../state/PartyContext'

export function EventScopeGuard() {
    const { eventId } = useParams()
    const { currentPartyId, switchParty, partyLoading } = useParty()
    const navigate = useNavigate()

    useEffect(() => {
        if (partyLoading || !eventId || currentPartyId === eventId) return

        switchParty(eventId).catch((err) => {
            console.error('Failed to switch party on navigation:', err)
            navigate('/', { replace: true })
        })
    }, [eventId, currentPartyId, partyLoading, switchParty, navigate])

    if (currentPartyId !== eventId) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="size-10 animate-spin text-emerald-500" />
            </div>
        )
    }

    return <Outlet />
}
