import { useRef, type ReactNode } from 'react'
import { useModal } from '../hooks/useModal'

interface Props {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
}

/**
 * Side menu on phones and tablets: a modal <dialog> that slides in from the
 * left (Escape, backdrop click and the focus trap come from the browser).
 */
export function Drawer({ open, onClose, label, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useModal(ref, open)
  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
