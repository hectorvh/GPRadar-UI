import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { KEY_STEP } from '../hooks/usePanels'

interface Props {
  /** Which panel this handle resizes: dragging right widens 'left' and narrows 'right'. */
  side: 'left' | 'right'
  width: number
  onResize: (width: number) => void
  label: string
}

/** Pointer + arrow-key resizing (mockup: ±20 px per key press). */
export function ResizeHandle({ side, width, onResize, label }: Props) {
  const drag = useRef<{ x: number; w: number } | null>(null)
  const sign = side === 'left' ? 1 : -1

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, w: width }
  }
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    onResize(drag.current.w + sign * (e.clientX - drag.current.x))
  }
  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    drag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft') onResize(width - sign * KEY_STEP)
    else if (e.key === 'ArrowRight') onResize(width + sign * KEY_STEP)
    else return
    e.preventDefault()
  }

  return (
    <button
      type="button"
      className="handle"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    />
  )
}
