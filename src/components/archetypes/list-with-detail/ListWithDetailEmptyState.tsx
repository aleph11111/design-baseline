"use client";
import type * as React from "react";
import { StateView } from "../../ui/state-view";

export type ListEmptyMode = "empty" | "loading" | "error" | "filtered-empty";

export type ListWithDetailEmptyStateProps = {
  mode: ListEmptyMode;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  /** CTA inside the empty / filtered-empty panel (e.g. an "Add {entity}" button). */
  action?: React.ReactNode;
  className?: string;
};

/**
 * Thin adapter over the shared `<StateView>` — keeps the list archetype's
 * `mode` API (incl. "filtered-empty") while the actual loading/empty/error
 * planes are owned by one primitive, so they match settings-table and
 * grouped-list exactly.
 */
export function ListWithDetailEmptyState({
  mode,
  message,
  error,
  onRetry,
  action,
  className,
}: ListWithDetailEmptyStateProps) {
  if (mode === "loading") {
    return <StateView variant="loading" className={className} />;
  }
  if (mode === "error") {
    return (
      <StateView
        variant="error"
        error={error}
        onRetry={onRetry}
        className={className}
      />
    );
  }
  return (
    <StateView
      variant="empty"
      message={
        message ??
        (mode === "filtered-empty"
          ? "No matches. Try clearing filters."
          : "No items yet")
      }
      action={action}
      className={className}
    />
  );
}

ListWithDetailEmptyState.displayName = "ListWithDetailEmptyState";
