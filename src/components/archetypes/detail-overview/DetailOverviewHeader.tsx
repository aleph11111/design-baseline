import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";

export type DetailOverviewHeaderProps = {
  /**
   * Entity title. Reflects the resolved entity name (e.g. "Acme Corp",
   * "Order #1042"). Rendered as an `<h1>` at the canonical
   * `text-2xl font-semibold tracking-tight`.
   */
  title: React.ReactNode;
  /**
   * Optional secondary line below the title. Use for parent-entity links,
   * status hints, or short metadata. Rendered as `<p>` at
   * `text-sm text-muted-foreground`.
   */
  subtitle?: React.ReactNode;
  /**
   * Optional status badges, rendered inline next to the title. This is the
   * detail-overview "one home for status" — an entity's status dimensions
   * (order: paid / shipped; deal: stage / forecast) live here as read-only
   * `<Badge>`s, not duplicated in the rail or a content band.
   */
  badges?: React.ReactNode;
  /**
   * Optional right-aligned actions row. Each child should be a `<Link>` or
   * `<Button>`. Visibility of individual actions may depend on entity state
   * (e.g. "Convert" only when the entity is in a pre-conversion state).
   *
   * Action buttons MUST NOT be mixed into the title line — pass them here.
   */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * DetailOverviewHeader — standalone header for a C (detail-overview) archetype
 * instance.
 *
 * Use this in **Mode A — standalone**: the page renders its own header because
 * no parent layout owns it (typical for top-level entity routes like
 * `/:resource/[id]`).
 *
 * For **Mode B — nested** (the parent route layout already renders the entity
 * title and any tab nav), omit this header entirely. Optionally introduce a
 * section-level `<h2>` if the parent's tab label is insufficient context.
 *
 * Layout:
 *   [title]                                                  [actions]
 *   [subtitle (optional)]
 *
 * Breadcrumbs are NOT rendered here — they belong to the app shell or parent
 * layout, not the detail-overview page.
 *
 * Thin wrapper over the baseline `<PageHeader>` — it narrows the surface to
 * the detail-overview contract (no icon, no back link) while the shared
 * layout and typography live in one place.
 */
export function DetailOverviewHeader({
  title,
  subtitle,
  badges,
  actions,
  className,
}: DetailOverviewHeaderProps): React.ReactElement {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      badges={badges}
      actions={actions}
      className={className}
    />
  );
}

DetailOverviewHeader.displayName = "DetailOverviewHeader";
