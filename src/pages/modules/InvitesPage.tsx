import { useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'

export function InvitesPage() {
  const { state, dispatch } = useParty()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const handleCopy = async (key: 'arrival' | 'music' | 'rooftop') => {
    const value = state.invites.messageTemplates[key]
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      setCopiedKey(null)
    }
  }

  const shareMessage = [
    `You're invited to ${state.core.name || 'our party'}!`,
    state.core.date ? `When: ${state.core.date}` : null,
    state.core.location ? `Where: ${state.core.location}` : null,
    state.invites.messageTemplates.arrival ? `Arrival: ${state.invites.messageTemplates.arrival}` : null,
    state.music.mainLink ? `Music: ${state.music.mainLink}` : null,
    state.invites.messageTemplates.rooftop
      ? `Rooftop: ${state.invites.messageTemplates.rooftop}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const hostBrief = [
    `Party: ${state.core.name || 'Untitled'}`,
    `Theme: ${state.core.theme === 'Custom' ? state.core.customTheme || 'Custom' : state.core.theme}`,
    `Date: ${state.core.date || 'TBD'}`,
    `Location: ${state.core.location || 'TBD'}`,
    `Guest count: ${state.invites.guestCount}`,
    '',
    'Menu:',
    state.menu.items.length
      ? state.menu.items.map((item) => `- ${item.name} (${item.category}, ${item.source})`).join('\n')
      : '- None yet',
    '',
    'Drinks:',
    state.drinks.suggestions.map((drink) => `- ${drink.name} (${drink.type})`).join('\n'),
    '',
    'Timeline:',
    state.timeline.tasks.length
      ? state.timeline.tasks.map((task) => `- ${task.title} (${task.offsetHours}h)`).join('\n')
      : '- None yet',
  ].join('\n')

  const copyShareMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 1500)
    } catch {
      setShareCopied(false)
    }
  }

  const downloadBrief = () => {
    const blob = new Blob([hostBrief], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'party-brief.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Invites Hub</h3>
      <p className="text-sm text-slate-300">
        Track the Partiful link, RSVP count, and reusable message templates.
      </p>

      <Card>
        <CardTitle>Event Details</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Partiful link
            <Input
              value={state.invites.partifulLink}
              onChange={(event) =>
                dispatch({ type: 'update_invites', payload: { partifulLink: event.target.value } })
              }
              className="mt-2"
              placeholder="https://partiful.com/e/..."
            />
          </label>
          <label className="text-sm text-slate-300">
            RSVP guest count
            <Input
              type="number"
              min={0}
              value={state.invites.guestCount}
              onChange={(event) =>
                dispatch({
                  type: 'update_invites',
                  payload: { guestCount: Number(event.target.value) },
                })
              }
              className="mt-2"
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardTitle>Message Templates</CardTitle>
        <div className="mt-4 space-y-4">
          {(['arrival', 'music', 'rooftop'] as const).map((key) => (
            <label key={key} className="block text-sm text-slate-300">
              {key === 'arrival' && 'Arrival instructions (e.g. Buzz code)'}
              {key === 'music' && 'Music share link (Spotify/Apple Music)'}
              {key === 'rooftop' && 'Rooftop details (Rules & Access)'}
              <div className="mt-2 flex gap-2">
                <Textarea
                  value={state.invites.messageTemplates[key]}
                  onChange={(event) =>
                    dispatch({
                      type: 'update_invites',
                      payload: {
                        messageTemplates: {
                          ...state.invites.messageTemplates,
                          [key]: event.target.value,
                        },
                      },
                    })
                  }
                  rows={3}
                />
                <Button
                  type="button"
                  onClick={() => handleCopy(key)}
                  variant="outline"
                  className="h-10 px-3 text-xs"
                >
                  {copiedKey === key ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Share Kit</CardTitle>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <Textarea value={shareMessage} rows={6} readOnly />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copyShareMessage}>
              {shareCopied ? 'Copied' : 'Copy invite'}
            </Button>
            <Button type="button" variant="outline" onClick={downloadBrief}>
              Download host brief
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default InvitesPage
