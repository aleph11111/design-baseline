import * as React from "react";
import { cn } from "@/lib/utils";

const WIDTH_MAP: Record<"none" | "md" | "lg" | "xl", string> = {
  none: "",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

const RHYTHM_MAP: Record<"compact" | "default", string> = {
  compact: "space-y-4",
  default: "space-y-5",
};

/**
 * Read by `<DetailSection>` (and any titled section primitive) to render
 * chromeless inside a `surface="unified"` shell — dropping its own
 * border/shadow/rounding so the one bounded surface owns all separation via
 * hairline dividers. Default `false` = today's separated behaviour.
 */
export const UnifiedSurfaceContext = React.createContext(false);

export type DetailOverviewShellProps = {
  /**
   * Slot 1 — page header (Mode A — standalone). Pass a
   * `<DetailOverviewHeader>`. Omit in Mode B (nested) when a parent layout
   * already renders the entity title and tab nav.
   */
  header?: React.ReactNode;
  /**
   * Slot 2 — master data. A `<DetailSection>` (typically titled "Details")
   * wrapping a `<KeyValueList>` of the entity's core fields, including
   * categorical chip attributes. Omit only when the page is purely
   * metric/tabular.
   */
  summary?: React.ReactNode;
  /**
   * Slot 3 — aggregates over transactional data. Pass a `<StatTileRow>` with
   * 2–4 `<StatTile>` children. Omit when the entity has no headline metrics.
   */
  stats?: React.ReactNode;
  /**
   * Slot 4 — transactional data: embedded read-only lists/tables and
   * read-write islands, each wrapped in its own `<DetailSection>`.
   */
  content?: React.ReactNode;
  /**
   * Slot 5 — reference panels: cross-entity links, related-records lists,
   * external resources. Always last on the page.
   */
  references?: React.ReactNode;
  /**
   * Vertical rhythm between sections.
   * - "compact" (`space-y-4`): short pages with few sections.
   * - "default" (`space-y-5`): the standard record-page rhythm.
   * Defaults to "default".
   */
  rhythm?: "compact" | "default";
  /**
   * Optional max-width preset.
   * - "none" (default): fill the layout's content column. Use when the page
   *   carries wide embedded tables.
   * - "md" (`max-w-3xl`): the record-page default — ruled rows and stat
   *   strips read best in a contained column.
   * - "lg" / "xl": wider single-column layouts.
   *
   * Ignored when `layout="rail"` — the rail variant manages its own widths.
   */
  width?: "none" | "md" | "lg" | "xl";
  /**
   * Page layout (Amendment v2.1 — the Command Rail variant).
   * - "vertical" (default): the canonical v2.0 stack — slots rendered top to
   *   bottom in canonical order. Zero churn for existing pages.
   * - "rail": on `lg+`, a full-width `header` over a two-column Command Rail —
   *   a sticky left identity rail (`summary` + `references`) beside a scrolling
   *   main column (`stats` + `content`). Below `lg` it collapses to the exact
   *   canonical vertical order, so it is the *same archetype*, only reflowed in
   *   2D on wide viewports. Use for dense, transactional, financial entities
   *   (orders, deals/opportunities, invoices); stay "vertical" for light ones.
   */
  layout?: "vertical" | "rail";
  /**
   * Container model (Amendment v2.3 — the unified-surface variant; hybrid).
   * - "separated" (default): each slot's `<DetailSection>`s are individually
   *   bordered `SectionCard`s with gaps between — the v2.0/v2.1 look. Zero churn.
   * - "unified": ONE bounded outer frame holds header + rail + main. The **rail**
   *   renders chromeless and hairline-divided (its `<DetailSection>`s drop card
   *   chrome via a `UnifiedSurfaceContext` scoped to the rail); the **main** keeps
   *   its normal carded `<DetailSection>`/`<StatTileRow>` with gaps. The cohesion
   *   comes from the frame, not from stripping every card — so a framed page reads
   *   as one record without the "card scatter". Recommended canonical pairing for
   *   dense record pages: `layout="rail" surface="unified"`.
   */
  surface?: "separated" | "unified";
  className?: string;
};

/**
 * DetailOverviewShell — the outermost container for every C (detail-overview)
 * archetype instance.
 *
 * v2.0: the shell owns the page layout via named slots rendered in the
 * canonical order — header → summary → stats → content → references
 * (master data, then aggregates, then transactional data). Consumers
 * fill the slots that apply and omit the rest; they cannot reorder them. This
 * is what makes a detail view recognizable across applications: the eye finds
 * the same information in the same place everywhere. The layout lives HERE,
 * in one file — iterating it baseline-wide is a change to this component, not
 * to every consuming page. (See the spec's "Canonical slot order" and the
 * blueprint: docs/archetypes/detail-overview-blueprint.svg.)
 *
 * Renders a vertical stack with one of two rhythm presets and an optional
 * max-width clamp.
 *
 * Two sanctioned layouts (Amendment v2.1):
 * - `layout="vertical"` (default): the v2.0 single-column stack.
 * - `layout="rail"`: the Command Rail — a sticky left identity rail beside a
 *   scrolling main column on `lg+`, collapsing to the exact same canonical
 *   vertical order below `lg`. The rail is shell-owned: pages never hand-roll a
 *   sidebar. There is never a second scroll container — the page scrolls and
 *   the rail is `position: sticky`, which is what keeps it the *same* archetype
 *   and preserves mobile parity.
 *
 * Two container models (Amendment v2.3 — hybrid):
 * - `surface="separated"` (default): each section is its own bordered card.
 * - `surface="unified"`: one bounded outer frame holds header + rail + main. The
 *   rail is chromeless + hairline-divided (chrome dropped via a
 *   `UnifiedSurfaceContext` scoped to the rail subtree only); the main keeps its
 *   carded sections. The frame unifies — stripping chrome from the main column
 *   too is the over-application the measured reference corrects. Same canonical
 *   slot order, single instances — no double-mount. Cohesive dense pairing:
 *   `layout="rail" surface="unified"`.
 */
export function DetailOverviewShell({
  header,
  summary,
  stats,
  content,
  references,
  rhythm = "default",
  width = "none",
  layout = "vertical",
  surface = "separated",
  className,
}: DetailOverviewShellProps): React.ReactElement {
  // -------------------------------------------------------------------------
  // UNIFIED — the HYBRID model (Amendment v2.3, corrected against the measured
  // reference). The cohesion comes from the OUTER FRAME, not from making every
  // section chromeless:
  //   - outer frame: one bounded card wrapping header + rail + main.
  //   - RAIL (aside): chromeless, flush, hairline-divided, lightly tinted. The
  //     `UnifiedSurfaceContext` provider is scoped to THIS subtree only, so the
  //     rail's `<DetailSection>`s drop their card chrome (keeping padding) while
  //     the shell's `divide-y` + `border-r` supply all separation.
  //   - MAIN: keeps its `<DetailSection>` / `<StatTileRow>` CARDS with gaps —
  //     the context stays false here, so they render normal chrome. The frame is
  //     what makes those cards read as units rather than a scatter.
  // Stripping chrome from the main column too was the over-application the
  // measured reference corrects, so there is NO outer provider.
  // -------------------------------------------------------------------------
  if (surface === "unified") {
    const body =
      layout === "rail" ? (
        // lg+: two columns inside the one frame; the aside carries the single
        // rail|main divider (`lg:border-r`). Below lg the aside's right border
        // is dropped and the main is separated by its `border-t`.
        <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <UnifiedSurfaceContext.Provider value={true}>
            <div className="divide-y divide-border bg-muted/40 lg:border-r lg:border-border lg:sticky lg:top-0 lg:self-start">
              {summary && <div>{summary}</div>}
              {references && <div>{references}</div>}
            </div>
          </UnifiedSurfaceContext.Provider>
          <div
            className={cn(
              "border-t border-border p-5 lg:border-t-0",
              RHYTHM_MAP[rhythm],
            )}
          >
            {stats && <div>{stats}</div>}
            {content}
          </div>
        </div>
      ) : (
        // vertical + unified: a chromeless summary strip on top, carded content
        // below — separated by a `border-t`, all inside the one frame.
        <div>
          <UnifiedSurfaceContext.Provider value={true}>
            <div className="divide-y divide-border bg-muted/40">
              {summary && <div>{summary}</div>}
            </div>
          </UnifiedSurfaceContext.Provider>
          <div className={cn("border-t border-border p-5", RHYTHM_MAP[rhythm])}>
            {stats && <div>{stats}</div>}
            {content}
            {references && <div>{references}</div>}
          </div>
        </div>
      );

    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
          layout !== "rail" && WIDTH_MAP[width],
          className,
        )}
      >
        {header && <div className="border-b border-border">{header}</div>}
        {body}
      </div>
    );
  }

  if (layout === "rail") {
    // Command Rail. The slots are rendered ONCE, in canonical source order
    // (header → summary → stats → content → references), so below `lg` — where
    // the grid is inert — they stack in the exact v2.0 vertical order and no
    // node is duplicated or double-mounted. On `lg+` an explicit grid placement
    // reflows them into two columns WITHOUT changing source order:
    //   col 1 (aside): summary (rows 2–3, sticky) over references (row 4)
    //   col 2 (main):  stats (row 2) over content (row 3)
    // `summary` spans the main column's rows so its sticky box has the full
    // scroll height to pin against — the identity/figures stay on screen while
    // the long transactional body scrolls. `references` sits at the foot of the
    // aside. This is the §4/§5 contract met with single instances.
    return (
      <div
        className={cn(
          RHYTHM_MAP[rhythm],
          "lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-5 lg:space-y-0 lg:items-start",
          className,
        )}
      >
        {header && (
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1">
            {header}
          </div>
        )}
        {summary && (
          <div className="lg:col-start-1 lg:row-start-2 lg:row-span-2 lg:sticky lg:top-6 lg:self-start">
            {summary}
          </div>
        )}
        {stats && (
          <div className="lg:col-start-2 lg:row-start-2">{stats}</div>
        )}
        {content && (
          <div className={cn("lg:col-start-2 lg:row-start-3", RHYTHM_MAP[rhythm])}>
            {content}
          </div>
        )}
        {references && (
          <div className="lg:col-start-1 lg:row-start-4">{references}</div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        RHYTHM_MAP[rhythm],
        WIDTH_MAP[width],
        className,
      )}
    >
      {header}
      {summary}
      {stats}
      {content}
      {references}
    </div>
  );
}

DetailOverviewShell.displayName = "DetailOverviewShell";
