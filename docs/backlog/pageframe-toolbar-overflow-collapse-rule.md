---
area: layout
opened: '2026-10-08'
status: blocked
gate:
  score: 4
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed:
    - open_question: >-
        threshold mechanism unresolved — fixed cap N vs. measured overflow; confirm the operator's
        pick before /feat
  graded_at: '2026-10-08T00:00:00.000Z'
value: normal
blocked_reason: >-
  review: PR https://github.com/aleph11111/design-baseline/pull/514 had 5 /ship review-gate rounds
  that did not approve. Read the <!-- review-gate --> comments on the PR, decide how to proceed,
  then release the ticket with back 2 ready.
---

# PageFrame crowded toolbar band overflow rule, enforcement, and version bump

## Context

`docs/STYLE.md` "Toolbar field labels" (the "one row of equal boxes" rule — the joined-label
device at `docs/STYLE.md:173`) and `docs/PLACEMENT.md` "The page frame" describe a `PageFrame`
**toolbar band** as a single row of equal boxes, and describe the collapse-to-filter-sheet — but
only **below `md`**, where `src/components/layout/PageFrame.tsx` renders the `MobileBand` (gated on
`useIsMobile`). Neither document says what happens on **desktop** when the scoping fields do not
fit one row. `PageFrame`'s desktop band is `flex min-w-0 flex-wrap …`, so it just wraps; there is
no cap-and-collapse rule and no enforcement. The 2026-10-08 fleet visual pass found both failure
modes of that gap: hk-sales-agent (Trefferliste) keeps five joined selects + search on one desktop
row and truncates every value (`Statu…`, `Se…`); controlling-app (variance) lets the band wrap to
three rows with `Ansicht` alone on the last. The fix reuses the filter sheet `PageFrame` already
renders on mobile — `data-filter-sheet` inside `MobileBand` — but the sheet affordance (the Filter
trigger + `filterCount`/`filterSummary`) is mobile-only, so lifting it to desktop is the mechanical
core of the work.

## What to do

- [ ] Record the threshold-mechanism decision below first (`fixed cap N` vs. `measured overflow`); the bullets that assume a fixed cap are the recommended default — if the operator picks measured overflow, swap those bullets for the measurement-hook variant instead of shipping the fixed-cap code.
- [ ] Document the rule in `docs/STYLE.md` "Toolbar field labels": a toolbar band is one row of equal boxes with a **maximum of N scoping fields inline**; scoping fields beyond N collapse into the `PageFrame` filter sheet (the same bottom sheet already rendered below `md`), also on desktop. The joined-label cell shrinks before a control's value ever truncates. (Grounded in the existing "one row of equal boxes" rule at `STYLE.md:173` and the mobile sheet at `PageFrame.tsx` `data-filter-sheet`.)
- [ ] Extend `docs/PLACEMENT.md` "The page frame" toolbar-band row with the same desktop cap-and-collapse rule (it currently only describes the below-`md` collapse and says "a wrapping toolbar that pushes the body below the first screen is the drift this rule closes" — that wraps-instead-of-collapses behavior is exactly what this ticket ends).
- [ ] In `src/components/layout/PageFrame.tsx`, lift the filter-sheet collapse out of the mobile-only `MobileBand` path so the **desktop** band renders one row of the in-cap fields and moves the overflow into the same sheet (reuse the Filter trigger + `filterCount`/`filterSummary`), replacing the current `flex-wrap` multi-row behavior. Fix at the shared primitive — every page shell renders through `PageFrame`, so no consumer patch.
- [ ] Add a lint **or** a test so the rule is enforced rather than remembered: a lint rule flagging a `PageFrame` band with more than N inline scoping fields, or a `PageFrame` test in `PageFrame.test.tsx` asserting the desktop band collapses fields beyond N into the sheet trigger instead of wrapping.
- [ ] ? Add a gallery demo in `gallery/layout-demos.tsx` next to `PageFrameDemo` showing a crowded band (≥ N+1 joined selects) collapsing into the sheet — matches the living-demos convention used by the sibling ticket; the thought did not explicitly ask for one.
- [ ] Bump `package.json` from `0.6.6` to the next version and add a matching `## v…` entry to `CHANGELOG.md` — `scripts/verify-package-version.mjs` is a `pretest` and fails `npm test` on a bump without an entry. (The open sibling `[[pageframe-filter-sheet-stacks-nested-fields]]` also targets a bump from `0.6.6`; if both land, the later one bumps further — reconcile at `/ship`, do not hard-code `0.6.7` if it will collide.)

## Acceptance

- The desktop `PageFrame` band renders one row with at most N scoping fields inline; a band with more than N renders the excess collapsed into the filter-sheet trigger and **no longer** wraps onto a second or third row.
- A joined-label cell truncates its **label** while the control's value stays fully visible — the control value is **unchanged** (shows no clipped `Statu…`/`Se…`).
- The lint/test **exits** non-zero (or **fails**) when a toolbar band exceeds the inline cap and **passes** (or **matches**) once the overflow is collapsed into the sheet.
- After the version bump, `npm test` runs `verify-package-version.mjs` **green** (a `CHANGELOG.md` entry for the new version **exists**) and `npx tsc --noEmit` is **unchanged**.

## Related

- [[pageframe-filter-sheet-stacks-nested-fields]] — open sibling; same `PageFrame` filter sheet and version-bump area. That ticket fixes the **mobile sheet** clipping nested wrapper-div fields (`[&>*]:w-full!` direct-child-only); this adds the **desktop band** overflow rule the sheet serves. Adjacent, not ordering — no `depends_on`.
- [[pageframe-mobile-filter-sheet]] — the shipped (done, v0.6.0) ticket that built the `data-filter-sheet` container and the ~130px `data-joined-label` column this rule reuses on desktop.
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement (the `toolbar` band and the filter-sheet slots `PageFrame` renders).
- [docs/STYLE.md "Toolbar field labels"](/docs/STYLE.md) — the "one row of equal boxes" / joined-label rule this extends with a desktop cap.
- [docs/PLACEMENT.md "The page frame"](/docs/PLACEMENT.md) — describes the below-`md` collapse; needs the desktop cap-and-collapse added.
- [src/components/layout/PageFrame.tsx](/src/components/layout/PageFrame.tsx) — the desktop band (`flex flex-wrap`) and the mobile-only `MobileBand` / `data-filter-sheet` to generalize.

## Open question

**Threshold mechanism — fixed cap vs. measured overflow.** (Auto-resolved to the recommended
default in the What-to-do bullets; alternatives recorded so the choice is reversible on review.)

- **(A, Recommended) Fixed cap N.** First N scoping fields render inline; the rest always collapse
  into the sheet (same trigger as mobile). Deterministic and testable, no layout-measurement
  machinery — fits the donor's no-extra-dependency stack and the "maximum of N scoping fields
  inline" wording the thought gives. Cost: a band with a few wide fields can under-use the row, and
  N must be picked (? suggest 6, the ~130px label column + a typical 1440px row; confirm in review).
- **(B) Measured overflow.** The band measures available width (a ResizeObserver/measure hook) and
  collapses any box that does not fit the current viewport. Handles "5 fits, 6 doesn't" gracefully
  across widths. Cost: introduces a width-measuring hook the donor does not have today — new
  machinery in a no-build source package.
