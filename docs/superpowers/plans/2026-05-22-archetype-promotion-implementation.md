# Archetype Promotion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the archetype layer in `~/Documents/dev/design-baseline/` by extracting brickshop's three most-mature archetypes (A list-with-detail, D2 settings-table, J crud-dialog) plus a methodology framework, and create `/style-archetypes` (apply to target) and `/promote-archetype` (extract from source) skills as siblings to the existing `/style-baseline`.

**Architecture:** Brickshop-manager is the source of truth where archetypes mature. Design-baseline holds generalised versions. Each archetype ships as a spec doc + reference primitives + sandbox demo (proves generic-ness against a far-from-brickshop domain). A `MANIFEST.json` drives apply and update flows. Brickshop keeps its bespoke implementations — drift is tracked and re-promoted on demand.

**Tech Stack:** TypeScript, React 19, shadcn/ui, Tailwind 4. No runtime deps added beyond what the donor already lists. Skills are markdown files in `~/.claude/commands/`. Donor gets a minimal `tsconfig.json` + `react`/`react-dom` types to enable `npx tsc --noEmit` for sandbox-demo verification (the donor remains non-buildable as an app — typecheck only).

**Reference spec:** `~/Documents/dev/design-baseline/docs/superpowers/specs/2026-05-22-archetype-promotion-design.md`. Read it before starting.

---

## File map

**Donor (created):**
- `docs/archetypes/README.md` — methodology framework (12-layer grid, kinds, rule-of-2, phases, promotion contract)
- `docs/archetypes/MANIFEST.json` — versioned registry of shipped archetypes
- `docs/archetypes/list-with-detail.md` — A spec (generalised from brickshop v1.2)
- `docs/archetypes/settings-table.md` — D2 spec (generalised from brickshop v1)
- `docs/archetypes/crud-dialog.md` — J spec (generalised from brickshop v1; primitives designed new)
- `src/components/archetypes/list-with-detail/{ListWithDetailShell,ListWithDetailToolbar,ListWithDetailEmptyState}.tsx` + `index.ts`
- `src/components/archetypes/settings-table/{SettingsTableShell}.tsx` + `index.ts`
- `src/components/archetypes/crud-dialog/{CrudDialogSheet,CrudDialogHeader,CrudDialogBody,CrudDialogFooter,useCrudDialogMode}.{tsx,ts}` + `index.ts`
- `src/examples/list-with-detail-demo.tsx` — sandbox consumer (podcast library)
- `src/examples/settings-table-demo.tsx` — sandbox consumer (recipe collection)
- `src/examples/crud-dialog-demo.tsx` — sandbox consumer (fitness log)
- `tsconfig.json` — typecheck-only config for donor

**Donor (modified):**
- `package.json` — add `react`, `react-dom`, `typescript`, type packages to devDependencies; remove the "not buildable" claim
- `docs/STYLE.md` — add an Archetypes section pointing at `docs/archetypes/`
- `README.md` — file tree + Option 1/2 mention archetype layer + sibling skills

**Skills (created):**
- `~/.claude/commands/style-archetypes.md`
- `~/.claude/commands/promote-archetype.md`

**Skills (modified):**
- `~/.claude/commands/style-baseline.md` — final report mentions sibling commands

**Memory (modified):**
- `~/.claude/projects/-Users-christoph-Documents-dev/memory/reference_design_baseline.md` — mention archetype layer
- `~/.claude/projects/-Users-christoph-Documents-dev/memory/MEMORY.md` — update line

