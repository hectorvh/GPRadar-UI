import { useCallback, useMemo, useRef, useState } from 'react'
import { DetectionsTable } from './components/DetectionsTable'
import { Footer } from './components/Footer'
import { InputPanel } from './components/InputPanel'
import { LeftNav } from './components/LeftNav'
import { ResizeHandle } from './components/ResizeHandle'
import { StatusBanner } from './components/StatusBanner'
import { TopBar } from './components/TopBar'
import { Viewer, type View } from './components/Viewer'
import { useBackend, useSamples } from './hooks/useBackend'
import { usePanels } from './hooks/usePanels'
import { useRun } from './hooks/useRun'
import { useTheme } from './hooks/useTheme'
import { downloadBlob, detectionsToCsv, exportFilename } from './lib/csv'
import { THRESHOLD_DEFAULT, filterByThreshold } from './lib/detections'
import { annotatedPng } from './lib/exportPng'
import { EMPTY_META, parseMetadata, type MetaStrings } from './lib/metadata'
import { kindLabel, sourceKind, sourceTitle, type Source } from './lib/source'
import type { Detection, MetaField, Mode, Sample } from './lib/types'
import { validateFile } from './lib/validate'

type Selection = { runId: string; id: number; from: 'box' | 'row' }

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme()
  const panels = usePanels()
  const backend = useBackend()
  const ready = backend.status === 'ok'
  const samples = useSamples(ready)
  const run = useRun(ready)

  const [source, setSource] = useState<Source | null>(null)
  const [mode, setMode] = useState<Mode>('full')
  const [view, setView] = useState<View>('processed')
  const [threshold, setThreshold] = useState(THRESHOLD_DEFAULT)
  const [meta, setMeta] = useState<MetaStrings>(EMPTY_META)
  const [metaOpen, setMetaOpen] = useState(true)
  const [sel, setSel] = useState<Selection | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const fileToken = useRef(0)

  const { values: metaValues, errors: metaErrors } = useMemo(() => parseMetadata(meta), [meta])
  const metaInvalid = Object.keys(metaErrors).length > 0

  const result = run.result
  const shown = useMemo(() => (result ? filterByThreshold(result.detections, threshold) : []), [result, threshold])
  const topId = useMemo(
    () => result?.detections.reduce<Detection | null>((best, d) => (!best || d.confidence > best.confidence ? d : best), null)?.id ?? null,
    [result],
  )
  const current = result && sel?.runId === result.run_id ? sel : null
  const selectedId = current ? current.id : topId

  const startRun = useCallback(
    (src: Source, m: Mode) => {
      if (metaInvalid) {
        setMetaOpen(true)
        return
      }
      setNotice(null)
      setView('processed')
      const base = { mode: m, metadata: metaValues }
      run.run(src.type === 'sample' ? { ...base, sampleId: src.sample.id } : { ...base, file: src.file }, sourceKind(src))
    },
    [metaInvalid, metaValues, run],
  )

  const pickSample = (s: Sample) => {
    fileToken.current++
    const src: Source = { type: 'sample', sample: s }
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
    const v = await validateFile(file).catch(() => ({ ok: false as const, message: 'The file could not be read.' }))
    if (token !== fileToken.current) return
    setChecking(false)
    if (!v.ok) {
      setFileError(v.message)
      return
    }
    run.reset()
    setSource({ type: 'file', file, kind: v.kind })
    setMode(v.kind === 'image' ? 'detector' : 'full')
  }

  const newAnalysis = () => {
    fileToken.current++
    run.reset()
    setSource(null)
    setMode('full')
    setMeta(EMPTY_META)
    setFileError(null)
    setChecking(false)
    setNotice(null)
  }

  const select = (from: 'box' | 'row') => (id: number) => {
    if (result) setSel({ runId: result.run_id, id, from })
  }

  const onCsv = () => {
    if (!result) return
    const now = new Date()
    const csv = detectionsToCsv(result.detections, {
      mode: result.mode,
      revision: result.model.revision,
      threshold,
      velocity: result.metadata.velocity_m_ns.value,
      date: now,
    })
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), exportFilename(result.input.filename, now, 'csv'))
  }

  const onPng = async () => {
    if (!result) return
    setExporting(true)
    setNotice(null)
    try {
      const blob = await annotatedPng(result, threshold)
      downloadBlob(blob, exportFilename(result.input.filename, new Date(), 'png'))
    } catch {
      setNotice('The annotated PNG could not be created in this browser.')
    } finally {
      setExporting(false)
    }
  }

  const placeholder =
    run.status === 'queued'
      ? 'Waiting for the detector server…'
      : run.status === 'uploading' || run.status === 'running'
        ? 'Running detection…'
        : run.status === 'error'
          ? 'No result. See the message above.'
          : source
            ? 'Ready. Press Run detection.'
            : 'Choose a sample or upload a B-scan to start.'

  return (
    <div className="app">
      {panels.leftOpen && (
        <>
          <LeftNav
            width={panels.leftW}
            samples={samples}
            activeSampleId={source?.type === 'sample' ? source.sample.id : null}
            onPickSample={pickSample}
            onNewAnalysis={newAnalysis}
            onHide={panels.toggleLeft}
          />
          <ResizeHandle side="left" width={panels.leftW} onResize={panels.setLeftW} label="Resize project menu (arrow keys)" />
        </>
      )}

      <main style={{ flex: '999 1 560px', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          title={sourceTitle(source)}
          kindLabel={kindLabel(source)}
          theme={theme}
          onToggleTheme={toggleTheme}
          leftOpen={panels.leftOpen}
          rightOpen={panels.rightOpen}
          onToggleLeft={panels.toggleLeft}
          onToggleRight={panels.toggleRight}
        />
        <div className="scroll" style={{ flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, maxWidth: 1200, width: '100%', margin: '0 auto' }}>
            <StatusBanner
              backend={backend.status}
              slow={backend.slow}
              onRetryBackend={backend.retry}
              run={run}
              warnings={result?.warnings ?? []}
              notice={notice}
            />
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
            <Footer />
          </div>
        </div>
      </main>

      {panels.rightOpen && (
        <>
          <ResizeHandle side="right" width={panels.rightW} onResize={panels.setRightW} label="Resize input panel (arrow keys)" />
          <InputPanel
            width={panels.rightW}
            source={source}
            samples={samples}
            onPickSample={pickSample}
            onFile={pickFile}
            fileError={fileError}
            checkingFile={checking}
            mode={mode}
            onMode={setMode}
            metaOpen={metaOpen}
            onToggleMeta={() => setMetaOpen((o) => !o)}
            meta={meta}
            onMeta={(f: MetaField, v: string) => setMeta((m) => ({ ...m, [f]: v }))}
            metaErrors={metaErrors}
            run={run}
            onRun={() => source && startRun(source, mode)}
            canRun={!!source && !metaInvalid}
            modelRevision={backend.health?.model.revision ?? null}
          />
        </>
      )}
    </div>
  )
}
