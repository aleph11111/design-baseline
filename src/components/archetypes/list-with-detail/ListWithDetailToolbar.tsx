import type { ReactNode } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

export type ListWithDetailToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  quickFilters?: ReactNode;
  pageActions?: ReactNode;
  className?: string;
};

export function ListWithDetailToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
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
        />
      )}
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {quickFilters && <div className="flex items-center gap-2">{quickFilters}</div>}
      {pageActions && <div className="ml-auto flex items-center gap-2">{pageActions}</div>}
    </div>
  );
}

ListWithDetailToolbar.displayName = "ListWithDetailToolbar";
