---
area: tooling
opened: 2026-10-08
status: ready
value: normal
model: sonnet
model_reason: "adds one signal to an existing scan with its own test file; same shape as adoption-scan-flags-stale-vendored-appshell"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-08T12:40:00Z
---

# Adoption scan flags consumer files that shadow a baseline component

## Context

Consumers resolve baseline components through a tsconfig `paths` fallback such as `"@/components/ui/*": ["./src/components/ui/*", "./node_modules/design-baseline/src/components/ui/*"]` (same for `layout/*` and `archetypes/*`). A consumer-local file with the same name wins silently. Real case on 2026-10-08: controlling-app still had an old adopted copy, `src/components/ui/native-field.tsx` (header "Adopted from design-baseline `src/components/archetypes/raw-input/native-field.tsx`"). That copy always puts the label above the field. The baseline v0.6.5 `NativeField` instead joins the label to the field's left edge inside the page-frame toolbar band. As a result, the Liquidity toolbar stayed misaligned, even though controlling-app's #1405 had moved its Selects to joined labels and looked done. The Axis C scan (`scripts/scan-adoption-quality.mjs`, `docs/ADOPTION-QUALITY.md`, ADR-0005) is the donor's read-only way to see this kind of drift in a consumer, but it has no signal for it today.

## What to do

- [ ] Add a signal to `scripts/scan-adoption-quality.mjs`: for each consumer tsconfig `paths` entry whose fallback points into `node_modules/design-baseline/src/`, flag every consumer-local file under the first (local) target whose basename matches a file the baseline ships in that aliased directory. Also flag a basename the baseline ships elsewhere, as with `ui/native-field` vs `archetypes/raw-input/native-field`, when the local file carries an "Adopted from design-baseline" header comment. Name the signal as a shadowed baseline file.
- [ ] Add fixture cases to `scripts/scan-adoption-quality.test.mjs`: one same-name shadow, one adopted-header copy under a different directory, and one consumer with a local file whose name the baseline does not ship.
- [ ] Document the signal in `docs/ADOPTION-QUALITY.md` and its machine form in `docs/audit-signals.json`, following the existing signal pattern (matches `adoption-scan-flags-stale-vendored-appshell`).

## Acceptance

- The scan returns a hit for a fixture `src/components/ui/native-field.tsx` behind a `@/components/ui/*` paths fallback to the baseline.
- The scan returns a hit for every local file carrying an "Adopted from design-baseline" header, not only the same-path ones.
- The scan returns no hit for a local file whose basename the baseline does not ship, and no hit for a consumer with no `paths` fallback into the baseline.
- `npm test` passes, including the new fixture cases.

## Related

- [[adoption-scan-flags-stale-vendored-appshell]]
- [[adoption-quality-scanner]]
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — the Axis C scan ships as a zero-dep donor script
