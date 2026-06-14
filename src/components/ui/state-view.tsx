import * as React from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StateViewVariant = "loading" | "empty" | "error";

export type StateViewProps = {
  variant: StateViewVariant;
  /** Empty-state body copy (also used as the loading label override). */
  message?: React.ReactNode;
  /** Optional leading icon for the empty state (centered above the message). */
  icon?: LucideIcon;
  /** Error object for the error variant; message is derived from it. */
  error?: unknown;
  /** Renders a "Try again" button in the error variant. */
  onRetry?: () => void;
  /** Optional CTA rendered below an empty-state message (e.g. an Add-new button). */
  action?: React.ReactNode;
  className?: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong.";
}

/**
 * StateView — the single owner of the three async planes (loading / empty /
 * error) that every list/table/section shell renders. Previously each shell
 * (list-with-detail, settings-table, grouped-list) inlined its own copy, which
 * drifted (text-only vs icon empties, `p-8` vs `p-10`, `ring-1` vs Alert). All
 * shells now delegate here so the planes look identical everywhere.
 *
 *  - loading: centered "Loading…", `role="status"`, `p-8`.
 *  - empty:   centered `p-8`, optional icon + message + CTA.
 *  - error:   a destructive `<Alert>` with an optional retry button.
 */
export function StateView({
  variant,
  message,
  icon: Icon,
  error,
  onRetry,
  action,
  className,
}: StateViewProps): React.ReactElement {
  if (variant === "loading") {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-8 text-sm text-muted-foreground",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        {message ?? "Loading…"}
      </div>
    );
  }

  if (variant === "error") {
    return (
      <div className={cn("p-4", className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{message ?? errorMessage(error)}</span>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={onRetry}
              >
                Try again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // variant === "empty"
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {Icon && <Icon className="h-8 w-8 text-muted-foreground/70" />}
      <span>{message ?? "No items yet"}</span>
      {action}
    </div>
  );
}

StateView.displayName = "StateView";
