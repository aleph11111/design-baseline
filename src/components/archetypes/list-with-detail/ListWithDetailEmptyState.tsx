"use client";
import type * as React from "react";
import { StateView } from "../../ui/state-view";

export type ListEmptyMode = "empty" | "loading" | "error" | "filtered-empty";

/**
 * The list shell's built-in copy — every string it renders on its own. English
 * defaults; a non-English app overrides per call site (the fleet's i18n rule:
 * English defaults, overridable, never a baked-in language).
 */
export type ListWithDetailLabels = {
  /** Loading-plane text. Default "Loading…". */
  loading?: string;
  /** Error-plane title. Default "Something went wrong". */
  errorTitle?: string;
  /** Error-plane retry button. Default "Try again". */
  retry?: string;
  /** Empty-plane text when no filter is active. Default "No items yet". */
  empty?: string;
  /** Empty-plane text under an active filter. Default "No matches. Try clearing filters." */
  filteredEmpty?: string;
  /** `sr-only` label of the mobile detail Sheet's close button. Default "Close". */
  close?: string;
  /** `sr-only` label of each row's `⋯` trigger when `rowActions` is set. Default "Row actions". */
  rowActions?: string;
};

export type ListWithDetailEmptyStateProps = {
  mode: ListEmptyMode;
  message?: string;
  labels?: ListWithDetailLabels;
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
  labels,
  error,
  onRetry,
  action,
  className,
}: ListWithDetailEmptyStateProps) {
  if (mode === "loading") {
    return <StateView variant="loading" message={labels?.loading} className={className} />;
  }
  if (mode === "error") {
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
      message={
        message ??
        (mode === "filtered-empty"
          ? (labels?.filteredEmpty ?? "No matches. Try clearing filters.")
          : (labels?.empty ?? "No items yet"))
      }
      action={action}
      className={className}
    />
  );
}

ListWithDetailEmptyState.displayName = "ListWithDetailEmptyState";
