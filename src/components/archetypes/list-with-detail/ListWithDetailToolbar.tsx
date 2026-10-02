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
   * the result of `resultCountLabel(resultCount)` (muted small text) in its
   * trailing counter slot — so it tracks the list live: "2 results" while a
   * query matches two rows, the full filtered-list count after the query is
   * cleared, and "0 results" (alongside the filtered-empty panel) when
   * nothing matches. Omit to hide the caption.
   */
  resultCount?: number;
  /**
   * Formats the count caption from the row count. The default is English
   * pluralization (`"1 result"` / `"2 results"`); a non-English app overrides
   * per call site — e.g. to keep "1 Ergebnis" vs "2 Ergebnisse" correct, or to
   * place the figure after the noun. A fixed noun suffix ("1 results",
   * "1 Ergebnisse") can't express that, so the prop is a formatter, not a word.
   */
  resultCountLabel?: (n: number) => string;
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
  resultCountLabel = (n) => (n === 1 ? "1 result" : `${n} results`),
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
              ? resultCountLabel(resultCount)
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
