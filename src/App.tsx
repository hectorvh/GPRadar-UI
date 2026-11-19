import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthDialog } from './components/AuthDialog'
import { DetectionsTable } from './components/DetectionsTable'
import { Dialog } from './components/Dialog'
import { EmptyState } from './components/EmptyState'
import { AnalysisIcon, ArchiveIcon, DownloadIcon, MoveIcon, PencilIcon, PinIcon, ShareIcon, TrashIcon } from './components/icons'
import { InfoDialog } from './components/InfoDialog'
import { InputPanel } from './components/InputPanel'
import { ItemMenu, type MenuItem } from './components/ItemMenu'
import { LeftNav } from './components/LeftNav'
import { AnalysesNav, ProjectsNav } from './components/LibraryNav'
import { MoveDialog } from './components/MoveDialog'
import { NewAnalysisView, type DraftItem } from './components/NewAnalysisView'
import { ProjectView } from './components/ProjectView'
import { ResizeHandle } from './components/ResizeHandle'
import { SettingsDialog } from './components/SettingsDialog'
import { StatusBanner } from './components/StatusBanner'
import { TopBar } from './components/TopBar'
import { UploadDrop } from './components/UploadDrop'
import { Viewer, type View } from './components/Viewer'
import { useBackend, useSamples } from './hooks/useBackend'
import { useBatch, type QueueItem } from './hooks/useBatch'
import { useLibrary } from './hooks/useLibrary'
import { usePanels } from './hooks/usePanels'
import { useRun } from './hooks/useRun'
import { useSettings } from './hooks/useSettings'
import { useTheme } from './hooks/useTheme'
import { currentAccount } from './lib/auth'
import { detectionsToCsv, downloadBlob, exportFilename } from './lib/csv'
import { THRESHOLD_DEFAULT, filterByThreshold } from './lib/detections'
import { annotatedPng } from './lib/exportPng'
import { analysesOf, newId, nextName, type Analysis, type Project } from './lib/library'
import { EMPTY_META, parseMetadata, type MetaStrings } from './lib/metadata'
import { projectZip } from './lib/projectZip'
import { allowedMode } from './lib/settings'
import { kindLabel, sourceKind, sourceTitle, type Source } from './lib/source'
import type { Detection, InputKind, MetaField, Mode, RunResponse, Sample } from './lib/types'
import { validateFile } from './lib/validate'

