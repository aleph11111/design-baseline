"use client";
import * as React from "react";
import { ErrorBoundary } from "../../ui/error-boundary";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";
import { SectionCard } from "../../layout/SectionCard";
import { ActionFooterBar } from "../shared/ActionFooterBar";
import { useLabels } from "../../../lib/labels";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * The page header — passed once, rendered by `PageFrame` (ADR-0008). `actions`
 * holds the page-level verbs ("Refresh", "New template"); a section's save is
 * never one of them — it lives at that section's foot.
 */
type SettingsSectionsTitleProps = Pick<PageFrameProps, "title" | "subtitle" | "actions">;

export type SettingsSectionsShellProps = SettingsSectionsTitleProps & {
  /** The stacked `<SettingsSection>`s, in reading order. */
  children: React.ReactNode;
};

export type SettingsSectionProps = {
  /** The section title — required; rendered once, in the section's title bar. */
  title: React.ReactNode;
  /** Optional one-line clarifier under the title. */
  description?: React.ReactNode;
  /** Section-scoped secondary controls in the title bar (a count, a
   *  "Refresh counters" ghost button). Never the save. */
  actions?: React.ReactNode;
  /** Saves this section only. When set, the section renders its save button
   *  at its foot. */
  onSave?: () => void;
  /** Save button label. Defaults to the locale's "Save". */
  saveLabel?: string;
  /** In-flight save: disables the button and shows the saving label. */
  isSaving?: boolean;
  /** Label while saving; derived from `saveLabel` in English when omitted. */
  savingLabel?: string;
  /** Static gate (nothing changed, invalid input). */
  saveDisabled?: boolean;
  children: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/**
 * SettingsSectionsShell — the settings-sections (D3) archetype shell. Renders
 * through `PageFrame` (ADR-0008): the page header (title once, page verbs in
 * `actions`) above the page's one raised surface, whose body is a stack of
 * independent `<SettingsSection>`s divided by hairlines. Each section flattens
 * inside the surface (no card-in-card) and owns its own title and save.
 *
 * Wraps everything in an `<ErrorBoundary>`; adds no page inset (the app
 * shell's main region owns it).
 */
export function SettingsSectionsShell({
  children,
  ...header
}: SettingsSectionsShellProps): React.ReactElement {
  return (
    <ErrorBoundary>
      <PageFrame {...header}>
        <div data-slot="settings-sections" className="divide-y">
          {children}
        </div>
      </PageFrame>
    </ErrorBoundary>
  );
}

SettingsSectionsShell.displayName = "SettingsSectionsShell";

/**
 * SettingsSection — one independent settings group: a titled `SectionCard`
 * (flattened inside the shell's surface) with the section's own save at its
 * foot, right-aligned.
 */
export function SettingsSection({
  title,
  description,
  actions,
  onSave,
  saveLabel,
  isSaving,
  savingLabel,
  saveDisabled,
  children,
}: SettingsSectionProps): React.ReactElement {
  const L = useLabels();
  return (
    <SectionCard title={title} description={description} actions={actions}>
      {children}
      {onSave && (
        <ActionFooterBar
          className="mt-4"
          primaryLabel={saveLabel ?? L.save}
          onPrimary={onSave}
          isSubmitting={isSaving}
          submittingLabel={savingLabel}
          primaryDisabled={saveDisabled}
        />
      )}
    </SectionCard>
  );
}

SettingsSection.displayName = "SettingsSection";
