# Backlog

This folder holds this repo's tickets. **This README is the schema authority** — the `/ticket` skill reads it once at the start of every capture/enrich run to learn the canonical `area` list and the frontmatter fields this project uses. When it is present, it overrides `/ticket`'s built-in default schema; keep it in sync with what tickets actually carry.

## Layout & lifecycle

A ticket is one Markdown file named `<slug>.md`. Its **location** encodes lifecycle stage; its `status` frontmatter encodes enrichment readiness. The two are orthogonal.

| Location | Stage | Written by |
|----------|-------|-----------|
| `docs/backlog/<slug>.md` | Open — captured, awaiting pickup | `/ticket` |
| `docs/backlog/wip/<slug>.md` | In flight — a `/feat` worktree is implementing it | `/feat` (moves the file here at start) |
| `docs/backlog/archive/<slug>.md` | Resolved — shipped or closed; immutable history | `/ship` / manual archive |

**`archive/` is immutable.** `/ticket --enrich` refuses to touch it; only `--regrade` will read it. Never hand-write a ticket file — capture and enrichment go through `/ticket` so the gate is applied.

## Frontmatter schema

Every ticket opens with a YAML frontmatter block. Required fields are always present; optional fields appear only when they apply.

| Field | Req? | Type / values | Meaning |
|-------|------|---------------|---------|
| `area` | ✅ | one of the canonical buckets below (or `other`) | Workstream this ticket belongs to. |
| `opened` | ✅ | `YYYY-MM-DD` | Date the ticket was first captured. |
| `status` | ✅ | `needs-enrichment` \| `ready` \| `done` | Enrichment readiness (see below). Set by the gate, not by hand. |
| `gate` | ✅ | block — see [The gate block](#the-gate-block) | Quality-gate result: `score` / `passed` / `failed` / `graded_at`. |
| `kind` | ⬚ | `ops` \| `roadmap` | How the ticket is closed. Omitted for the normal capture → `/feat` → archive lifecycle. |
| `model` | ⬚ | `sonnet` \| `opus` \| `fable` | Suggested implementation model, consumed by `/feat`. Never `haiku`. |
| `model_reason` | ⬚ | one line | Why that tier — pairs with `model`. |

### `status` values

- **`needs-enrichment`** — gate `score < 5`; the ticket is missing something (see its `gate.failed` list) before it's ready to hand off. Re-grade after editing with `/ticket --regrade <slug>`.
- **`ready`** — gate `score == 5`; hand off with `/feat <slug>`.
- **`done`** — resolved. Lives in `archive/`.

### `kind` — how a ticket is closed (optional)

Distinct from `area` (which names a *workstream*). Most tickets omit `kind`.

- **`kind: ops`** — the deliverable is a runtime action that leaves **no git artifact** (apply a migration, rotate a secret, run a one-off backfill, claim a lock). Every *What to do* bullet is "run/apply/configure X against a live system" rather than "edit/add/write a file". Mixed code+ops → omit `kind` and let it go through `/feat`.
- **`kind: roadmap`** — the ticket is itself a scope/roadmap document enumerating phases or sub-tickets, not a single actionable unit.

### `model` — suggested implementation tier (optional)

Filled by `/ticket --enrich` (an explicit prior value always wins). Consumed by `/feat`.

- **`sonnet`** — mechanical/scoped: clear acceptance, an established pattern to follow, no design decisions left.
- **`opus`** — default: real implementation judgment, tradeoffs, or ambiguity remains.
- **`fable`** — roadmap-scale slices or long autonomous runs needing sustained design judgment (≈2× opus cost).

## The gate block

`/ticket` scores every ticket 0–5 against five criteria and records the result in the `gate` block. `score == 5` sets `status: ready`; anything less sets `status: needs-enrichment`.

```yaml
gate:
  score: 4                     # 0–5, one point per passed criterion
  passed: [title, context, what-to-do, related]
  failed:
    - acceptance: "no testable assertion — bullets are plausible but unverified"
  graded_at: 2026-07-05T00:00:00Z   # ISO-8601 timestamp of the grading run
```

- `passed` / `failed` reference the five criteria by these canonical slugs: **`title`**, **`context`**, **`what-to-do`**, **`acceptance`**, **`related`**.
- `failed` is a list of single-key maps (`- <criterion>: "<one-line reason>"`); when nothing failed it is the empty list (`failed: []`).

The five criteria:

| Slug | Passes when |
|------|-------------|
| `title` | Title is ≥5 words and names the subsystem as a noun phrase — no trailing period. |
| `context` | Context is ≥1 paragraph naming a concrete artifact (file path, route, named concept) that exists in the repo. |
| `what-to-do` | ≥1 actionable bullet: has a verb, names a concrete artifact, not `?`-prefixed. |
| `acceptance` | ≥1 testable bullet using assertion words (shows / returns / no longer / after / when / matches), not `?`-prefixed. |
| `related` | If neighbors exist, ≥1 is linked. Auto-satisfied when there genuinely are none. |

Only unprefixed (asserted) bullets count toward the gate; residual `?`-prefixed bullets are ignored.

## Canonical `area` buckets

`/ticket` classifies each thought against **this pinned list**. If nothing fits, it uses `other` — recurring `other`s are the signal to add a bucket here.

| `area` | Scope |
|--------|-------|
| `archetypes` | Page-archetype contracts, reference primitives, demos, MANIFEST (`src/components/archetypes/`, `docs/archetypes/`). |
| `layout` | The app-shell / layout primitives (`src/components/layout/` — AppShell, Sidebar, Header, shared chrome). |
| `ui` | The shadcn/ui primitive layer (`src/components/ui/`). |
| `a11y` | Accessibility fixes across primitives and shells (keyboard operability, ARIA, roving-tabindex). |
| `i18n` | Localization / hardcoded-string removal in primitives. |
| `tooling` | The plugin skills, gallery build, config, and workflow scaffolding (`/style-baseline`, `/style-archetypes`, `/promote-archetype`, vite config). |
| `docs` | Documentation reconciliation — JSDoc / STYLE.md / spec prose drift. |

## Body conventions

After the frontmatter, tickets use these H2 sections (empty ones are omitted, not left blank):

- `# <Title>` — one line, no trailing period.
- `## Context` — one paragraph; names the concrete subsystem.
- `## What to do` — `- [ ]` checkboxes; `?`-prefixed for residual unknowns.
- `## Acceptance` — testable bullets (assertion words).
- `## Related` — links to sibling tickets and matching ADRs.
- `## Open question` — only when `/ticket` surfaced a real design fork; records both question and answer.
