import { useEffect, type RefObject } from 'react'

/**
 * Keeps a native <dialog> in step with `open`: showModal() gives the focus
 * trap, Escape and the backdrop; close() when `open` turns false.
 */
export function useModal(ref: RefObject<HTMLDialogElement | null>, open: boolean) {
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [ref, open])
}
