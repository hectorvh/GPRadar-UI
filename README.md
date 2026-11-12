# GPRadar-UI

Web frontend for **GPRadar**, a prototype that finds hyperbolas (buried pipes,
cables, voids) in ground-penetrating radar B-scans with a YOLO model.

Upload a gprMax output file (`.out`, `.h5`) or a PNG/JPG B-scan, or pick a
bundled sample. [GPRadar-API](https://github.com/hectorvh/GPRadar-API) runs
the preprocessing and the detector, and this app shows the radargram with
boxes, axes (time, distance, approximate depth) and a detections table. The
confidence threshold filters in the browser. CSV and annotated-PNG exports are
also made in the browser, so the free backend does less work.

It is a static Vite + React + TypeScript app. The browser talks to the API
directly; there is no server of its own, no accounts and no tracking.

> **Prototype.** Detections can be missed or false, and depths assume one
> constant velocity. Verify results independently before any excavation or
> engineering decision.

## Related projects

| | |
| --- | --- |
| [GPRadar](https://github.com/hectorvh/GPRadar) | Research code: data, training, evaluation |
| [GPRadar-API](https://github.com/hectorvh/GPRadar-API) | Detector service this app calls (FastAPI + ONNX Runtime). **AGPL-3.0** |
| [hectorvh/gpradar-hyperbola-yolo](https://huggingface.co/hectorvh/gpradar-hyperbola-yolo) | The YOLO model on Hugging Face |

## Run locally against a local API

Requirements: Node.js 22 and a running GPRadar-API.

1. Start GPRadar-API on port 8000 (see its README for the model download).
   The API allows `http://localhost:5173` by default (`ALLOWED_ORIGINS`).
2. In this repository:

   ```sh
   npm install
   cp .env.example .env.local   # VITE_API_URL=http://localhost:8000
   npm run dev                  # http://localhost:5173
   ```

On load the app calls `GET /health` (it waits up to 75 s, because a sleeping
free host can take that long to wake), then `GET /samples`. Clicking a sample
runs it. Uploaded files are checked in the browser (extension, size, magic
bytes) before they are sent.

### Configuration

| Variable | Used at | Example |
| --- | --- | --- |
| `VITE_API_URL` | **build time** (and `npm run dev`) | `http://localhost:8000`, `https://gpradar-api.onrender.com` |

Vite inlines `VITE_*` variables into the public JavaScript bundle. **Never
put secrets in them.** The API URL is public by design.

If `VITE_API_URL` is unset, `npm run build` warns and falls back to
`http://localhost:8000`. On Netlify, where `NETLIFY=true`, the build fails
instead, so a broken deploy cannot go out.

## Scripts

| | |
| --- | --- |
| `npm run dev` | Dev server with hot reload on port 5173 |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve `dist/` locally on port 4173 |
| `npm test` | Vitest: CSV export, file validation, threshold filtering, box geometry, CSP generation |
| `npm run lint` | ESLint (also rejects `dangerouslySetInnerHTML`) |

## Build

```sh
VITE_API_URL=https://your-api.example.org npm run build
```

The build writes static files to `dist/`. Hashed assets go in `dist/assets/`.
Fonts (Inter, JetBrains Mono) are self-hosted from the fontsource packages,
so there are no requests to Google Fonts or any other third party.

The build also writes `dist/_headers` with the Content-Security-Policy (see
below).

## Deploy on Netlify

1. Create a site from this repository. Netlify reads `netlify.toml`: it runs
   `npm run build` on Node 22 and publishes `dist`.
2. Under **Site configuration → Environment variables**, set `VITE_API_URL`
   to the API's public URL (Render in v1.1, Cloud Run in v1.2).
3. On the API side, add the Netlify origin (e.g. `https://gpradar.netlify.app`)
   to `ALLOWED_ORIGINS`, or the browser will block the requests (CORS).
4. Changing `VITE_API_URL` needs a new deploy, because the value is baked in
   at build time.

### Security headers

`netlify.toml` sets `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` and long-lived caching for `/assets/*`.

The **Content-Security-Policy** needs two values that change: the API origin
(for `connect-src`) and the hash of the small inline script in `index.html`
that sets the theme before React loads, which prevents a light flash in dark
mode. `netlify.toml` cannot read environment variables, so `build/csp.ts`
computes both at build time and writes `dist/_headers`. Netlify merges that
file with `netlify.toml`. If you edit the inline script, the hash updates on
the next build, and a unit test checks that it matches.

## Project layout

```
src/
  App.tsx              layout: LeftNav | handle | Main | handle | InputPanel
  styles/              tokens.css (light/dark variables), base.css (components)
  components/          LeftNav, TopBar, Viewer, BoxOverlay, Axes, DetectionsTable,
                       InputPanel, UploadDrop, ModeToggle, MetadataForm,
                       StatusBanner, ResizeHandle, Footer
  hooks/               useTheme, usePanels, useBackend, useRun
  lib/                 api, types (= API contract), csv, exportPng, validate,
                       detections, metadata, format
build/csp.ts           CSP → dist/_headers
design/                the original design mockup (reference only, not shipped)
```

`design/` holds the mockup the UI was built from. See
[design/README.md](design/README.md). The build does not include it.

## Licence

The frontend is [MIT](LICENSE). The API it talks to,
[GPRadar-API](https://github.com/hectorvh/GPRadar-API), is AGPL-3.0.
Real-scan samples come from Mojahid et al. (2025), Mendeley Data,
[DOI 10.17632/ww7fd9t325.1](https://doi.org/10.17632/ww7fd9t325.1) (CC BY 4.0).
The synthetic samples were simulated with gprMax (Warren et al. 2016).