**External:**
- A test target with `/style-baseline` already applied is required for Task 7 verification. Use `~/Documents/dev/mistra/frontend/` — it already has the baseline (PR #100) and runs with `noUncheckedIndexedAccess` + `noUnusedLocals`.

---

## Verification model

This work is doc-heavy and skill-heavy, not unit-test-heavy. "Tests" are:
- **For primitives:** `npx tsc --noEmit` from the donor must compile the sandbox demos against the primitives with zero domain-type imports. If a primitive cannot satisfy its sandbox demo without leaking project types, the primitive is wrong.
- **For skills:** smoke-test against a real target (mistra/frontend) or the source project (brickshop-manager). `--dry-run` modes let us verify behavior without writing files.
- **For specs:** round-trip check — re-read the generalised spec from the source project's perspective. If brickshop's actual implementation can still be described by the generic spec, the generalisation held.

There is no test runner to add. No CI. Verification is run-and-read.

---

## Task 1: Donor scaffolding

**Files:**
- Create: `~/Documents/dev/design-baseline/docs/archetypes/MANIFEST.json`
- Create: `~/Documents/dev/design-baseline/docs/archetypes/README.md`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/.gitkeep` (placeholder — donor isn't git but file marks dir exists)
- Modify: `~/Documents/dev/design-baseline/docs/STYLE.md` (append Archetypes section)
- Modify: `~/Documents/dev/design-baseline/README.md` (file tree + Option 1 + Option 2)

- [ ] **Step 1.1: Create directories**

```bash
mkdir -p ~/Documents/dev/design-baseline/docs/archetypes
mkdir -p ~/Documents/dev/design-baseline/src/components/archetypes
ls ~/Documents/dev/design-baseline/docs/archetypes
ls ~/Documents/dev/design-baseline/src/components/archetypes
```

Expected: both dirs exist, both are empty.

- [ ] **Step 1.2: Write empty MANIFEST.json**

Write `~/Documents/dev/design-baseline/docs/archetypes/MANIFEST.json`:

```json
{
  "version": 1,
  "archetypes": []
}
```

Entries will be appended by Tasks 5, 10, 11 as each archetype is extracted.

- [ ] **Step 1.3: Write framework README.md**

Write `~/Documents/dev/design-baseline/docs/archetypes/README.md`. The content is a generalised version of `~/Documents/dev/brickshop-manager/docs/archetypes/README.md` with brickshop-specific status rows, archetype examples, and ROADMAP references stripped. The output keeps:

- The intro paragraph (what archetypes are, why they exist) — rewritten without "Brickshop Manager" references.
- "Archetype kinds" table — keep the page / dialog / flow / component split with their layer counts (12 / 15 / 13 / 11).
- "The twelve layers" section verbatim (layers are framework, not project-specific).
- "The fifteen layers (dialog)" — same 12 + mode contract + footer contract + cross-context invocation. Spell them out.
- "The audit process" section verbatim (scope-lock → audit → spec → migration phases).
- "Rule of 2" rule verbatim.
- **New section: "Promotion contract"** — explains how baseline gets archetypes (`/promote-archetype` from source projects), how targets get them (`/style-archetypes`), and the maturity gates (spec v1+ locked, Phase 4 started, stable for one session).
- **New section: "What baseline does NOT ship"** — auth, data fetching, charts, i18n, project-specific archetypes.

Strip: the "twelve archetypes" status table (brickshop-specific), the "currently in scope" per-archetype blocks (brickshop-specific), references to brickshop pages.

- [ ] **Step 1.4: Add Archetypes section to STYLE.md**

Modify `~/Documents/dev/design-baseline/docs/STYLE.md`. After the "Utils (`src/utils/`)" section and before "Layout primitives", add:

```markdown
## Archetypes (`src/components/archetypes/` + `docs/archetypes/`)

Archetypes are page-shape contracts that sit on top of the layout primitives. Each archetype is a 12–15 layer spec covering route, shell, header, toolbar, data fetching, types, mutations, mobile, permissions — plus reference primitive components that implement the chrome. See `docs/archetypes/README.md` for the methodology.

Apply with the sibling command `/style-archetypes` (requires `/style-baseline` to have run first). The first ship covers list-with-detail, settings-table, and crud-dialog.

Archetypes are optional — projects that don't want the page-shape vocabulary can use the baseline chrome alone. Project-specific archetypes live alongside baseline ones in the target's `docs/archetypes/`; `/style-archetypes` never touches files that aren't in the MANIFEST.
```

- [ ] **Step 1.5: Update donor README.md**

Modify `~/Documents/dev/design-baseline/README.md`.

Update the file tree (after the `utils/` block, before the `components/` block — keep alphabetical-ish order broken by purpose):

```
    ├── components/
    │   ├── ui/                     # 36 shadcn/ui primitives
    │   ├── layout/                 # AppShell, AppSidebar, AppHeader (router-agnostic)
    │   └── archetypes/             # page-shape contracts (list-with-detail, settings-table, crud-dialog)
```

Update Option 1 description (after the chrome bullet):

```
Optionally, run `/style-archetypes` after `/style-baseline` to also copy the page-shape archetypes (list-with-detail, settings-table, crud-dialog) into the project. See `docs/archetypes/README.md` for the methodology.
```

Update Option 2 with a new step after step 7:

```
8. (Optional) Apply the archetype layer: copy `docs/archetypes/` and `src/components/archetypes/` into the project. See `docs/archetypes/README.md` for what's in each archetype and `docs/STYLE.md` for the convention.
```

- [ ] **Step 1.6: Verify scaffolding**

```bash
ls -la ~/Documents/dev/design-baseline/docs/archetypes
ls -la ~/Documents/dev/design-baseline/src/components/archetypes
cat ~/Documents/dev/design-baseline/docs/archetypes/MANIFEST.json
grep -A2 "Archetypes" ~/Documents/dev/design-baseline/docs/STYLE.md | head -10
grep "archetypes/" ~/Documents/dev/design-baseline/README.md
```

Expected: directories exist with their contents, MANIFEST has empty archetypes array, STYLE.md has the new section, README.md mentions `archetypes/`.

- [ ] **Step 1.7: No commit step**

Donor is not a git repo. Skip commit. Move to Task 2.

---

## Task 2: Donor typecheck setup

This enables `npx tsc --noEmit` to verify that primitives (Task 4+) compile against zero domain types using sandbox demos.

**Files:**
- Modify: `~/Documents/dev/design-baseline/package.json` (add devDependencies for typecheck)
- Create: `~/Documents/dev/design-baseline/tsconfig.json`
- Modify: `~/Documents/dev/design-baseline/README.md` (drop the "not installable as-is" claim, mention `npm install && npx tsc --noEmit` for donor verification)

- [ ] **Step 2.1: Add typecheck deps to package.json**

Modify the `devDependencies` block in `~/Documents/dev/design-baseline/package.json` to add:

```json
"@types/react": "^19.0.0",
"@types/react-dom": "^19.0.0",
"react": "^19.0.0",
"react-dom": "^19.0.0",
"typescript": "^5.6.0"
```

Keep existing `@tailwindcss/typography` and `tailwindcss` entries. Update the package description to: `"Reference list of runtime + dev dependencies for design-baseline. Donor is typecheck-only (run npx tsc --noEmit); not a buildable app."` Remove the older claim about not being installable.

- [ ] **Step 2.2: Write tsconfig.json**

Write `~/Documents/dev/design-baseline/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

The strict flags mirror what real targets use (per the original ticket — `noUncheckedIndexedAccess: true`, `noUnusedLocals: true`). Catches generalisation gaps that loose configs would hide.

- [ ] **Step 2.3: Install and verify**

```bash
cd ~/Documents/dev/design-baseline
npm install
npx tsc --noEmit
```

Expected: install succeeds; `tsc --noEmit` exits 0 (the existing `src/components/ui/`, `src/hooks/`, `src/utils/`, etc. all typecheck under strict mode — this was verified by the mistra extraction work).

If `tsc` reports errors in the existing code, **stop and report**. The donor must compile clean before we add archetype code on top.

- [ ] **Step 2.4: Add .gitignore-style note for node_modules**

Donor is not git but `node_modules/` should not be considered part of the donor tree. Write `~/Documents/dev/design-baseline/.gitignore`:

```
node_modules/
*.log
.DS_Store
```

This prevents accidental copying of `node_modules` if anyone ever does `cp -R` on the donor.

- [ ] **Step 2.5: Update README to mention typecheck**

In `~/Documents/dev/design-baseline/README.md`, find the "**This repo is donor source, not a buildable app.**" line. Replace with:

```
**This repo is donor source, not a buildable app.** Files in `src/` are meant to be copied into a target project — either manually or via the `/style-baseline` skill. The donor itself is typecheck-only: run `npm install && npx tsc --noEmit` to verify that primitives compile against the strict TypeScript settings real targets use.
```

- [ ] **Step 2.6: No commit step**

Move to Task 3.

---

## Task 3: Extract A — list-with-detail spec

**Files:**
- Read: `~/Documents/dev/brickshop-manager/docs/archetypes/list-with-detail.md` (source spec, v1.2)
- Read: `~/Documents/dev/brickshop-manager/docs/archetypes/list-with-detail-audit.md` (drift findings — informs allowed-variation carve-outs)
- Read: `~/Documents/dev/brickshop-manager/docs/adr/0030-page-archetypes-as-standardisation-contract.md` (governing ADR)
- Create: `~/Documents/dev/design-baseline/docs/archetypes/list-with-detail.md`

- [ ] **Step 3.1: Read source materials**

Read the three source files above. Note for each of the 12 layers:
- What brickshop's spec says (the rule).
- Where the rule references brickshop primitives (`StandardTableShell`, `ItemMasterSummary`) → rename to baseline equivalents.
- Where the rule references brickshop pages (`/orders`, `/sourcing`, `/inventory`) → replace with generic examples.
- Where the rule references Supabase fragments, React Query keys, domain types → strip and replace with a "data shape contract" (what shape the consumer must provide).
- What the audit doc flagged as "essential variation" → preserve as an explicit allowed-variation carve-out in the generic spec.
- What the audit flagged as "accidental drift" → not relevant; ignore.

- [ ] **Step 3.2: Write generalised spec**

Write `~/Documents/dev/design-baseline/docs/archetypes/list-with-detail.md`. Structure:

```markdown
---
key: A
slug: list-with-detail
kind: page
version: 1.0
promoted_from: brickshop-manager
promoted_at: 2026-05-22
source_spec_version: 1.2
status: locked
---

# Archetype A — List-with-detail

## Purpose

[1 paragraph: when you reach for this archetype. Generic example: an /items page that lists rows and opens detail in a side panel or right rail.]

## Reference primitive

`<ListWithDetailShell>` in `src/components/archetypes/list-with-detail/`. Composes `ListWithDetailToolbar` (filters, search, page-level actions) and `ListWithDetailEmptyState` (empty / loading / error views). Detail panel is consumer-owned (slot prop).

## Layer 1 — Route config

[Rule: path shape, params, lazy-load, auth wrapper. Generic. No specific routes.]

## Layer 2 — Page shell

[Rule: which layout wraps the page. References `<AppShell>` from baseline layout primitives.]

## Layer 3 — Page header

[Rule: title + icon + optional subtitle + breadcrumb. Action buttons NOT in header — see Layer 4.]

## Layer 4 — Toolbar

[Rule: filters, search, quick-filter chips, page-level actions live here. Render via `<ListWithDetailToolbar>`. Allowed variation: which filters appear; required: at least one search input or filter group.]

## Layer 5 — Content wrapper

[Rule: card or plain shell. Padding / max-width / scroll. References `<ListWithDetailShell>`.]

## Layer 6 — Table / grid

[Rule: column shape contract. Identifier column convention (uses `text-primary` for clickable cells). Date columns use `formatDate()` from the consumer's util — the primitive does not format. Number formatting via consumer. Row interaction: click opens detail.]

## Layer 7 — Empty / loading / error states

[Rule: each has a dedicated rendering. `<ListWithDetailEmptyState>` covers all three with mode prop. Required states: `empty`, `loading`, `error`. Optional: `filtered-empty`.]

## Layer 8 — Data fetching (contract)

[Generic data shape: the primitive expects `rows: Row[]`, `isLoading: boolean`, `error: unknown | null` via props. No assumptions about React Query, SWR, fetch, or any backend. Consumer wires data however they want.]

## Layer 9 — Type shapes (contract)

[The primitive is generic in `<Row>`. Consumers pass a discriminated row type. The primitive does not assume any domain fields beyond what the consumer's column config references.]

## Layer 10 — Mutations & invalidation (contract)

[Out of primitive scope. The consumer's row-click handler / row-action menu owns mutation. The primitive exposes `onRowSelect(row: Row): void` and optional `rowActions?: RowAction<Row>[]` for action menus.]

## Layer 11 — Mobile variant

[Rule: mobile collapses to single-column rows, swipe-to-action allowed. Detail opens full-screen modal instead of side panel. Primitive handles via internal media query.]

## Layer 12 — Permissions

[Out of primitive scope. Consumer renders the page (or doesn't) via route-level auth.]

## Allowed variations

[List the carve-outs the brickshop audit identified as essential — e.g., quick-filter chips on some pages, status pill on others, tab layout for some controls. Phrase generically.]

## Forbidden patterns

[Generic forbidden list — e.g., no inline edit (use detail panel or dialog), no row drag-reorder by default (allowed via opt-in prop), no embedded D2 settings-table (would conflict with list semantics).]

## Migration notes (project-extension contract)

[How a target project extends this archetype with project-specific behavior without violating the spec. Example: project-specific cell renderers, project-specific row-action types.]
```

Each `[bracketed]` paragraph is a content placeholder — write the actual rule text by transforming the corresponding section of brickshop's spec. The result must be readable end-to-end without referencing brickshop.

- [ ] **Step 3.3: Round-trip check**

Re-read the generic spec from brickshop's perspective: does brickshop's `/orders` page (or `/sourcing` Saved Searches tab) still satisfy every rule? If brickshop has behavior the generic spec doesn't permit, either:
- Add an allowed-variation carve-out in the generic spec (preferred for generic-useful extensions), or
- Document the behavior as a brickshop project-extension and note it doesn't propagate to baseline.

Decide every red explicitly before locking the spec.

- [ ] **Step 3.4: No commit step**

Move to Task 4.

---

## Task 4: Extract A — primitives

**Files:**
- Read: brickshop's `StandardTableShell`, `<PageHeader>`, `<SortableHeader>`, `ItemInstancesTable` implementations (find paths via `find ~/Documents/dev/brickshop-manager/src -name "StandardTableShell*"`)
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/list-with-detail/ListWithDetailEmptyState.tsx`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/list-with-detail/index.ts`

- [ ] **Step 4.1: Read brickshop primitives**

```bash
find ~/Documents/dev/brickshop-manager/src -name "StandardTableShell*" -o -name "PageHeader*" -o -name "SortableHeader*"
```

Read each file. Identify:
- **Chrome:** wrapping elements, layout, ARIA, keyboard handlers, transitions, spacing.
- **Data plumbing:** anywhere a Supabase fragment is consumed, a React Query key is referenced, a domain type (`Order`, `Customer`, `LotInstance`) is used, a project-specific cell renderer is invoked.

- [ ] **Step 4.2: Write `ListWithDetailShell.tsx`**

Write `~/Documents/dev/design-baseline/src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`. Skeleton signature:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListWithDetailEmptyState } from "./ListWithDetailEmptyState";

