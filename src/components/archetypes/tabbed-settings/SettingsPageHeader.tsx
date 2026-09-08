"use client";
import * as React from "react";
import { PageHeader } from "../../layout/PageHeader";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SettingsPageHeaderProps = {
  /**
   * Page title. Names the settings *category* the page configures
   * (e.g. "Integrations", "Order Processing"). Rendered as the wrapped
   * `<PageHeader>`'s `<h1>` — see its `title` prop for the canonical type
   * scale.
   */
  title: React.ReactNode;
  /**
   * Optional secondary line clarifying the page's purpose when the title
   * alone is not enough.
   */
  subtitle?: React.ReactNode;
  /**
   * Optional decorative icon rendered to the left of the title.
   * Size is `h-6 w-6`; pass a lucide-react icon component.
   */
  icon?: React.ComponentType<{ className?: string }>;
  /**
   * Optional action slot rendered right of the title block.
   *
   * For a tabbed-settings (F2) page this slot is intentionally empty — the
   * page title is a category, so actions live in each tab body's own toolbar.
   * It exists because <SettingsPageShell> is shared with the settings-form
   * (D1) archetype, where a single-entity form may surface a Save button here.
   */
  actions?: React.ReactNode;
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SettingsPageHeader — the title block for a tabbed-settings (F2) page.
 *
 * Layout:
 *   [icon (optional)] [title]            [actions (optional)]
 *   [subtitle (optional)]
 *
 * Action buttons do NOT belong here for a tabbed-settings page — the title
 * names a category and per-tab actions live in each tab body's toolbar. The
 * `actions` slot is retained only for the shared settings-form (D1) consumer.
 */
export function SettingsPageHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}: SettingsPageHeaderProps): React.ReactElement {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={actions}
      className={className}
    />
  );
}

SettingsPageHeader.displayName = "SettingsPageHeader";
