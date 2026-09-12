"use client";
import * as React from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { cn } from "../../lib/utils";

export type StateViewVariant = "loading" | "empty" | "error";

export type StateViewProps = {
  variant: StateViewVariant;
  /**
   * Headline for the empty/error plane — foreground, medium weight. When set,
   * the `message`/`description` line reads as a muted sub-line beneath it. For
   * the error variant this overrides the default "Something went wrong" title.
   */
  title?: React.ReactNode;
  /**
   * Secondary muted line. Preferred over `message` for new callers; `message`
   * is kept as a back-compat alias (a single muted line, no title).
   */
  description?: React.ReactNode;
  /** Back-compat single-line copy (also the loading label override). Aliased to `description`. */
  message?: React.ReactNode;
  /**
   * Loading-plane override: a skeleton node (e.g. `<ListSkeleton>`) rendered in
   * place of the centered "Loading…" text when `variant="loading"`. The node
   * owns its own `role="status"`, so StateView renders it verbatim. Omit for the
   * default text loader.
   *
   * Default across the list/table shells (list-with-detail, settings-table,
   * grouped-list) is the text loader; a skeleton is an explicit opt-in for the
   * pages whose row shape is known ahead of the fetch.
   */
  loadingSkeleton?: React.ReactNode;
  /** Optional leading icon for the empty state (centered above the text). */
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
 *  - loading: centered "Loading…", `role="status"`, `p-8` — or a `loadingSkeleton`
 *    node (e.g. `<ListSkeleton>`) rendered verbatim when the row shape is known.
 *  - empty:   centered `p-8`, optional icon + optional title + description + CTA.
 *  - error:   a destructive `<Alert>` with an optional retry button.
 *
 * Both empty and error accept a `title` (foreground headline) + `description`
 * (muted sub-line). `message` is the back-compat alias for `description` — a
 * single muted line with no title renders exactly as before.
 */
export function StateView({
  variant,
  title,
  description,
  message,
  icon: Icon,
  error,
  onRetry,
  action,
  loadingSkeleton,
  className,
}: StateViewProps): React.ReactElement {
  if (variant === "loading") {
    if (loadingSkeleton) return <>{loadingSkeleton}</>;
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
          <AlertTitle>{title ?? "Something went wrong"}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{description ?? message ?? errorMessage(error)}</span>
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
  const body = description ?? message ?? (title ? undefined : "No items yet");
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-center",
        className,
      )}
    >
      {Icon && <Icon className="h-8 w-8 text-muted-foreground/70" />}
      {(title || body) && (
        <div className="space-y-1">
          {title && <p className="text-sm font-medium text-foreground">{title}</p>}
          {body && <p className="text-sm text-muted-foreground">{body}</p>}
        </div>
      )}
      {action}
    </div>
  );
}

StateView.displayName = "StateView";
