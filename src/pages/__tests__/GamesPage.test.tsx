import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PartyProvider } from '../../state/PartyContext'
import { GamesPage } from '../ModulePages'

function GamesPageWithProviders() {
  return (
    <PartyProvider>
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('GamesPage', () => {
  it('renders without crashing', () => {
    render(<GamesPageWithProviders />)
    expect(screen.getByRole('heading', { name: /game generator/i })).toBeInTheDocument()
  })

  it('shows add game form', () => {
    render(<GamesPageWithProviders />)
    expect(screen.getByPlaceholder(/two truths and a lie/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add game/i })).toBeInTheDocument()
  })

  it('allows adding a game', () => {
    render(<GamesPageWithProviders />)
    const nameInput = screen.getByPlaceholder(/two truths and a lie/i)
    fireEvent.change(nameInput, { target: { value: 'Charades' } })
    fireEvent.click(screen.getByRole('button', { name: /add game/i }))
    expect(screen.getByDisplayValue('Charades')).toBeInTheDocument()
  })
})
