import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "./input";
import { cn } from "../../lib/utils";

export type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "size" | "value" | "onChange"
> & {
  value?: string;
  onChange?: (value: string) => void;
  /** Applied to the wrapper. Defaults to `max-w-sm flex-1`. */
  className?: string;
  /** Control height/density. `default` = the original h-10 toolbar box. */
  inputSize?: "sm" | "default" | "lg";
  /** Show a trailing clear-X once there's a value; clears and refocuses. */
  clearable?: boolean;
  /** Match counter (or any trailing caption) — molecule owns the styling. */
  count?: React.ReactNode;
};

// Per-size geometry. The molecule owns these so a compact toolbar box and a
// mobile (lg) search field read as the same widget at different densities.
const SIZE = {
  sm: { input: "h-8 text-xs", icon: "left-2.5 h-3.5 w-3.5", pl: "pl-8" },
  default: { input: "h-10", icon: "left-3 h-4 w-4", pl: "pl-9" },
  lg: { input: "h-12 text-base", icon: "left-3.5 h-5 w-5", pl: "pl-11" },
} as const;

/**
 * SearchInput — the single owner of the toolbar search box: a leading magnifier
 * icon + an `<Input>` in a `max-w-sm flex-1` wrapper. Extended (2026-06-15) to
 * absorb the compact/mobile/clearable/match-counter hand-rolls the fleet kept
 * re-rolling: `inputSize` (sm/default/lg), `clearable` (trailing X), `count`
 * (standardized counter slot), plus full native-input passthrough (`inputMode`,
 * `autoFocus`, `onKeyDown`, …). Default render is unchanged from the original.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  inputSize = "default",
  clearable = false,
  count,
  ...rest
}: SearchInputProps): React.ReactElement {
  const ref = React.useRef<HTMLInputElement>(null);
  const size = SIZE[inputSize];
  const current = value ?? "";
  const showClear = clearable && current.length > 0;
  const hasTrailing = showClear || count != null;

  return (
    <div className={cn("relative max-w-sm flex-1", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          size.icon
        )}
      />
      <Input
        ref={ref}
        className={cn(size.input, size.pl, hasTrailing && "pr-16")}
        placeholder={placeholder}
        aria-label={rest["aria-label"] ?? "Search"}
        value={current}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
      {hasTrailing && (
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {count != null && (
            <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
          )}
          {showClear && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onChange?.("");
                ref.current?.focus();
              }}
              className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

SearchInput.displayName = "SearchInput";
