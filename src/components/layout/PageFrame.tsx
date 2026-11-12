"use client";
import * as React from "react";
import type { ClassValue } from "clsx";
import { PageHeader, type PageHeaderProps } from "./PageHeader";
import { NestedPageHeading } from "./NestedPageHeading";
import { SurfaceFrame } from "./SurfaceFrame";
import { BandChrome, ToolbarBand, has, type FilterLabels } from "./ToolbarBand";
import { HeadingHostContext } from "../ui/heading-host";
import { RaisedSurfaceContext } from "./surface";
import { cn } from "../../lib/utils";
import { isHeaderActions, renderHeaderActions, type HeaderActions } from "./HeaderActions";

/**
 * True inside a `PageFrame`. A `PageFrame` rendered inside another (a tabbed
 * sub-route under a layout that owns the page) titles itself with
 * `NestedPageHeading` and joins the parent's surface — derived from where it
 * renders, never a prop (ADR-0008 §1).
 */
const PageFrameContext = React.createContext(false);

/**
 * @deprecated The rendered-node form of `PageFrame` `actions`: renders
 * unchanged for one minor and bypasses the action hierarchy. Pass the typed
 * `HeaderActions` form instead. Removal: backlog ticket
 * `remove-pageframe-flat-actions-node-form`.
 */
export type LegacyHeaderActions = React.ReactNode;

export type PageFrameProps = {
  /** The page title — passed once. Renders as the `PageHeader` `<h1>`
   *  (nested: the `NestedPageHeading` `<h2>`). */
  title: React.ReactNode;
  /** Compact metadata under the title. */
  subtitle?: React.ReactNode;
  /** Read-only status `<Badge>`s next to the title. */
  badges?: React.ReactNode;
  /** Decorative title icon. Not rendered when nested: the parent page owns
   *  the icon and the back link. */
  icon?: PageHeaderProps["icon"];
  /** Back link (top-level page only). */
  backHref?: string;
  backLabel?: string;
  renderBackLink?: PageHeaderProps["renderBackLink"];
  /**
   * Header actions — verbs on the whole page or document: the one primary
   * action (create included), export, print. Pass the typed form
   * `{ primary, secondary, menu }`; the frame enforces the hierarchy on every
   * path (default, nested, host-titled): at most one primary and two
   * secondary buttons inline, the rest behind one `⋯` menu, and any
   * `destructive` action only inside that menu. Page-header actions only —
   * form/dialog footers keep Delete at their left edge (PLACEMENT.md).
   *
   * Rendered nodes (`<Button>`s) still render unchanged for one minor but
   * bypass the hierarchy — see `LegacyHeaderActions`. Move to the typed form.
   */
  actions?: HeaderActions | LegacyHeaderActions;
  /**
   * The frame's toolbar band, left side — everything that **scopes** the body:
   * search, filters, scoping selectors, tabs. Keep these controls **controlled**
   * (value held by the page): below `md` they render inside the filter sheet,
   * which unmounts on close, and the band remounts when the viewport crosses
   * `md` — uncontrolled local state (a search draft) would be lost.
   */
  toolbar?: React.ReactNode;
  /**
   * A control that switches **what** the page shows (a `SegmentedControl`
   * over Plan · Checkliste · …), as opposed to scoping it. Renders first in
   * the band; below `md` it stays visible above the filter row (scrolling
   * sideways when it overflows) instead of moving into the filter sheet.
   */
  viewSwitch?: React.ReactNode;
  /** Below `md`: how many `toolbar` filters hold a non-default value — shown
   *  on the Filter button. */
  filterCount?: number;
  /** Below `md`: a one-line summary of the active filter values
   *  (`"2026 · Ist · Alle Kostenstellen"`), truncated beside the Filter button. */
  filterSummary?: React.ReactNode;
  /** Below `md`: resets every `toolbar` filter — renders the sheet's reset
   *  action. */
  onResetFilters?: () => void;
  /** Copy of the mobile filter sheet. English defaults; override per page. */
  filterLabels?: FilterLabels;
  /** The result count, right side of the toolbar band, in the canonical muted
   *  treatment. Pass the formatted string (`"12 results"`). */
  count?: React.ReactNode;
  /**
   * Display options that change **how** the body is shown without re-scoping
   * it (decimals, KPI rows, show-zero rows, density). Pass
   * `DropdownMenuCheckboxItem`s / `DropdownMenuRadioGroup`s — the frame renders
   * them as one "View" menu at the far right of the toolbar band.
   */
  viewOptions?: React.ReactNode;
  /** Label of the view-options trigger. */
  viewOptionsLabel?: string;
  /** The body — rendered inside the page's one raised surface. */
  children: React.ReactNode;
  /** Structural classes on the page root (width presets, the full-bleed
   *  marker). Never appearance (ADR-0004). */
  className?: ClassValue;
};

