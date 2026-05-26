import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { PlanPage } from '../ModulePages'

function PlanPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <PlanPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('PlanPage', () => {
  it('renders without crashing', () => {
    render(<PlanPageWithProviders />)
    expect(screen.getByRole('heading', { name: /plan/i })).toBeInTheDocument()
  })

  it('shows party concepts', () => {
    render(<PlanPageWithProviders />)
    expect(screen.getByText(/party concepts/i)).toBeInTheDocument()
  })

  it('allows selecting a party concept', () => {
    render(<PlanPageWithProviders />)
    const tropicalButton = screen.getByRole('button', { name: /tropical/i })
    fireEvent.click(tropicalButton)
    expect(tropicalButton).toHaveClass(/emerald|ring/)
  })

  it('shows custom concept input when Custom is selected', () => {
    render(<PlanPageWithProviders />)
    fireEvent.click(screen.getByRole('button', { name: /custom/i }))
    const customInput = screen.getByPlaceholderText(/art deco speakeasy/i)
    expect(customInput).toBeInTheDocument()
    fireEvent.change(customInput, { target: { value: 'Art Deco Speakeasy' } })
    expect(screen.getByDisplayValue('Art Deco Speakeasy')).toBeInTheDocument()
  })
})
