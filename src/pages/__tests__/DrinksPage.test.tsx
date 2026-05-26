import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { DrinksPage } from '../ModulePages'

function DrinksPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <DrinksPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('DrinksPage', () => {
  it('renders without crashing', () => {
    render(<DrinksPageWithProviders />)
    expect(screen.getByRole('heading', { name: /themed drinks/i })).toBeInTheDocument()
  })

  it('shows Add custom drink button', () => {
    render(<DrinksPageWithProviders />)
    expect(screen.getByRole('button', { name: /add custom drink/i })).toBeInTheDocument()
  })

  it('allows adding a custom drink', () => {
    render(<DrinksPageWithProviders />)
    fireEvent.click(screen.getByRole('button', { name: /add custom drink/i }))
    expect(screen.getByDisplayValue('New Drink')).toBeInTheDocument()
  })

  it('shows drink suggestions section', () => {
    render(<DrinksPageWithProviders />)
    expect(screen.getByRole('heading', { name: /suggestions/i })).toBeInTheDocument()
  })
})
