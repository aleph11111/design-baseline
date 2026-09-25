"use client";
import * as React from "react";
import { ActionFooterBar } from "../shared/ActionFooterBar";

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
   * Label shown on the primary button while `isSubmitting` is true. When
   * omitted, the label is derived from `primaryLabel` by stripping a trailing
   * "e" and appending "ing…" ("Save" → "Saving…", "Create" → "Creating…").
   * That derivation only works for English; non-English consumers MUST pass
   * this prop to avoid mangled output (e.g. "Speichern" → "Speicherning…").
   */
  submittingLabel?: string;

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
   * Renders the destructive button disabled instead of omitting it — a static
   * gate distinct from `isDeleting`'s spinner. Pass `mode.isView` so Delete
   * reads as unavailable until the user enters Edit mode, and OR in any
   * business-rule gate rather than no-op-ing inside `onDestructive`.
   */
  destructiveDisabled?: boolean;

  /**
   * Optional overflow slot for secondary actions (Duplicate, Archive, Export).
   * Rendered to the left of the primary action group, to the right of the
   * destructive button.
   */
  overflowMenu?: React.ReactNode;
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
 * The derivation is English-only; pass `submittingLabel` explicitly for
 * non-English UIs.
 *
 * The consumer is responsible for opening a <ConfirmationDialog> or
 * <AlertDialog> before calling the delete mutation — onDestructive should
 * trigger that confirm flow, not the mutation directly.
 */
export function CrudDialogFooter({
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
  destructiveDisabled = false,
  overflowMenu,
}: CrudDialogFooterProps): React.ReactElement {
  // Thin wrapper over the shared ActionFooterBar core: J's distinct surface is
  // just the bordered `px-6 py-4` container. Destructive gating is the plain
  // "label + handler present" check (no mode), and a delete in flight leaves
  // the secondary/primary actions enabled — so `disableActionsWhileDeleting`
  // stays off. The core renders destructive and secondary as `type="button"`
  // (safe whether or not the dialog wraps a <form>); the primary only
  // submits a native form when it is `type="submit"`, which it is only when
  // no `onPrimary` is passed — and a dialog primary is always wired to one.
  return (
    <ActionFooterBar
      className="border-t px-6 py-4 shrink-0"
      primaryLabel={primaryLabel}
      onPrimary={onPrimary}
      primaryDisabled={primaryDisabled}
      isSubmitting={isSubmitting}
      submittingLabel={submittingLabel}
      isDeleting={isDeleting}
      secondaryLabel={secondaryLabel}
      onSecondary={onSecondary}
      destructiveLabel={destructiveLabel}
      onDestructive={onDestructive}
      destructiveDisabled={destructiveDisabled}
      overflowMenu={overflowMenu}
    />
  );
}

CrudDialogFooter.displayName = "CrudDialogFooter";
