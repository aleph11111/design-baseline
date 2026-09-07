import * as React from "react";
import { cn } from "../../lib/utils";

export type AuthCardProps = {
  /** Heading — "Sign in", "Not authorized", "Something went wrong". */
  title: React.ReactNode;
  /** Optional supporting line below the title. */
  description?: React.ReactNode;
  /** Optional icon above the title (sized `h-8 w-8`). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Card body — a sign-in form, action buttons, an error detail. */
  children?: React.ReactNode;
  /** Optional content below the card (e.g. a "Back to home" link). */
  footer?: React.ReactNode;
  className?: string;
};

/**
 * AuthCard — the centered single-card shell for off-app utility screens: sign-in,
 * not-authorized, generic error / 404. A layout primitive (shipped by
 * `/style-baseline`), NOT a page archetype — these screens have no toolbar, data
 * layer, or list/detail shape; they're a centered card with a title, a short
 * message, and one or two actions.
 *
 * Use for screens rendered *outside* the `AppShell` (no sidebar/header) — a login
 * page, an access wall. The `min-h` centers it in the viewport; override via
 * `className` when embedding inside a content area.
 */
export function AuthCard({
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
}: AuthCardProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full items-center justify-center p-6",
        className,
      )}
    >
      <div className="w-full max-w-sm">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {Icon && <Icon className="mb-3 h-8 w-8 text-muted-foreground" />}
          <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
        {footer && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

AuthCard.displayName = "AuthCard";
