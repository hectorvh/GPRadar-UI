import type { RunState } from '../hooks/useRun'

/** Text of the Run button for the current run state (with upload progress). */
export function runLabel(run: RunState) {
  switch (run.status) {
    case 'queued':
      return 'Waiting for server…'
    case 'uploading':
      return run.progress != null && run.progress < 1 ? `Uploading… ${Math.round(run.progress * 100)}%` : 'Uploading…'
    case 'running':
      return 'Running…'
    default:
      return 'Run detection'
  }
}
