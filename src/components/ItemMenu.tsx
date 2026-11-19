import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface MenuItem {
  key: string
  label: string
  icon: ReactNode
  /** Single-letter shortcut shown on the right, pressed while the menu is open. */
  shortcut?: string
  /** No run = shown disabled with `hint`. */
  run?: () => void
  hint?: string
  danger?: boolean
  separatorBefore?: boolean
}

interface Props {
  label: string
  items: MenuItem[]
  /** The button that opened the menu: it gets focus back, and the menu sits under it. */
  anchor: HTMLElement
  /** 'start' = left edges aligned (title bar); 'end' = right edges aligned (side menu rows). */
  align?: 'start' | 'end'
  onClose: () => void
}

const WIDTH = 240

/** Options menu for a project or an analysis (pin, rename, move, export, archive, delete). */
export function ItemMenu({ label, items, anchor, align = 'end', onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 })

  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect()
    const h = ref.current?.offsetHeight ?? 300
    const left = Math.min(Math.max(8, align === 'start' ? r.left : r.right - WIDTH), window.innerWidth - WIDTH - 8)
    const below = r.bottom + 4
    setPos({ top: below + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 4) : below, left })
  }, [anchor, align])

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus()
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onClose()
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('resize', onClose)
    }
  }, [anchor, onClose])

  const choose = (it: MenuItem) => {
    if (!it.run) return
    onClose()
    if (it.key !== 'rename') anchor.focus()
    it.run()
  }

  const onKey = (e: KeyboardEvent) => {
    const els = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])
    const i = els.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()
      onClose()
      anchor.focus()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const n = els.length
      els[(i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n]?.focus()
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      els[e.key === 'Home' ? 0 : els.length - 1]?.focus()
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const it = items.find((x) => x.shortcut?.toLowerCase() === e.key.toLowerCase())
      if (it) {
        e.preventDefault()
        choose(it)
      }
    }
  }

  const menu = (
    <div ref={ref} role="menu" aria-label={label} className="menu" style={{ ...pos, width: WIDTH }} onKeyDown={onKey}>
      {items.map((it) => (
        <div key={it.key}>
          {it.separatorBefore && <div className="menu-sep" role="separator" />}
          <button
            type="button"
            role="menuitem"
            className={'menu-item' + (it.danger ? ' danger' : '')}
            aria-disabled={it.run ? undefined : 'true'}
            aria-keyshortcuts={it.shortcut}
            title={it.hint}
            tabIndex={-1}
            onClick={() => choose(it)}
          >
            {it.icon}
            <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>
            {it.shortcut && <span className="menu-key">{it.shortcut}</span>}
            {!it.run && it.hint && <span className="menu-key">{it.hint}</span>}
          </button>
        </div>
      ))}
    </div>
  )
  // Inside a modal <dialog> (the side-menu drawer) everything outside the dialog is
  // inert, so the menu is rendered into that dialog.
  const host = anchor.closest('dialog')
  return host?.open ? createPortal(menu, host) : menu
}
