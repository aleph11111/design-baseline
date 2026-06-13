import * as React from "react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  SettingsPageHeader,
  type SettingsPageHeaderProps,
} from "./SettingsPageHeader";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SettingsPageShellProps = SettingsPageHeaderProps & {
  /**
   * Optional breadcrumb trail rendered above the header.
   *
   * Kept as a slot rather than auto-derived from the router: breadcrumb
   * derivation is framework-specific (it needs the current location), so the
   * consuming project wires its own router-aware breadcrumb component here.
   */
  breadcrumbs?: React.ReactNode;
  /**
   * Page body. This slot is the only structural variation between the three
   * settings consumers that share this shell:
   *   - tabbed settings (F2): pass a `<Tabs>` element
   *   - settings form    (D1): pass a `<form>` element
   *   - settings table   (D2): pass a settings-table shell
   */
  children: React.ReactNode;
  /**
   * Extra classes for the inner container. Use on a standalone page (one not
   * nested under a settings layout) to add the outer padding the layout would
   * otherwise supply, e.g. `className="container mx-auto px-6 py-6"`.
   */
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SettingsPageShell — the shared chrome for every settings page. It is the
 * primitive the tabbed-settings (F2) archetype owns, and is reused by the
 * settings-form (D1) and settings-table (D2) archetypes.
 *
 * Provides:
 *   - <ErrorBoundary> wrapping all page content
 *   - an optional breadcrumb slot
 *   - <SettingsPageHeader> (title + optional subtitle / icon / actions)
 *   - a `space-y-6` body container with no outer padding
 *
 * The outer container intentionally omits padding — a settings layout route is
 * expected to supply the page inset. A standalone page (rendered outside such a
 * layout) should pass `className` to add its own padding wrapper.
 *
 * Consumer shapes:
 *   F2 tabbed settings: <SettingsPageShell title="…"><Tabs>…</Tabs></SettingsPageShell>
 *   D1 settings form:   <SettingsPageShell title="…" actions={<SaveButton/>}><form>…</form></SettingsPageShell>
 *   D2 settings table:  <SettingsPageShell title="…"><SettingsTableShell …/></SettingsPageShell>
 */
export function SettingsPageShell({
  breadcrumbs,
  children,
  className,
  ...header
}: SettingsPageShellProps): React.ReactElement {
  return (
    <ErrorBoundary>
      <div className={cn("space-y-6", className)}>
        {breadcrumbs}
        <SettingsPageHeader {...header} />
        {children}
      </div>
    </ErrorBoundary>
  );
}

SettingsPageShell.displayName = "SettingsPageShell";
