import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { InvitesPage } from '../ModulePages'

function InvitesPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <InvitesPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('InvitesPage', () => {
  it('renders without crashing', () => {
    render(<InvitesPageWithProviders />)
    expect(screen.getByRole('heading', { name: /invites hub/i })).toBeInTheDocument()
  })

  it('shows Partiful link input', () => {
    render(<InvitesPageWithProviders />)
    expect(screen.getByPlaceholderText(/partiful\.com/i)).toBeInTheDocument()
  })

  it('allows editing Partiful link', () => {
    render(<InvitesPageWithProviders />)
    const linkInput = screen.getByPlaceholderText(/partiful\.com/i)
    fireEvent.change(linkInput, { target: { value: 'https://partiful.com/e/test123' } })
    expect(screen.getByDisplayValue('https://partiful.com/e/test123')).toBeInTheDocument()
  })

  it('shows Copy invite button', () => {
    render(<InvitesPageWithProviders />)
    expect(screen.getByRole('button', { name: /copy invite/i })).toBeInTheDocument()
  })
})