type Selection = { runId: string; id: number; from: 'box' | 'row' }
/** Key of a library item: "p:<project id>" or "a:<analysis id>". */
type ItemKey = string

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme()
  const panels = usePanels()
  const backend = useBackend()
  const ready = backend.status === 'ok'
  const samples = useSamples(ready)
  const lib = useLibrary()
  const { settings, update: updateSettings } = useSettings()

  // Set further down (they need the page state); called when runs finish.
  const onRunDone = useRef<((r: RunResponse) => void) | null>(null)
  const run = useRun(
    ready,
    useCallback((r: RunResponse) => onRunDone.current?.(r), []),
  )
  const onBatchDone = useRef<((item: QueueItem, r: RunResponse) => void) | null>(null)
  const batch = useBatch(
    ready,
    useCallback((item: QueueItem, r: RunResponse) => onBatchDone.current?.(item, r), []),
  )

  const [source, setSource] = useState<Source | null>(null)
  const [preferredMode, setMode] = useState<Mode>('full')
  // A mode switched off in Settings is never used: fall back to the one that is on.
  const mode = allowedMode(preferredMode, settings)
  const [view, setView] = useState<View>('processed')
  const [threshold, setThreshold] = useState(THRESHOLD_DEFAULT)
  const [meta, setMeta] = useState<MetaStrings>(EMPTY_META)
  const [metaOpen, setMetaOpen] = useState(true)
  const [sel, setSel] = useState<Selection | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [zipping, setZipping] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [dialog, setDialog] = useState<'auth' | 'info' | 'settings' | null>(null)

  /** Open project window (main column), or null. */
  const [projectViewId, setProjectViewId] = useState<string | null>(null)
  /** A project's New analysis window: the project and the B-scans picked so far. */
  const [draft, setDraft] = useState<{ projectId: string; items: DraftItem[] } | null>(null)
  /** The saved analysis being shown (null until the first run of a new one finishes). */
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [renamingTitle, setRenamingTitle] = useState(false)
  const [listRenaming, setListRenaming] = useState<ItemKey | null>(null)
  const [menu, setMenu] = useState<{ key: ItemKey; anchor: HTMLElement; from: 'list' | 'top' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ItemKey | null>(null)
  const [deleteWithAnalyses, setDeleteWithAnalyses] = useState(false)
  const [moveId, setMoveId] = useState<string | null>(null)
  const [rejected, setRejected] = useState<string[]>([])
  const fileToken = useRef(0)

  const { values: metaValues, errors: metaErrors } = useMemo(() => parseMetadata(meta), [meta])
  const metaInvalid = Object.keys(metaErrors).length > 0

  const libOk = lib.state.status === 'ok' ? lib.state : null
  const viewedProject = projectViewId ? lib.getProject(projectViewId) : null
  const draftProject = draft ? lib.getProject(draft.projectId) : null
  const currentAnalysis = analysisId ? lib.getAnalysis(analysisId) : null
  const parentProject = currentAnalysis?.projectId ? lib.getProject(currentAnalysis.projectId) : null

  const result = projectViewId || draft ? null : run.result
  const shown = useMemo(() => (result ? filterByThreshold(result.detections, threshold) : []), [result, threshold])
  const topId = useMemo(
    () => result?.detections.reduce<Detection | null>((best, d) => (!best || d.confidence > best.confidence ? d : best), null)?.id ?? null,
    [result],
  )
  const current = result && sel?.runId === result.run_id ? sel : null
  const selectedId = current ? current.id : topId

  /** Back to an empty single-analysis state (Home when no project is open). */
  const clearAnalysis = () => {
    fileToken.current++
    run.reset()
    setSource(null)
    setMode('full')
    setName(null)
    setAnalysisId(null)
    setRenamingTitle(false)
    setFileError(null)
    setChecking(false)
    setNotice(null)
  }

  const goHome = () => {
    clearAnalysis()
    setMeta(EMPTY_META)
    setProjectViewId(null)
    setDraft(null)
  }

  const startRun = useCallback(
    (src: Source, m: Mode) => {
      if (metaInvalid) {
        setMetaOpen(true)
        return
      }
      setNotice(null)
      setView('processed')
      const base = { mode: allowedMode(m, settings), metadata: metaValues }
      run.run(src.type === 'sample' ? { ...base, sampleId: src.sample.id } : { ...base, file: src.file }, sourceKind(src))
    },
    [metaInvalid, metaValues, run, settings],
  )

  const pickSample = (s: Sample) => {
    fileToken.current++
    const src: Source = { type: 'sample', sample: s }
    setProjectViewId(null)
    setDraft(null)
    setAnalysisId(null)
    setName(null)
    setSource(src)
    setMode(s.default_mode)
    setFileError(null)
    setChecking(false)
    startRun(src, s.default_mode)
  }

  const pickFile = async (file: File) => {
    const token = ++fileToken.current
    setChecking(true)
    setFileError(null)
    const v = await validateFile(file).catch(() => ({ ok: false as const, message: 'The file could not be read' }))
    if (token !== fileToken.current) return
    setChecking(false)
    if (!v.ok) {
      setFileError(v.message)
      return
    }
    run.reset()
    setProjectViewId(null)
    setDraft(null)
    setAnalysisId(null)
    setSource({ type: 'file', file, kind: v.kind })
    setMode(v.kind === 'image' ? 'detector' : 'full')
  }

  const analysisFrom = (
    r: RunResponse,
    label: string,
    sampleId: string | null,
    projectId: string | null,
    analysisName: string,
  ): Analysis => {
    const now = Date.now()
    return {
      id: newId(),
      name: analysisName,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      archived: false,
      projectId,
      source: { kind: r.input.kind, label, sampleId },
      mode: r.mode,
      threshold,
      result: r,
    }
  }

  // A finished single run becomes an analysis (or updates the one it re-ran).
  useEffect(() => {
    onRunDone.current = (r: RunResponse) => {
      if (analysisId && lib.getAnalysis(analysisId)) {
        lib.updateAnalysis(analysisId, { result: r, mode: r.mode, threshold })
        return
      }
      const label = source ? sourceTitle(source) : r.input.filename
      const a = analysisFrom(r, label, source?.type === 'sample' ? source.sample.id : null, null, name ?? label)
      lib.saveAnalysis(a)
      setAnalysisId(a.id)
    }
    onBatchDone.current = (item: QueueItem, r: RunResponse) => {
      lib.saveAnalysis({ ...analysisFrom(r, item.label, item.sampleId ?? null, item.projectId, item.label), threshold: THRESHOLD_DEFAULT })
      lib.updateProject(item.projectId, {})
    }
  })

  // Keep the analysis's threshold in step with the slider (debounced).
  const { getAnalysis, updateAnalysis } = lib
  useEffect(() => {
    if (!analysisId) return
    const t = setTimeout(() => {
      const a = getAnalysis(analysisId)
      if (a && a.threshold !== threshold) updateAnalysis(analysisId, { threshold }, false)
    }, 400)
    return () => clearTimeout(t)
  }, [threshold, analysisId, getAnalysis, updateAnalysis])

  const openAnalysis = (id: string) => {
    const a = lib.getAnalysis(id)
    if (!a) return
    fileToken.current++
    const sample = a.source.sampleId && samples.status === 'ok' ? samples.samples.find((x) => x.id === a.source.sampleId) : undefined
    setProjectViewId(null)
    setDraft(null)
    setSource(sample ? { type: 'sample', sample } : null)
    setAnalysisId(id)
    setName(a.name)
    setMode(a.mode)
    setThreshold(a.threshold)
    setView('processed')
    setFileError(null)
    setNotice(null)
    setRenamingTitle(false)
    run.show(a.result)
  }

  const openProject = (id: string) => {
    clearAnalysis()
    setDraft(null)
    setRejected([])
    setProjectViewId(id)
  }

  /** Open the project's New analysis window (several B-scans, one setup). */
  const newAnalysisInProject = (projectId: string) => {
    clearAnalysis()
    setProjectViewId(null)
    setRejected([])
    setDraft({ projectId, items: [] })
  }

  const newProject = () => {
    const now = Date.now()
    const p: Project = {
      id: newId(),
      name: nextName('Project', libOk?.projects.map((x) => x.name) ?? []),
      createdAt: now,
      updatedAt: now,
      pinned: false,
      archived: false,
    }
    lib.saveProject(p)
    openProject(p.id)
  }

  // ---- project New analysis (draft) and queue ----
  const addToDraft = (items: DraftItem[]) => {
    // The first B-scan picks the default mode for the whole set (images: Detector only, raw: Full pipeline).
    if (draft && draft.items.length === 0 && items[0]) setMode(items[0].kind === 'image' ? 'detector' : 'full')
    setDraft((d) => (d ? { ...d, items: [...d.items, ...items] } : d))
  }

  const addDraftFiles = async (files: File[]) => {
    const ok: DraftItem[] = []
    const bad: string[] = []
    for (const f of files) {
      const v = await validateFile(f).catch(() => ({ ok: false as const, message: 'The file could not be read' }))
      if (v.ok) ok.push({ key: newId('d-'), label: f.name, kind: v.kind, file: f })
      else bad.push(`${f.name}: ${v.message}`)
    }
    addToDraft(ok)
    setRejected(bad)
  }

  const draftKinds = new Set(draft?.items.map((i) => i.kind) ?? [])
  const draftKind: InputKind | null = draftKinds.size === 1 ? [...draftKinds][0] : null
  const canRunDraft = !!draft && draft.items.length > 0 && !metaInvalid

  const runDraft = () => {
    if (!draft || draft.items.length === 0) return
    if (metaInvalid) {
      setMetaOpen(true)
      return
    }
    batch.add(
      draft.items.map((d) => ({
        ...d,
        key: newId('q-'),
        projectId: draft.projectId,
        mode,
        metadata: metaValues,
        status: 'pending' as const,
      })),
    )
    const pid = draft.projectId
    setDraft(null)
    setRejected([])
    setProjectViewId(pid)
  }

  const projectQueue = projectViewId ? batch.items.filter((q) => q.projectId === projectViewId) : []

  // ---- exports ----
  const exportCsvFor = (r: RunResponse, thr: number, label: string) => {
    const now = new Date()
    const csv = detectionsToCsv(r.detections, {
      mode: r.mode,
      revision: r.model.revision,
      threshold: thr,
      velocity: r.metadata.velocity_m_ns.value,
      date: now,
    })
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), exportFilename(label, now, 'csv'))
  }

  const exportPngFor = async (r: RunResponse, thr: number, label: string) => {
    setExporting(true)
    setNotice(null)
    try {
      downloadBlob(await annotatedPng(r, thr), exportFilename(label, new Date(), 'png'))
    } catch {
      setNotice('The annotated PNG could not be created in this browser')
    } finally {
      setExporting(false)
    }
  }

  const downloadProject = async (p: Project) => {
    if (!libOk) return
    setZipping(true)
    setNotice(null)
    try {
      const zip = await projectZip(p, analysesOf(libOk.analyses, p.id), { png: (a) => annotatedPng(a.result, a.threshold) })
      downloadBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), exportFilename(p.name, new Date(), 'zip'))
    } catch {
      setNotice('The project download could not be created in this browser')
    } finally {
      setZipping(false)
    }
  }

  // ---- rename / move / delete ----
  const renameItem = (key: ItemKey, newName: string | null) => {
    setListRenaming(null)
    if (!newName) return
    const id = key.slice(2)
    if (key.startsWith('p:')) lib.updateProject(id, { name: newName })
    else {
      lib.updateAnalysis(id, { name: newName })
      if (id === analysisId) setName(newName)
    }
  }

  const renameTitle = (n: string | null) => {
    if (viewedProject) {
      if (n) lib.updateProject(viewedProject.id, { name: n })
      return
    }
    setName(n)
    if (analysisId) lib.updateAnalysis(analysisId, { name: n ?? sourceTitle(source) })
  }

  const moveAnalysis = (target: { projectId: string | null } | { newProject: string }) => {
    if (!moveId) return
    let projectId: string | null
    if ('newProject' in target) {
      const now = Date.now()
      const p: Project = { id: newId(), name: target.newProject, createdAt: now, updatedAt: now, pinned: false, archived: false }
      lib.saveProject(p)
      projectId = p.id
    } else projectId = target.projectId
    lib.moveAnalysis(moveId, projectId)
  }

  const doDelete = () => {
    if (!confirmDelete) return
    const id = confirmDelete.slice(2)
    if (confirmDelete.startsWith('p:')) {
      lib.removeProject(id, deleteWithAnalyses)
      batch.clearProject(id)
      if (projectViewId === id) goHome()
      if (deleteWithAnalyses && currentAnalysis?.projectId === id) goHome()
    } else {
      lib.removeAnalysis(id)
      if (id === analysisId) {
        const back = currentAnalysis?.projectId
        if (back && lib.getProject(back)) openProject(back)
        else goHome()
      }
    }
    setConfirmDelete(null)
    setDeleteWithAnalyses(false)
  }

  // ---- menus ----
  const toggleMenu = (key: ItemKey, anchor: HTMLElement, from: 'list' | 'top') =>
    setMenu((m) => (m?.key === key && m.from === from ? null : { key, anchor, from }))

  const menuItems = (key: ItemKey, from: 'list' | 'top'): MenuItem[] => {
    const id = key.slice(2)
    const rename = () => (from === 'top' ? setRenamingTitle(true) : setListRenaming(key))
    if (key.startsWith('p:')) {
      const p = lib.getProject(id)
      if (!p) return []
      return [
        {
          key: 'pin',
          label: p.pinned ? 'Unpin' : 'Pin',
          icon: <PinIcon />,
          shortcut: 'P',
          run: () => lib.updateProject(id, { pinned: !p.pinned }, false),
        },
        { key: 'rename', label: 'Rename', icon: <PencilIcon />, shortcut: 'R', run: rename },
        { key: 'zip', label: 'Download project (.zip)', icon: <DownloadIcon />, run: () => void downloadProject(p) },
        { key: 'share', label: 'Share', icon: <ShareIcon />, hint: 'Needs an account' },
        {
          key: 'archive',
          label: p.archived ? 'Unarchive' : 'Archive',
          icon: <ArchiveIcon />,
          shortcut: 'A',
          run: () => lib.updateProject(id, { archived: !p.archived }, false),
          separatorBefore: true,
        },
        { key: 'delete', label: 'Delete', icon: <TrashIcon />, shortcut: 'D', run: () => setConfirmDelete(key), danger: true },
      ]
    }
    const a = lib.getAnalysis(id)
    if (!a) return []
    return [
      {
        key: 'pin',
        label: a.pinned ? 'Unpin' : 'Pin',
        icon: <PinIcon />,
        shortcut: 'P',
        run: () => lib.updateAnalysis(id, { pinned: !a.pinned }, false),
      },
      { key: 'rename', label: 'Rename', icon: <PencilIcon />, shortcut: 'R', run: rename },
      { key: 'move', label: 'Move to project…', icon: <MoveIcon />, shortcut: 'M', run: () => setMoveId(id) },
      ...(a.projectId
        ? [{ key: 'independent', label: 'Make independent', icon: <AnalysisIcon />, run: () => lib.moveAnalysis(id, null) }]
        : []),
      {
        key: 'csv',
        label: 'Export CSV',
        icon: <DownloadIcon />,
        run: () => exportCsvFor(a.result, a.threshold, a.name),
        separatorBefore: true,
      },
      { key: 'png', label: 'Export annotated PNG', icon: <DownloadIcon />, run: () => void exportPngFor(a.result, a.threshold, a.name) },
      { key: 'share', label: 'Share', icon: <ShareIcon />, hint: 'Needs an account' },
      {
        key: 'archive',
        label: a.archived ? 'Unarchive' : 'Archive',
        icon: <ArchiveIcon />,
        shortcut: 'A',
        run: () => lib.updateAnalysis(id, { archived: !a.archived }, false),
        separatorBefore: true,
      },
      { key: 'delete', label: 'Delete', icon: <TrashIcon />, shortcut: 'D', run: () => setConfirmDelete(key), danger: true },
    ]
  }

  const onCsv = () => {
    if (result) exportCsvFor(result, threshold, name ?? result.input.filename)
  }
  const onPng = () => {
    if (result) void exportPngFor(result, threshold, name ?? result.input.filename)
  }

  const select = (from: 'box' | 'row') => (id: number) => {
    if (result) setSel({ runId: result.run_id, id, from })
  }

  const busy = run.status === 'queued' || run.status === 'uploading' || run.status === 'running'
  const canRun = !projectViewId && !!source && !metaInvalid && !busy
  const runCurrent = useCallback(() => {
    if (source && !busy) startRun(source, mode)
  }, [source, busy, startRun, mode])

  // Ctrl/Cmd + Enter runs detection (or the project queue) from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey)) return
      if (canRun) {
        e.preventDefault()
        runCurrent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canRun, runCurrent])

  // On a phone the results sit below the fold: bring them into view when a run finishes.
  useEffect(() => {
    if (run.status !== 'done' || !window.matchMedia?.('(max-width: 820px)').matches) return
    document.getElementById('viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [run.status])

  const home = !projectViewId && !draft && !source && !result && run.status === 'idle'
  // Steps 2 and 3 (right panel) only while setting up or running an analysis: not in the
  // project window and not once a result is on screen.
  const showSetup = !viewedProject && !(result && !busy)

  const placeholder =
    run.status === 'queued'
      ? 'Waiting for the detector server…'
      : run.status === 'uploading' || run.status === 'running'
        ? 'Running detection…'
        : run.status === 'error'
          ? 'No result. See the message above'
          : source
            ? 'Ready to run'
            : 'Choose a sample or upload a B-scan to start'

  const title = viewedProject ? viewedProject.name : draft ? 'New analysis' : (name ?? sourceTitle(source))
  // "Project / analysis" in the top bar, like the project / chat title on claude.ai.
  const crumbProject = draft ? draftProject : parentProject
  const crumb = crumbProject ? { label: crumbProject.name, onClick: () => openProject(crumbProject.id) } : null
  const chip = viewedProject
    ? `Project · ${analysesOf(libOk?.analyses ?? [], viewedProject.id).length} B-scans`
    : draft
      ? `${draft.items.length} selected`
      : source || !result
        ? kindLabel(source)
        : result.input.kind === 'image'
          ? 'Saved · image'
          : 'Saved · gprMax'
  const topKey: ItemKey | null = viewedProject ? `p:${viewedProject.id}` : draft ? null : analysisId ? `a:${analysisId}` : null

  const nav = {
    library: lib.state,
    current: { projectId: projectViewId ?? draft?.projectId ?? currentAnalysis?.projectId ?? null, analysisId },
    renaming: listRenaming,
    menuOpen: menu?.from === 'list' ? menu.key : null,
    onRename: renameItem,
    onMenu: (key: ItemKey, anchor: HTMLElement) => toggleMenu(key, anchor, 'list'),
  }

  const deleting = confirmDelete
    ? confirmDelete.startsWith('p:')
      ? { kind: 'project' as const, item: lib.getProject(confirmDelete.slice(2)) }
      : { kind: 'analysis' as const, item: lib.getAnalysis(confirmDelete.slice(2)) }
    : null
  const deletingCount = deleting?.kind === 'project' && deleting.item && libOk ? analysesOf(libOk.analyses, deleting.item.id).length : 0

  return (
    <div className={'app' + (home ? ' first-screen' : '')}>
      {panels.leftOpen && (
        <>
          <LeftNav
            width={panels.leftW}
            samples={samples}
            activeSampleId={!projectViewId && !draft && source?.type === 'sample' ? source.sample.id : null}
            onPickSample={pickSample}
            onNewAnalysis={goHome}
            onNewProject={newProject}
            onHide={panels.toggleLeft}
            onSignIn={() => setDialog('auth')}
            onSettings={() => setDialog('settings')}
            onHome={goHome}
            showSamples={settings.showSamples}
            projectsNav={<ProjectsNav {...nav} onOpenProject={openProject} onOpenAnalysis={openAnalysis} />}
            analysesNav={<AnalysesNav {...nav} onOpenAnalysis={openAnalysis} onSignIn={() => setDialog('auth')} />}
          />
          <ResizeHandle side="left" width={panels.leftW} onResize={panels.setLeftW} label="Resize side menu (arrow keys)" />
        </>
      )}

      <main className="main" style={{ flex: '999 1 560px', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          title={title}
          crumb={crumb}
          editable={!draft}
          customTitle={viewedProject ? true : name != null}
          onRename={renameTitle}
          renaming={renamingTitle}
          onRenamingChange={setRenamingTitle}
          onProjectMenu={topKey ? (anchor) => toggleMenu(topKey, anchor, 'top') : null}
          projectMenuOpen={menu?.from === 'top'}
          onInfo={() => setDialog('info')}
          kindLabel={chip}
          theme={theme}
          onToggleTheme={toggleTheme}
          leftOpen={panels.leftOpen}
          rightOpen={panels.rightOpen}
          rightAvailable={showSetup}
          onToggleLeft={panels.toggleLeft}
          onToggleRight={panels.toggleRight}
        />
        <div className="scroll main-scroll" style={{ flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, maxWidth: 1200, width: '100%', margin: '0 auto' }}>
            <StatusBanner
              backend={backend.status}
              slow={backend.slow}
              onRetryBackend={backend.retry}
              run={run}
              warnings={result?.warnings ?? []}
              notice={notice}
            />
            {viewedProject ? (
              <ProjectView
                project={viewedProject}
                analyses={analysesOf(libOk?.analyses ?? [], viewedProject.id)}
                queue={projectQueue}
                running={batch.runningProject === viewedProject.id}
                paused={batch.paused}
                zipping={zipping}
                onNewAnalysis={() => newAnalysisInProject(viewedProject.id)}
                onPause={batch.pause}
                onResume={batch.resume}
                onRetryFailed={() => batch.retryFailed(viewedProject.id)}
                onRemoveQueued={batch.removeItem}
                onOpen={openAnalysis}
                onMenu={(id, anchor) => toggleMenu(`a:${id}`, anchor, 'list')}
                menuOpenId={menu?.from === 'list' && menu.key.startsWith('a:') ? menu.key.slice(2) : null}
                onCsv={(a) => exportCsvFor(a.result, a.threshold, a.name)}
                onPng={(a) => void exportPngFor(a.result, a.threshold, a.name)}
                onZip={() => void downloadProject(viewedProject)}
              />
            ) : draft && draftProject ? (
              <NewAnalysisView
                project={draftProject}
                items={draft.items}
                rejected={rejected}
                modeLabel={mode === 'full' ? 'Full pipeline' : 'Detector only'}
                canRun={canRunDraft}
                onAddFiles={(files) => void addDraftFiles(files)}
                onRemove={(key) => setDraft((d) => (d ? { ...d, items: d.items.filter((i) => i.key !== key) } : d))}
                onRun={runDraft}
                onCancel={() => openProject(draft.projectId)}
              />
            ) : home ? (
              <EmptyState
                fileError={fileError}
                checking={checking}
                showSamples={settings.showSamples}
                samples={samples}
                onPickSample={pickSample}
                onFile={pickFile}
                waking={backend.status === 'waking'}
              />
            ) : (
              <>
                {!result && (
                  <section className="input-step card" aria-label="Input B-Scan">
                    <p className="sec-title">1 · Input B-Scan</p>
                    <UploadDrop
                      onFile={pickFile}
                      fileName={!source ? null : source.type === 'file' ? source.file.name : `${source.sample.name} · bundled sample`}
                      error={fileError}
                      checking={checking}
                    />
                  </section>
                )}
                <Viewer
                  result={result}
                  mode={mode}
                  view={view}
                  onView={setView}
                  threshold={threshold}
                  onThreshold={setThreshold}
                  shown={shown}
                  selectedId={selectedId}
                  scrollToId={current?.from === 'row' ? current.id : null}
                  onSelect={select('box')}
                  placeholder={placeholder}
                  busy={busy}
                  onRun={source && run.status !== 'error' && !busy && !result ? runCurrent : null}
                  canRun={canRun}
                />
                <DetectionsTable
                  shown={shown}
                  total={result ? result.detections.length : null}
                  selectedId={selectedId}
                  scrollToId={current?.from === 'box' ? current.id : null}
                  onSelect={select('row')}
                  onCsv={onCsv}
                  onPng={onPng}
                  exporting={exporting}
                  threshold={threshold}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {panels.rightOpen && showSetup && (
        <>
          <ResizeHandle side="right" width={panels.rightW} onResize={panels.setRightW} label="Resize input panel (arrow keys)" />
          <InputPanel
            width={panels.rightW}
            source={draft ? null : source}
            mode={mode}
            onMode={setMode}
            modes={settings.modes}
            metaOpen={metaOpen}
            onToggleMeta={() => setMetaOpen((o) => !o)}
            meta={meta}
            onMeta={(f: MetaField, v: string) => setMeta((m) => ({ ...m, [f]: v }))}
            metaErrors={metaErrors}
            run={run}
            onRun={runCurrent}
            canRun={!!source && !metaInvalid}
            modelRevision={backend.health?.model.revision ?? null}
            batch={
              draft
                ? {
                    count: draft.items.length,
                    kind: draftKind,
                    canRun: canRunDraft,
                    onRun: runDraft,
                  }
                : null
            }
          />
        </>
      )}

      {menu && (
        <ItemMenu
          label={`Options for ${menu.key.startsWith('p:') ? lib.getProject(menu.key.slice(2))?.name : lib.getAnalysis(menu.key.slice(2))?.name}`}
          items={menuItems(menu.key, menu.from)}
          anchor={menu.anchor}
          align={menu.from === 'top' ? 'start' : 'end'}
          onClose={() => setMenu(null)}
        />
      )}

      <MoveDialog
        analysis={moveId ? lib.getAnalysis(moveId) : null}
        projects={libOk?.projects ?? []}
        onClose={() => setMoveId(null)}
        onMove={moveAnalysis}
      />

      <Dialog
        open={!!deleting?.item}
        onClose={() => {
          setConfirmDelete(null)
          setDeleteWithAnalyses(false)
        }}
        title={deleting?.kind === 'project' ? 'Delete project?' : 'Delete analysis?'}
        width={420}
      >
        <p style={{ fontSize: 13 }}>
          {deleting?.kind === 'project'
            ? `“${deleting.item?.name}” will be deleted from this browser`
            : `“${deleting?.item?.name}” and its result will be deleted from this browser. This cannot be undone.`}
        </p>
        {deleting?.kind === 'project' && deletingCount > 0 && (
          <label className="check">
            <input type="checkbox" checked={deleteWithAnalyses} onChange={(e) => setDeleteWithAnalyses(e.target.checked)} />
            <span>
              <span className="check-label">
                Also delete its {deletingCount} analys{deletingCount === 1 ? 'is' : 'es'}
              </span>
              <span className="check-hint">Otherwise they move to Analyses as independent analyses</span>
            </span>
          </label>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setConfirmDelete(null)
              setDeleteWithAnalyses(false)
            }}
          >
            Cancel
          </button>
          <button type="button" className="btn danger solid" onClick={doDelete}>
            Delete
          </button>
        </div>
      </Dialog>

      <AuthDialog open={dialog === 'auth'} onClose={() => setDialog(null)} />
      <InfoDialog open={dialog === 'info'} onClose={() => setDialog(null)} />
      <SettingsDialog
        open={dialog === 'settings'}
        onClose={() => setDialog(null)}
        settings={settings}
        onChange={updateSettings}
        account={currentAccount()}
      />
    </div>
  )
}
