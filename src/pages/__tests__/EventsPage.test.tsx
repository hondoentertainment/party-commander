import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { EventsPage } from '../ModulePages'

function EventsPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <EventsPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('EventsPage', () => {
  it('renders without crashing', () => {
    render(<EventsPageWithProviders />)
    expect(screen.getByRole('heading', { name: /events/i })).toBeInTheDocument()
  })

  it('shows add event form or needs-party message', () => {
    render(<EventsPageWithProviders />)
    const hasForm = screen.queryByPlaceholderText(/rooftop kickoff/i)
    const hasMessage = screen.queryByText(/select a party|create your first party/i)
    expect(hasForm ?? hasMessage).toBeTruthy()
  })
})
