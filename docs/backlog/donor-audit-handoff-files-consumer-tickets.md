---
area: tooling
opened: 2026-10-06
status: ready
value: high
model: sonnet
model_reason: "handoff mechanism is already chosen (the /ticket foreign-repo land) and the stalled instance is concrete — follow-the-pattern filing plus a rule line"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-06T00:00:00Z
---

# Donor audit handoff files a consumer backlog ticket instead of a playbook nobody reads

## Context

The donor hands consumer migrations off as playbook files under `docs/audits/` "to be handed to that project's own session" (the fleet-adoption self-heal rule, ADR-0008 "Consumers migrate from their own sessions"). Nothing performs the hand-off. [[fleet-adoption-v0-3-0-audit-playbooks]] (#467) shipped `docs/audits/2026-10-06-adopt-v0-3-0-playbook-{hk-crm,mistra,brickshop-manager}.md` and archived. Its acceptance only required the files to exist. No consumer backlog got a ticket, so the dashboard kanban (which reads each repo's `docs/backlog/` only) and auto-dispatch never see the work. The v0.3.0 migration stalls without anyone noticing. The self-heal memory's handoff step ("launch the project's own session via `cmux new-workspace`") is a one-shot action with no durable trace, and the donor read-only rule ("do not migrate or write to any consumer repo") was read as forbidding a backlog ticket too. `docs/audits/` has no reader, the same failure [[fleet-audit-and-adoption-doc-retire]] already cleaned up once ("dated audit dumps … outlived their readers").

## What to do

- [ ] File one ticket per consumer now for v0.3.0 via `/ticket` into each consumer repo (`~/.fleet/lib/ticket-land.sh <consumer-abs> <slug>`, the foreign-repo land): hk-crm, mistra, brickshop-manager. Each ticket links its playbook by repo-root-absolute path on design-baseline and lists the pin bump first for hk-crm (v0.2.24) and brickshop-manager (v0.2.7).
- [ ] Amend the donor rule wherever it is stated (ADR-0008 consequence line, `docs/ARCHITECTURE.md` §8 Fleet audit system, the `fleet-adoption-projects-self-heal` project memory): the donor never edits consumer code, but it **does** file the consumer's backlog ticket through `/ticket`. That ticket is the handoff and replaces the "launch a cmux session" step.
- [ ] Make "one ticket per consumer filed, linked from the report" the standard acceptance line for any donor audit or playbook ticket. Add it to the audit report shape (`docs/audits/2026-10-03-page-frame-contradictions.md` lineage) so the report lists each consumer's ticket slug next to its hit counts.

## Acceptance

- hk-crm, mistra and brickshop-manager each show an open `docs/backlog/` ticket for design-baseline v0.3.0 adoption on their `origin/main`, and each ticket links its playbook.
- `docs/audits/2026-10-06-fleet-adoption-v0-3-0.md` names each consumer's ticket slug.
- The donor rule text no longer reads as forbidding backlog filing in consumers, and every future donor audit ticket's acceptance requires a filed consumer ticket for all consumers with hits. A playbook-only close is no longer possible.

## Related

- [[fleet-adoption-v0-3-0-audit-playbooks]]
- [[fleet-audit-and-adoption-doc-retire]]
- [[brickshop-manager-package-install-cutover]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — Adoption-quality scan as a zero-dep donor script
