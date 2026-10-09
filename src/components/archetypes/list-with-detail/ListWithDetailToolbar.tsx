"use client";
import type { ReactNode } from "react";
import { SearchInput } from "../../ui/search-input";
import { cn } from "../../../lib/utils";
import { useLabels } from "../../../lib/labels";

export type ListWithDetailToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  quickFilters?: ReactNode;
  className?: string;
};

/**
 * The scoping controls of a list page — search, filters, quick filters —
 * composed for the shell's `toolbar` slot. The result count is the shell's
 * `count`; the create action is the shell's `actions` (ADR-0008 §2).
 */
export function ListWithDetailToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder: searchPlaceholderProp,
  filters,
  quickFilters,
  className,
}: ListWithDetailToolbarProps) {
  const L = useLabels();
  const searchPlaceholder = searchPlaceholderProp ?? L.searchPlaceholder;
  const hasSearch = onSearchChange !== undefined || searchValue !== undefined;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {hasSearch && (
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      )}
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {quickFilters && <div className="flex items-center gap-2">{quickFilters}</div>}
    </div>
  );
}

ListWithDetailToolbar.displayName = "ListWithDetailToolbar";
