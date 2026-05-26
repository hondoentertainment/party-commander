import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { MenuPage } from '../ModulePages'

function MenuPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <MenuPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('MenuPage', () => {
  it('renders without crashing', () => {
    render(<MenuPageWithProviders />)
    expect(screen.getByRole('heading', { name: /menu builder/i })).toBeInTheDocument()
  })

  it('shows add menu item form', () => {
    render(<MenuPageWithProviders />)
    expect(screen.getByPlaceholderText(/buffalo sliders/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument()
  })

  it('allows adding a menu item', () => {
    render(<MenuPageWithProviders />)
    const nameInput = screen.getByPlaceholderText(/buffalo sliders/i)
    fireEvent.change(nameInput, { target: { value: 'Caesar salad' } })
    fireEvent.click(screen.getByRole('button', { name: /add item/i }))
    expect(screen.getByDisplayValue('Caesar salad')).toBeInTheDocument()
  })
})
