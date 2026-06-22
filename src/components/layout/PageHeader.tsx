import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type PageHeaderProps = {
  /**
   * Page title. Always present. Rendered as an `<h1>` at the canonical
   * `text-2xl font-semibold tracking-tight` — the single title treatment
   * shared by every archetype header in the baseline.
   */
  title: React.ReactNode;
  /**
   * Optional secondary line below the title (status hint, parent-entity
   * link, created date). Rendered as `<p>` at `text-sm text-muted-foreground`.
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
 * This is the single source of truth for page-level header layout and
 * typography. Archetype-specific headers (`FormPageHeader`,
 * `SettingsPageHeader`, `DetailOverviewHeader`) are thin wrappers over this
 * primitive that narrow the prop surface to their contract; the markup and
 * type scale live here so iterating the header is one edit, baseline-wide.
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
  backLabel = "Back",
  renderBackLink,
  className,
}: PageHeaderProps): React.ReactElement {
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
    <div className={cn("space-y-1.5", className)}>
      {backLink && <div>{backLink}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {Icon && (
              <Icon className="h-6 w-6 shrink-0 text-muted-foreground" />
            )}
            <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h1>
            {badges && (
              <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}

PageHeader.displayName = "PageHeader";
