import { zipSync, strToU8 } from 'fflate'
import { csvField, detectionsToCsv } from './csv'
import { shownCount, uniqueStems, type Analysis, type Project } from './library'

export interface ZipOptions {
  /** Annotated PNG per analysis (canvas; injected so tests can stub it). */
  png?: (a: Analysis) => Promise<Blob>
  date?: Date
}

/**
 * One zip for a project: per analysis a CSV of its detections (at its own
 * threshold) and, if `png` is given, an annotated PNG; plus summary.csv.
 */
export async function projectZip(project: Project, analyses: Analysis[], opts: ZipOptions = {}): Promise<Uint8Array> {
  const date = opts.date ?? new Date()
  const stems = uniqueStems(analyses.map((a) => a.name))
  const files: Record<string, Uint8Array> = {}
  const summary = [
    ['analysis', 'file', 'kind', 'mode', 'threshold', 'detections_shown', 'detections_total', 'model_revision', 'csv', 'png'].join(','),
  ]

  for (let i = 0; i < analyses.length; i++) {
    const a = analyses[i]
    const stem = stems[i]
    const csv = detectionsToCsv(a.result.detections, {
      mode: a.result.mode,
      revision: a.result.model.revision,
      threshold: a.threshold,
      velocity: a.result.metadata.velocity_m_ns.value,
      date,
    })
    files[`${stem}/${stem}.csv`] = strToU8(csv)
    let pngName = ''
    if (opts.png) {
      try {
        files[`${stem}/${stem}_annotated.png`] = new Uint8Array(await (await opts.png(a)).arrayBuffer())
        pngName = `${stem}/${stem}_annotated.png`
      } catch {
        /* this analysis gets no PNG; the summary says so */
      }
    }
    summary.push(
      [
        a.name,
        a.result.input.filename,
        a.result.input.kind,
        a.result.mode,
        a.threshold.toFixed(2),
        shownCount(a),
        a.result.detections.length,
        a.result.model.revision,
        `${stem}/${stem}.csv`,
        pngName,
      ]
        .map((v) => csvField(v))
        .join(','),
    )
  }
  files['summary.csv'] = strToU8(
    `# GPRadar project: ${project.name.replace(/[\r\n]+/g, ' ')}\n# exported ${date.toISOString()}\n${summary.join('\n')}\n`,
  )
  return zipSync(files, { level: 6 })
}
