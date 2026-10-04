"use client";
import * as React from "react";
import { ListStateView, resolveListState, type ListStateLabels } from "../shared";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";

// The shared renderer's own labels type — one owner of the key set, so the
// three list shells' `labels` props can't drift. Re-exported under the shell's
// name for existing import sites.
export type GroupedListShellLabels = ListStateLabels;

export type GroupedListShellProps = Pick<
  PageFrameProps,
  "title" | "subtitle" | "badges" | "actions" | "toolbar"
> & {
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
};

/**
 * Page-level wrapper for an Archetype K (grouped-list) page (ADR-0008): the
 * page title on the canvas, then one raised surface — toolbar band, then the
 * `<GroupedListSection>` children stacked inside it, each flattened to a
 * heading over its table (no card-in-card). Handles the page-level loading,
 * empty, and error planes.
 *
 * The inner table chrome is delegated to the list-with-detail body inside each
 * `<GroupedListSection>`; this component does not render any table itself.
 */
export function GroupedListShell({
  isLoading,
  error,
  onRetry,
  isEmpty,
  emptyMessage,
  labels,
  children,
  ...frame
}: GroupedListShellProps): React.ReactElement {
  const listState = resolveListState({ isLoading, error, isEmpty: isEmpty === true });
  const showSections = listState === "content";

  return (
    <PageFrame {...frame}>
      <ListStateView
        phase={listState}
        error={error}
        onRetry={onRetry}
        labels={labels}
        emptyMessage={emptyMessage}
      />

      {/* Group separation (STYLE.md vertical rhythm): space-y-8 between groups. */}
      {showSections && <div className="space-y-8">{children}</div>}
    </PageFrame>
  );
}

GroupedListShell.displayName = "GroupedListShell";
