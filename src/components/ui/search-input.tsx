import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Applied to the wrapper. Defaults to `max-w-sm flex-1`. */
  className?: string;
  "aria-label"?: string;
};

/**
 * SearchInput — the single owner of the toolbar search box: a leading magnifier
 * icon + an `<Input className="pl-9">` in a `max-w-sm flex-1` wrapper. Previously
 * this lived inline in ListWithDetailToolbar and was hand-copied into demos;
 * extracting it keeps every search field identical.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  ...rest
}: SearchInputProps): React.ReactElement {
  return (
    <div className={cn("relative max-w-sm flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder={placeholder}
        aria-label={rest["aria-label"] ?? "Search"}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

SearchInput.displayName = "SearchInput";
