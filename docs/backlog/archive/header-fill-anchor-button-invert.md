---
area: archetypes
opened: 2026-06-24
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-06-24T15:10:00Z
---

# Invert asChild anchor-buttons on solid header-fill bars

## Context

`SOLID_INVERT` in `src/components/layout/headerFill.ts` inverts a solid (accent-
filled) header's contents to read on the brand color: white title/kicker,
transparent-with-white-border outline buttons, white-fill primary buttons. But
every selector targets `button` elements only (`[&_button]`, `[&_button.border-input]`,
`[&_button.bg-primary]`). A shadcn `<Button asChild>` wrapping a `<Link>` renders
as an `<a>` carrying the same button classes — so it is NOT matched, and on a
solid bar it renders as a blank white box (white `bg-background` + dark text that
disappears).

This surfaced adopting the header-fill into hk-crm (Next RSC): the detail-overview
header's "Bearbeiten" edit link (a `<Button asChild>` → `<a>`) showed as an empty
white box on the teal header. Fixed there by broadening the selectors to
`:is(button,a)` (e.g. `[&_:is(button,a)]:text-primary-foreground` plus the
`.border-input` / `.bg-primary` variants). Per the 2-token contract rule —
"if a project needs to change anything beyond the two tokens to look right, that's
a baseline gap; fix it in the baseline so the whole fleet inherits it" — the same
fix belongs in the donor.

## What to do

- [ ] Broaden every `button` selector in `SOLID_INVERT` (`src/components/layout/headerFill.ts`) to `:is(button,a)` so asChild link-buttons invert identically — mirror the hk-crm fix.
- [ ] Confirm the subtitle company-link and other header anchors still read correctly (white on solid); semantic `<Badge>` pills must stay untouched (not anchors/buttons).
- [ ] Bump the `headerFill`/affected MANIFEST entry/plugin version for the change.

## Acceptance

- [ ] On a `surface="unified" headerFill="solid"` header, a `<Button asChild><Link/></Button>` renders inverted (transparent + white border + white text), no longer a blank white box.
- [ ] Real `<button>` actions and semantic `<Badge>`s render exactly as before (no regression) on solid headers in the gallery board.
- [ ] `npm run gallery:build` succeeds.

## Related

- [header-fill-variant-demo.md](header-fill-variant-demo.md) — same `headerFill.ts` primitive
- [archetype-specs-board-form-sync.md](archetype-specs-board-form-sync.md) — documents the same 2-token header-fill contract

## Resolution (2026-07-03)

Fixed in donor on feat/plex-ledger-hygiene: SOLID_INVERT selectors broadened from `button` to `:is(button,a)` in src/components/layout/headerFill.ts, matching the hk-crm downstream fix.
