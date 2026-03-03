import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Remove item"
        description="Are you sure?"
      />
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('renders title and description when open', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Remove item"
        description="This cannot be undone."
      />
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Remove item')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Remove"
        description="Sure?"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Remove is clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Remove"
        description="Sure?"
        confirmLabel="Remove"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /remove/i }))
    await vi.waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  it('has aria-labelledby and aria-describedby for accessibility', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Remove item"
        description="This cannot be undone."
      />
    )
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title')
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-desc')
  })
})
