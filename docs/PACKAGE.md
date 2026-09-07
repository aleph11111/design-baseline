# PACKAGE.md — installing the design-baseline as a source package

The Design Baseline can be consumed as a **git source package** instead of a `cp -R`
copy. A consumer adds one dependency line and four wiring lines:

```
"design-baseline": "github:aleph11111/design-baseline#v0.2.0"
```

Everything below is load-bearing — each line was proven in a throwaway Vite +
Tailwind 4 consumer (tag `v0.2.0`, `@tailwindcss/postcss` pipeline) that imports
`DetailOverviewShell` from `design-baseline/archetypes/detail-overview` and applies
the wiring. The matrix at the bottom shows both CSS lines failing independently.

> The package ships **source** (`.tsx` / `.ts`), never compiled JS or CSS. The
> consumer's own toolchain transpiles the TypeScript and compiles every Tailwind
> class from source. This is the whole answer to the "Compiled-CSS version skew"
> hazard in `STACK.md` (hazard 3) — there is no compiled bundle to drift out of
> sync. See the correction there.

## The four wiring lines

### 1. `package.json` — pin the tag

A git dependency against a tag, so a version bump is a one-digit change and the
consumed commit is pinned (P7 of the spec — no registry publish).

```jsonc
// package.json
"design-baseline": "github:aleph11111/design-baseline#v0.2.0"
```

`react` / `react-dom` are the package's **peer dependencies** (`^19`) — the
consumer brings its own. The Radix set and the rest of the primitive stack are
real `dependencies` and install with the package; do not duplicate them.

### 2. `tsconfig.json` — re-point `@/components/ui/*` at the package (P2)

The package **owns** `src/components/ui/`. A consumer deletes its vendored copy of
`src/components/ui/` and re-points the alias at the package's copy. Ordering
matters: the more specific `@/components/ui/*` entry comes **first** and shadows
the consumer's own `@/*`.

```jsonc
// tsconfig.json — more specific path first
{
  "compilerOptions": {
    "paths": {
      "@/components/ui/*": ["node_modules/design-baseline/src/components/ui/*"],
      "@/*": ["src/*"]
    }
  }
}
```

This narrows ADR-0004's "`ui/` stays vendored" clause for projects that adopt an
archetype (not just the shell) — recorded in `docs/audits/` as a distribution-layer
note.

### 3. the project's own `tokens.css` — import the layer + `@source` the package

Two independently load-bearing lines. The `@import` loads the donor-owned token
layer (its `@theme` is what the candidate classes resolve against); the `@source`
tells Tailwind to scan the package's source so un-imported component classes are
still emitted. Tailwind 4 does **not** scan `node_modules` on its own — `@source`
is a hard requirement, not a courtesy.

```css
/* the project's own tokens.css */
@import "design-baseline/tokens.layer.css";
@source "../node_modules/design-baseline/src";
```

The brand half of the tokens (the `:root` / `.dark` HSL values) stays the
consumer's own `tokens.css` — the package does not export the brand `tokens.css`,
so a donor-side default can never silently overwrite the brand palette.

### 4. `next.config.js` — `transpilePackages` (Next consumers only)

Next skips `node_modules` by default; opt the package in so its `.tsx` is
transpiled by the consumer's build. Vite/webpack consumers that already resolve
`.tsx` do not need this.

```js
// next.config.js — Next consumers only
module.exports = {
  transpilePackages: ["design-baseline"],
}
```

## Measured caveats (context, not a 5th wiring line)

- **The layout barrel drags two framework extras into the import graph.**
  `design-baseline/layout` (re-exported by every archetype `index.ts` for
  `StatTileRow` / `ProgressTracker` / etc.) carries `BottomNav`
  (`react-router-dom`) and `ThemeToggle` / `sonner` (`next-themes`). A consumer
  that type-checks the package source therefore needs those resolvable:
  `next-themes` ships in the package's real `dependencies` and installs
  automatically; `react-router-dom` is a **donor-dev** dependency and must be
  added by the consumer (Vite/webpack) or by Next's own router. This is why the
  throwaway proof installed `react-router-dom` — the wiring line is unchanged.
- **`process.env.NODE_ENV` in `ui/button.tsx` needs `@types/node`** for a
  consumer that type-checks the package source (donor-dev-only, not bundled).

## Proof matrix (throwaway consumer, tag v0.2.0)

A consumer importing `DetailOverviewShell` (rail layout, stats, sections), with
its `tokens.css` varying only the two CSS lines above. CSS presence in `dist`:

| `tokens.css` | rail (imported `DetailOverviewShell`) | `min-w-[640px]` (non-imported package) | `bg-success/10` (layer `@theme`) |
|---|:--:|:--:|:--:|
| bare `@import "tailwindcss"` only | ✗ | ✗ | ✗ |
| layer `@import` only (no `@source`) | ✗ | ✗ | ✗ |
| `@source` only (no layer) | ✓ | ✓ | ✗ |
| **layer `@import` + `@source` (the wiring)** | ✓ | ✓ | ✓ |

- **Removing `@source` drops every package class** — including the imported
  shell — confirming `@source` reaches the package, not just that the import
  resolved.
- **Removing the layer `@import` drops the token-derived classes** — confirming
  the two lines are independently load-bearing.

*Run detail: this proof is a throwaway install (a second buildable app in a repo
whose premise is "not a buildable app" is the wrong permanent cost). The
repeatable check that stays behind is `scripts/verify-exports.mjs`.*