/**
 * The `PageFrame` slots a full-frame page shell takes and forwards: every slot
 * except the body, the structural root class, and the back-link/icon header
 * chrome (detail and form pages pick those by contract). An `Omit`, not a
 * `Pick`, so a new `PageFrame` slot reaches every shell built from it.
 */
export type PageShellFrameProps = Omit<
  PageFrameProps,
  "children" | "className" | "icon" | "backHref" | "backLabel" | "renderBackLink"
>;

/**
 * PageFrame — the one way a page is built (ADR-0008): the `PageHeader` on the
 * canvas, then one untitled raised surface whose first band is the toolbar,
 * then the body. Every page archetype shell renders through it, so the title
 * exists once and every control has exactly one home.
 *
 * ```
 * PageHeader  title · subtitle · badges                          [actions]
 * ┌ surface ───────────────────────────────────────────────────────────┐
 * │ toolbar (scoping)                          count · [View ▾]        │
 * ├────────────────────────────────────────────────────────────────────┤
 * │ body                                                               │
 * └────────────────────────────────────────────────────────────────────┘
 * ```
 */
export function PageFrame({
  title,
  subtitle,
  badges,
  icon,
  backHref,
  backLabel,
  renderBackLink,
  actions: actionsProp,
  toolbar,
  viewSwitch,
  filterCount,
  filterSummary,
  onResetFilters,
  filterLabels,
  count,
  viewOptions,
  viewOptionsLabel,
  children,
  className,
}: PageFrameProps): React.ReactElement {
  const actions = isHeaderActions(actionsProp) ? renderHeaderActions(actionsProp) : actionsProp;
  const nested = React.useContext(PageFrameContext);
  const hostTitled = React.useContext(HeadingHostContext);

  const hasBand = has(toolbar) || has(viewSwitch) || has(count) || has(viewOptions);
  const band = hasBand ? (
    <ToolbarBand
      toolbar={toolbar}
      viewSwitch={viewSwitch}
      filterCount={filterCount}
      filterSummary={filterSummary}
      onResetFilters={onResetFilters}
      filterLabels={filterLabels}
      count={count}
      viewOptions={viewOptions}
      viewOptionsLabel={viewOptionsLabel}
    />
  ) : null;

  if (hostTitled) {
    // The host already titles this region — a dialog / drawer (DialogTitle /
    // SheetTitle) or a titled SectionCard — and is the raised surface
    // (ADR-0008). Only the band and the body render; header actions stay
    // reachable in a plain row.
    return (
      <div className={cn("flex flex-col", className)}>
        {has(actions) && <div className="flex justify-end gap-2 px-4 pb-3">{actions}</div>}
        {band && <BandChrome>{band}</BandChrome>}
        <PageFrameContext.Provider value={true}>
          <RaisedSurfaceContext.Provider value={true}>{children}</RaisedSurfaceContext.Provider>
        </PageFrameContext.Provider>
      </div>
    );
  }

  if (nested) {
    // Joins the parent's surface: a nested heading, then the band, then the
    // body — no second raised surface, no second h1.
    return (
      <div className={cn("flex flex-col", className)}>
        <NestedPageHeading
          title={title}
          subtitle={subtitle}
          badges={badges}
          actions={actions}
          className="px-5 pt-4 pb-3"
        />
        {band && <BandChrome>{band}</BandChrome>}
        {children}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        badges={badges}
        icon={icon}
        backHref={backHref}
        backLabel={backLabel}
        renderBackLink={renderBackLink}
        actions={actions}
      />
      <PageFrameContext.Provider value={true}>
        <SurfaceFrame toolbar={band}>
          {children}
        </SurfaceFrame>
      </PageFrameContext.Provider>
    </div>
  );
}

/** Re-exported for tests and consumers; defined with the band that applies it. */
export { MAX_INLINE_FIELDS } from "./ToolbarBand";
