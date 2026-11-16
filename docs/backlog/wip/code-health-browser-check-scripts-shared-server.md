---
area: code-health
opened: '2026-11-04'
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T09:00:00Z
---

# Share one gallery server helper across the four real-Chrome check scripts

## Context

`scripts/check-viewports.mjs`, `scripts/check-app-header-phone.mjs`, `scripts/check-joined-label.mjs` and `scripts/check-detail-sheet.mjs` each copy the same ~15-line preamble: a `DIST` path from `import.meta.url`, a `CHROME` constant (`CHROME_PATH` env or the macOS Chrome path), an identical MIME map, an `http.createServer` static file server with the same path-traversal guard, `server.listen(0)`, and `chromium.launch({executablePath: CHROME})`. Compare `check-app-header-phone.mjs` lines 10-24 with `check-viewports.mjs` lines 15-54.

The copies already drift together: the MIME map has no `.woff2`/`.woff`/`.ttf` although PR #644 (80de6a9) just self-hosted Inter in the gallery, so all four servers send the font as `application/octet-stream`. A fix (or a cache header, or a SPA fallback) has to be pasted four times.

Separately, only `check:viewports` runs in CI (`.github/workflows/check.yml`). `check:app-header-phone` and `check:joined-label` are in `package.json`, but neither CI nor CLAUDE.md's Commands list names them, so the layout guards they encode (`gallery/layout-demos.tsx` variants cite them by name, e.g. lines 844 and 1060) run only when someone remembers. `check:detail-sheet` is local-only on purpose (dev build).

## What to do

- [ ] Add `scripts/lib/serve-gallery.mjs` (donor-only, not shipped) exporting `serveDir(dir)` returning `{url, close}` with a complete MIME map including `.woff2`, plus `launchChrome()`; make all four check scripts use it.
- [ ] Get the `app-header-phone` and `joined-label` checks into CI: either fold their assertions into `check-viewports.mjs` as extra named checks, or add them as steps after `check:viewports` in `.github/workflows/check.yml`; pick whichever keeps CI time flat (one shared gallery build).
- [ ] List the newly-CI'd checks in CLAUDE.md's Commands block (and note `check:detail-sheet` stays local-only, dev build).

- [ ] If either check proves flaky in CI, fix the check rather than leaving it unrun; keep it local-only only with a CLAUDE.md note.

## Acceptance

- `grep -c 'createServer' scripts/*.mjs` returns 0 for every file outside `scripts/lib/serve-gallery.mjs`; no other check script keeps its own server or MIME map.
- Requesting a `.woff2` from the helper server returns `content-type: font/woff2`.
- The `app-header-phone` and `joined-label` checks run on every PR's `check` job, visible in the CI log.
- `npm run check:viewports` still passes locally and in CI.

## Related

- [[phone-screenshot-baselines-flake]] — the Inter self-host (PR #644) that exposed the missing font MIME type
- [[code-health-no-pr-check-workflow]] — the `check` workflow these steps join
- [[app-header-phone-overflow]] — origin of the `check:app-header-phone` guard
- [[joined-label-floor-too-small]] — origin of the `check:joined-label` guard
- [scripts/check-viewports.mjs](/scripts/check-viewports.mjs)
- [.github/workflows/check.yml](/.github/workflows/check.yml)
