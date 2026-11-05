---
area: docs
opened: '2026-11-04'
status: done
value: normal
model: sonnet
model_reason: "single new text file beside a known asset; cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-11-04T00:00:00Z'
---

# Add OFL license text beside vendored Inter font

## Context

`gallery/fonts/inter-latin-v20.woff2` was vendored in PR #644 to stop the phone screenshot baseline flake. Inter is licensed under SIL OFL 1.1, which requires the copyright notice and license text to accompany redistributed font software. `gallery/fonts/` contains only the `.woff2` — no `OFL.txt` or copyright notice on `origin/main`, so the donor currently redistributes the font out of compliance.

## What to do

- [ ] Add `gallery/fonts/OFL.txt` with the SIL OFL 1.1 text and the notice "Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)", taken verbatim from the upstream Inter `LICENSE.txt`.
- [ ] Confirm the license file is not excluded from whatever ships `gallery/fonts/` (check `package.json` `files` and any gallery build copy step) so it travels with the font.

## Acceptance

- `gallery/fonts/OFL.txt` exists on `origin/main` and contains the Inter copyright line and the full OFL 1.1 text.
- After `npm run gallery:build`, the built output ships `OFL.txt` wherever it ships `inter-latin-v20.woff2`.
- Every other vendored font file under `gallery/fonts/` has a license notice beside it; none is left without one.

## Related

- [[consumer-docs-self-host-inter-for-baselines]] — same Inter vendoring; consumers who copy the font need the license too
- [[tokens-brand-font-seam-and-split-guard]]
