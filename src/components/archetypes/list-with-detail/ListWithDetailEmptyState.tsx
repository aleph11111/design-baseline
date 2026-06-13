import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ListEmptyMode = "empty" | "loading" | "error" | "filtered-empty";

export type ListWithDetailEmptyStateProps = {
  mode: ListEmptyMode;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
};

export function ListWithDetailEmptyState({
  mode,
  message,
  error,
  onRetry,
  className,
}: ListWithDetailEmptyStateProps) {
  if (mode === "loading") {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-8 text-sm text-muted-foreground",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        Loading…
      </div>
    );
  }

  if (mode === "error") {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong loading this list.";
    return (
      <div className={cn("p-4", className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{errorMessage}</span>
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

  if (mode === "filtered-empty") {
    return (
      <div className={cn("p-8 text-center text-sm text-muted-foreground", className)}>
        {message ?? "No matches. Try clearing filters."}
      </div>
    );
  }

  // mode === "empty"
  return (
    <div className={cn("p-8 text-center text-sm text-muted-foreground", className)}>
      {message ?? "No items yet"}
    </div>
  );
}

ListWithDetailEmptyState.displayName = "ListWithDetailEmptyState";
