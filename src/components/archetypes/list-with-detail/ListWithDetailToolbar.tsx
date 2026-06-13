import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      )}
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {quickFilters && <div className="flex items-center gap-2">{quickFilters}</div>}
      {pageActions && <div className="ml-auto flex items-center gap-2">{pageActions}</div>}
    </div>
  );
}

ListWithDetailToolbar.displayName = "ListWithDetailToolbar";
