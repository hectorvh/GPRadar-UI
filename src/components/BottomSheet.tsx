import { useId, useRef, type ReactNode } from 'react'
import { useModal } from '../hooks/useModal'
import { CloseIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Phone sheet anchored to the bottom (setup: processing and metadata). The handle is visual only. */
export function BottomSheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useModal(ref, open)
  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="sheet-handle" aria-hidden="true" />
      <div className="sheet-head">
        <h2 id={titleId} style={{ fontSize: 16, fontWeight: 600 }}>
          {title}
        </h2>
        <button type="button" className="btn ghost icon" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="sheet-body scroll">{children}</div>
    </dialog>
  )
}
