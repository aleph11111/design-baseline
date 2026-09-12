# Lessons

Durable, tracked corrections that survive across worktrees and ship with the repo.
Reviewed at session start; drained here from `tasks/lessons.md` by `/ship`.

## A `~/.claude/` path may be a symlink into another repo — fetch *that* repo

Verifying an ops ticket on 2026-07-20, a session read `~/.claude/lib/ship-reconcile.sh`,
found three numbered sections, and reported the ticket's gap as still open. It was not:
the fix had merged ~2h earlier as dashboard PR #66. The file is a **symlink** to
`claude-skills/lib/ship-reconcile.sh`, a tracked file in the `aleph11111/dashboard` repo,
and what was read was that repo's **stale working tree**. The session then re-implemented
the same 122-line reaper and only caught the duplication when the splice landed beside an
existing `# 4. Local-orphan reaper` header.

The existing "fetch before diagnosing" habit covers the repo you are sitting in. It does
not cover a path that resolves elsewhere. **Before diagnosing any `~/.claude/…` file:
`readlink -f` it, and if it lands in a git repo, `git -C <that repo> fetch` and read
`origin/main` — not the working tree.** A parallel session may have shipped it already.
This also determines whether the work can ship as a PR at all.

## `kind: ops` is about *git artifacts*, not about living outside this repo

The same ticket carried `kind: ops` justified as "targets `~/.claude/` global config, so it
cannot ship via a design-baseline PR." Only the second half held. The file was tracked in
another GitHub repo and shipped there as an ordinary PR (#66). "Not shippable from *this*
repo" is not the same as "leaves no git artifact" — the latter is what `kind: ops` means
(see `docs/backlog/README.md`). Resolve the symlink and check for a tracked path before
assigning `kind`; a cross-repo code ticket should say which repo it ships from.

## Donor exports: "unused in-repo" ≠ dead code

design-baseline is a **donor** — `src/` exports are copy-source for downstream projects.
A documented public export (e.g. the primitives declared by a MANIFEST `primitives_dir`,
the export `design-baseline/archetypes/<slug>`)
being unused in the local demo/gallery is the *expected, correct* state, not dead code.
Hygiene sweeps that grep for in-repo consumers will over-flag these. Before pruning an
"orphaned" export, check whether it's documented public API; if so, keep it. The genuine
dead artifacts are undocumented ones with no consumer AND no doc reference (e.g. a UI
primitive whose only trace was a JSDoc mention).

## Layer 7: a hand-rolled state plane is not automatically drift — read the contract first

An audit that greps for "shells not using `StateView`" **over-flags by design**, because
Layer 7 deliberately prescribes *different* chrome per surface. Before "fixing" any
loading/empty/error plane, check the archetype's own Layer 7 and
`docs/archetypes/README.md` → "Layer 7 — canonical state treatments":

- **Skeletons are mandated, not drift, in P (kanban) and H (feed).** Both contracts say
  "never a page spinner" — and `StateView variant="loading"` *is* a centered text
  spinner. Routing them through it would introduce violations. `README.md` states it
  globally: no skeleton screens in a list/table shell, and the J (crud-dialog) body is
  the **one** sanctioned skeleton in the baseline.
- **C (detail-overview) and M (matrix-grid) delegate loading to a route-level
  `loading.tsx`** — C's Layer 7 says outright that the archetype ships no loading
  primitive. Its bare `<Card>` early return is a feature-availability gate, not a plane.
- **Error has two treatments chosen by _surface_, not by cause.** A full destructive
  `<Alert>` is for a shell/page load failure (A, K, D2). A form or dialog inline error
  (B root error, J entity fetch) uses the compact tinted box
  `bg-destructive/10 p-4 rounded text-sm text-destructive`. Swapping one for the other
  is a violation in both directions.

The genuine drift signal is narrower: a plane that hand-rolls chrome the contract says
should be **shared** (an inline empty `<div>` where the canonical empty is `StateView`),
or a skeleton built from raw `animate-pulse`/`bg-muted` divs instead of the `<Skeleton>`
atom. Both were real; the other four flagged sites were correct as written.

## Documented variation is not drift — and a workaround is not a second bug

A consistency audit greps for *"shells that differ"*, which cannot distinguish a
divergence from a **sanctioned variation**. Three sweeps in a row over-flagged in this
same direction; every one of the following was reported as a defect and is correct:

- **F2's dual header path** (board form vs classic) is an explicit **"Allowed variation"**
  in `tabbed-settings.md` Layer 3, and it exists for a stated reason: the on-surface
  header bar had no `subtitle`/`icon` slot. Forcing board-form unconditionally would
  have *removed* the only way to render a subtitle on an F2 page.
- **C's `surface="separated"` default.** The "One outer frame, not a card scatter"
  gate is scoped to `layout="rail"` pages (`detail-overview.md`) — the default is
  `layout="vertical"`, where it does not apply.
- **J's `px-6` header gutter.** `STYLE.md`'s surface-padding table assigns `px-6 py-4`
  to the dialog surface; `px-5` is the *page*-surface gutter. "Unifying" the dialog
  header to `px-5` would have misaligned it from its own body directly beneath.

Two rules of thumb. **(1) Read the archetype's own contract before believing a
cross-archetype comparison** — the contracts encode intent that a diff cannot see.
**(2) When an audit reports both a capability gap and the workaround for that gap as
separate findings, they are usually one finding.** Here, "SurfaceHeader has no subtitle
slot" and "F2 silently falls back to the classic header" were the same defect seen from
two ends; fixing the gap (adding the slot) is the real work, and forcing the fallback
away without it would have been a regression.

## esbuild parses every ancestor `package.json` — pin `--configLoader runner`

Vite's default config loader (`bundle`) hands `vite.config.ts` / `vitest.config.ts` to
esbuild, and esbuild builds directory info for the **whole ancestor chain**, parsing each
directory's `package.json` — not just the nearest one. Run from `.worktrees/<slug>`, that
reaches the main checkout's `package.json` two levels up. When a concurrent session leaves
that file mid-merge, an unrelated worktree's run dies with
`Expected string in JSON but found "<<"`.

Two things that look like fixes and are not: **`root:`** (`vite.config.ts` already pins
`root: "gallery"` and still climbed) and **a local `node_modules`** (verified — the climb
is dir-info caching, not module resolution). The only lever is skipping esbuild:
`--configLoader runner` on every `vite`/`vitest` script. `native` also works but relies on
Node's type-stripping; `runner` is the safer default.

Generalizes past this repo: any parallel-worktree layout where a shared ancestor holds a
`package.json` can have one session's merge conflict break another session's test run.
