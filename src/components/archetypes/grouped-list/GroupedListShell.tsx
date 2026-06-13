import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GroupedListShellProps = {
  /** Page-level toolbar slot. Rendered above the sections region with a separator. */
  toolbar?: React.ReactNode;
  /** True while the initial fetch is in flight. */
  isLoading?: boolean;
  /** Fetch error; null/undefined when healthy. */
  error?: unknown;
  /** Called by the error panel's "Try again" button. */
  onRetry?: () => void;
  /** True when there are zero sections and zero ungrouped rows. */
  isEmpty?: boolean;
  /** Copy shown in the page-level empty state. */
  emptyMessage?: string;
  /** `<GroupedListSection>` instances. */
  children?: React.ReactNode;
  className?: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong loading this page.";
}

/**
 * Page-level wrapper for an Archetype K (grouped-list) page. Renders an
 * optional toolbar above a vertical stack of `<GroupedListSection>` children,
 * and handles the page-level loading, empty, and error planes.
 *
 * The inner table chrome is delegated to `<ListWithDetailShell>` inside each
 * `<GroupedListSection>`; this component does not render any table itself.
 */
export function GroupedListShell({
  toolbar,
  isLoading,
  error,
  onRetry,
  isEmpty,
  emptyMessage,
  children,
  className,
}: GroupedListShellProps): React.ReactElement {
  const showLoading = isLoading === true;
  const showError = !showLoading && error != null;
  const showEmpty = !showLoading && !showError && isEmpty === true;
  const showSections = !showLoading && !showError && !showEmpty;

  return (
    <div className={cn("space-y-6", className)}>
      {toolbar && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b px-4 py-3">{toolbar}</div>
        </div>
      )}

      {showLoading && (
        <div
          className="flex items-center justify-center p-8 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Loading…
        </div>
      )}

      {showError && (
        <div className="p-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2">
              <span>{errorMessage(error)}</span>
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
      )}

      {showEmpty && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {emptyMessage ?? "No items yet"}
        </div>
      )}

      {showSections && <div className="space-y-8">{children}</div>}
    </div>
  );
}

GroupedListShell.displayName = "GroupedListShell";
