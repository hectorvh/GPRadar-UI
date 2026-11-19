# Release checklist 1.2.0

Walked through on 2026-11-19, working tree of `release/1.2.0` with the
17 Nov patch (uncommitted; version still 1.1.0). Lines 6 and 12 failed at
first; they were fixed and rechecked the same day (see *Fixes applied*).

Setup: GPRadar-API run locally with uvicorn (model `best.onnx` at revision
`6927e741…`, SHA-256 `965ab4f7…` as in the API README), UI dev server with
`VITE_API_URL=http://localhost:8000`. Browser: Chromium 131 (Playwright),
at 1440 × 900 and 390 × 844 (touch, 2×), each in light and dark.

## Build

| Step | Result |
| --- | --- |
| `npm ci` | OK. `npm audit`: 9 moderate (minimatch, dev dependency chain) |
| `npm run lint` | OK, no findings (also after the fixes) |
| `npm test` | OK, 9 files, 82 tests (also after the fixes) |
| `VITE_API_URL=https://api.gpradar.hectorvh.com npm run build` | OK, no warnings. After the fixes: JS 332.1 kB (103.8 kB gzip), CSS 44.0 kB (19.2 kB gzip) |
| `dist/_headers` | `connect-src 'self' https://api.gpradar.hectorvh.com`, nothing else new; identical to the live CSP (same theme-script hash) |

## Checklist

| # | Check | Result | Note |
| --- | --- | --- | --- |
| 1 | Home: step 1 "1 · Input B-Scan" in the main column, figure, "Or try a sample" cards without arrows, three steps | Pass | All four sizes/themes. |
| 2 | Right panel shows only 2 · Processing and 3 · Metadata; hidden in the project window and once a result is shown (its top-bar toggle too) | Pass | Also holds the Run button and Run info, as the README says. On a phone the top-bar toggle is still shown on Home, where the panel is hidden by CSS; clicking it does nothing visible (minor, see notes). |
| 3 | Run Utility (Mendeley) from Home: result, listed under Analyses, still there after reload; rename from the title; CSV and annotated PNG download | Pass | Desktop light and phone dark. Files `gpradar_Pipe_test_2026-11-19.csv` / `.png`. |
| 4 | + next to Projects creates "Project 1"; New analysis takes 2 files (no samples), one mode for both, "Run 2 B-scans"; both appear; Pause / Resume and Retry failed appear when they should | Pass | Pause and Retry tested with a slowed and a forced-500 `/run` in the test browser. The summary first counted a failed item as "1 queued"; fixed, it now reads "2 queued" while running and "1 failed" after a failure. |
| 5 | Open an analysis from the project: title "Project 1 / name", no duplicate name; the project part goes back | Pass | |
| 6 | Menus (… and ⌄): Pin, Rename, Move to project… (other, new, none), Make independent, Archive, Delete; deleting a project with and without its analyses | Pass (after fix) | Was a fail: the *New project* name field was 22 px wide. Rechecked at 390 and 1440 px, light and dark: field 284 / 348 px, radios and checkboxes still 16 px, whole menu flow passes on both sizes. |
| 7 | Download project (.zip): a folder per analysis with CSV and PNG, plus summary.csv | Pass | Duplicate names get `_2`. |
| 8 | Settings: View samples hides samples; switching off a mode leaves the other one; Danger Zone button disabled for a guest | Pass | Input panel then shows "Detector only · set in Settings". |
| 9 | About: licence, API source (AGPL), GitHub, model, dataset DOI links work. Sign in: forms validate, then say accounts are not available | Pass | All links return 200 and open in a new tab. |
| 10 | Logo without background: dark in light mode, light in dark mode; favicon follows the browser theme | Pass | Logo and favicon #00293A (light) / #C4FFFB (dark), transparent background. |
| 11 | Disclaimer: "about 90% of buried utilities and 50% of voids*", details under Limitations | Pass | |
| 12 | No horizontal scrolling at 390 px; no console errors | Pass (after fix) | Was a fail: the project window was 562 px wide at 390 px. Rechecked: page width equals the viewport (390 / 1440) on Home, result, project window (with and without a failed row) and with dialogs open; dialogs centred. No console errors other than the forced 500. |
| 13 | Live check after deploy: Home loads, one sample runs, favicon and link preview (og-image.png) are new | Not run | Owner does this after deploy. |

## Fixes applied

### 6 · New project name field is 22 px wide

- File: `src/styles/base.css:359`
- Cause: `.check input { width: 16px; … }` is meant for the radio and
  checkbox, but also matches the text field nested in the *New project*
  label of `MoveDialog.tsx`. It has the same specificity as `.field input`
  and comes later, so it wins.
- Fix: the rule now targets the control only: `.check > input` and
  `.check > input:disabled`. Every radio and checkbox in a `.check` label
  (Move, Settings, delete project) is a direct child, so they keep 16 px.

### 12 · Project window wider than a 390 px screen

- File: `src/components/ProjectView.tsx:93` (wrapper) and `:101` (cause)
- Cause: the last header cell holds `<span className="sr">Actions</span>`.
  `.sr` is `position: absolute`, and no ancestor up to `<body>` is
  positioned, so the span escapes the table's `overflow-x: auto` wrapper and
  sits at x = 562, widening the page. Verified: adding `position: relative`
  to the cells brings the page back to 390 px.
- Fix: `position: 'relative'` on the `overflowX: 'auto'` wrappers in
  `ProjectView.tsx` and `src/components/DetectionsTable.tsx` (the second
  as a guard; no overflow was seen there).

### 4 · Failed items counted as queued

- File: `src/components/ProjectView.tsx` (summary under the project name)
- Fix: "N queued" counts pending, running and waiting items only; "N
  failed" is shown separately when there are any.

## Other notes (not in the list)

- Left as is (the 2.0 mobile layout replaces it): phone Home: the "Hide setup panel" toggle is shown although
  `.first-screen .inputpanel` is hidden (`src/styles/base.css:401`).
  Possible fix: pass `rightAvailable={showSetup && !home}` to `TopBar` in
  `src/App.tsx` on narrow screens, or hide the toggle with the same media
  query.
- Left as is: phone: the side menu stays open after *New project* or a
  sample click in it, so the result is below the menu. The 2.0 mobile
  drawer covers this.
- Phone: the project table shows B-scan and Mode; Detections, Status and
  actions are reached by scrolling the table sideways, with no visual hint.
- Local API reported `model.revision: unknown` (no `MODEL_REVISION` set
  locally), so Run info and the CSVs say `unknown`. The live API reports the
  revision.