export type ListColumn<Row> = {
  key: string;
  header: React.ReactNode;
  cell: (row: Row) => React.ReactNode;
  /** Use `text-primary` automatically for the cell that uniquely identifies the row (typically the first one). */
  isIdentifier?: boolean;
  width?: string | number;
  align?: "left" | "right" | "center";
};

export type RowAction<Row> = {
  label: string;
  onSelect: (row: Row) => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
};

export type ListWithDetailShellProps<Row> = {
  rows: Row[];
  columns: ListColumn<Row>[];
  getRowId: (row: Row) => string;
  isLoading?: boolean;
  error?: unknown | null;
  onRowSelect?: (row: Row) => void;
  selectedRowId?: string | null;
  rowActions?: RowAction<Row>[];
  toolbar?: React.ReactNode;
  detail?: React.ReactNode;
  emptyStateMessage?: string;
  className?: string;
};

export function ListWithDetailShell<Row>(props: ListWithDetailShellProps<Row>): React.ReactElement {
  // Compose: <header card with toolbar>, <table area>, <optional detail rail>.
  // Use ListWithDetailEmptyState when rows.length === 0 / isLoading / error.
  // Apply isIdentifier → text-primary on that column's cell.
  // onRowSelect fires on row click.
  // Render rowActions via DropdownMenu (shadcn) in the rightmost column when provided.
  // Mobile: collapse detail to full-screen overlay (use useIsMobile from @/hooks/use-mobile).
  // Implementation body left for the implementing agent to write following this contract.
}

