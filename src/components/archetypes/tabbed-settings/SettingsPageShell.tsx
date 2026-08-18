import * as React from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "@/components/layout/SurfaceHeaderSlot";
import {
  SettingsPageHeader,
  type SettingsPageHeaderProps,
} from "./SettingsPageHeader";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

// On-surface header (Plex Ledger board form). When `kicker` or `headerActions`
// is set, the shell switches to board form: `SettingsPageHeader` is suppressed
// and a `SurfaceHeader` renders at the top of a bounded card wrapping the
// children. The existing `title` prop (from `SettingsPageHeaderProps`) is
// used as the surface title.
export type SettingsPageShellProps = SettingsPageHeaderProps &
  Omit<SurfaceHeaderSlotProps, "title"> & {
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
 *   - a `space-y-5` body container with no outer padding
 *
 * The outer container intentionally omits padding — `<AppShell>`'s `<main>`
 * supplies the page inset (docs/STYLE.md); adding it here would double-inset.
 *
 * Consumer shapes:
 *   F2 tabbed settings: <SettingsPageShell title="…"><Tabs>…</Tabs></SettingsPageShell>
 *   D1 settings form:   <SettingsPageShell title="…" actions={<SaveButton/>}><form>…</form></SettingsPageShell>
 *   D2 settings table:  <SettingsPageShell title="…"><SettingsTableShell …/></SettingsPageShell>
 */
export function SettingsPageShell({
  breadcrumbs,
  children,
  kicker,
  headerActions,
  ...header
}: SettingsPageShellProps): React.ReactElement {
  const boardForm = kicker !== undefined || headerActions !== undefined;

  return (
    <ErrorBoundary>
      <div className="space-y-5">
        {breadcrumbs}
        {boardForm ? (
          // Board form: SurfaceHeader on the bounded card; SettingsPageHeader suppressed.
          <div className="rounded-lg border bg-card overflow-hidden">
            <SurfaceHeaderSlot
              kicker={kicker}
              title={header.title}
              headerActions={headerActions}
            />
            <div className="p-5">{children}</div>
          </div>
        ) : (
          <>
            <SettingsPageHeader {...header} />
            {children}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

SettingsPageShell.displayName = "SettingsPageShell";
