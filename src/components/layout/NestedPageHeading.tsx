import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Fixed scale
// ---------------------------------------------------------------------------

/**
 * The single type treatment for a nested page heading — rendered as an `<h2>`
 * at the one fixed scale that sits between `PageHeader` (the h1 page title)
 * and `SectionHeading` (the overline sub-section label). No prop may change it:
 * a per-call-site size/weight/variant is exactly the appearance-prop that hard
 * rule 12 forbids, and it is the freedom that split the fleet's sub-tab headings
 * into competing weights.
 */
export const NESTED_HEADING_CLASS =
  "text-base font-medium leading-tight tracking-tight text-foreground";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type NestedPageHeadingProps = {
  /**
   * Nested page title. Always present. Rendered as an `<h2>` at the canonical
   * fixed nested-page scale (`NESTED_HEADING_CLASS`) — the single source of a
   * nested page title's typography. Use when a parent route layout already owns
   * the page's h1 (a tabbed sub-route like `/:resource/[id]/:section`) and this
   * page needs a title of its own below it.
   */
  title: React.ReactNode;
  /**
   * Optional secondary line below the title. Rendered as `<p>` at
   * `text-xs text-muted-foreground` — the same treatment `PageHeader` gives
   * its subtitle.
   */
  subtitle?: React.ReactNode;
  /**
   * Optional status badges, rendered inline to the RIGHT of the title (same
   * row, wrapping). Read-only state only — interactive controls go in `actions`.
   */
  badges?: React.ReactNode;
  /**
   * Optional right-aligned actions row. Each child should be a `<Button>` or
   * `<Link>`. Action buttons MUST NOT be mixed into the title line.
   */
  actions?: React.ReactNode;
  /**
   * Optional class for the outer wrapper. Never for the heading itself — the
   * title's scale is fixed in the component.
   */
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * NestedPageHeading — the canonical nested page title for the baseline.
 *
 * This is the third rung of the heading-scale ladder, between `PageHeader`
 * (the standalone h1 page title) and `SectionHeading` (the uppercase
 * overline that names a sub-section inside a card). It carries a nested *page*
 * title for the case where a parent route layout owns the h1 and the page
 * below it still needs a title of its own.
 *
 * The type scale and weight are FIXED in the component — it takes no `size`,
 * `level`, `weight`, or `variant` prop. That is deliberate: a per-call-site
 * appearance prop is hard rule 12's forbidden escape hatch, and the freedom to
 * re-pick the weight is precisely what split the fleet's sub-tab headings.
 *
 * Prop shape matches the `PageHeader` page-title family (title / subtitle /
 * badges / actions) minus its standalone-page concerns (icon, back link), so
 * the three ladder rungs read as one family.
 *
 * Layout:
 *   [title]                                         [actions (optional)]
 *   [subtitle (optional)]
 *
 * Breadcrumbs and the parent's page title (h1) are NOT rendered here — they belong to the
 * parent route layout or app shell, not to this page.
 */
export function NestedPageHeading({
  title,
  subtitle,
  badges,
  actions,
  className,
}: NestedPageHeadingProps): React.ReactElement {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className={NESTED_HEADING_CLASS}>{title}</h2>
            {badges && (
              <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}

NestedPageHeading.displayName = "NestedPageHeading";
