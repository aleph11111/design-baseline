"use client";
import * as React from "react";
import { ErrorBoundary } from "../../ui/error-boundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** One settings category: its tab trigger and the body it reveals. */
export type SettingsTab = {
  value: string;
  /** Trigger label (an icon may lead it). It is the body's heading. */
  label: React.ReactNode;
  /** The tab body — a list-with-detail, settings-form or settings-table body. */
  content: React.ReactNode;
};

/**
 * The page header — passed once, rendered by `PageFrame` (ADR-0008). No
 * `actions`: a tabbed-settings page has no page-level verbs; actions are per
 * tab and live in each tab body.
 */
type SettingsPageTitleProps = Pick<PageFrameProps, "title" | "subtitle">;

export type SettingsPageShellProps = SettingsPageTitleProps & {
  /** The settings categories, in tab order. The tab strip is the toolbar. */
  tabs: SettingsTab[];
  /** Initially selected tab (uncontrolled). Defaults to the first tab. */
  defaultTab?: string;
  /** Selected tab (controlled) — for a page that syncs the tab to the URL. */
  tab?: string;
  onTabChange?: (value: string) => void;
  /** Persistent section below every tab body (applies to all tabs); the shell
   *  divides it from the tab body. */
  belowTabs?: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SettingsPageShell — the tabbed-settings (F2) archetype shell. Renders
 * through `PageFrame` (ADR-0008): the page header (title once) above the
 * page's one raised surface, whose toolbar band is the tab strip and whose
 * body is the selected tab. Rendered inside another `PageFrame` (a settings
 * sub-route under a layout that owns the page) it nests automatically.
 *
 * Wraps everything in an `<ErrorBoundary>`; adds no page inset (the app
 * shell's main region owns it).
 */
export function SettingsPageShell({
  tabs,
  defaultTab = tabs[0]?.value,
  tab,
  onTabChange,
  belowTabs,
  ...header
}: SettingsPageShellProps): React.ReactElement {
  return (
    <ErrorBoundary>
      <Tabs value={tab} defaultValue={defaultTab} onValueChange={onTabChange}>
        <PageFrame
          {...header}
          toolbar={
            <TabsList>
              {tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          }
        >
          {/* Vertical-only inset (no horizontal pad): a tab body's own ruled
              band (the frameless D2 `SettingsTableBody`) must run edge-to-edge
              with the surface, exactly as on a standalone page — a surface
              frame never pads its body (ADR-0008) and table cells own their
              horizontal pad. Bodies that aren't edge-to-edge (a bare form)
              supply their own `px`. */}
          <div data-slot="settings-page-tab-panel" className="py-5">
            {tabs.map((t) => (
              <TabsContent key={t.value} value={t.value} className="mt-0">
                {t.content}
              </TabsContent>
            ))}
            {belowTabs != null && (
              <div className="mt-5 border-t pt-4">{belowTabs}</div>
            )}
          </div>
        </PageFrame>
      </Tabs>
    </ErrorBoundary>
  );
}

SettingsPageShell.displayName = "SettingsPageShell";
