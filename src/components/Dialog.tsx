import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
}

/** Modal on the native <dialog>: focus trap, Escape and the backdrop come from the browser. */
export function Dialog({ open, onClose, title, children, width = 420 }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      style={{ width: `min(${width}px, calc(100vw - 24px))` }}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dialog-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 id="dialog-title" style={{ fontSize: 17, fontWeight: 600 }}>
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
