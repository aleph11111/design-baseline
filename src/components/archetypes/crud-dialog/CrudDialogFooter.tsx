import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CrudDialogFooterProps = {
  // Primary action (rightmost button)
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  /**
   * When true, the primary button is disabled and shows a loading indicator.
   * Use while the save/create mutation is in-flight.
   */
  isSubmitting?: boolean;

  /**
   * When true, the destructive button is disabled and shows a loading
   * indicator. Use while the delete mutation is in-flight.
   */
  isDeleting?: boolean;

  // Secondary action (left of primary)
  secondaryLabel?: string;
  onSecondary?: () => void;

  /**
   * Destructive action — rendered on the leading (left) edge of the footer,
   * separated from the main button group on the right. Omit when the entity
   * cannot be deleted (e.g. a permanent system entity) or when mode is "create".
   */
  destructiveLabel?: string;
  onDestructive?: () => void;

  /**
   * Optional overflow slot for secondary actions (Duplicate, Archive, Export).
   * Rendered to the left of the primary action group, to the right of the
   * destructive button.
   */
  overflowMenu?: React.ReactNode;

  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CrudDialogFooter — mode-aware footer for J (crud-dialog) dialogs.
 *
 * Layout:
 *   [destructive (left)] ... [overflowMenu] [secondary] [primary]
 *
 * Mode mapping (consumer is responsible for passing the right labels):
 *
 *   View mode:
 *     destructiveLabel="Delete" (disabled) | secondary="Close" primary="Edit"
 *
 *   Edit mode:
 *     destructiveLabel="Delete" (enabled) | secondary="Cancel" primary="Save"
 *
 *   Create mode:
 *     (no destructive)                    | secondary="Cancel" primary="Create"
 *
 * When isSubmitting=true, the primary button shows a spinner + "Saving…" /
 * "Creating…" text derived from primaryLabel (appends "…") and is disabled.
 *
 * The consumer is responsible for opening a <ConfirmDeleteDialog> or
 * <AlertDialog> before calling the delete mutation — onDestructive should
 * trigger that confirm flow, not the mutation directly.
 */
export function CrudDialogFooter({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  isSubmitting = false,
  isDeleting = false,
  secondaryLabel,
  onSecondary,
  destructiveLabel,
  onDestructive,
  overflowMenu,
  className,
}: CrudDialogFooterProps): React.ReactElement {
  const hasPrimary = primaryLabel !== undefined;
  const hasSecondary = secondaryLabel !== undefined;
  const hasDestructive = destructiveLabel !== undefined && onDestructive !== undefined;

  // Derive a submitting label: "Save" → "Saving…", "Create" → "Creating…"
  const submittingLabel =
    primaryLabel
      ? `${primaryLabel.replace(/e$/, "")}ing…`
      : "Saving…";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-t px-6 py-4 shrink-0",
        className,
      )}
    >
      {/* Leading edge — destructive action */}
      <div className="flex items-center">
        {hasDestructive && (
          <Button
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
            variant="outline"
            onClick={onSecondary}
            disabled={isSubmitting}
          >
            {secondaryLabel}
          </Button>
        )}

        {hasPrimary && (
          <Button
            variant="default"
            onClick={onPrimary}
            disabled={primaryDisabled || isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? submittingLabel : primaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

CrudDialogFooter.displayName = "CrudDialogFooter";
