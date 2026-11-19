import { useId, useState } from 'react'
import { sortItems, type Analysis, type Project } from '../lib/library'
import { Dialog } from './Dialog'

interface Props {
  analysis: Analysis | null
  projects: Project[]
  onClose: () => void
  /** Target project id, null = independent, or a new project's name. */
  onMove: (target: { projectId: string | null } | { newProject: string }) => void
}

const NONE = '__independent__'
const NEW = '__new__'

/** Move an analysis to another project, to a new project, or make it independent. */
export function MoveDialog({ analysis, projects, onClose, onMove }: Props) {
  const id = useId()
  const [choice, setChoice] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const current = analysis?.projectId ?? NONE
  const picked = choice ?? current
  const list = sortItems(projects.filter((p) => !p.archived || p.id === analysis?.projectId))

  const close = () => {
    setChoice(null)
    setNewName('')
    onClose()
  }
  const submit = () => {
    if (picked === NEW) {
      if (newName.trim()) onMove({ newProject: newName.trim().slice(0, 80) })
    } else if (picked !== current) {
      onMove({ projectId: picked === NONE ? null : picked })
    }
    close()
  }

  return (
    <Dialog open={!!analysis} onClose={close} title="Move analysis" width={420}>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>Choose where “{analysis?.name}” belongs. Its result stays the same</p>
      <div role="radiogroup" aria-label="Destination" className="move-list">
        <label className="check">
          <input type="radio" name={id} checked={picked === NONE} onChange={() => setChoice(NONE)} />
          <span>
            <span className="check-label">No project (independent analysis)</span>
            {current === NONE && <span className="check-hint">Current</span>}
          </span>
        </label>
        {list.map((p) => (
          <label className="check" key={p.id}>
            <input type="radio" name={id} checked={picked === p.id} onChange={() => setChoice(p.id)} />
            <span>
              <span className="check-label">{p.name}</span>
              {current === p.id && <span className="check-hint">Current</span>}
            </span>
          </label>
        ))}
        <label className="check">
          <input type="radio" name={id} checked={picked === NEW} onChange={() => setChoice(NEW)} />
          <span style={{ flex: 1 }}>
            <span className="check-label">New project</span>
            {picked === NEW && (
              <span className="field" style={{ marginTop: 6 }}>
                <input
                  aria-label="New project name"
                  autoFocus
                  maxLength={80}
                  value={newName}
                  placeholder="Project name"
                  onChange={(e) => setNewName(e.target.value)}
                />
              </span>
            )}
          </span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn ghost" onClick={close}>
          Cancel
        </button>
        <button type="button" className="btn primary" disabled={picked === current || (picked === NEW && !newName.trim())} onClick={submit}>
          Move
        </button>
      </div>
    </Dialog>
  )
}
