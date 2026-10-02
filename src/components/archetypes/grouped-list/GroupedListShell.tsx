"use client";
import * as React from "react";
import { ListStateView, resolveListState, type ListStateLabels } from "../shared";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "../../layout/SurfaceHeaderSlot";

// The shared renderer's own labels type — one owner of the key set, so the
// three list shells' `labels` props can't drift. Re-exported under the shell's
// name for existing import sites.
export type GroupedListShellLabels = ListStateLabels;

export type GroupedListShellProps = {
  /** Page-level toolbar slot. Rendered as a bare flex row above the sections region. */
  toolbar?: React.ReactNode;
  /** True while the initial fetch is in flight. */
  isLoading?: boolean;
  /** Fetch error; null/undefined when healthy. */
  error?: unknown;
  /** Called by the error panel's "Try again" button. */
  onRetry?: () => void;
  /** True when there are zero sections and zero ungrouped rows. */
  isEmpty?: boolean;
  /** Copy shown in the page-level empty state. */
  emptyMessage?: string;
  /** Overrides for the page-level state-plane copy (loading, error title, retry). */
  labels?: GroupedListShellLabels;
  /** `<GroupedListSection>` instances. */
  children?: React.ReactNode;
} & SurfaceHeaderSlotProps;

/**
 * Page-level wrapper for an Archetype K (grouped-list) page. Renders an
 * optional toolbar above a vertical stack of `<GroupedListSection>` children,
 * and handles the page-level loading, empty, and error planes.
 *
 * The inner table chrome is delegated to `ListWithDetailShell` inside each
 * `<GroupedListSection>`; this component does not render any table itself.
 */
export function GroupedListShell({
  toolbar,
  isLoading,
  error,
  onRetry,
  isEmpty,
  emptyMessage,
  labels,
  children,
  kicker,
  title,
  headerActions,
}: GroupedListShellProps): React.ReactElement {
  const listState = resolveListState({ isLoading, error, isEmpty: isEmpty === true });
  const showSections = listState === "content";

  return (
    <div className="space-y-5">
      <SurfaceHeaderSlot
        kicker={kicker}
        title={title}
        headerActions={headerActions}
      />

      {/* Page-level toolbar: a bare flex row (no card chrome) — the same
          standalone-toolbar treatment as feed-inbox. The grouped sections below
          supply their own card boundaries. */}
      {toolbar && (
        <div className="flex flex-wrap items-center gap-3">{toolbar}</div>
      )}

      <ListStateView
        phase={listState}
        error={error}
        onRetry={onRetry}
        labels={labels}
        emptyMessage={emptyMessage}
      />

      {showSections && <div className="space-y-5">{children}</div>}
    </div>
  );
}

GroupedListShell.displayName = "GroupedListShell";
