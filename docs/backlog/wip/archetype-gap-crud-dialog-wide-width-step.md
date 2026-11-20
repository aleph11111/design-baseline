---
area: archetypes
opened: 2026-11-20
status: ready
value: normal
model: sonnet
model_reason: "additive width step plus one keying bullet, following the existing WIDTH_MAP and Layer 2 pattern; cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-20T00:00:00Z
---

# CrudDialogSheet wide xl width step for two-pane bodies

## Context

`WIDTH_MAP` in `src/components/archetypes/crud-dialog/CrudDialogSheet.tsx:11` tops out at `lg` (40rem / 640px). A body with a live result pane beside the inputs (inputs left, computed preview right, stacked on mobile) does not fit: the controlling-app Planung "Neuer Effekt" sheet (`frontend/src/components/workspace/planset/EffectDialog.tsx`, consumer ticket `planset-effect-sheet-two-pane-rework`) needs ~860px for inputs plus a 4-tile year row (Basis + 3 plan years) with breakdown rows; at 640px the right pane gets ~270px and the year tiles truncate. `docs/archetypes/crud-dialog.md` Layer 2 Forbidden bans width overrides and a raw Sheet for J dialogs, so the consumer cannot widen it itself and per baseline policy must not hand-roll a stopgap. The consumer already lays the panes out with a container query (side by side when the body is wide enough, stacked at `lg`), so after this ships it only bumps its pin and passes `width="xl"`.

## What to do

- [ ] Add `xl: "54rem"` (~860px) to `WIDTH_MAP` in `CrudDialogSheet.tsx` and widen the `width` prop type and JSDoc to `"sm" | "md" | "lg" | "xl"`; mobile stays full-viewport.
- [ ] Add a Layer 2 keying rule in `docs/archetypes/crud-dialog.md`: a body with a live result pane beside the inputs (two-pane: inputs left, computed preview right, stacked on mobile) derives `"xl"`. Update the Required list and the exhaustive keying text so tab count and field count still resolve every body to exactly one step. Role-only wording, no Tailwind classes (per `docs/RULES.md` rules 2–3).
- [ ] Extend `deriveDialogWidth` in `src/examples/crud-dialog-demo.tsx` with the two-pane case and add a visible two-pane demo body (living demo for the variant).
- [ ] Pin the `xl` width in the crud-dialog tests, add the `CHANGELOG.md` entry and the contract changelog line, and bump the package version (`scripts/verify-package-version.mjs` fails `npm test` otherwise).

## Acceptance

- `<CrudDialogSheet width="xl">` renders its desktop sheet at 54rem and shows full-viewport on mobile, unchanged for `sm`, `md` and `lg`.
- The Layer 2 contract names the two-pane body as deriving `"xl"`, and the crud-dialog demo shows a two-pane body opened at that step.
- A two-pane body in the gallery shows its year tiles and breakdown rows untruncated at the desk27 and laptop14 viewports and stacked on phone.

## Related

- [[crud-dialog-body-two-column-container-query]] — body layout already keys on container width, which is what the two-pane consumer relies on
- [[archetype-convergence-crud-dialog-close-api]] — closed the width axis and its keying rule that this extends
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — width stays a derived prop, no override

## Resolution

- Shipped as v0.63.0 (crud-dialog contract v3.11, MANIFEST 3.12): `xl: "54rem"` in `WIDTH_MAP`, widened `width` type/JSDoc, Layer 2 keying (result pane, then tabs, then fields), demo "Two-pane" layout, `CrudDialogSheet.test.tsx` pinning all four steps plus mobile full-viewport.
- Gallery acceptance verified in real Chrome against the built gallery (ad hoc script, not committed; no existing check covers dialog demos): the two-pane sheet measured 864px at desk27 (2560) and laptop14 (1512) with the preview pane 396px wide, side by side, no truncated or overflowing element in the pane; at phone (390) the sheet is full viewport with the panes stacked (screenshot reviewed).
