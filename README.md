# GPRadar-UI

[![License](https://img.shields.io/github/license/hectorvh/GPRadar-UI)](https://github.com/hectorvh/GPRadar-UI/blob/main/LICENSE)
[![Live demo](https://img.shields.io/website?url=https%3A%2F%2Fgpradar.hectorvh.com&label=live%20demo&up_message=online&down_message=offline)](https://gpradar.hectorvh.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node 22](https://img.shields.io/badge/node-22-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Last commit](https://img.shields.io/github/last-commit/hectorvh/GPRadar-UI)](https://github.com/hectorvh/GPRadar-UI/commits/main)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24339830.svg)](https://doi.org/10.5281/zenodo.24339830)

Web interface for **GPRadar**, a prototype that detects hyperbolas (buried
pipes, cables, voids) in ground-penetrating radar B-scans with a YOLO model.

Pick a bundled sample or upload a B-scan (PNG/JPG) or a gprMax output file
(`.out`, `.h5`). The app sends it to
[GPRadar-API](https://github.com/hectorvh/GPRadar-API), then shows the
radargram with detection boxes, axes and a detections table. You can filter
detections by confidence and export them as CSV or as an annotated PNG.

It is a static Vite + React + TypeScript app with no backend of its own.

> **Prototype.** Detections can be missed or wrong, and depths are
> approximate. Do not rely on them for excavation or engineering decisions.

## How to run

You need **Node.js 22** and a running **GPRadar-API**.

1. **Start the API** on `http://localhost:8000` by following the
   [GPRadar-API README](https://github.com/hectorvh/GPRadar-API). By default
   the API accepts requests from `http://localhost:5173`.

2. **Start the interface:**

   ```sh
   npm install
   cp .env.example .env.local   # sets VITE_API_URL=http://localhost:8000
   npm run dev
   ```

3. **Open** <http://localhost:5173> and click a sample in the left menu.

If the API runs somewhere else, change `VITE_API_URL` in `.env.local`. This
value ends up in the public JavaScript, so never put secrets in it.

## Other commands

| Command | What it does |
| --- | --- |
| `npm test` | Run the unit tests |
| `npm run lint` | Check the code with ESLint |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site on <http://localhost:4173> |

To build for a deployed API, set the URL at build time:

```sh
VITE_API_URL=https://your-api.example.org npm run build
```

## Deploying to Netlify

`netlify.toml` already holds the build settings. In the Netlify site
settings, set `VITE_API_URL` to the API's public URL. On the API side, add
the Netlify address to `ALLOWED_ORIGINS`. The build also writes the
Content-Security-Policy to `dist/_headers`.

## Related projects

- [GPRadar](https://github.com/hectorvh/GPRadar): research code, data and training
- [GPRadar-API](https://github.com/hectorvh/GPRadar-API): the detector service (AGPL-3.0)
- [gpradar-hyperbola-yolo](https://huggingface.co/hectorvh/gpradar-hyperbola-yolo): the model on Hugging Face

## Licence

MIT. See [LICENSE](LICENSE). Real-scan samples come from Mojahid et al. (2025),
Mendeley Data, [DOI 10.17632/ww7fd9t325.1](https://doi.org/10.17632/ww7fd9t325.1)
(CC BY 4.0).
