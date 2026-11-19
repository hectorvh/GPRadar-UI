# GPRadar · Detector workspace — design reference

This is a design mockup created in a visual design tool, exported as a
standalone page. Treat it as a REFERENCE MOCKUP, not production code:
the markup and inline styles carry the design's precise values — colors,
font sizes, spacing, radii, shadows, layout — which an implementation
should replicate faithfully in its own components and styling system
rather than copy wholesale.

## Contents

- `Main.dc.html` — the artboard (a Design Component: an `<x-dc>`
  template + a small logic class). The values to replicate live in its
  inline `style="…"` attributes and the `<helmet><style>` block.
- `support.js`, `vendor/react*.js` — the runtime that renders the
  component in a browser; not part of the design.

## Viewing

Serve the folder (e.g. `python3 -m http.server`) and open `Main.dc.html`;
some browsers block the scripts over file://.

## How the app differs from the mockup

The mockup is the reference for colours, type, spacing and the three-column
layout. The app has since changed in these places:

- **Logo.** Option E from `brand/logo-options.html` (viewfinder brackets
  around a hyperbola), without a background tile: dark mark in light mode,
  light mark in dark mode. Mini icons for samples, analyses and projects
  reuse its lines. Sources are in `brand/`.
- **Home screen.** Instead of an empty radargram placeholder, the main
  column shows `EmptyState`: a short explanation, a figure from the GPRadar
  repo (detections on real scans), sample cards and a three-step guide.
- **Projects and analyses.** Side menu sections Samples / Projects (+ to
  create) / Analyses; a project window (table of analyses, New analysis,
  zip download); a New analysis window for several B-scans with one setup;
  … and ⌄ options menus; a Move dialog; *Project / analysis* title in the
  top bar.
- **Side menu.** *Samples*, *Projects* and *Analyses* are collapsible sections.
  Citations are shortened to author, year and licence (full text on hover);
  the search box only appears with six or more samples; the disclaimer is
  shorter, with the details behind *Limitations*. *Sign in* is a small ghost
  button at the bottom that opens a dialog (Log in / Sign up / Continue as
  guest), with a ⚙ *Settings* button next to it (View samples, processing
  modes, Danger Zone).
- **Top bar.** The title is the analysis name and can be renamed in place.
  The info button opens an About dialog with the licences, links and data
  credits that used to be in the page footer; there is no footer now.
- **Input panel.** Step 1 (*1 · Input B-Scan*, *Drop or browse*, *Raw
  (.out, .h5) or PNG / JPG*) moved to the main column; the right panel keeps
  2 · Processing and 3 · Metadata and is hidden in the project window and
  when a result is shown. No sample buttons; the Run button has no shortcut
  label.
- **Phones.** Below 820 px the order is top bar, results, input panel, and
  the side menu starts closed.

## Brand sources (`brand/`)

- `logo-mark.svg` / `logo-mark-dark.svg`: the logo (option E), no
  background, for light and dark backgrounds. `public/favicon.svg` holds both and switches with
  the browser theme.
- `icon-full-bleed.svg`: square, full-bleed version for app icons.
- `logo-options.html`: the eight two-colour alternatives (A–H) that were compared; E was chosen. Each is shown in
  light mode (tile `#00293A`, mark `#C4FFFB`) and dark mode (tile `#C4FFFB`,
  mark `#00202D`) at 72, 32 and 16 px. Open it in a browser.
- `og-image.html`: the 1200 × 630 social preview; open it next to
  `logo-mark-dark.svg` and take a 1200 × 630 screenshot to rebuild
  `public/og-image.png`.
