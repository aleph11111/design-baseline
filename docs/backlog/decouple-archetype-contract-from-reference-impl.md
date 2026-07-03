---
area: archetypes
opened: 2026-06-16
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-06-16T12:38:26Z
---

# Decouple archetype contracts from stack-specific reference implementations

## Context

The archetype docs in `docs/archetypes/*.md` are written as layered page-shape contracts (route config → page shell → header → toolbar → states, each with required / forbidden / allowed-variation). But the contract *body* bakes in baseline-specific primitives and Tailwind-4 class strings: `list-with-detail.md` Layer 2 mandates `<AppShell>` and `<div className="space-y-6">`, Layer 3 mandates `<PageHeader>` with `text-2xl font-semibold tracking-tight`, and every archetype opens with a "Reference primitive" section naming a concrete `src/components/archetypes/<slug>/` shell.

This couples the *portable* asset (the page-shape contract) to the *non-portable* one (the Tailwind-4 + shadcn + sidebar-shell reference implementation). A divergent consumer — controlling-app is Tailwind 3 / Next 16 with its own 23-component system — can legitimately adopt the contract (layers, slots, states, responsibilities) but cannot adopt the primitive references or class strings. The `frontend-design-baseline-adoption` attempt in controlling-app surfaced this: the page-shape audit (drift against `frontend-workspace-data-page`) was valuable and safe, but anything touching the reference primitives required a stack the project doesn't have.

## What to do

- [ ] Split each `docs/archetypes/*.md` into a **stack-agnostic contract** (page shape, layers, slots, states, required/forbidden/allowed-variation expressed in terms of *roles*, not primitive names) and a **stack-specific reference-implementation appendix** (the concrete `<AppShell>`/`<PageHeader>` primitives + Tailwind-4 classes).
- [ ] In the contract layer, replace hard primitive names with role descriptions (e.g. "the project's top-level layout shell" instead of `<AppShell>`; "the canonical title treatment" instead of the literal class string), with the baseline primitive named only in the appendix as the reference binding.
- [ ] ? Decide appendix placement — inline `## Reference implementation (baseline stack)` section within the same `.md`, vs. a sibling `<slug>.baseline.md`. Inline keeps one file per archetype; sibling keeps the contract diff-clean across stack changes.
- [ ] Update `docs/archetypes/MANIFEST.json` / `README.md` if the split changes how archetypes are enumerated or versioned.

## Acceptance

- A consumer on a non-baseline stack (Tailwind 3 / Next) can read an archetype's contract and audit a page against it **without** needing the baseline's primitives installed — every required/forbidden rule references a role, not a `src/components/...` import or a Tailwind-4 class.
- The baseline-stack reference primitives are still fully specified, isolated to the appendix layer.
- `docs/archetypes/list-with-detail.md` (the canonical example) no longer mentions `<AppShell>`/`<PageHeader>`/literal Tailwind classes in its Layer 1–4 contract body.

## Related

- [docs/FLEET-AUDIT.md](../FLEET-AUDIT.md) — fit & drift audit; this split is what makes fit-scoring possible against divergent stacks
- [docs/TAXONOMY.md](../TAXONOMY.md)
- [docs/archetypes/README.md](../archetypes/README.md)
- Two-axis adoption model + conformance rubric (commit 7de8cf4)

## Open question

Surfaced by the `frontend-design-baseline-adoption` ticket in the controlling-app project. The contract/impl split is the long-term enabler for the `audit-ritual-fit-and-drift` roadmap idea (auditing a project's pages against archetype contracts regardless of its stack).
