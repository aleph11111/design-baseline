"use client";
import { useLabels } from "../../../lib/labels";
import type * as React from "react";
import { ListStateView } from "../shared";
import type { ListStatePhase } from "../shared";

/**
 * `filtered-empty` is this archetype's own sub-mode of the shared `"empty"`
 * phase: the same empty plane with a filter-active message (an explicit
 * `message` override inside this component). The phase-aware planes all come
 * from the shared `<ListStateView>`, so every list shell renders the same
 * planes.
 */
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
  /** Bulk mode: the header checkbox. Default "Select all rows". */
  selectAll?: string;
  /** Bulk mode: every row checkbox. Default "Select row: {identifier}" (flat "Select row" for a JSX identifier). */
  selectRow?: string;
  /** Bulk mode: the bulk band's caption. Default `${n} selected`. */
  selectedCount?: (count: number) => string;
  /** Bulk mode: the convenience delete button. Default `Delete ${n} selected`. */
  deleteSelected?: (count: number) => string;
  /** Bulk mode: the bulk band's clear button. Default "Clear selection". */
  clearSelection?: string;
  /** Detail stepping: the previous-row button. Default "Previous". */
  previous?: string;
  /** Detail stepping: the next-row button. Default "Next". */
  next?: string;
};

export type ListWithDetailEmptyStateProps = {
  mode: ListEmptyMode;
  message?: string;
  labels?: ListWithDetailLabels;
  error?: unknown;
  onRetry?: () => void;
  /** CTA inside the empty plane (e.g. an "Add {entity}" button). */
  action?: React.ReactNode;
  className?: string;
};

/**
 * Thin adapter over the shared `<ListStateView>` — keeps the list archetype's
 * `mode` API (incl. "filtered-empty") while the actual loading/empty/error
 * planes are owned by one shared renderer, so they match settings-table and
 * grouped-list exactly. The `labels` pass straight through (their
 * `loading`/`errorTitle`/`retry`/`empty` keys are the shared renderer's own);
 * the only mapping is `"filtered-empty"` folded into a message override with
 * this archetype's own default.
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
  const L = useLabels();
  // The shared renderer owns the `"empty"` phase; this component folds its
  // `"filtered-empty"` sub-mode into a message override (its default is the
  // provider's `filteredEmpty`). The no-filter empty message comes
  // from the shared renderer — `labels.empty` or its single default
  // ("No items yet").
  const phase: ListStatePhase = mode === "loading" || mode === "error" ? mode : "empty";
  const emptyMessage =
    mode === "filtered-empty"
      ? (message ?? labels?.filteredEmpty ?? L.filteredEmpty)
      : message;

  return (
    <ListStateView
      phase={phase}
      error={error}
      onRetry={onRetry}
      labels={labels}
      emptyMessage={emptyMessage}
      emptyAction={action}
      className={className}
    />
  );
}

ListWithDetailEmptyState.displayName = "ListWithDetailEmptyState";
