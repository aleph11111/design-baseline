"use client";
import type { ReactNode } from "react";
import { SearchInput } from "../../ui/search-input";
import { cn } from "../../../lib/utils";

export type ListWithDetailToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /**
   * Number of rows currently listed *after* search and filters are applied.
   * When the search box renders and this is provided, the search box shows
   * `{resultCount} {resultCountLabel}` (muted small text) in its trailing
   * counter slot — so it tracks the list live: "2 results" while a query
   * matches two rows, the full filtered-list count after the query is cleared,
   * and "0 results" (alongside the filtered-empty panel) when nothing matches.
   * Omit to hide the caption.
   */
  resultCount?: number;
  /** Count wording. English default "results"; a non-English app overrides per call site. */
  resultCountLabel?: string;
  filters?: ReactNode;
  quickFilters?: ReactNode;
  pageActions?: ReactNode;
  className?: string;
};

export function ListWithDetailToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  resultCount,
  resultCountLabel = "results",
  filters,
  quickFilters,
  pageActions,
  className,
}: ListWithDetailToolbarProps) {
  const hasSearch = onSearchChange !== undefined || searchValue !== undefined;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {hasSearch && (
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          count={
            resultCount !== undefined
              ? `${resultCount} ${resultCountLabel}`
              : undefined
          }
        />
      )}
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {quickFilters && <div className="flex items-center gap-2">{quickFilters}</div>}
      {pageActions && <div className="ml-auto flex items-center gap-2">{pageActions}</div>}
    </div>
  );
}

ListWithDetailToolbar.displayName = "ListWithDetailToolbar";
