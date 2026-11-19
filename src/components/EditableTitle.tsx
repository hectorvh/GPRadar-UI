import { useEffect, useRef } from 'react'
import { PencilIcon } from './icons'

interface Props {
  /** What is shown: the custom name, or the default ("New analysis", the file name…). */
  value: string
  /** True when `value` is a name the user typed. */
  custom: boolean
  /** null resets to the default name. */
  onChange: (name: string | null) => void
  /** Controlled so the project menu's Rename can start editing too. */
  editing: boolean
  onEditingChange: (editing: boolean) => void
}

export const MAX_NAME = 80

/** Analysis name in the top bar. Click (or Enter) to rename; Enter or blur saves, Escape cancels. */
export function EditableTitle({ value, custom, onChange, editing, onEditingChange }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const cancelled = useRef(false)

  useEffect(() => {
    if (editing) {
      cancelled.current = false
      input.current?.focus()
      input.current?.select()
    }
  }, [editing])

  const save = () => {
    if (cancelled.current) return
    const name = (input.current?.value ?? '').trim().slice(0, MAX_NAME)
    onChange(name ? name : null)
    onEditingChange(false)
  }

  if (editing) {
    return (
      <input
        ref={input}
        className="title-input"
        aria-label="Analysis name"
        placeholder={value}
        defaultValue={custom ? value : ''}
        maxLength={MAX_NAME}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') {
            cancelled.current = true
            onEditingChange(false)
          }
        }}
      />
    )
  }

  return (
    <h1 style={{ margin: 0, minWidth: 0, fontSize: 16, fontWeight: 600 }}>
      <button type="button" className="title-btn" onClick={() => onEditingChange(true)} title="Rename this analysis">
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        <PencilIcon />
        <span className="sr">(rename)</span>
      </button>
    </h1>
  )
}
