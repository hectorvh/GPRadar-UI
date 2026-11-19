# Changelog

## Unreleased

## 1.2.0 (2026-11-20)

### Added
- Projects and analyses (in the browser, IndexedDB). An analysis is one
  B-scan run; a project is a collection of analyses. Side menu sections:
  Samples, Projects (the open project lists its analyses), Analyses
  (independent ones).
- Project window with *New analysis* and *Download project (.zip)*. A
  project's New analysis takes one or more B-scans (files)
  that all run with the same setup (mode and metadata), one after another,
  and land in the project window; the queue starts by itself, with Pause /
  Resume and Retry failed. Each analysis downloads as CSV / annotated PNG,
  the project as a zip (CSV and PNG per analysis + `summary.csv`). Uses
  `fflate`.
- Top bar shows *Project / analysis* for an analysis inside a project.
- **+** in the Projects heading creates a project.
- Options menus (… on hover, ⌄ next to the title): Pin, Rename, Move to
  project… / Make independent (analyses), Download project (.zip), Export,
  Share (needs an account), Archive, Delete, with P / R / M / A / D keys.
  Deleting a project can keep its analyses as independent ones.
- Mini icons for samples, analyses and projects, drawn from the logo.
- Home screen figure from the GPRadar repo (hand labels vs detections on
  real Mendeley scans) instead of the drawn illustration; the logo goes home.
- Detector accuracy in the disclaimer in plain numbers ("In tests it found
  about 90% of buried utilities and 50% of voids"), with a * pointing to the
  test details under Limitations.
- Rename the analysis by clicking its title in the top bar; the name is used
  for export file names. *New analysis* resets it.
- *Sign in* button at the bottom of the side menu, opening a dialog with
  Log in, Sign up (email + password or Google) and Continue as guest. The
  account functions in `src/lib/auth.ts` are placeholders until a backend
  exists.
- About dialog behind the info button with the licences, source links and
  data credits.
- *Samples*, *Projects* and *Analyses* sections in the side menu can be opened or
  hidden; the state is remembered.
- Settings dialog (⚙ next to Sign in): View samples, which processing modes
  are offered (Full pipeline, Detector only; at least one stays on), and a
  GitHub-style Danger Zone with Delete account (type-to-confirm; disabled
  for guests; placeholder until accounts exist). Saved in the browser.
- New logo, option E (*Detection*): a hyperbola inside viewfinder brackets,
  no background, dark in light mode and light in dark mode. Used for the favicon (which
  follows the browser theme), home-screen icons, the in-app logo and a
  1200 × 630 social-preview image (`og-image.png`). The eight options that
  were compared are kept in `design/brand/logo-options.html`.
- `site.webmanifest`, Apple touch icon, `theme-color` and Open Graph /
  Twitter tags, so shared links show a title, description and image.
- First screen (`EmptyState`): what the tool does, sample cards that run on
  click, upload with drag-and-drop, and a three-step guide.
- Run button inside the viewer once an input is chosen.
- <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> runs detection (no label on
  the Run button).
- Loading skeletons while samples load; spinner in the viewer during a run.
- Phones: the page scrolls to the result when a run finishes.

### Changed
- Step 1 (Input B-Scan) moved from the right panel to the main column
  (Home, above the viewer, and a project's New analysis); the right panel
  keeps steps 2 and 3 and is hidden in the project window and once a result
  is shown.
- A project's New analysis takes files only (no samples).
- Side menu header: *by hectorvh* (GitHub) under the name, as on the live
  site. Main button *New analysis* (Home, single B-scan).
- Sample cards on Home have no arrows.
- Short texts (hints, labels, empty states, short messages) no longer end
  with a full stop; longer paragraphs keep it.
- Disclaimer: removed "Not for excavation or engineering decisions".
- Step 1 labels: *1 · Input B-Scan*, *Drop or browse*,
  *Raw (.out, .h5) or PNG / JPG*.
- Sample names: Utility (Mendeley), Void (Mendeley), 400 MHz (gprMax) (set
  in GPRadar-API `app/samples/manifest.json`).
- The page footer is gone; its content is in the About dialog.
- No sample buttons in the input panel.
- Side menu: short citations (full text on hover), data type under each
  sample, accent bar on the active sample, search only with six or more
  samples, shorter disclaimer with expandable *Limitations*.
- Top bar shows the logo when the side menu is hidden; buttons have tooltips.
- Phones (≤ 820 px): order is top bar, results, input panel; the side
  menu starts closed; the input panel is hidden on the first screen, which
  already has samples and upload.

### Fixed
- Disclaimer: corrected the training data. The shipped model was trained on
  real Mendeley scans only (not gprMax + Mendeley).
- Phones: the confidence slider no longer overflows the viewer.

## 1.1.0

- First public version: samples, upload, Full pipeline / Detector only,
  metadata, viewer with axes, detections table, CSV and annotated PNG export,
  light/dark theme, resizable side panels.
