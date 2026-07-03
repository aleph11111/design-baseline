# Design Baseline — how to build with this system

A **shadcn/ui + Tailwind CSS v4** component library. You compose apps from its React
components (all on `window.DesignBaseline.*`, imported from the package) and lay them out
with **Tailwind utility classes backed by semantic design tokens**. House style: **IBM Plex**
type with **monospaced tabular figures**, flat surfaces, a graded slate palette.

## Styling idiom — semantic token utilities, never raw colors

Style with Tailwind utilities that map to CSS-variable tokens, so light/dark and re-theming
work automatically. **Never hardcode hex/`slate-500`-style colors** — use these token utilities:

| Role | Utilities |
|---|---|
| Page / surfaces | `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-accent` |
| Text | `text-foreground` (default), `text-muted-foreground` (secondary/labels) |
| Brand / actions | `bg-primary` + `text-primary-foreground`, `bg-secondary`, `bg-destructive` + `text-destructive-foreground` |
| Borders / rings | `border-border`, `border-input`, `ring-ring` |
| Sidebar chrome | `bg-sidebar`, `text-sidebar-foreground`, `border-sidebar-border`, `ring-sidebar-ring` |

Radius: `rounded-md`/`rounded-lg` (driven by `--radius`). Standard Tailwind utilities
(`flex`, `grid`, `gap-4`, `px-4`, `space-y-4`, `text-sm`…) are available for layout glue.

**Type:** body text defaults to **IBM Plex Sans** (the `--font-sans` token — no class needed).
**Numeric figures** — money, counts, metrics, table numbers — use `font-mono tabular-nums`
(IBM Plex Mono) for aligned columns. This mono-figure rule is the signature of the house style;
apply it to `StatTile` values, table number cells, KPIs.

## Setup / wrapping (only where noted)

Most components style themselves from the stylesheet — no root provider needed for basic use.
Exceptions (wrap only the subtree that needs it):

- **Tooltips** → wrap in `<TooltipProvider>` (from the package), else the tooltip never mounts.
- **`Sidebar`** (the low-level primitive) → wrap in `<SidebarProvider>`. (The higher-level
  `AppShell` + `AppSidebar` already manage this — prefer them for app chrome.)
- **`BottomNav`** → requires a react-router `<Router>` ancestor (it renders `NavLink`s).
- **Dark mode** → toggle the `.dark` class on a root element (the `ThemeToggle` component does this).
- **`Toaster`** → mount once near the app root; trigger toasts with `toast()` (sonner).

## Where the truth lives

- **`_ds/<folder>/styles.css`** and its `@import` closure (`_ds_bundle.css`, `fonts/fonts.css`)
  define every token (`--background`, `--primary`, `--muted`, `--sidebar-*`, `--font-sans`,
  `--font-mono`, `--radius`) and utility. Read it before inventing styles.
- **Per component**: `<Name>.d.ts` is the exact prop contract; `<Name>.prompt.md` shows usage.
  Read these before composing a component — many are compound APIs (e.g. `Select` =
  `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`; `Card`, `Dialog`, `Table`,
  `Form` similarly). Subparts are importable from the package even when not listed as top-level cards.

## Idiomatic build snippet

```tsx
import { Card, CardHeader, CardTitle, CardContent, StatTile, StatTileRow, Badge, Button } from "design-baseline";

function RevenuePanel() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue</CardTitle>
        <Badge variant="secondary">This month</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatTileRow columns={3}>
          <StatTile label="Gross" value="€58.9k" hint="+12% MoM" />
          <StatTile label="Orders" value="812" />
          <StatTile label="Avg. order" value="€72" />
        </StatTileRow>
        <div className="flex justify-end">
          <Button>View report</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

Numbers render in `font-mono tabular-nums` via `StatTile`; the layout glue (`space-y-4`,
`flex justify-end`) is plain Tailwind; colors come entirely from tokens.
