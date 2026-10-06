"use client";
import * as React from "react";
import type { ClassValue } from "clsx";
import { ListFilter, SlidersHorizontal } from "lucide-react";
import { PageHeader, type PageHeaderProps } from "./PageHeader";
import { NestedPageHeading } from "./NestedPageHeading";
import { SurfaceFrame } from "./SurfaceFrame";
import { ToolbarBandContext, ToolbarSizeContext } from "../ui/toolbar-band";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";

/**
 * True inside a `PageFrame`. A `PageFrame` rendered inside another (a tabbed
 * sub-route under a layout that owns the page) titles itself with
 * `NestedPageHeading` and joins the parent's surface — derived from where it
 * renders, never a prop (ADR-0008 §1).
 */
const PageFrameContext = React.createContext(false);

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
   * action (create included), export, print. At most one primary and two
   * secondary buttons; collapse the rest into a `⋯` menu.
   */
  actions?: React.ReactNode;
  /**
   * The frame's toolbar band, left side — everything that **scopes** the body:
   * search, filters, scoping selectors, tabs.
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
  filterLabels?: { filter?: string; done?: string; reset?: string };
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
  actions,
  toolbar,
  viewSwitch,
  filterCount,
  filterSummary,
  onResetFilters,
  filterLabels,
  count,
  viewOptions,
  viewOptionsLabel = "View",
  children,
  className,
}: PageFrameProps): React.ReactElement {
  const nested = React.useContext(PageFrameContext);
  const isMobile = useIsMobile();

  // `cond && <X />` yields `false`: an absent slot, not an empty band.
  const has = (slot: React.ReactNode) => slot != null && slot !== false;
  const hasBand = has(toolbar) || has(viewSwitch) || has(count) || has(viewOptions);
  const band = !hasBand ? null : isMobile ? (
    <MobileBand
      toolbar={has(toolbar) ? toolbar : null}
      viewSwitch={has(viewSwitch) ? viewSwitch : null}
      filterCount={filterCount}
      filterSummary={filterSummary}
      onResetFilters={onResetFilters}
      labels={filterLabels}
      count={has(count) ? count : null}
      viewOptions={has(viewOptions) ? viewOptions : null}
      viewOptionsLabel={viewOptionsLabel}
    />
  ) : (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <ToolbarBandContext.Provider value={true}>
            {viewSwitch}
            {toolbar}
          </ToolbarBandContext.Provider>
        </div>
        {has(count) || has(viewOptions) ? (
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {has(count) && (
              <span className="text-sm text-muted-foreground">{count}</span>
            )}
            {has(viewOptions) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="h-4 w-4" />
                    {viewOptionsLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-52">
                  {viewOptions}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ) : null}
      </div>
    );

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
        {band && <div className="border-b px-4 py-3">{band}</div>}
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

PageFrame.displayName = "PageFrame";

/**
 * The band below `md`: the view switch (if any) on its own sideways-scrolling
 * line, then one row — a Filter button carrying the set-filter count, the
 * truncated filter summary, the result count, and the View menu as an icon. The `toolbar`
 * filters live in a bottom sheet, each still a joined-label row (the band
 * context), at the `lg` touch step with one shared label column.
 */
function MobileBand({
  toolbar,
  viewSwitch,
  filterCount,
  filterSummary,
  onResetFilters,
  labels,
  count,
  viewOptions,
  viewOptionsLabel,
}: {
  toolbar: React.ReactNode;
  viewSwitch: React.ReactNode;
  filterCount?: number;
  filterSummary?: React.ReactNode;
  onResetFilters?: () => void;
  labels?: PageFrameProps["filterLabels"];
  count: React.ReactNode;
  viewOptions: React.ReactNode;
  viewOptionsLabel: string;
}): React.ReactElement {
  const filterLabel = labels?.filter ?? "Filter";
  return (
    <div className="flex flex-col gap-2">
      {viewSwitch && (
        <div data-view-switch="" className="-mx-4 overflow-x-auto px-4">
          <ToolbarBandContext.Provider value={true}>{viewSwitch}</ToolbarBandContext.Provider>
        </div>
      )}
      <div className="flex items-center gap-2">
        {toolbar && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <ListFilter className="h-4 w-4" />
                {filterLabel}
                {filterCount ? (
                  <span
                    data-filter-count=""
                    className="rounded-full bg-primary px-1.5 text-xs tabular-nums text-primary-foreground"
                  >
                    {filterCount}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              showCloseButton={false}
              aria-describedby={undefined}
              className="flex max-h-[85svh] flex-col overflow-y-auto rounded-t-xl"
            >
              <SheetHeader className="text-left">
                <SheetTitle>{filterLabel}</SheetTitle>
              </SheetHeader>
              {/* Back inside the band (the sheet ended it), at the touch step;
                  every joined label shares one column so the boxes line up. */}
              <ToolbarBandContext.Provider value={true}>
                <ToolbarSizeContext.Provider value="lg">
                  <div
                    data-filter-sheet=""
                    className="flex flex-col gap-3 [&_[data-joined-label]]:w-[130px] [&>*]:w-full!"
                  >
                    {toolbar}
                  </div>
                </ToolbarSizeContext.Provider>
              </ToolbarBandContext.Provider>
              <SheetFooter className="flex-row gap-2 sm:space-x-0">
                {onResetFilters && (
                  <Button variant="ghost" size="lg" className="px-4" onClick={onResetFilters}>
                    {labels?.reset ?? "Reset"}
                  </Button>
                )}
                <SheetClose asChild>
                  <Button size="lg" className="ml-auto">
                    {labels?.done ?? "Done"}
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
        {filterSummary != null && filterSummary !== false && (
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {filterSummary}
          </span>
        )}
        {count && (
          <span className="ml-auto shrink-0 text-sm text-muted-foreground">{count}</span>
        )}
        {viewOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="ml-auto shrink-0" aria-label={viewOptionsLabel}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              {viewOptions}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
