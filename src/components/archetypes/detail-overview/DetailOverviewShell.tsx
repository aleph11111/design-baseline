import * as React from "react";
import { cn } from "@/lib/utils";
import { SurfaceFrame } from "@/components/layout/SurfaceFrame";
import { SurfaceHeaderBar } from "@/components/layout/SurfaceHeaderBar";
import { NestedPageHeading } from "@/components/layout/NestedPageHeading";
import { StatTile } from "@/components/layout/StatTile";
import { StatTileRow } from "@/components/layout/StatTileRow";

const WIDTH_MAP: Record<"none" | "md" | "lg" | "xl", string> = {
  none: "",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

/**
 * Read by `<DetailSection>` to render chromeless inside the unified rail —
 * dropping its own border/shadow/rounding so the one bounded surface owns all
 * separation via hairline dividers. Provided by `<DetailOverviewShell>` scoped
 * to the rail subtree only; `false` everywhere else (the main column keeps its
 * flattened cards). INTERNAL — not part of the shell's public API.
 */
export const UnifiedSurfaceContext = React.createContext(false);

/**
 * One cell of the shell's aggregate strip. Mirrors the stat-tile's data fields
 * minus its `className` (the shell derives all appearance from this data — a
 * cell's classes are owned by the tile primitive, never the call site). The
 * tile renders pre-formatted values as-is; the tile never formats.
 */
export type StatItem = {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
};

export type DetailOverviewShellProps = {
  /**
   * Mode B — nested page title. When set, the shell renders its on-surface
   * header as the canonical nested page heading (an `<h2>` at a single fixed
   * scale) instead of the page's own top-level page title (Mode A — use the
   * standalone detail-overview header above the shell). The scale/weight are
   * fixed in that primitive; no prop re-picks them.
   */
  title?: React.ReactNode;
  /** Secondary line under the nested title (e.g. a parent-entity link). */
  subtitle?: React.ReactNode;
  /** Read-only status badges, inline next to the nested title — the page's
   *  one home for status. */
  badges?: React.ReactNode;
  /** Right-aligned actions row (link/buttons). Never mixed into the title. */
  actions?: React.ReactNode;
  /**
   * Structure, keyed to the entity by the contract (Amendment v2.1).
   * - "vertical" (default): the canonical single column.
   * - "rail": a sticky left identity rail beside a scrolling main column on
   *   wide viewports, collapsing to vertical on narrow. Dense/transactional
   *   entities (orders, deals, invoices) use the rail.
   */
  layout?: "vertical" | "rail";
  /**
   * Contained column width. Keyed to the entity by the contract (Layer 2):
   * "md" (a contained column) is the record-page default — ruled rows and the
   * stat strip read best contained. Use "none" only for pages carrying wide
   * embedded tables. Ignored under `layout="rail"` (the rail manages widths).
   */
  width?: "none" | "md" | "lg" | "xl";
  /** Master data (rail). Composed section primitives — structure, not appearance. */
  summary?: React.ReactNode;
  /**
   * Aggregates (main top). Typed data — the shell renders the strip and
   * derives its column count from `stats.length`, so a metric count is
   * computed rather than a hand-matched prop. Omit to surface the metrics in
   * `summary` instead (recommended in the rail variant).
   */
  stats?: StatItem[];
  /** Transactional data (main). Composed section primitives. */
  content?: React.ReactNode;
  /** Cross-entity references (rail foot / page end). Composed section primitives. */
  references?: React.ReactNode;
};

/**
 * DetailOverviewShell — the C (detail-overview) archetype container.
 *
 * ONE bounded outer frame holds header + (rail layout) a chromeless,
 * hairline-divided, tinted identity rail beside a main column of carded
 * sections flattened to sit as fitted panels in the frame. Cohesion comes from
 * the frame; there is no separate container model and no per-call-site axis
 * that picks one over the other. Appearance is either global (the page's
 * header-fill context, set once at `<AppShell>`) or fixed in the primitives —
 * the shell exposes `layout` (keyed to entity density) and `width` (keyed to
 * wide tables) as the only structure/data props, plus typed header + stats
 * data (`title`/`subtitle`/`badges`/`actions`, `stats: StatItem[]`) and
 * ReactNode slots for the composed master-data / transactional / reference
 * sections (composing documented section primitives is structure, not
 * appearance).
 *
 * Notes: the unified frame relies on the page behind the frame being a muted
 * surface (e.g. AppShell's `<main>` on bg-muted/30) — a white frame on a white
 * page has no contrast and the effect collapses.
 */
export function DetailOverviewShell({
  title,
  subtitle,
  badges,
  actions,
  layout = "vertical",
  width = "md",
  summary,
  stats,
  content,
  references,
}: DetailOverviewShellProps): React.ReactElement {
  // The aggregate strip is rendered from typed data; the strip derives its own
  // cell count from the tiles it is handed, so no call site passes one.
  const statStrip =
    stats && stats.length > 0 ? (
      <StatTileRow>
        {stats.map((s, i) => (
          <StatTile key={i} label={s.label} value={s.value} hint={s.hint} />
        ))}
      </StatTileRow>
    ) : null;

  // Mode B: the shared bar chrome (padding + header-fill) with the fixed-scale
  // <NestedPageHeading> as its title block — the shell never reads the
  // header-fill class table itself.
  const header =
    title !== undefined ? (
      <SurfaceHeaderBar>
        <NestedPageHeading
          title={title}
          subtitle={subtitle}
          badges={badges}
          actions={actions}
        />
      </SurfaceHeaderBar>
    ) : null;

  // flatten the carded children in the main column so they sit as panels, not floaters
  const mainFlatten = "[&_section]:shadow-none [&_section]:border-border/70";
  // Rail section dividers: an INSET hairline between sibling sections (a faint
  // pseudo-element aligned to the 20px content gutter), NOT a full-bleed
  // `divide-y` rule striking edge-to-edge across the rail. `*+*` targets every
  // section after the first; `inset-x-5` matches the sections' px-5 content.
  const railDividers =
    "[&>*+*]:relative [&>*+*]:before:absolute [&>*+*]:before:inset-x-5 " +
    "[&>*+*]:before:top-0 [&>*+*]:before:h-px [&>*+*]:before:bg-border/60";

  const rail = (
    <UnifiedSurfaceContext.Provider value={true}>
      {/* Slot children render DIRECTLY into the rail container so a
          multi-section `summary` gets an inset hairline between sections. */}
      <div
        className={cn(
          "bg-muted/20 lg:border-r lg:border-border/60 lg:sticky lg:top-0 lg:self-start",
          railDividers,
        )}
      >
        {summary}
        {references}
      </div>
    </UnifiedSurfaceContext.Provider>
  );

  const main = (
    <div
      className={cn(
        "border-t border-border/60 p-5 lg:border-t-0 space-y-4",
        mainFlatten,
      )}
    >
      {statStrip && <div>{statStrip}</div>}
      {content}
    </div>
  );

  const body =
    layout === "rail" ? (
      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        {rail}
        {main}
      </div>
    ) : (
      // vertical: the identity rail holds `summary` only (chromeless);
      // references falls into the MAIN column, carded (no chrome suppression).
      <div>
        <UnifiedSurfaceContext.Provider value={true}>
          <div className={cn("bg-muted/20", railDividers)}>{summary}</div>
        </UnifiedSurfaceContext.Provider>
        <div
          className={cn(
            "border-t border-border/60 p-5 space-y-4",
            mainFlatten,
          )}
        >
          {statStrip && <div>{statStrip}</div>}
          {content}
          {references && <div>{references}</div>}
        </div>
      </div>
    );

  // One bounded frame (the canonical `<SurfaceFrame>` chrome — flat, no shadow:
  // the lone `shadow-sm` here was copy drift, not a documented mode). Mode B's
  // nested page heading replaces the frame's on-surface header slot (the slot
  // renders nothing when the shell carries no `title`).
  return (
    <SurfaceFrame
      className={cn(
        layout !== "rail" && WIDTH_MAP[width],
      )}
    >
      {header}
      {body}
    </SurfaceFrame>
  );
}

DetailOverviewShell.displayName = "DetailOverviewShell";
