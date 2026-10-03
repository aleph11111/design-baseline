"use client";
import * as React from "react";
import type { ClassValue } from "clsx";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader, type PageHeaderProps } from "./PageHeader";
import { NestedPageHeading } from "./NestedPageHeading";
import { SurfaceFrame } from "./SurfaceFrame";
import { Button } from "../ui/button";
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
  /** Decorative title icon (top-level page only). */
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
  /** Structural classes on the surface (the matrix-grid inner scroller's
   *  `overflow`). Never appearance. */
  frameClassName?: ClassValue;
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
  count,
  viewOptions,
  viewOptionsLabel = "View",
  children,
  className,
  frameClassName,
}: PageFrameProps): React.ReactElement {
  const nested = React.useContext(PageFrameContext);

  const band =
    toolbar != null || count != null || viewOptions != null ? (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">{toolbar}</div>
        {count != null || viewOptions != null ? (
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {count != null && (
              <span className="text-sm text-muted-foreground">{count}</span>
            )}
            {viewOptions != null && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
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
    ) : null;

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
        <SurfaceFrame toolbar={band} className={frameClassName}>
          {children}
        </SurfaceFrame>
      </PageFrameContext.Provider>
    </div>
  );
}

PageFrame.displayName = "PageFrame";
