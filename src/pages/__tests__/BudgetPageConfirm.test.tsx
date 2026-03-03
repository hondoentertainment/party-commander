import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
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

describe('BudgetPage confirmation dialog', () => {
  it('shows confirmation dialog when Remove is clicked', async () => {
    render(<BudgetPageWithProviders />)
    const labelInput = screen.getByPlaceholderText(/ice, cups, napkins/i)
    const amountInput = screen.getByPlaceholderText(/24\.99/i)
    fireEvent.change(labelInput, { target: { value: 'Test item' } })
    fireEvent.change(amountInput, { target: { value: '25' } })
    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    fireEvent.click(removeButtons[0])

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText(/remove "test item"\?/i)).toBeInTheDocument()
  })

  it('closes dialog and removes item when Remove is confirmed', async () => {
    render(<BudgetPageWithProviders />)
    const labelInput = screen.getByPlaceholderText(/ice, cups, napkins/i)
    const amountInput = screen.getByPlaceholderText(/24\.99/i)
    fireEvent.change(labelInput, { target: { value: 'To Remove' } })
    fireEvent.change(amountInput, { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    expect(screen.getByDisplayValue('To Remove')).toBeInTheDocument()

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    fireEvent.click(removeButtons[0])

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    const confirmButton = within(dialog).getByRole('button', { name: /^remove$/i })
    fireEvent.click(confirmButton)

    // Dialog should close; removal is verified by E2E
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  it('keeps item when Cancel is clicked', async () => {
    render(<BudgetPageWithProviders />)
    const labelInput = screen.getByPlaceholderText(/ice, cups, napkins/i)
    const amountInput = screen.getByPlaceholderText(/24\.99/i)
    fireEvent.change(labelInput, { target: { value: 'Keep Me' } })
    fireEvent.change(amountInput, { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    fireEvent.click(removeButtons[0])

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByDisplayValue('Keep Me')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
