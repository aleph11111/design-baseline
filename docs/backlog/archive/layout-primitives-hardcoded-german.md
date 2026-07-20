---
area: i18n
opened: 2026-07-04
status: done
model: sonnet
model_reason: add override props / English defaults to two primitives, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Remove hardcoded German UI strings from ThemeToggle and BottomNav

## Context

Severity: **medium** (i18n). Two brand-agnostic layout primitives ship hardcoded German user-facing strings with no override props, contradicting the donor's stated language-neutral/English-default contract (`crudStrings.ts` documents "The baseline ships language-neutral … English defaults"). (1) `ThemeToggle` (exported from `src/components/layout/index.ts:27`) hardcodes the trigger aria-label "Farbschema umschalten" and menu items "Hell"/"Dunkel"/"System" with zero props (`src/components/layout/ThemeToggle.tsx:19,27,28,29`). (2) `BottomNav` (`index.ts:26`) hardcodes the landmark `aria-label="Mobile-Navigation"` (`BottomNav.tsx:46`), defaults `moreLabel="Mehr"` (`:41`), and — worst — builds the More-trigger accessible name by concatenating a baked-in German suffix: `aria-label={`${moreLabel}-Menü öffnen`}` (`:63`), so even a consumer who overrides `moreLabel="More"` gets "More-Menü öffnen". An English-only or other-locale app adopting the baseline inherits untranslatable German a11y text.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) asserting (a) ThemeToggle default strings are English and overridable via a `labels` prop, and (b) BottomNav's More-trigger accessible name is fully overridable with no residual German suffix; then make it pass.
- [ ] `ThemeToggle`: default the strings to English ("Toggle color scheme", "Light"/"Dark"/"System") and add an optional `labels?: { toggle?; light?; dark?; system? }` prop with English fallbacks (ThemeToggle.tsx:19,27-29).
- [ ] `BottomNav`: default `moreLabel` to English ("More"); make the landmark label an optional prop (e.g. `navLabel`, default "Bottom navigation"); replace the concatenated `${moreLabel}-Menü öffnen` with a fully-overridable `moreMenuLabel?` (default English), removing the baked-in suffix (BottomNav.tsx:41,46,63).

## Acceptance

- ThemeToggle and BottomNav default to English strings and expose props to override every user-facing string; `grep -rn 'Farbschema\|Mobile-Navigation\|Menü öffnen\|"Mehr"\|"Hell"\|"Dunkel"' src/components/layout` returns no hardcoded German defaults.
- Overriding `moreLabel`/`moreMenuLabel` no longer leaves a residual German suffix on the accessible name.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [crud-dialog-footer-submitting-label.md](crud-dialog-footer-submitting-label.md) — sibling i18n gap in the footer
- src/components/archetypes/crud-dialog/crudStrings.ts — the language-neutral donor contract these violate
