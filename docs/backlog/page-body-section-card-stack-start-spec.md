---
area: roadmap
kind: ops
opened: '2026-11-11'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-11-11T19:56:52.196Z'
value: high
---

# Start the Phase-0 design spec for roadmap page-body-section-card-stack

## Context

The roadmap `page-body-section-card-stack` ("Page body as a stack of raised section cards (supersedes ADR-0008 §3 and ADR-0007 §3)") in `design-baseline` is active but has no `spec:` pointer yet, so its Phase-0 design spec has not been written. The spec is what unlocks decompose and every later phase of the roadmap, so it should start early. This reminder was filed automatically by the dashboard's start-spec reminder scan and is archived automatically once the roadmap has its `spec:` pointer.

## What to do

- [ ] Start the spec session: the roadmap panel's "Start spec →" button, Today's "no spec yet" row, or `POST /api/roadmap/start-spec` with `{"repoName":"design-baseline","slug":"page-body-section-card-stack"}` on the dashboard.
- [ ] Work the spec session to the point where the roadmap carries its `spec:` pointer.

## Acceptance

- The roadmap `page-body-section-card-stack` carries a `spec:` pointer, every later phase of it can decompose, and this reminder is archived by the scan without a manual step.

## Related

- [[page-body-section-card-stack]] — the roadmap this reminder is about
- Filed and closed by the coding-dashboard's `start-spec-reminders` scan (`server/startSpecReminder.ts`); the action is `startRoadmapSpec` (`server/roadmapSpec.ts`)
