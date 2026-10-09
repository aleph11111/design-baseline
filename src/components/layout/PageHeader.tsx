"use client";
import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { HeadingRow } from "./HeadingRow";
import { useLabels } from "../../lib/labels";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type PageHeaderProps = {
  /**
   * Page title. Always present. Rendered as an `<h1>` at the canonical
   * `text-display-title font-semibold tracking-tight` (ADR-0007's display
   * step) — the single title treatment shared by every archetype header in
   * the baseline.
   */
  title: React.ReactNode;
  /**
   * Optional secondary content below the title (status hint, parent-entity
   * link, created date). Rendered in a `<div>` at `text-xs
   * text-muted-foreground`, so block content (several lines, nested `<div>`s)
   * is valid as well as a plain string.
   */
  subtitle?: React.ReactNode;
  /**
   * Optional decorative icon, rendered to the left of the title at
   * `h-6 w-6 text-muted-foreground`. Pass a lucide-react icon component.
   */
  icon?: React.ComponentType<{ className?: string }>;
  /**
   * Optional status badges, rendered inline to the RIGHT of the title (same
   * row, wrapping). Use for an entity's status dimensions (order: paid /
   * shipped; deal: stage / forecast) — this is the "one home for status" the
   * detail-overview acceptance gate prescribes. Pass `<Badge>`s. Distinct from
   * `actions` (interactive) — badges are read-only state.
   */
  badges?: React.ReactNode;
  /**
   * Optional right-aligned actions row. Each child should be a `<Button>` or
   * `<Link>`. Action buttons MUST NOT be mixed into the title line — they go
   * here. Some archetypes (form-page, crud-dialog) forbid header actions
   * entirely and own a footer instead; those wrappers simply don't expose
   * this slot.
   */
  actions?: React.ReactNode;
  /**
   * Optional back link, rendered as a "← Back" affordance above the title row.
   * Pass only when the page is a leaf with no breadcrumb/section nav of its
   * own (typical for a form-page route).
   */
  backHref?: string;
  /** Label for the back link. Defaults to "Back". */
  backLabel?: string;
  /**
   * Optional render function for the back link, to wire a framework router's
   * `<Link>` without leaking the dependency into the baseline. Defaults to a
   * plain `<a>`.
   */
  renderBackLink?: (href: string, label: string) => React.ReactNode;
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * PageHeader — the canonical page title block for the baseline.
 *
 * This is the single source of truth for page-level header typography. The
 * h1 rung owns its element and its scale — the display step (ADR-0007 §2),
 * the fleet's one focal point on a page; the shared row layout comes from
 * `HeadingRow` — the one place the page-title family's layout markup lives,
 * so iterating the header is one edit, baseline-wide.
 * Archetype shells never wrap it themselves: they render it through
 * `PageFrame`, which passes the page's title once (ADR-0008).
 *
 * Layout:
 *   [back link (optional)]
 *   [icon (optional)] [title]                              [actions (optional)]
 *   [subtitle (optional)]
 *
 * Breadcrumbs are NOT rendered here — they belong to the app shell or the
 * section layout, not the page header.
 */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badges,
  actions,
  backHref,
  backLabel: backLabelProp,
  renderBackLink,
  className,
}: PageHeaderProps): React.ReactElement {
  const L = useLabels();
  const backLabel = backLabelProp ?? L.back;
  const backLink = backHref
    ? renderBackLink
      ? renderBackLink(backHref, backLabel)
      : (
        <a
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </a>
      )
    : null;

  return (
    <HeadingRow
      heading={
        <h1 className="text-display-title font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
      }
      beforeRow={backLink}
      beforeHeading={
        Icon ? <Icon className="h-6 w-6 shrink-0 text-muted-foreground" /> : undefined
      }
      subtitle={subtitle}
      badges={badges}
      actions={actions}
      className={className}
    />
  );
}

PageHeader.displayName = "PageHeader";
