---
area: layout
opened: '2026-10-18'
status: needs-enrichment
value: normal
model: opus
model_reason: "the prop shape must pass RULES hard rule 10 (derived, enumerated, no inherited default) — a design call, not a class swap"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved fork auto-resolved to the Recommended default; operator must confirm before /feat"
  graded_at: '2026-10-18T11:40:00Z'
---

# Promote controlling-app's centered tinted-icon look into AuthCard

## Context

`src/components/layout/AuthCard.tsx` renders its off-app card left-aligned, with a grey `h-8 w-8 text-muted-foreground` icon and no icon background. controlling-app hand-built a different look for `/login` and `/not-authorized`: centered header, the icon inside a 56px tinted circle (`bg-primary/10 text-primary` for sign-in, `bg-destructive/10 text-status-danger-fg` for access denied), on a `bg-muted/30` page plane. The operator compared the two (mockup https://claude.ai/artifact/JvLDzYWAA1NRvNFwASo9pL, variant C) and picked controlling-app's look as the fleet default. Consumers today: gebo-stock-kiosk (`SignIn` / `NoAccess`, stock `AuthCard`), and controlling-app's admin walls since controlling-app #1580 (stock `AuthCard`, which dropped the red circle they had before). `docs/PROMOTION-RADAR.md` already says the not-authorized icon circles belong to `AuthCard`'s `icon`, and `AuthCard` has no test file.

## What to do

- [ ] Make the centered header and the tinted icon circle `AuthCard`'s **fixed** look (no `align` prop, no on/off flag): centered icon, title and description; the icon sits in a `h-14 w-14 rounded-full` circle. An optional prop with a backwards-compatible default is disqualified by `docs/RULES.md` hard rule 10.
- [ ] Key the circle colour on what the screen is, not on taste: add a required `purpose: "sign-in" | "denied" | "error"` prop mapping to `bg-primary/10 text-primary`, `bg-destructive/10 text-status-danger-fg` and `bg-muted text-muted-foreground`. Document the mapping as the decision rule in the JSDoc (two engineers holding the same screen derive the same value, per RULES hard rule 10).
- [ ] Keep the `<h1>` on `text-lg` and the card on `max-w-sm`, per the archived [[auth-card-title-display-step]] decision (a larger title wraps German headings in that width).
- [ ] Leave the page plane to the caller: `AuthCard` keeps a transparent wrapper, because it is also embedded inside `AppShell` content (controlling-app admin walls). Document `bg-muted/30` on the off-app page wrapper as the recommended plane in `docs/STYLE.md`'s `AuthCard` row.
- [ ] Add `src/components/layout/AuthCard.test.tsx`: each `purpose` renders its circle classes, the title renders as an `<h1>`, the header is centered.
- [ ] Record controlling-app as the promotion source in `docs/PROMOTION-RADAR.md` / `docs/promotion-radar.json`, bump `package.json` `"version"` in the same PR (RULES hard rule 11) so `tag-version.yml` cuts the next tag after v0.11.8, and note the breaking `purpose` prop in the release note.

## Acceptance

- `<AuthCard purpose="denied">` renders the icon inside a circle with `bg-destructive/10` and `text-status-danger-fg`; `purpose="sign-in"` renders `bg-primary/10` / `text-primary`; `purpose="error"` renders the muted circle.
- The icon, title and description are centered in every purpose; the `<h1>` className still carries `text-lg`.
- `AuthCard` exposes no other new appearance prop, and `node scripts/lint-design.mjs` exits 0.
- After the tag, a consumer that adds `purpose` gets the variant C look with no local layout code (gebo-stock-kiosk `SignIn` / `NoAccess`, controlling-app admin walls, `/login`, `/not-authorized`).

## Related

- [[auth-card-title-display-step]] — keeps the `text-lg` title this ticket keeps
- [[metric-row-accent-prop-promotion]] — precedent: a promoted look prop came back data-keyed, not as a free flag
- [[layout-primitives-hardcoded-german]] — earlier `AuthCard`-adjacent layout cleanup
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — `--primary` is the one brand accent
- [RULES hard rule 10](/docs/RULES.md) — derived vs inherited appearance props
- controlling-app ticket `design-baseline-hand-built-pages-recheck-2026-10` waits on this release (cross-repo, so no `depends_on`)

## Open question

**Question:** The look C mockup was pitched as optional `tone` / `align` props with unchanged defaults. That shape fails RULES hard rule 10 (a backwards-compatible default disqualifies a per-call-site appearance prop). Which shape ships?

**Recommended (asserted above):** fixed centered look plus a required, screen-derived `purpose` enum. This is a breaking change: gebo-stock-kiosk must add `purpose` on its next pin bump, and its sign-in card changes look.

**Alternative:** fixed centered look with the circle always `bg-primary/10 text-primary` (no prop at all). Not breaking, but denied and sign-in screens look the same again.