ListWithDetailShell.displayName = "ListWithDetailShell";
```

Implementation body follows from the contract: render the table from columns + rows, swap empty/loading/error from `ListWithDetailEmptyState`, render `toolbar` above the table, render `detail` in a right rail (desktop) or sheet (mobile). Use `<Table>` from `@/components/ui/table`.

**Hard constraints:**
- Zero imports from any domain. Only `@/lib/utils`, `@/components/ui/*`, `@/hooks/use-mobile`, `react`.
- No Supabase, no React Query, no project-specific types.
- Generic in `<Row>` — must compile without any `extends` constraint.

- [ ] **Step 4.3: Write `ListWithDetailToolbar.tsx`**

Write `~/Documents/dev/design-baseline/src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx`. Skeleton:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export type ListWithDetailToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  quickFilters?: React.ReactNode;
  pageActions?: React.ReactNode;
  className?: string;
};

export function ListWithDetailToolbar(props: ListWithDetailToolbarProps): React.ReactElement {
  // Compose: [search input | filters slot | quick-filter chips | page actions right-aligned]
  // All slots optional; render only what's provided.
  // Implementation body left for the implementing agent.
}

ListWithDetailToolbar.displayName = "ListWithDetailToolbar";
```

- [ ] **Step 4.4: Write `ListWithDetailEmptyState.tsx`**

Write `~/Documents/dev/design-baseline/src/components/archetypes/list-with-detail/ListWithDetailEmptyState.tsx`. Skeleton:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type ListEmptyMode = "empty" | "loading" | "error" | "filtered-empty";

export type ListWithDetailEmptyStateProps = {
  mode: ListEmptyMode;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
};

export function ListWithDetailEmptyState(props: ListWithDetailEmptyStateProps): React.ReactElement {
  // Switch on mode:
  // - loading: render <Skeleton> rows
  // - empty: centered illustration + message
  // - filtered-empty: "no matches — try clearing filters"
  // - error: <Alert variant="destructive"> with message + optional retry button
  // Implementation body left for the implementing agent.
}

ListWithDetailEmptyState.displayName = "ListWithDetailEmptyState";
```

- [ ] **Step 4.5: Write `index.ts`**

Write `~/Documents/dev/design-baseline/src/components/archetypes/list-with-detail/index.ts`:

```ts
export { ListWithDetailShell } from "./ListWithDetailShell";
export type { ListWithDetailShellProps, ListColumn, RowAction } from "./ListWithDetailShell";
export { ListWithDetailToolbar } from "./ListWithDetailToolbar";
export type { ListWithDetailToolbarProps } from "./ListWithDetailToolbar";
export { ListWithDetailEmptyState } from "./ListWithDetailEmptyState";
export type { ListEmptyMode, ListWithDetailEmptyStateProps } from "./ListWithDetailEmptyState";
```

- [ ] **Step 4.6: Typecheck**

```bash
cd ~/Documents/dev/design-baseline
npx tsc --noEmit
```

Expected: exits 0. If errors, fix the primitive — do not add `// @ts-ignore` or relax tsconfig. Errors here mean the primitive is wrong.

- [ ] **Step 4.7: No commit step**

Move to Task 5.

---

## Task 5: Sandbox demo for A + MANIFEST entry

**Files:**
- Create: `~/Documents/dev/design-baseline/src/examples/list-with-detail-demo.tsx`
- Modify: `~/Documents/dev/design-baseline/docs/archetypes/MANIFEST.json` (append A entry)

- [ ] **Step 5.1: Write types first (no reference to brickshop spec)**

In your editor (don't write the file yet), draft the demo's types from cold — pretend you've never read brickshop's spec. Use a podcast library domain. Types:

```tsx
type Podcast = {
  id: string;
  title: string;
  host: string;
  episodeCount: number;
  lastPublishedAt: string; // ISO date
  category: "interview" | "narrative" | "panel" | "solo";
};
```

If you find yourself wanting a field the primitive doesn't accept (e.g., the primitive demands a `name` instead of `title`), that's a generalisation gap — the primitive is wrong. Fix the primitive in Task 4 before proceeding.

- [ ] **Step 5.2: Write the demo**

Write `~/Documents/dev/design-baseline/src/examples/list-with-detail-demo.tsx`:

```tsx
import { useState } from "react";
import {
  ListWithDetailShell,
  ListWithDetailToolbar,
  type ListColumn,
} from "@/components/archetypes/list-with-detail";

type Podcast = {
  id: string;
  title: string;
  host: string;
  episodeCount: number;
  lastPublishedAt: string;
  category: "interview" | "narrative" | "panel" | "solo";
};

const PODCASTS: Podcast[] = [
  { id: "p1", title: "Distributed Coffee", host: "Lena Pak",
    episodeCount: 142, lastPublishedAt: "2026-05-18", category: "interview" },
  { id: "p2", title: "Riverbed", host: "Olu Adebayo",
    episodeCount: 23,  lastPublishedAt: "2026-05-20", category: "narrative" },
  { id: "p3", title: "Three Things",  host: "Mei Tanaka",
    episodeCount: 89,  lastPublishedAt: "2026-04-11", category: "panel" },
];

const columns: ListColumn<Podcast>[] = [
  { key: "title", header: "Show", cell: (p) => p.title, isIdentifier: true },
  { key: "host", header: "Host", cell: (p) => p.host },
  { key: "episodes", header: "Episodes", cell: (p) => p.episodeCount, align: "right" },
  { key: "last", header: "Last published", cell: (p) => p.lastPublishedAt },
  { key: "category", header: "Category", cell: (p) => p.category },
];

export function ListWithDetailDemo() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = PODCASTS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const selected = filtered.find((p) => p.id === selectedId) ?? null;

  return (
    <ListWithDetailShell<Podcast>
      rows={filtered}
      columns={columns}
      getRowId={(p) => p.id}
      onRowSelect={(p) => setSelectedId(p.id)}
      selectedRowId={selectedId}
      toolbar={
        <ListWithDetailToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search shows…"
        />
      }
      detail={
        selected ? (
          <div className="p-4">
            <h3 className="font-medium">{selected.title}</h3>
            <p className="text-muted-foreground text-sm">by {selected.host}</p>
            <p className="text-muted-foreground text-sm mt-2">
              {selected.episodeCount} episodes · {selected.category}
            </p>
          </div>
        ) : (
          <div className="p-4 text-muted-foreground text-sm">
            Select a show to see details.
          </div>
        )
      }
    />
  );
}
```

- [ ] **Step 5.3: Typecheck**

```bash
cd ~/Documents/dev/design-baseline
npx tsc --noEmit
```

Expected: exits 0. The demo must compile against the primitive with zero brickshop-shaped types.

If a type error reveals the primitive can't accept the podcast types as written, fix the **primitive** in Task 4 (loosen a constraint, add a missing prop, generalise a callback signature). Do not bend the demo to match a too-narrow primitive — the demo is the contract.

- [ ] **Step 5.4: Append A entry to MANIFEST.json**

Modify `~/Documents/dev/design-baseline/docs/archetypes/MANIFEST.json`:

```json
{
  "version": 1,
  "archetypes": [
    {
      "key": "A",
      "slug": "list-with-detail",
      "version": "1.0",
      "promoted_from": "brickshop-manager",
      "promoted_at": "2026-05-22",
      "source_spec_version": "1.2",
      "spec": "docs/archetypes/list-with-detail.md",
      "primitives_dir": "src/components/archetypes/list-with-detail",
      "example": "src/examples/list-with-detail-demo.tsx"
    }
  ]
}
```

- [ ] **Step 5.5: Verify**

```bash
cd ~/Documents/dev/design-baseline
npx tsc --noEmit
cat docs/archetypes/MANIFEST.json | python3 -m json.tool
ls -la src/components/archetypes/list-with-detail/
ls -la src/examples/list-with-detail-demo.tsx
```

Expected: typecheck green; MANIFEST parses as valid JSON with one entry; all expected files exist.

---

## Task 6: Write `/style-archetypes` skill

**Files:**
- Create: `~/.claude/commands/style-archetypes.md`

- [ ] **Step 6.1: Write the skill file**

Write `~/.claude/commands/style-archetypes.md`. The skill follows the same shape as `~/.claude/commands/style-baseline.md` (read it first as a reference). Required sections in order:

```markdown
---
description: Apply baseline archetypes (page-shape contracts + reference primitives) to the current project. Usage - /style-archetypes [keys...] [--list] [--update] [--force]
---

You are applying the design-baseline archetype layer to the current project. Archetypes are page-shape contracts (list-with-detail, settings-table, crud-dialog, …) with reference primitives. The donor lives at `~/Documents/dev/design-baseline/`; the manifest at `docs/archetypes/MANIFEST.json` lists what's available.

## Argument parsing

Parse `$ARGUMENTS`:
- `--list` → print manifest, exit. No file writes.
- `--update` → update mode (see Update flow below).
- `--force` → allow overwriting existing files.
- Positional args (e.g., `A D2`, `list-with-detail settings-table`) → restrict to these archetypes by key or slug. No positionals = apply all.

## Steps (execute in order)

### 1. Verify donor and target

[bash block: check BASELINE/docs/archetypes/MANIFEST.json exists, parse it, set ARCHETYPES list]

### 2. Verify /style-baseline has been applied

[bash block: check $TARGET/src/components/ui/ exists and $TARGET/src/lib/utils.ts exists; if not, stop and direct user to run /style-baseline first]

### 3. --list short-circuit

If --list is set: print MANIFEST entries with their slugs, versions, and file lists. Exit.

### 4. --update path

If --update is set:
- Read target's MANIFEST at <target>/docs/archetypes/MANIFEST.json (if absent, treat all archetypes as fresh applies).
- Diff against baseline MANIFEST. Group entries by status: `ok` (same version), `minor diff` (target version < baseline minor), `MAJOR diff` (target version < baseline major).
- For each `minor diff`: ask one confirmation, apply.
- For each `MAJOR diff`: open layer-by-layer diff (read each spec, compare layer-by-layer, present to user). User triages per layer.
- For each `ok`: skip.
- Exit after the update pass — do not fall through to fresh-apply logic.

### 5. Pre-flight collision check (fresh-apply path)

For each archetype to apply, check whether the target has:
- `<target>/docs/archetypes/<slug>.md`
- `<target>/src/components/archetypes/<slug>/`

If any exist and --force is not set, list them and stop. Suggest --force or /style-archetypes --update.

### 6. Copy files

For each archetype:
- `cp $BASELINE/docs/archetypes/<slug>.md <target>/docs/archetypes/<slug>.md`
- `cp -R $BASELINE/src/components/archetypes/<slug> <target>/src/components/archetypes/<slug>`

Always copy:
- `$BASELINE/docs/archetypes/README.md` → target (framework)
- `$BASELINE/docs/archetypes/MANIFEST.json` → target (so future --update works)

NEVER copy:
- `$BASELINE/src/examples/*-demo.tsx` (donor-only contract)

### 7. Stack-specific fixes

Next.js: prepend `"use client";` to every `.tsx` in copied archetype dirs (same loop as /style-baseline). Vite: no-op.

### 8. Verify typecheck

Run `npm run typecheck` (or `npx tsc --noEmit`) in the target. Report any errors. Don't claim success on red.

### 9. Report

[print summary: which archetypes applied, where their docs live, next steps for consumer pages]

## Notes

- Project-local archetypes (anything not in the baseline MANIFEST) are never touched. Targets may freely add their own archetypes to `docs/archetypes/`.
- The reference primitives take data as props — no Supabase, no domain types. See the spec doc for each archetype for the data shape contract.
- To upgrade an archetype later, run `/style-archetypes --update`.
```

The skill text above is a structural template — flesh out each bracketed block into a runnable bash block following the patterns in `~/.claude/commands/style-baseline.md`.

- [ ] **Step 6.2: Verify the skill file exists and parses**

```bash
ls -la ~/.claude/commands/style-archetypes.md
head -3 ~/.claude/commands/style-archetypes.md
```

Expected: file exists with the frontmatter description.

- [ ] **Step 6.3: No commit step (skills live in user config, not project git)**

Move to Task 7.

---

## Task 7: Smoke-test `/style-archetypes` against a real target

**Target:** `~/Documents/dev/mistra/frontend/` (already has /style-baseline applied via mistra PR #100).

⚠ **Do not write to mistra directly.** Use a throwaway worktree or copy mistra/frontend to a temp dir for the smoke test. We are validating the skill, not modifying mistra.

- [ ] **Step 7.1: Create a throwaway test target**

```bash
TEMP_TARGET=$(mktemp -d)/test-target
cp -R ~/Documents/dev/mistra/frontend "$TEMP_TARGET"
cd "$TEMP_TARGET"
ls src/components/ui | head -5  # sanity: baseline is there
```

- [ ] **Step 7.2: Apply `/style-archetypes` (just A)**

Invoke the skill (the implementing agent runs `/style-archetypes A` in the throwaway target). Expected outputs:
- Files copied: `docs/archetypes/list-with-detail.md`, `docs/archetypes/README.md`, `docs/archetypes/MANIFEST.json`, `src/components/archetypes/list-with-detail/*`
- The sandbox demo `list-with-detail-demo.tsx` is NOT copied
- Typecheck passes

- [ ] **Step 7.3: Verify**

```bash
ls "$TEMP_TARGET/docs/archetypes/"
ls "$TEMP_TARGET/src/components/archetypes/list-with-detail/"
test -f "$TEMP_TARGET/src/examples/list-with-detail-demo.tsx" && echo "BUG: demo was copied" || echo "OK: demo not copied"
cd "$TEMP_TARGET" && npx tsc --noEmit
```

Expected: docs + primitives present, demo NOT present, typecheck exits 0.

- [ ] **Step 7.4: Smoke-test --list and collision behavior**

```bash
# --list should print manifest without writing
/style-archetypes --list

# Re-running without --force should report collision and stop
/style-archetypes A

# Re-running with --force should overwrite cleanly
/style-archetypes A --force
```

Verify each behaves as designed.

- [ ] **Step 7.5: Tear down**

```bash
rm -rf "$(dirname "$TEMP_TARGET")"
```

If the smoke test failed at any step, **stop and fix the skill (Task 6)**. Do not proceed to Task 8 with a broken apply flow.

---

## Task 8: Write `/promote-archetype` skill

**Files:**
- Create: `~/.claude/commands/promote-archetype.md`

- [ ] **Step 8.1: Write the skill file**

Write `~/.claude/commands/promote-archetype.md`. Required structure:

```markdown
---
description: Promote a page archetype from a source project into design-baseline. Usage - /promote-archetype <slug> [--update] [--dry-run] [--source <path>]
---

You are promoting a mature archetype from a source project (default: brickshop-manager) into the design-baseline donor. After promotion, the archetype ships with /style-archetypes to new projects. Brickshop keeps its bespoke implementation — drift is tracked, not eliminated.

## Argument parsing

Parse $ARGUMENTS:
- Positional: slug (e.g., `list-with-detail`). Required.
- `--update`: update-existing-baseline-archetype path (diff + triage).
- `--dry-run`: produce the planned diff/output without writing files.
- `--source <path>`: override source project (default: `~/Documents/dev/brickshop-manager`).

## Steps

### 1. Verify source

Check $SOURCE/docs/archetypes/<slug>.md exists. If not, stop.

### 2. Verify baseline state

Check $BASELINE/docs/archetypes/MANIFEST.json exists. Determine: is <slug> already in baseline (update path) or not (first-time path)?

If --update was passed but the slug is not in baseline → stop, suggest dropping --update.
If --update was NOT passed but the slug IS in baseline → stop, suggest adding --update.

### 3. Maturity gate check

For first-time path, verify:
- Source spec has frontmatter `status: locked` OR a governing ADR exists.
- Source spec version is v1+ (frontmatter `version` field, e.g., `1.0`, `1.2`).
- At least one page in the source has been migrated to the spec (look for spec mentions in the source's commit history, e.g., `git log --oneline --grep "<slug>"`).

For update path, verify:
- Source spec version is greater than baseline's `source_spec_version` for this archetype.
- At least one page in the source has been migrated to the new version.

If any gate fails, list the failed gates and stop unless --force is passed.

### 4. First-time path

a. Read source spec, audit doc (if exists), governing ADR(s), primitive implementations.
b. Apply de-source-ification ruleset:
   - Strip concrete page paths, replace with generic examples.
   - Strip source primitive names, replace with baseline names.
   - Strip Supabase/Prisma/etc fragments and React Query keys.
   - Strip domain types; use generics.
   - Strip source-internal forbidden lists; keep generic ones.
   - Preserve all 12 (or 15 for dialog kind) layers.
c. Produce draft baseline spec at $BASELINE/docs/archetypes/<slug>.md.
d. Open layer-by-layer review with user (AskUserQuestion per layer). User accepts/edits/rejects each cell.
e. Identify chrome vs data plumbing in source primitives. Draft baseline primitive files.
f. Build sandbox demo at $BASELINE/src/examples/<slug>-demo.tsx with a far-from-source domain.
   - Pick a domain with completely different nouns (podcasts / recipes / fitness logs / book annotations).
   - Write types first with zero reference to source spec. Then plug into the primitive.
   - If types don't fit, the primitive is wrong — fix it.
g. Run `cd $BASELINE && npx tsc --noEmit`. Must pass.
h. Append entry to MANIFEST.json with version 1.0, source_spec_version = source's current version, promoted_at = today.
i. Round-trip check: does source's implementation still satisfy the generic spec? If not, decide explicitly per gap.

### 5. Update path

a. Read source's current spec and baseline's current spec.
b. Diff layer-by-layer.
c. For each diff, open AskUserQuestion with three buckets:
   - "Generic improvement" → propagate
   - "Project-specific behavior" → leave in source, document in source's spec as project-extension
   - "Spec correction" → propagate
d. Write only propagated changes to baseline.
e. Bump version: minor if diffs are backward-compatible (additive), major if any layer rule tightens or required props change.
f. Update MANIFEST entry: bump `version`, update `source_spec_version`, update `promoted_at`.
g. Run `cd $BASELINE && npx tsc --noEmit`. Must pass.

### 6. Dry-run handling

If --dry-run was passed: print the planned changes (drafts, diffs, MANIFEST delta) but do not write files. Skip step 5d/h writes.

### 7. Report

Print summary: archetype promoted, version, files written, MANIFEST entry, next step (likely "test /style-archetypes against a target").

## Notes

- This skill modifies the design-baseline donor at `~/Documents/dev/design-baseline/`. Donor is not git — no commit step. If you want to version the donor, that's a separate project (out of scope here).
- The layer-by-layer review is 12 questions for page archetypes, 15 for dialog. It's deliberate — fast batched review papers over generic-ness gaps.
- See `~/Documents/dev/design-baseline/docs/superpowers/specs/2026-05-22-archetype-promotion-design.md` for the design decisions behind this skill.
```

Flesh out each bracketed block into runnable instructions for the agent executing the skill.

- [ ] **Step 8.2: Verify the skill file**

```bash
ls -la ~/.claude/commands/promote-archetype.md
head -3 ~/.claude/commands/promote-archetype.md
```

Expected: file exists with the frontmatter.

- [ ] **Step 8.3: No commit step**

Move to Task 9.

---

## Task 9: Smoke-test `/promote-archetype --dry-run` against brickshop A

This validates that the skill correctly reads brickshop, applies the ruleset, and produces a sensible diff against what we already extracted in Tasks 3–5. The output should be small (we already extracted A) — the test is whether the skill's update-path detection works and whether dry-run writes nothing.

- [ ] **Step 9.1: Invoke dry-run update against existing A**

```bash
/promote-archetype --update --dry-run list-with-detail
```

Expected output:
- Skill detects A is already in baseline (correct).
- Skill detects no source spec version bump (since we just promoted at version 1.2 in Task 5).
- Skill reports "no diffs to propagate" or equivalent, exits cleanly.
- No files modified.

- [ ] **Step 9.2: Verify no writes occurred**

```bash
stat -f "%m %N" ~/Documents/dev/design-baseline/docs/archetypes/MANIFEST.json
# Note the mtime. It should match the time you completed Task 5, not now.
ls -la ~/Documents/dev/design-baseline/docs/archetypes/list-with-detail.md
```

Expected: file mtimes unchanged from end of Task 5.

If the skill misbehaves, fix it in Task 8 before proceeding.

---

## Task 10: Extract D2 — settings-table

This follows the same pattern as Tasks 3–5 for A, but for D2 (settings-table). The methodology is identical; only the source files and the sandbox-demo domain change.

**Files:**
- Read: `~/Documents/dev/brickshop-manager/docs/archetypes/settings-table.md` (source spec v1)
- Read: `~/Documents/dev/brickshop-manager/docs/archetypes/settings-table-audit.md`
- Read: brickshop's edit-modal-shell primitive (find via `grep -r "EditModalShell" ~/Documents/dev/brickshop-manager/src`)
- Create: `~/Documents/dev/design-baseline/docs/archetypes/settings-table.md`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/settings-table/SettingsTableShell.tsx`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/settings-table/index.ts`
- Create: `~/Documents/dev/design-baseline/src/examples/settings-table-demo.tsx`
- Modify: `~/Documents/dev/design-baseline/docs/archetypes/MANIFEST.json` (append D2 entry)

- [ ] **Step 10.1: Read source materials**

Read all three source files. Apply the methodology from Task 3 Step 3.1.

- [ ] **Step 10.2: Write generalised spec**

Write `~/Documents/dev/design-baseline/docs/archetypes/settings-table.md` following the structure from Task 3 Step 3.2 (12-layer page spec). The archetype is "settings-table" — table view + edit dialog for CRUD-style settings entities. Key generic features:
- Inline row → opens edit dialog (NOT detail panel; differs from A).
- "Add new" affordance in the toolbar.
- Bulk actions optional.
- Spec note: this archetype delegates its edit dialog to the J (crud-dialog) archetype. Forward-reference J in the spec.

- [ ] **Step 10.3: Write SettingsTableShell.tsx**

Write the primitive following the chrome/data-plumbing split from Task 4. Skeleton signature:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export type SettingsColumn<Row> = {
  key: string;
  header: React.ReactNode;
  cell: (row: Row) => React.ReactNode;
  align?: "left" | "right" | "center";
};

export type SettingsTableShellProps<Row> = {
  rows: Row[];
  columns: SettingsColumn<Row>[];
  getRowId: (row: Row) => string;
  onRowEdit?: (row: Row) => void;
  onRowDelete?: (row: Row) => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  isLoading?: boolean;
  error?: unknown | null;
  emptyMessage?: string;
  className?: string;
};

export function SettingsTableShell<Row>(props: SettingsTableShellProps<Row>): React.ReactElement {
  // Compose: header with title + "Add new" button, table with rows, per-row edit/delete actions,
  // empty/loading/error states. Row click → onRowEdit.
  // Implementation body left for the implementing agent.
}

SettingsTableShell.displayName = "SettingsTableShell";
```

Then `index.ts`:

```ts
export { SettingsTableShell } from "./SettingsTableShell";
export type { SettingsTableShellProps, SettingsColumn } from "./SettingsTableShell";
```

- [ ] **Step 10.4: Write sandbox demo (recipe collection domain)**

Far-from-brickshop domain: recipe collection. Types written first:

```tsx
type Recipe = {
  id: string;
  name: string;
  cuisine: "italian" | "japanese" | "mexican" | "indian" | "french" | "other";
  prepMinutes: number;
  servings: number;
};
```

Write `~/Documents/dev/design-baseline/src/examples/settings-table-demo.tsx` consuming `<SettingsTableShell>` against this type. Follow the pattern from Task 5 Step 5.2.

- [ ] **Step 10.5: Typecheck**

```bash
cd ~/Documents/dev/design-baseline
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 10.6: Append D2 entry to MANIFEST.json**

Modify MANIFEST.json to add:

```json
{
  "key": "D2",
  "slug": "settings-table",
  "version": "1.0",
  "promoted_from": "brickshop-manager",
  "promoted_at": "2026-05-22",
  "source_spec_version": "1.0",
  "spec": "docs/archetypes/settings-table.md",
  "primitives_dir": "src/components/archetypes/settings-table",
  "example": "src/examples/settings-table-demo.tsx"
}
```

- [ ] **Step 10.7: Verify**

```bash
cd ~/Documents/dev/design-baseline
npx tsc --noEmit
cat docs/archetypes/MANIFEST.json | python3 -m json.tool
```

Expected: typecheck green, MANIFEST has two entries (A + D2).

---

## Task 11: Extract J — crud-dialog

Same pattern as Task 10 but for J (crud-dialog). This is the heaviest extraction because brickshop has the spec but not the primitives yet — we are **designing primitives for the first time** here. Brickshop adopts them later.

**Files:**
- Read: `~/Documents/dev/brickshop-manager/docs/archetypes/crud-dialog.md` (source spec v1)
- Read: `~/Documents/dev/brickshop-manager/docs/archetypes/crud-dialog-audit.md`
- Read: brickshop's existing dialog implementations (find samples via `grep -r "LotDetailDialog" ~/Documents/dev/brickshop-manager/src`)
- Create: `~/Documents/dev/design-baseline/docs/archetypes/crud-dialog.md`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/crud-dialog/{CrudDialogSheet,CrudDialogHeader,CrudDialogBody,CrudDialogFooter}.tsx`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/crud-dialog/useCrudDialogMode.ts`
- Create: `~/Documents/dev/design-baseline/src/components/archetypes/crud-dialog/index.ts`
- Create: `~/Documents/dev/design-baseline/src/examples/crud-dialog-demo.tsx`
- Modify: `~/Documents/dev/design-baseline/docs/archetypes/MANIFEST.json` (append J entry)

- [ ] **Step 11.1: Read source materials**

Read the three source files. J is dialog-kind, so the spec covers 15 layers (12 page-archetype layers + mode contract + footer contract + cross-context invocation).

- [ ] **Step 11.2: Write generalised spec**

Write `~/Documents/dev/design-baseline/docs/archetypes/crud-dialog.md` with all 15 layers. Note: spec frontmatter must say `kind: dialog`. The reference primitive is `<CrudDialogSheet>` (uses shadcn Sheet right-side slide-in).

- [ ] **Step 11.3: Write `CrudDialogSheet.tsx`**

Right-side slide-in shell. Skeleton:

```tsx
import * as React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type CrudDialogSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "left" | "bottom";
  /** Width on desktop. Defaults to 480px. */
  width?: string;
  children: React.ReactNode;
  className?: string;
};

