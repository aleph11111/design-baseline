import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * What the screen is — decides the icon circle's colour. Decision rule (derived from
 * the screen, never from taste; two engineers holding the same screen pick the same value):
 * - `"sign-in"` — the user can proceed by authenticating (login, magic-link sent, SSO
 *   hand-off): `bg-primary/10 text-primary`.
 * - `"denied"` — the user is signed in but may not see this (not-authorized, admin
 *   wall, missing role): `bg-destructive/10 text-status-danger-fg`.
 * - `"error"` — nothing the user's identity changes (404, crash, maintenance):
 *   `bg-muted text-muted-foreground`.
 */
export type AuthCardPurpose = "sign-in" | "denied" | "error";

const PURPOSE_CIRCLE: Record<AuthCardPurpose, string> = {
  "sign-in": "bg-primary/10 text-primary",
  denied: "bg-destructive/10 text-status-danger-fg",
  error: "bg-muted text-muted-foreground",
};

export type AuthCardProps = {
  /** What the screen is; keys the icon circle colour (see `AuthCardPurpose`). */
  purpose: AuthCardPurpose;
  /** Heading — "Sign in", "Not authorized", "Something went wrong". */
  title: React.ReactNode;
  /** Optional supporting line below the title. */
  description?: React.ReactNode;
  /** Optional icon above the title, inside a 56px circle tinted by `purpose`. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Card body — a sign-in form, action buttons, an error detail. */
  children?: React.ReactNode;
  /** Optional content below the card (e.g. a "Back to home" link). */
  footer?: React.ReactNode;
  className?: string;
};

/**
 * AuthCard — the centered single-card shell for off-app utility screens: sign-in,
 * not-authorized, generic error / 404. A layout primitive (shipped as
 * `design-baseline/layout`), NOT a page archetype — these screens have no toolbar, data
 * layer, or list/detail shape; they're a centered card with a title, a short
 * message, and one or two actions. Its h1 title is deliberately excluded from the
 * ADR-0007 §2 display-title step: it stays `text-lg`, since a 30px title would
 * wrap most German headings in this `max-w-sm` card.
 *
 * The header (icon, title, description) is always centered and the icon always sits
 * in a tinted circle — a fixed look, not a prop. Only its colour varies, keyed by the
 * required `purpose`.
 *
 * Use for screens rendered *outside* the `AppShell` (no sidebar/header) — a login
 * page, an access wall. The `min-h` centers it in the viewport; override via
 * `className` when embedding inside a content area. The wrapper stays transparent:
 * an off-app page puts it on a `bg-muted/30` plane itself (docs/STYLE.md).
 */
export function AuthCard({
  purpose,
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
          <div className="flex flex-col items-center text-center">
            {Icon && (
              <div
                className={cn(
                  "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                  PURPOSE_CIRCLE[purpose],
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
            )}
            <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
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
