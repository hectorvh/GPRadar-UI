import { useCallback, useEffect, useRef, useState } from 'react'
import { analysesToPrune, type Analysis, type Project } from '../lib/library'
import { getAll, put, remove } from '../lib/store'

export type LibraryState = { status: 'loading' } | { status: 'ok'; analyses: Analysis[]; projects: Project[] }

/** Projects and analyses kept in this browser, with create / update / move / delete. */
export function useLibrary() {
  const [state, setState] = useState<LibraryState>({ status: 'loading' })
  const data = useRef<{ analyses: Analysis[]; projects: Project[] }>({ analyses: [], projects: [] })

  const commit = useCallback((next: { analyses: Analysis[]; projects: Project[] }) => {
    data.current = next
    setState({ status: 'ok', ...next })
  }, [])

  useEffect(() => {
    let alive = true
    Promise.all([getAll('analyses').catch(() => []), getAll('projects').catch(() => [])]).then(([analyses, projects]) => {
      if (alive) commit({ analyses, projects })
    })
    return () => {
      alive = false
    }
  }, [commit])

  const saveAnalysis = useCallback(
    (a: Analysis) => {
      const all = [a, ...data.current.analyses.filter((x) => x.id !== a.id)]
      const drop = new Set(analysesToPrune(all))
      commit({ ...data.current, analyses: all.filter((x) => !drop.has(x.id)) })
      void put('analyses', a).catch(() => {})
      drop.forEach((id) => void remove('analyses', id).catch(() => {}))
    },
    [commit],
  )

  const updateAnalysis = useCallback(
    (id: string, patch: Partial<Analysis>, touch = true) => {
      const cur = data.current.analyses.find((x) => x.id === id)
      if (cur) saveAnalysis({ ...cur, ...patch, ...(touch ? { updatedAt: Date.now() } : {}) })
    },
    [saveAnalysis],
  )

  const removeAnalysis = useCallback(
    (id: string) => {
      commit({ ...data.current, analyses: data.current.analyses.filter((x) => x.id !== id) })
      void remove('analyses', id).catch(() => {})
    },
    [commit],
  )

  const saveProject = useCallback(
    (p: Project) => {
      commit({ ...data.current, projects: [p, ...data.current.projects.filter((x) => x.id !== p.id)] })
      void put('projects', p).catch(() => {})
    },
    [commit],
  )

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>, touch = true) => {
      const cur = data.current.projects.find((x) => x.id === id)
      if (cur) saveProject({ ...cur, ...patch, ...(touch ? { updatedAt: Date.now() } : {}) })
    },
    [saveProject],
  )

  /** Delete a project; its analyses are deleted too, or become independent. */
  const removeProject = useCallback(
    (id: string, withAnalyses: boolean) => {
      const inside = data.current.analyses.filter((a) => a.projectId === id)
      const analyses = withAnalyses
        ? data.current.analyses.filter((a) => a.projectId !== id)
        : data.current.analyses.map((a) => (a.projectId === id ? { ...a, projectId: null } : a))
      commit({ analyses, projects: data.current.projects.filter((p) => p.id !== id) })
      void remove('projects', id).catch(() => {})
      inside.forEach((a) => {
        if (withAnalyses) void remove('analyses', a.id).catch(() => {})
        else void put('analyses', { ...a, projectId: null }).catch(() => {})
      })
    },
    [commit],
  )

  /** Move an analysis into a project, or make it independent (null). */
  const moveAnalysis = useCallback(
    (id: string, projectId: string | null) => {
      updateAnalysis(id, { projectId })
      if (projectId) updateProject(projectId, {})
    },
    [updateAnalysis, updateProject],
  )

  const getAnalysis = useCallback((id: string) => data.current.analyses.find((x) => x.id === id) ?? null, [])
  const getProject = useCallback((id: string) => data.current.projects.find((x) => x.id === id) ?? null, [])

  return {
    state,
    saveAnalysis,
    updateAnalysis,
    removeAnalysis,
    saveProject,
    updateProject,
    removeProject,
    moveAnalysis,
    getAnalysis,
    getProject,
  }
}

export type Library = ReturnType<typeof useLibrary>
