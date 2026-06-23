import * as React from "react";
import { cn } from "@/lib/utils";
import {
  useHeaderFill,
  headerFillClasses,
  type HeaderFill,
} from "@/components/layout/headerFill";

const WIDTH_MAP: Record<"none" | "md" | "lg" | "xl", string> = {
  none: "",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

const RHYTHM_MAP: Record<"compact" | "default", string> = {
  compact: "space-y-3",
  default: "space-y-4",
};

/**
 * Read by `<DetailSection>` (and any titled section primitive) to render
 * chromeless inside a `surface="unified"` shell — dropping its own
 * border/shadow/rounding so the one bounded surface owns all separation via
 * hairline dividers. Default `false` = today's separated behaviour.
 */
export const UnifiedSurfaceContext = React.createContext(false);

export type DetailOverviewShellProps = {
  header?: React.ReactNode;
  summary?: React.ReactNode;
  stats?: React.ReactNode;
  content?: React.ReactNode;
  references?: React.ReactNode;
  rhythm?: "compact" | "default";
  width?: "none" | "md" | "lg" | "xl";
  layout?: "vertical" | "rail";
  /**
   * Container model (Amendment v2.3 — the unified-surface variant; hybrid).
   * - "separated" (default): each slot's `<DetailSection>`s are individually
   *   bordered `SectionCard`s with gaps between — the v2.0/v2.1 look. Zero churn.
   * - "unified": ONE bounded outer frame holds header + rail + main. The **rail**
   *   renders chromeless and hairline-divided (its `<DetailSection>`s drop card
   *   chrome via a `UnifiedSurfaceContext` scoped to the rail); the **main** keeps
   *   carded `<DetailSection>`/`<StatTileRow>` BUT flattened (no shadow, softer
   *   border, tighter gap) so they read as fitted panels inside the frame, not
   *   floating cards. Cohesion comes from the frame — recommended dense pairing:
   *   `layout="rail" surface="unified"`. NOTE: unified relies on the page behind
   *   the frame being a muted surface (e.g. AppShell `<main>` on `bg-muted/30`);
   *   a white frame on a white page has no contrast and the effect collapses.
   */
  surface?: "separated" | "unified";
  /**
   * Header treatment for the `surface="unified"` framed header (House Style B).
   * Defaults to the project's `HeaderFillContext` ("solid" unless overridden).
   * Only applies in unified mode (the separated header is a bare PageHeader).
   */
  headerFill?: HeaderFill;
  className?: string;
};

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
  headerFill,
  className,
}: DetailOverviewShellProps): React.ReactElement {
  // House header treatment (only used by the unified framed header below).
  const hfc = headerFillClasses(useHeaderFill(headerFill));
  // -------------------------------------------------------------------------
  // UNIFIED — the HYBRID model (Amendment v2.3). Cohesion comes from the OUTER
  // FRAME, not from stripping every card:
  //   - outer frame: one bounded card wrapping header + rail + main.
  //   - RAIL (aside): chromeless, flush, hairline-divided, LIGHTLY tinted
  //     (bg-muted/20 — a whisper, not a second panel). Context scoped here only.
  //   - MAIN: keeps carded sections, but FLATTENED — shadow-none + softer border
  //     + tighter gap — so they sit as fitted panels in the frame, not floaters.
  // -------------------------------------------------------------------------
  if (surface === "unified") {
    // flatten the carded children in the main column so they don't "float"
    const mainFlatten = "[&_section]:shadow-none [&_section]:border-border/70";
    // Rail section dividers: an INSET hairline between sibling sections (a faint
    // pseudo-element aligned to the 20px content gutter), NOT a full-bleed
    // `divide-y` rule striking edge-to-edge across the rail. `*+*` targets every
    // section after the first; `inset-x-5` matches the sections' px-5 content.
    const railDividers =
      "[&>*+*]:relative [&>*+*]:before:absolute [&>*+*]:before:inset-x-5 " +
      "[&>*+*]:before:top-0 [&>*+*]:before:h-px [&>*+*]:before:bg-border/60";
    const body =
      layout === "rail" ? (
        <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <UnifiedSurfaceContext.Provider value={true}>
            {/* Slot children render DIRECTLY into the rail container so a
                multi-section `summary` (status · figures · partner · facts) gets
                an inset hairline between each section (see `railDividers`). */}
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
          <div
            className={cn(
              "border-t border-border/60 p-5 lg:border-t-0 space-y-4",
              mainFlatten,
            )}
          >
            {stats && <div>{stats}</div>}
            {content}
          </div>
        </div>
      ) : (
        <div>
          <UnifiedSurfaceContext.Provider value={true}>
            <div className={cn("bg-muted/20", railDividers)}>{summary}</div>
          </UnifiedSurfaceContext.Provider>
          <div className={cn("border-t border-border/60 p-5 space-y-4", mainFlatten)}>
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
        {header && (
          <div className={cn("px-5 py-4", hfc.bar)}>{header}</div>
        )}
        {body}
      </div>
    );
  }

  if (layout === "rail") {
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