export function CrudDialogSheet(props: CrudDialogSheetProps): React.ReactElement {
  // Compose shadcn Sheet with header/body/footer slots passed as children.
  // Mobile: collapse to full-screen viewport (use useIsMobile).
  // Implementation body left for the implementing agent.
}

CrudDialogSheet.displayName = "CrudDialogSheet";
```

- [ ] **Step 11.4: Write `CrudDialogHeader.tsx`**

```tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CrudDialogHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
  /** Right-aligned slot for mode-toggle buttons (Edit/Cancel). */
  actions?: React.ReactNode;
  className?: string;
};

export function CrudDialogHeader(props: CrudDialogHeaderProps): React.ReactElement {
  // Compose: title + subtitle on left, actions slot + close button on right.
  // Implementation body left for the implementing agent.
}

CrudDialogHeader.displayName = "CrudDialogHeader";
```

- [ ] **Step 11.5: Write `CrudDialogBody.tsx`**

```tsx
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type CrudDialogBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export function CrudDialogBody(props: CrudDialogBodyProps): React.ReactElement {
  // Wrap children in ScrollArea with consistent padding.
  // Implementation body left for the implementing agent.
}

CrudDialogBody.displayName = "CrudDialogBody";
```

- [ ] **Step 11.6: Write `CrudDialogFooter.tsx`**

```tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CrudDialogFooterProps = {
  /** Primary action label (e.g. "Save"). */
  primaryLabel?: string;
  onPrimary?: () => void;
  /** Secondary action label (e.g. "Cancel"). */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Destructive action (e.g. "Delete"). Rendered separately, leading edge. */
  destructiveLabel?: string;
  onDestructive?: () => void;
  primaryDisabled?: boolean;
  isSubmitting?: boolean;
  className?: string;
};

