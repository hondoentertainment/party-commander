import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { CleaningPage } from '../ModulePages'

function CleaningPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <CleaningPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('CleaningPage', () => {
  it('renders without crashing', () => {
    render(<CleaningPageWithProviders />)
    expect(screen.getByRole('heading', { name: /cleaning & bathroom/i })).toBeInTheDocument()
  })

  it('shows checklist form', () => {
    render(<CleaningPageWithProviders />)
    expect(screen.getByPlaceholderText(/sweep kitchen floor/i)).toBeInTheDocument()
    const addButtons = screen.getAllByRole('button', { name: /add to checklist/i })
    expect(addButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('allows adding a checklist item', () => {
    render(<CleaningPageWithProviders />)
    const itemInput = screen.getByPlaceholderText(/sweep kitchen floor/i)
    fireEvent.change(itemInput, { target: { value: 'Vacuum living room' } })
    const addButtons = screen.getAllByRole('button', { name: /add to checklist/i })
    fireEvent.click(addButtons[0])
    expect(screen.getByText('Vacuum living room')).toBeInTheDocument()
  })

  it('allows toggling checklist item status', () => {
    render(<CleaningPageWithProviders />)
    const itemInput = screen.getByPlaceholderText(/sweep kitchen floor/i)
    fireEvent.change(itemInput, { target: { value: 'Wipe down countertops' } })
    const addButtons = screen.getAllByRole('button', { name: /add to checklist/i })
    fireEvent.click(addButtons[0])
    const toggleButton = screen.getByRole('button', { name: /wipe down countertops, status not_started/i })
    fireEvent.click(toggleButton)
    expect(screen.getByRole('button', { name: /wipe down countertops, status in_progress/i })).toBeInTheDocument()
  })
})
