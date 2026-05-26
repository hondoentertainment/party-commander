import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { DecorPage } from '../ModulePages'

function DecorPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <DecorPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('DecorPage', () => {
  it('renders without crashing', () => {
    render(<DecorPageWithProviders />)
    expect(screen.getByRole('heading', { name: /decor & ambience/i })).toBeInTheDocument()
  })

  it('shows add decor form', () => {
    render(<DecorPageWithProviders />)
    expect(screen.getByPlaceholderText(/string lights/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add decor/i })).toBeInTheDocument()
  })

  it('allows adding a decor item', () => {
    render(<DecorPageWithProviders />)
    const itemInput = screen.getByPlaceholderText(/string lights/i)
    fireEvent.change(itemInput, { target: { value: 'Balloons' } })
    fireEvent.click(screen.getByRole('button', { name: /add decor/i }))
    expect(screen.getByText('Balloons')).toBeInTheDocument()
  })

  it('allows clicking Edit on a decor item', () => {
    render(<DecorPageWithProviders />)
    const itemInput = screen.getByPlaceholderText(/string lights/i)
    fireEvent.change(itemInput, { target: { value: 'Candles' } })
    fireEvent.click(screen.getByRole('button', { name: /add decor/i }))
    const editButton = screen.getByRole('button', { name: /edit candles/i })
    fireEvent.click(editButton)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Candles')).toBeInTheDocument()
  })
})
