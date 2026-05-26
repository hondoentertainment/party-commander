import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { LeadsPage } from '../ModulePages'

function LeadsPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <LeadsPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('LeadsPage', () => {
  it('renders without crashing', () => {
    render(<LeadsPageWithProviders />)
    expect(screen.getByRole('heading', { name: /team roles/i })).toBeInTheDocument()
  })

  it('shows scope selector', () => {
    render(<LeadsPageWithProviders />)
    const scopeSelect = screen.getAllByRole('combobox')[0]
    expect(scopeSelect).toBeInTheDocument()
  })

  it('allows adding a lead assignment', () => {
    render(<LeadsPageWithProviders />)
    const leadInput = screen.getAllByPlaceholderText(/lead name/i)[0]
    fireEvent.change(leadInput, { target: { value: 'Alice' } })
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
  })
})