export function CrudDialogFooter(props: CrudDialogFooterProps): React.ReactElement {
  // Left: optional destructive action.
  // Right: secondary then primary.
  // Implementation body left for the implementing agent.
}

CrudDialogFooter.displayName = "CrudDialogFooter";
```

- [ ] **Step 11.7: Write `useCrudDialogMode.ts`**

```ts
import { useState, useCallback, useEffect } from "react";

export type CrudDialogMode = "view" | "edit" | "create";

export type UseCrudDialogModeOptions = {
  initialMode?: CrudDialogMode;
  isDirty?: boolean;
  onConfirmDiscard?: () => Promise<boolean> | boolean;
};

export type UseCrudDialogModeResult = {
  mode: CrudDialogMode;
  setMode: (mode: CrudDialogMode) => Promise<void>;
  isView: boolean;
  isEdit: boolean;
  isCreate: boolean;
};

export function useCrudDialogMode(options: UseCrudDialogModeOptions = {}): UseCrudDialogModeResult {
  // Initial: options.initialMode ?? "view"
  // setMode: if going from edit/create → view with isDirty=true, call onConfirmDiscard
  //          and only switch if it resolves true.
  // Implementation body left for the implementing agent.
}
```

- [ ] **Step 11.8: Write `index.ts`**

```ts
export { CrudDialogSheet } from "./CrudDialogSheet";
export type { CrudDialogSheetProps } from "./CrudDialogSheet";
export { CrudDialogHeader } from "./CrudDialogHeader";
export type { CrudDialogHeaderProps } from "./CrudDialogHeader";
export { CrudDialogBody } from "./CrudDialogBody";
export type { CrudDialogBodyProps } from "./CrudDialogBody";
export { CrudDialogFooter } from "./CrudDialogFooter";
export type { CrudDialogFooterProps } from "./CrudDialogFooter";
export { useCrudDialogMode } from "./useCrudDialogMode";
export type { CrudDialogMode, UseCrudDialogModeOptions, UseCrudDialogModeResult } from "./useCrudDialogMode";
```

- [ ] **Step 11.9: Write sandbox demo (fitness log domain)**

Far-from-brickshop domain: fitness log. Types written first:

```tsx
type Workout = {
  id: string;
  date: string;
  kind: "run" | "lift" | "bike" | "swim";
  durationMinutes: number;
  notes: string;
};
```

Write `~/Documents/dev/design-baseline/src/examples/crud-dialog-demo.tsx` showing the dialog in view, edit, and create modes against this type. The demo should exercise:
- View → Edit mode toggle
- Edit with dirty state → close attempt → confirm-discard
- Create new
- Footer primary/secondary/destructive layout

- [ ] **Step 11.10: Typecheck**

```bash
cd ~/Documents/dev/design-baseline
npx tsc --noEmit
```

Expected: exits 0. If a primitive can't satisfy the demo, fix the primitive — not the demo.

- [ ] **Step 11.11: Append J entry to MANIFEST.json**

```json
{
  "key": "J",
  "slug": "crud-dialog",
  "version": "1.0",
  "promoted_from": "brickshop-manager",
  "promoted_at": "2026-05-22",
  "source_spec_version": "1.0",
  "spec": "docs/archetypes/crud-dialog.md",
  "primitives_dir": "src/components/archetypes/crud-dialog",
  "example": "src/examples/crud-dialog-demo.tsx"
}
```

- [ ] **Step 11.12: Verify**

```bash
cd ~/Documents/dev/design-baseline
npx tsc --noEmit
cat docs/archetypes/MANIFEST.json | python3 -m json.tool
ls src/components/archetypes/crud-dialog/
```

Expected: typecheck green, MANIFEST has three entries (A + D2 + J), all six crud-dialog files present.

---

## Task 12: Update `/style-baseline` skill to mention siblings

**Files:**
- Modify: `~/.claude/commands/style-baseline.md`

- [ ] **Step 12.1: Update the final report section**

In `~/.claude/commands/style-baseline.md`, find the "### 10. Report" section. After the "To add more shadcn components later" line, add:

```
Optional next step — the archetype layer (page-shape contracts):
  /style-archetypes              # see what's available
  /style-archetypes A D2 J       # apply the page-shape vocabulary
