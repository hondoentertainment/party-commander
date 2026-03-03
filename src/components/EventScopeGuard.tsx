import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useParty } from '../state/PartyContext'

export function EventScopeGuard() {
    const { eventId } = useParams()
    const { currentPartyId, switchParty, partyLoading, parties } = useParty()
    const navigate = useNavigate()

    useEffect(() => {
        if (partyLoading || !eventId) return

        const eventExists = parties.some((p) => p.id === eventId)
        if (!eventExists) {
            // If the URL has an eventId that doesn't exist, boot them to home
            navigate('/', { replace: true })
            return
        }

        if (currentPartyId !== eventId) {
            switchParty(eventId).catch((err) => {
                console.error('Failed to switch party on navigation:', err)
                navigate('/', { replace: true })
            })
        }
    }, [eventId, currentPartyId, partyLoading, parties, switchParty, navigate])

    if (currentPartyId !== eventId) {
        // Optionally render a unified skeleton/spinner here while switching
        return null
    }

    return <Outlet />
}
