"use client";
import * as React from "react";
import { cn } from "../../../lib/utils";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";
import { StatTile } from "../../layout/StatTile";
import { StatTileRow } from "../../layout/StatTileRow";
import { RaisedSurfaceContext } from "../../layout/surface";

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

/**
 * The page header — passed once, rendered by `PageFrame` (ADR-0008). `badges`
 * is the page's one home for status; `actions` holds the whole-record verbs
 * (≤ 1 primary + 2 secondary, the rest in a `⋯` menu). Nested under a parent
 * `PageFrame` (an entity tab under a layout that owns the page) the frame
 * derives the nested heading itself — there is no mode prop.
 */
type DetailOverviewTitleProps = Pick<
  PageFrameProps,
  | "title"
  | "subtitle"
  | "badges"
  | "actions"
  | "icon"
  | "backHref"
  | "backLabel"
  | "renderBackLink"
>;

export type DetailOverviewShellProps = DetailOverviewTitleProps & {
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
 * Renders through `PageFrame` (ADR-0008) with a stack body (ADR-0015): the
 * record's header on the canvas, then one raised card per main-column section
 * and, beside them (rail layout) or above them (vertical), one card holding
 * the chromeless, hairline-divided identity sections. Nested in a parent
 * frame, the body keeps the flat look (no cards of its own). The shell exposes `layout` (keyed to entity density) and
 * `width` (keyed to wide tables) as its only structure props, plus the header
 * data, typed `stats`, and ReactNode slots for the composed master-data /
 * transactional / reference sections.
 */
export function DetailOverviewShell({
  layout = "vertical",
  width = "md",
  summary,
  stats,
  content,
  references,
  ...header
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

  return (
    <PageFrame {...header} className={layout !== "rail" && WIDTH_MAP[width]} body="stack">
      <DetailOverviewBody
        layout={layout}
        summary={summary}
        statStrip={statStrip}
        content={content}
        references={references}
      />
    </PageFrame>
  );
}

// Rail section dividers: an INSET hairline between sibling sections (a faint
// pseudo-element aligned to the 20px content gutter), NOT a full-bleed
// `divide-y` rule striking edge-to-edge across the rail. `*+*` targets every
// section after the first; `inset-x-5` matches the sections' px-5 content.
const railDividers =
  "[&>*+*]:relative [&>*+*]:before:absolute [&>*+*]:before:inset-x-5 " +
  "[&>*+*]:before:top-0 [&>*+*]:before:h-px [&>*+*]:before:bg-border/60";

/** The stack body's gap between cards (mirrors `PageFrame`'s stack). */
const STACK_GAP = "gap-4 md:gap-5";

/**
 * The record body. Rendered inside `PageFrame`, so `RaisedSurfaceContext`
 * says where it landed: `false` on the stack canvas (ADR-0015) — each main
 * section is its own card and the rail / summary is one card of chromeless
 * sections; `true` nested in a parent frame or a titled host — the old flat
 * look (tinted band, hairline rules, no cards of its own).
 */
function DetailOverviewBody({
  layout,
  summary,
  statStrip,
  content,
  references,
}: {
  layout: "vertical" | "rail";
  summary: React.ReactNode;
  statStrip: React.ReactNode;
  content: React.ReactNode;
  references: React.ReactNode;
}): React.ReactElement {
  const flat = React.useContext(RaisedSurfaceContext);

  // Publish the rail's own height as --db-rail-h so its sticky `top` can clamp
  // to `100dvh - height`: a rail taller than the viewport scrolls with the
  // page until its foot is in view, then pins there — the foot (references)
  // stays reachable without an inner scroll box. A rail that fits keeps
  // pinning just below the app shell's header. Measured, because the rail's
  // content is the consumer's.
  const railRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const el = railRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const publish = () => el.style.setProperty("--db-rail-h", `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, [layout]);

  // An empty body slot set renders no container — no ruled blank strip.
  const hasMain = Boolean(statStrip || content);
  // Body wrappers pad vertically only: sections, stat tiles and key-value rows
  // each own their `px-5` gutter, so a horizontal pad here doubled the inset
  // and set the main column 20px in from the summary band (and, on a phone,
  // 40px in from the page title).

  if (layout === "rail") {
    // Below lg the rail div dissolves (`contents`) so summary and references
    // become items of the body and references can sort after main (contract
    // order: header, summary, stats, content, references) with one mount per
    // slot. On the canvas the rail is one card at lg, and each of its two
    // slots is its own card below lg.
    const slotCard = flat
      ? "max-lg:bg-muted/20"
      : "max-lg:overflow-clip max-lg:rounded-lg max-lg:border max-lg:bg-surface-raised";
    const rail = (
      <UnifiedSurfaceContext.Provider value={true}>
        <RaisedSurfaceContext.Provider value={true}>
          {/* Slot children render DIRECTLY into the rail container so a
              multi-section `summary` gets an inset hairline between sections. */}
          <div
            ref={railRef}
            data-slot="detail-rail"
            className={cn(
              "max-lg:contents lg:sticky lg:self-start",
              "lg:top-[min(var(--db-sticky-top,0px),calc(100dvh_-_var(--db-rail-h,0px)))]",
              flat
                ? "bg-muted/20 lg:border-r lg:border-border/60"
                : "lg:overflow-clip lg:rounded-lg lg:border lg:bg-surface-raised",
              railDividers,
            )}
          >
            {summary && <div className={cn(slotCard, railDividers)}>{summary}</div>}
            {references && (
              <div className={cn("max-lg:order-last", slotCard, railDividers)}>{references}</div>
            )}
          </div>
        </RaisedSurfaceContext.Provider>
      </UnifiedSurfaceContext.Provider>
    );
    const main = hasMain && (
      <div
        data-slot="detail-main"
        className={cn(
          "min-w-0",
          flat ? "border-t border-border/60 py-5 lg:border-t-0 space-y-4" : cn("flex flex-col", STACK_GAP),
        )}
      >
        {statStrip && <div>{statStrip}</div>}
        {content}
      </div>
    );
    return (
      <div
        className={cn(
          "max-lg:flex max-lg:flex-col",
          !flat && STACK_GAP,
          hasMain && "lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start",
        )}
      >
        {rail}
        {main}
      </div>
    );
  }

  // vertical: `summary` is the identity band (chromeless sections; one card on
  // the canvas); references falls into the MAIN column, carded.
  const summaryBand = (summary || flat) && (
    <UnifiedSurfaceContext.Provider value={true}>
      <RaisedSurfaceContext.Provider value={true}>
        <div
          data-slot="detail-summary"
          className={cn(
            flat ? "bg-muted/20" : "overflow-clip rounded-lg border bg-surface-raised",
            railDividers,
          )}
        >
          {summary}
        </div>
      </RaisedSurfaceContext.Provider>
    </UnifiedSurfaceContext.Provider>
  );
  const hasVerticalBody = hasMain || Boolean(references);
  if (!flat) {
    // Stack canvas: every slot is a direct item of the stack (a fragment adds
    // no box), so each section card sits on the canvas with the stack's gap.
    return (
      <>
        {summaryBand}
        {statStrip}
        {content}
        {references}
      </>
    );
  }
  return (
    <div>
      {summaryBand}
      {hasVerticalBody && (
        <div className="border-t border-border/60 py-5 space-y-4">
          {statStrip && <div>{statStrip}</div>}
          {content}
          {references && <div>{references}</div>}
        </div>
      )}
    </div>
  );
}

DetailOverviewShell.displayName = "DetailOverviewShell";
