import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { Navigation } from '../Navigation'
import { PartyProvider } from '../../state/PartyContext'

function NavWithProviders({ layout }: { layout: 'sidebar' | 'bottom' }) {
  return (
    <PartyProvider>
      <BrowserRouter>
        <Navigation layout={layout} />
      </BrowserRouter>
    </PartyProvider>
  )
}

describe('Navigation', () => {
  it('renders nav with aria-label', () => {
    render(<NavWithProviders layout="sidebar" />)
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
  })

  it('shows aria-current="page" on active link when on home', () => {
    render(
      <PartyProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Navigation layout="sidebar" />} />
          </Routes>
        </MemoryRouter>
      </PartyProvider>
    )
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toHaveAttribute('aria-current', 'page')
  })

  it('shows aria-current on Budget when on /budget', () => {
    render(
      <PartyProvider>
        <MemoryRouter initialEntries={['/budget']}>
          <Routes>
            <Route path="/budget" element={<Navigation layout="sidebar" />} />
          </Routes>
        </MemoryRouter>
      </PartyProvider>
    )
    const budgetLink = screen.getByRole('link', { name: /budget/i })
    expect(budgetLink).toHaveAttribute('aria-current', 'page')
  })

  it('shows labels on mobile layout', () => {
    render(<NavWithProviders layout="bottom" />)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
