"use client";
import * as React from "react";
import { PageHeader } from "../../layout/PageHeader";

export type DetailOverviewHeaderProps = {
  /**
   * Entity title. Reflects the resolved entity name (e.g. "Acme Corp",
   * "Order #1042"). Rendered as the wrapped `<PageHeader>`'s `<h1>` — see its
   * `title` prop for the canonical type scale.
   */
  title: React.ReactNode;
  /**
   * Optional secondary line below the title. Use for parent-entity links,
   * status hints, or short metadata. Rendered as the wrapped `<PageHeader>`'s
   * `<p>` — see its `subtitle` prop for the canonical type scale.
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
  /**
   * Optional back link, forwarded to the wrapped `<PageHeader>` — see its
   * `backHref` / `backLabel` / `renderBackLink` for the shared adapter. Pass
   * only when the entity route has no breadcrumb or section nav of its own.
   */
  backHref?: string;
  /** Label for the back link. Defaults to `<PageHeader>`'s "Back". */
  backLabel?: string;
  /** Router-link adapter for the back link, as on `<PageHeader>`. */
  renderBackLink?: (href: string, label: string) => React.ReactNode;
  className?: string;
};

/**
 * DetailOverviewHeader — standalone header for a C (detail-overview) archetype
 * instance.
 *
 * Use this in **Mode A — standalone**: call this header above the
 * `<DetailOverviewShell>` because no parent layout owns the title (typical for
 * top-level entity routes like `/:resource/[id]`). It renders the canonical
 * `<h1>` through `PageHeader`.
 *
 * For **Mode B — nested** (the parent route layout already renders the entity
 * title and any tab nav), do not call this header. Pass `title` / `subtitle` /
 * `badges` / `actions` to `<DetailOverviewShell>`, which renders the
 * fixed-scale nested `<h2>` itself via `NestedPageHeading` — no per-call-site
 * heading choice.
 *
 * Layout:
 *   [title]                                                  [actions]
 *   [subtitle (optional)]
 *
 * Breadcrumbs are NOT rendered here — they belong to the app shell or parent
 * layout, not the detail-overview page.
 *
 * Thin wrapper over the baseline `<PageHeader>` — it narrows the surface to
 * the detail-overview contract (no icon; the back link is `<PageHeader>`'s
 * shared adapter, forwarded as-is) while the shared
 * layout and typography live in one place.
 */
export function DetailOverviewHeader({
  title,
  subtitle,
  badges,
  actions,
  backHref,
  backLabel,
  renderBackLink,
  className,
}: DetailOverviewHeaderProps): React.ReactElement {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      badges={badges}
      actions={actions}
      backHref={backHref}
      backLabel={backLabel}
      renderBackLink={renderBackLink}
      className={className}
    />
  );
}

DetailOverviewHeader.displayName = "DetailOverviewHeader";
