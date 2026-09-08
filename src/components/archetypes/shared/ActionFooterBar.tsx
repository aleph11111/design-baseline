"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { resolveSubmittingLabel } from "./submittingLabel";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ActionFooterBarProps = {
  // Primary action (rightmost button)
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  /**
   * When true, the primary button is disabled and shows a loading indicator
   * with the resolved submitting label.
   */
  isSubmitting?: boolean;
  /** Explicit submitting label; overrides the English derivation. */
  submittingLabel?: string;

  /**
   * When true, the destructive button is disabled and shows a loading
   * indicator. See `disableActionsWhileDeleting` for the secondary/primary.
   */
  isDeleting?: boolean;

  // Secondary action (left of primary)
  secondaryLabel?: string;
  onSecondary?: () => void;

  // Destructive action (leading/left edge)
  destructiveLabel?: string;
  onDestructive?: () => void;
  /**
   * Whether the destructive button is eligible to render. The composing
   * wrapper owns the gating (mode/canDelete/etc.); the destructive button
   * still only renders when both `destructiveLabel` and `onDestructive` are
   * also present. Defaults to true.
   */
  showDestructive?: boolean;

  /** Overflow slot, rendered left of the secondary/primary group. */
  overflowMenu?: React.ReactNode;

  /**
   * When true, the secondary and primary buttons are also disabled while
   * `isDeleting` (form-page semantics — the whole footer freezes during a
   * delete). When false, only the destructive button reacts to `isDeleting`
   * (crud-dialog semantics). Defaults to false.
   */
  disableActionsWhileDeleting?: boolean;

  /** Extra container classes appended to the shared flex layout. */
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ActionFooterBar — the shared mode-aware footer core behind
 * `CrudDialogFooter` (J) and `FormPageActions` (B).
 *
 * Owns the layout and button chrome both archetypes duplicated:
 *
 *   [destructive (left)] ... [overflowMenu] [secondary] [primary]
 *
 * the destructive-button styling, the `<Loader2>` spinner treatment on the
 * destructive/primary buttons, and the resolved submitting label. Per-archetype
 * surface (container class, mode/canDelete gating) stays in the thin wrapper
 * and is threaded in via props/flags — see `showDestructive` and
 * `disableActionsWhileDeleting`.
 *
 * This is a primitive, not a public archetype export: consumers use
 * `CrudDialogFooter` / `FormPageActions`, whose prop contracts are documented
 * in `docs/archetypes/crud-dialog.md` / `form-page.md`.
 */
export function ActionFooterBar({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  isSubmitting = false,
  submittingLabel,
  isDeleting = false,
  secondaryLabel,
  onSecondary,
  destructiveLabel,
  onDestructive,
  showDestructive = true,
  overflowMenu,
  disableActionsWhileDeleting = false,
  className,
}: ActionFooterBarProps): React.ReactElement {
  const hasPrimary = primaryLabel !== undefined;
  const hasSecondary = secondaryLabel !== undefined;
  const hasDestructive =
    showDestructive &&
    destructiveLabel !== undefined &&
    onDestructive !== undefined;

  const resolvedSubmittingLabel = resolveSubmittingLabel(
    primaryLabel,
    submittingLabel,
  );

  // form-page freezes the whole footer during a delete; crud-dialog only
  // disables the destructive button itself.
  const deletingBlocks = disableActionsWhileDeleting && isDeleting;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2",
        className,
      )}
    >
      {/* Leading edge — destructive action */}
      <div className="flex items-center">
        {hasDestructive && (
          <Button
            type="button"
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={onDestructive}
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {destructiveLabel}
          </Button>
        )}
      </div>

      {/* Trailing edge — overflow menu + secondary + primary */}
      <div className="flex items-center gap-2">
        {overflowMenu}

        {hasSecondary && (
          <Button
            type="button"
            variant="outline"
            onClick={onSecondary}
            disabled={isSubmitting || deletingBlocks}
          >
            {secondaryLabel}
          </Button>
        )}

        {hasPrimary && (
          <Button
            type={onPrimary ? "button" : "submit"}
            variant="default"
            onClick={onPrimary}
            disabled={primaryDisabled || isSubmitting || deletingBlocks}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? resolvedSubmittingLabel : primaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

ActionFooterBar.displayName = "ActionFooterBar";