See ~/Documents/dev/design-baseline/docs/archetypes/README.md for the methodology.
```

- [ ] **Step 12.2: Verify**

```bash
grep -A3 "/style-archetypes" ~/.claude/commands/style-baseline.md
```

Expected: the new lines appear in the report block.

---

## Task 13: Update memory

**Files:**
- Modify: `~/.claude/projects/-Users-christoph-Documents-dev/memory/reference_design_baseline.md`
- Modify: `~/.claude/projects/-Users-christoph-Documents-dev/memory/MEMORY.md`

- [ ] **Step 13.1: Update reference_design_baseline.md**

Read the file first (Read tool), then add a new bullet after the "Application skill" bullet:

```markdown
- **Archetype layer**: `~/Documents/dev/design-baseline/docs/archetypes/` ships page-shape contracts (list-with-detail, settings-table, crud-dialog) with reference primitives in `src/components/archetypes/`. Apply via `/style-archetypes` (requires /style-baseline applied first). Promote mature archetypes from brickshop-manager via `/promote-archetype <slug>`. See `~/Documents/dev/design-baseline/docs/superpowers/specs/2026-05-22-archetype-promotion-design.md` for the promotion model.
```

Add a "Related:" line at the end if not already present, linking to `[[reference-design-baseline]]` style memories that touch the design-baseline.

- [ ] **Step 13.2: Update MEMORY.md index line**

Read `~/.claude/projects/-Users-christoph-Documents-dev/memory/MEMORY.md`. Find the `reference_design_baseline.md` line. Replace with:

```markdown
- [Design baseline + /style-baseline + /style-archetypes + /promote-archetype](reference_design_baseline.md) — cross-project frontend foundation at ~/Documents/dev/design-baseline (shadcn/ui + Tailwind 4 + sidebar shell + archetype layer); apply via /style-baseline then /style-archetypes; promote from brickshop via /promote-archetype
```

- [ ] **Step 13.3: Verify**

```bash
grep -A1 "Archetype layer" ~/.claude/projects/-Users-christoph-Documents-dev/memory/reference_design_baseline.md
grep "style-archetypes" ~/.claude/projects/-Users-christoph-Documents-dev/memory/MEMORY.md
```

Expected: both new lines present.

---

## Self-review checklist

After all tasks complete, run this checklist before declaring done:

- [ ] `npx tsc --noEmit` in the donor exits 0.
- [ ] `docs/archetypes/MANIFEST.json` parses as valid JSON with three entries (A, D2, J).
- [ ] Each archetype has a spec doc, a primitives directory, and a sandbox demo.
- [ ] Sandbox demos use podcast / recipe / fitness-log domains — zero brickshop nouns.
- [ ] No primitive imports `@supabase/*`, `@tanstack/react-query`, or any path under `brickshop-manager` (`grep -r` the primitives dir).
- [ ] `/style-archetypes` skill exists and was smoke-tested against a throwaway target (Task 7).
- [ ] `/promote-archetype` skill exists and was smoke-tested in dry-run mode (Task 9).
- [ ] `/style-baseline` skill mentions sibling commands.
- [ ] Memory updated.

If any item fails, fix it before reporting completion.
