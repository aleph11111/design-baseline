import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type FormPageHeaderProps = {
  /**
   * Page title. Use an entity-context phrase: "New Task", "Edit Contact — Jane Doe".
   * In edit mode, including the entity's identifier helps the user confirm
   * they're editing the right record.
   */
  title: React.ReactNode;
  /**
   * Optional secondary line — created date, status string, role hint.
   */
  subtitle?: React.ReactNode;
  /**
   * Optional decorative icon, rendered to the left of the title.
   * Size is `h-6 w-6`; pass a lucide-react icon component.
   */
  icon?: React.ComponentType<{ className?: string }>;
  /**
   * Optional back link. When provided, renders a "← Back" affordance above
   * the title row.
   */
  backHref?: string;
  /**
   * Label for the back link. Defaults to "Back".
   */
  backLabel?: string;
  /**
   * Optional render function to render the back link with a project-specific
   * router. Defaults to a plain `<a>` element. Use to wire a framework's
   * `<Link>` component (e.g. Next.js Link) without leaking the dependency
   * into the baseline.
   */
  renderBackLink?: (href: string, label: string) => React.ReactNode;
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FormPageHeader — informational header for a B (form-page) archetype instance.
 *
 * Layout:
 *   [back link (optional)]
 *   [icon (optional)] [title]
 *   [subtitle (optional)]
 *
 * Action buttons (Save, Cancel, Delete) DO NOT belong here — they live in
 * <FormPageActions> at the bottom of the form. This is what separates a
 * form page from a list-with-detail page (where header actions are
 * canonical) and from a J dialog (where mode-toggle goes in the header
 * actions slot).
 */
export function FormPageHeader({
  title,
  subtitle,
  icon,
  backHref,
  backLabel = "Back",
  renderBackLink,
  className,
}: FormPageHeaderProps): React.ReactElement {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={icon}
      backHref={backHref}
      backLabel={backLabel}
      renderBackLink={renderBackLink}
      className={className}
    />
  );
}

FormPageHeader.displayName = "FormPageHeader";
