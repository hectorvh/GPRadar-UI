# Next version (2.0.0)

The branch `next` starts from release 1.2.0 and becomes 2.0.0 when it
replaces 1.2.0 on <https://gpradar.hectorvh.com>. Until then it is
previewed at <https://v2.gpradar.hectorvh.com>; the live site runs the
latest release from `main`.

The detector model stays v1 and the app keeps talking to GPRadar-API with
contract `api_version` 1.1 (`src/lib/types.ts`).

## Scope

- [ ] **Mobile layout**
  - [ ] Side menu as a drawer
  - [ ] Setup (steps 2 and 3) in a bottom sheet
  - [ ] Detections as cards instead of a table
  - [ ] Sticky Run button
- [ ] **Brand files for logo E made reproducible**
  - [ ] `npm run brand` regenerates the favicon, home-screen icons and
        `og-image.png` from the sources in `design/brand/`
- [ ] **Accounts** (Supabase Auth, EU region)
  - [ ] Email and password
  - [ ] Google
  - [ ] Continue as guest
  - [ ] Delete account
- [ ] **Projects and analyses moved from the browser to the account**
  - [ ] Supabase Postgres for projects and analyses
  - [ ] Supabase Storage for files
  - [ ] Row-level security
- [ ] **Preview, QA and release**
  - [ ] Preview at v2.gpradar.hectorvh.com: a second Netlify site that
        builds the `next` branch
  - [ ] QA on the preview
  - [ ] Merge `next` into `main` and release 2.0.0

## Not in this version

- New model
- New file formats
- API changes
