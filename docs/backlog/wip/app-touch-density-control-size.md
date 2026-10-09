---
area: ui
opened: 2026-10-09
status: needs-enrichment
value: high
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "provider shape and overlay scope auto-resolved to the Recommended defaults — confirm before /feat"
  graded_at: "2026-10-09T00:00:00Z"
---

# App-level touch density that resolves the default control step to lg

## Context

The control ladder in [`docs/STYLE.md`](/docs/STYLE.md) "Control heights" has an `lg` step (`h-11`, 44pt) for touch layouts, but every call site must opt in per control. The touch-first gebo-stock-kiosk (2026-10-08 visual pass) therefore renders toolbar controls at 36px, tabs at 28px and the `SearchInput` clear button at 16px. An app-wide switch already exists in miniature: `ToolbarSizeContext` (`src/components/ui/toolbar-band.tsx:43`) is set to `"lg"` by `PageFrame`'s mobile filter sheet (`src/components/layout/PageFrame.tsx:305`) and read by `SelectTrigger`, `Input` and `SegmentedControl` (an explicit `size` wins). It is typed `"lg" | undefined`, scoped to the filter sheet, and reset by `OutsideToolbarBand`. It is not read by `Button`, `SearchInput` (clear button), `TabsList`/`TabsTrigger` (`src/components/ui/tabs.tsx`, fixed `h-9` / `py-1`) or the toolbar band itself, so an app cannot opt the whole UI into touch size with one setting.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add one app-level density setting that makes the default step resolve to `lg` for `Button`, `SelectTrigger`, `Input`, `SearchInput` (including its clear button), `SegmentedControl`, `Tabs` (`TabsList` + `TabsTrigger`) and the `PageFrame` toolbar band. Build it on the existing `ToolbarSizeContext` mechanism (read by 3 primitives today, set by `PageFrame.tsx:305`) rather than a second context: export a provider from `src/components/ui/toolbar-band.tsx` (or a sibling `control-size.tsx`) and expose it as `AppShell` `density="touch"` so one prop on the shell covers the app. (Recommended — see Open question)
- [ ] Teach `Button`, `SearchInput` and `Tabs` to read the context when no `size` is passed; an explicit `size` still wins, and with no provider every render is byte-identical to today.
- [ ] Keep the density across overlays: `OutsideToolbarBand` ends the band's joined-label placement but must not reset an app-level density, so dialogs, sheets and popovers in a touch app stay on `lg` (the filter-sheet `lg` still works as before).
- [ ] In `docs/STYLE.md` "Control heights", add `Tabs` to the owners list, document the app density setting (what it sets, that explicit `size` wins, that it is the supported alternative to per-call-site `size="lg"`), and note the `SearchInput` clear-button target.
- [ ] Add tests: each primitive above resolves `h-11` under the provider and its unchanged default without it; explicit `size="sm"` wins; `AppShell density="touch"` end to end; the filter sheet still sets `lg`.
- [ ] Add a gallery demo of a touch-density shell beside a default one, per the living-demos convention.
- [ ] Bump `package.json` version above v0.6.7 and add the matching `CHANGELOG.md` row (new `AppShell` prop and exported provider → minor); update the MANIFEST/PACKAGE rows per `docs/RULES.md` if a shipped primitive's export surface changes.

## Acceptance

- Inside `AppShell density="touch"`, a `Button`, `SelectTrigger`, `Input`, `SearchInput`, `SegmentedControl`, `TabsList` and the `PageFrame` toolbar band with no `size` render at `h-11`, and the `SearchInput` clear button meets the 44pt target — every control on the ladder, not only the three that read `ToolbarSizeContext` today.
- Without the setting, every primitive renders byte-identical to v0.6.7 (no default-render regression), and an explicit `size` always wins over the density.
- `PageFrame`'s mobile filter sheet still sets the `lg` step, and a dialog opened from a toolbar control in a touch app is still `lg`.
- `docs/STYLE.md` "Control heights" documents the density setting and lists `Tabs` as an owner.
- `package.json` version is bumped above v0.6.7 and a matching `CHANGELOG.md` row exists.

## Related

- [[toolbar-boolean-toggle-ladder-gap]] — open, same ladder; the boolean toggle it adds must read the same density context. Adjacent, not ordering — no `depends_on`.
- [[pageframe-mobile-filter-sheet]] — shipped; origin of the `lg`-in-sheet `ToolbarSizeContext` this generalizes
- [[input-nativefield-size-prop]] — shipped; the `Input` `size` step and ladder threading this builds on
- [[button-inline-and-icon-sm-sizes]] — shipped; last `Button` size-step change
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement (band context is derived, not a prop)
- [`docs/STYLE.md`](/docs/STYLE.md) — "Control heights" + "Toolbar field labels"

## Open question

Two forks auto-resolved to the Recommended default; confirm before `/feat`:

1. **Provider shape.** Recommended: generalize `ToolbarSizeContext` and surface it as `AppShell density="touch"`. Alternative: a standalone `ControlSizeProvider` with no `AppShell` coupling (works for apps not using `AppShell`, but a second way to set the same context).
2. **Overlay scope.** Recommended: density persists into dialogs/sheets/popovers (a kiosk wants 44pt everywhere). Alternative: overlays reset it like `ToolbarBandContext` does, leaving only the in-page chrome at `lg`.
