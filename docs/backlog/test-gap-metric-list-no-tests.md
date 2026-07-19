---
area: test-gap
opened: 2026-07-19
status: ready
---

# MetricList's disclosure state and MetricRow emphasis styling have no test coverage

## Context

`src/components/layout/MetricList.tsx` (135 lines) changed in 4 commits over the last 90 days and has no test file. Unlike most layout primitives in this directory, it owns actual component state (`const [open, setOpen] = React.useState(false)`) driving a `Collapsible` disclosure — a class of bug (state not resetting, toggle not wired to the trigger) that presentational-only siblings can't have.

Untested behavior:
- The `more` disclosure only renders when `more` is passed; `moreLabel`/`lessLabel` swap based on `open` state.
- `MetricRow`'s `emphasis` prop changes both the label and value text sizing; `accent` tints the value with `text-primary` — both are independent boolean flags with distinct class outputs, easy to accidentally couple.

## What to do

- [ ] Add `src/components/layout/MetricList.test.tsx` covering: no `more` prop renders no disclosure trigger.
- [ ] Test clicking the disclosure trigger toggles between `moreLabel` ("Show more") and `lessLabel` ("Show less") and reveals/hides the `more` content.
- [ ] Test `MetricRow`'s `emphasis` and `accent` props apply independently (emphasis-only, accent-only, both, neither).

## Acceptance

- `MetricList.test.tsx` exists and passes under `npm test`.
- A test fails if the disclosure toggle stops responding to clicks or `emphasis`/`accent` classes become coupled.

## Related

- None — no existing ticket references this file.
