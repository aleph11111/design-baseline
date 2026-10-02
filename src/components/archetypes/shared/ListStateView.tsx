"use client";
import type * as React from "react";
import { StateView } from "../../ui/state-view";
import type { ListStatePhase } from "./resolveListState";

/**
 * The list shells' built-in state-plane copy — every string
 * `<ListStateView>` renders on its own. English defaults; a non-English app
 * overrides per call site (the fleet's i18n rule: English defaults,
 * overridable, never a baked-in language).
 */
export type ListStateLabels = {
  /** Loading-plane text. Default "Loading…". */
  loading?: string;
  /** Error-plane title. Default "Something went wrong". */
  errorTitle?: string;
  /** Error-plane retry button. Default "Try again". */
  retry?: string;
};

export type ListStateViewProps = {
  /**
   * The `<resolveListState>` phase for the region this plane covers.
   * `"content"` renders nothing (the region's own content owns it).
   */
  phase: ListStatePhase;
  /** Fetch error; only used in the `"error"` phase. */
  error?: unknown;
  /** Renders the error plane's retry button. */
  onRetry?: () => void;
  /** Overrides for the shell's own state-plane copy. */
  labels?: ListStateLabels;
  /** Empty-plane text override. Default "No items yet". */
  emptyMessage?: string;
  /** CTA rendered inside the empty plane (an "Add {entity}" button). */
  emptyAction?: React.ReactNode;
  className?: string;
};

/**
 * The shared list-state renderer: maps a `<resolveListState>` phase onto the
 * shared `<StateView>` loading / error / empty planes. The phase resolver and
 * its planes were shared separately and each list shell (list-with-detail,
 * settings-table, grouped-list) kept its own rendering copy, which drifted —
 * all three now route through here, so the planes stay identical everywhere
 * and the default empty string lives in one place.
 */
export function ListStateView({
  phase,
  error,
  onRetry,
  labels,
  emptyMessage,
  emptyAction,
  className,
}: ListStateViewProps): React.ReactElement | null {
  if (phase === "content") return null;

  if (phase === "loading") {
    return <StateView variant="loading" message={labels?.loading} className={className} />;
  }

  if (phase === "error") {
    return (
      <StateView
        variant="error"
        title={labels?.errorTitle}
        error={error}
        onRetry={onRetry}
        retryLabel={labels?.retry}
        className={className}
      />
    );
  }

  return (
    <StateView
      variant="empty"
      message={emptyMessage ?? "No items yet"}
      action={emptyAction}
      className={className}
    />
  );
}

ListStateView.displayName = "ListStateView";
