---
area: docs
opened: 2026-10-04
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-04T12:00:00Z
---

# Fleet adoption audit and playbooks for design-baseline v0.3.0

## Context

design-baseline v0.3.0 (ADR-0008, PR #452) removed the on-surface header props (`kicker`, `headerActions`, `headerFill`) in favour of the one `PageFrame` (`src/components/layout/PageFrame.tsx`). Beyond controlling-app, hk-crm, mistra and brickshop-manager still render the retired headers and will hit the breaking removals on their next pin bump. The donor measures consumers read-only with `scripts/scan-adoption-quality.mjs` (ADR-0005, signals in `docs/audit-signals.json`) and hands migrations to each project's own session (fleet-adoption rule: projects self-heal from their own session, not the donor session).

## What to do

- [ ] For each of hk-crm, mistra and brickshop-manager, run `scripts/scan-adoption-quality.mjs` read-only with the new `page-*` and `retired-surface-header-props` signals and record per-consumer hit counts in a dated report under `docs/audits/` (matches the existing `docs/audits/2026-10-03-page-frame-contradictions.md` report shape).
- [ ] Write one self-heal playbook per consumer, modelled on controlling-app's adoption playbook, listing its concrete hits and the replacement (`title` / `actions` / `toolbar` / `count` / `viewOptions` slots), to be handed to that project's own session.
- [ ] Do not migrate or write to any consumer repo from the donor session; the migrations happen in each project.

## Acceptance

- A dated report under `docs/audits/` shows hit counts for every one of hk-crm, mistra and brickshop-manager against each `page-*` signal and `retired-surface-header-props`.
- Each of the three consumers has a playbook that names its own hits, and no consumer repository is modified by this ticket.

## Related

- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — Adoption-quality scan as a zero-dep donor script
- [[hk-crm-package-install-cutover]]
- [[mistra-package-install-cutover]]
- [[brickshop-manager-package-install-cutover]]
