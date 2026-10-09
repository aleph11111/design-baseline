"use client";
import * as React from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { useLabels } from "../../lib/labels";

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
  /** Label of the error variant's retry button. Override in a non-English app. */
  retryLabel?: string;
  /**
   * Per-variant default copy, winning over the `BaselineLabelsProvider` preset:
   * `loading` text, `error` title, `empty` line. `title`/`description`/`message` still win over these.
   */
  labels?: { loading?: string; error?: string; empty?: string };
  /**
   * The empty state's single next-step action (ADR-0007 §7 — e.g. an
   * "Add new" button), rendered below the title/description with extra
   * top spacing to read as the CTA, not another text line. An empty state
   * offers at most one; a caller that needs two is a signal to reconsider
   * the message, not to pass a second button here.
   */
  action?: React.ReactNode;
  className?: string;
};

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
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
 *  - empty:   centered `p-8`, optional icon + optional title + description +
 *    a single CTA (`action` — ADR-0007 §7's one next-step action).
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
  retryLabel,
  labels,
  action,
  loadingSkeleton,
  className,
}: StateViewProps): React.ReactElement {
  const L = useLabels();
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
        {message ?? labels?.loading ?? L.loading}
      </div>
    );
  }

  if (variant === "error") {
    return (
      <div className={cn("p-4", className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title ?? labels?.error ?? L.errorTitle}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{description ?? message ?? errorMessage(error, L.errorFallback)}</span>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={onRetry}
              >
                {retryLabel ?? L.retry}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // variant === "empty"
  const body = description ?? message ?? (title ? undefined : (labels?.empty ?? L.empty));
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
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

StateView.displayName = "StateView";

export type InlineErrorProps = {
  /** The human-readable message. Falls back to `error`'s message. */
  message?: React.ReactNode;
  /** Error object; its message is shown when `message` is omitted. */
  error?: unknown;
  /** Renders a retry button below the message. */
  onRetry?: () => void;
  /** Label of the retry button. Override in a non-English app. */
  retryLabel?: string;
  className?: string;
};

/**
 * InlineError — the compact inline-error box for an error inside a form body
 * or a narrow dialog (a failed save, a dialog's own entity fetch), where the
 * full destructive `<Alert>` of StateView's error plane is too heavy. One
 * treatment shared by J (crud-dialog) and B (form-page root error) — see
 * docs/archetypes/README.md, "Layer 7 — canonical state treatments".
 *
 * `role="alert"` announces it the moment it renders (no focus move needed),
 * and the leading icon carries "error" beside the tint, so colour is never
 * the only signal.
 */
export function InlineError({
  message,
  error,
  onRetry,
  retryLabel,
  className,
}: InlineErrorProps): React.ReactElement {
  const L = useLabels();
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2 rounded bg-destructive/10 p-4 text-sm text-destructive",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="flex flex-col gap-2">
        <span>{message ?? errorMessage(error, L.errorFallback)}</span>
        {onRetry && (
          <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
            {retryLabel ?? L.retry}
          </Button>
        )}
      </div>
    </div>
  );
}

InlineError.displayName = "InlineError";
