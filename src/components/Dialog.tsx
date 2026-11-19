import { useId, useRef, type CSSProperties, type ReactNode } from 'react'
import { useModal } from '../hooks/useModal'
import { CloseIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
  /** On phones, a full-height sheet instead of a centred box (About, Sign in, Settings). */
  fullOnPhone?: boolean
}

/** Modal on the native <dialog>: focus trap, Escape and the backdrop come from the browser. */
export function Dialog({ open, onClose, title, children, width = 420, fullOnPhone = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useModal(ref, open)

  return (
    <dialog
      ref={ref}
      className={'dialog' + (fullOnPhone ? ' full-phone' : '')}
      aria-labelledby={titleId}
      style={{ '--dialog-w': `min(${width}px, calc(100vw - 24px))` } as CSSProperties}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dialog-body">
        <div className="dialog-head">
          <h2 id={titleId} style={{ fontSize: 17, fontWeight: 600 }}>
            {title}
          </h2>
          <button type="button" className="btn ghost icon" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
