---
area: tooling
opened: 2026-07-21
status: ready
model: sonnet
model_reason: the correct directive is already proven (next build fails on @plugin, passes on @import) — a one-line comment correction against a known-good answer, no design judgment left
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-21T00:00:00Z
---

# tokens.css header tells consumers to load tw-animate-css via `@plugin`, which breaks `next build`

## Context

`src/styles/tokens.css:14–21` — the header comment that documents how a target project should
wire animation utilities — instructs consumers to install `tw-animate-css` and add
`@plugin "tw-animate-css";` to their `tokens.css`. That directive is wrong for `tw-animate-css@1.x`:
its `package.json` `exports` field declares only a `style` condition (no `node`/`require` JS entry),
so `@tailwindcss/postcss@4`'s `@plugin` resolver cannot load it and throws
`"." is not exported under the conditions ["node","require"]`, failing the consumer's `next build`
on `globals.css`. The correct directive is `@import "tw-animate-css";` (right after
`@import "tailwindcss";`) — `tw-animate-css` is a pure-CSS package, not a JS Tailwind plugin.

This is a **consumed** artifact, same failure class as the already-fixed
`donor-deps-violate-stack-contract` (archived): consumers copy the donor's `tokens.css` header
verbatim as their wiring recipe, so the donor propagates a build-breaking directive to every Next.js
target that follows it. That archived ticket even quoted this exact line (`src/styles/tokens.css:14–21`
… "add `@plugin "tw-animate-css";`") in its context but scoped its fix to `package.json`, leaving the
header directive uncorrected. Surfaced from controlling-app's Tailwind-4 migration
(`frontend-tailwind4-core-cut`), where `@plugin` broke `next build` and `@import` fixed it; filed
here rather than in controlling-app's backlog because the defect is the donor's.

## What to do

- [ ] In `src/styles/tokens.css`, change the header-comment directive from `@plugin "tw-animate-css";` to `@import "tw-animate-css";`, and add one sentence noting `tw-animate-css@1.x` ships as a pure-CSS package (`exports` declares only `style`) so `@plugin` cannot resolve it.
- [ ] Grep the rest of the repo (`src/`, `docs/`, `gallery/`) for any other `@plugin "tw-animate-css"` occurrence and correct it the same way; `docs/STACK.md` scar #1 already names the package correctly and needs no change.

## Acceptance

- `grep -rn '@plugin "tw-animate-css"' src docs gallery` returns no matches; the tokens.css header shows `@import "tw-animate-css";`.
- A Next.js consumer that copies the corrected header directive runs `next build` and it no longer fails with `"." is not exported under the conditions ["node","require"]`.

## Related

- [archive/donor-deps-violate-stack-contract.md](archive/donor-deps-violate-stack-contract.md) — sibling donor-defect ticket (same consumed-artifact class); fixed package.json but left this header directive.
- `docs/STACK.md` scar #1 — the Tailwind-3-plugin-on-Tailwind-4 scar this directive was meant to help consumers avoid.
