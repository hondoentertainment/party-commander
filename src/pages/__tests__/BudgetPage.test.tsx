import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { BudgetPage } from '../ModulePages'

function BudgetPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <BudgetPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('BudgetPage', () => {
  it('renders budget heading', () => {
    render(<BudgetPageWithProviders />)
    expect(screen.getByRole('heading', { level: 2, name: /budget/i })).toBeInTheDocument()
  })

  it('shows total spent', () => {
    render(<BudgetPageWithProviders />)
    expect(screen.getByText(/total spent/i)).toBeInTheDocument()
  })

  it('allows adding a line item', () => {
    render(<BudgetPageWithProviders />)
    const labelInput = screen.getByPlaceholderText(/ice, cups, napkins/i)
    const amountInput = screen.getByPlaceholderText(/24\.99/i)
    fireEvent.change(labelInput, { target: { value: 'Test item' } })
    fireEvent.change(amountInput, { target: { value: '25' } })
    fireEvent.click(screen.getByRole('button', { name: /add item/i }))
    expect(screen.getByDisplayValue('Test item')).toBeInTheDocument()
  })
})
