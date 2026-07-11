import * as React from "react";
import { ActionFooterBar } from "@/components/archetypes/shared/ActionFooterBar";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type FormPageMode = "create" | "edit";

export type FormPageActionsProps = {
  /**
   * Mode determines which buttons are visible. In "create" mode the
   * destructive (Delete) button is hidden regardless of `canDelete`.
   */
  mode: FormPageMode;

  // Primary action (rightmost button) — typically a submit
  primaryLabel?: string;
  /**
   * When omitted, the primary button defaults to `type="submit"` and submits
   * the closest <form>. Provide `onPrimary` when submission is controlled
   * imperatively (e.g. multi-step orchestration).
   */
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

  // Secondary action (left of primary) — typically Cancel
  secondaryLabel?: string;
  onSecondary?: () => void;

  /**
   * Destructive action — rendered on the leading (left) edge of the footer.
   * Visible only in `mode === "edit"` and when `canDelete` is true (default).
   * The primitive does NOT render a confirm dialog — `onDestructive` must
   * trigger the consumer's confirm flow (shadcn `<AlertDialog>` recommended)
   * before calling the delete mutation.
   */
  destructiveLabel?: string;
  onDestructive?: () => void;
  /**
   * Hide the destructive button entirely (e.g. for read-only users). Defaults
   * to `true`. The Delete button is still hidden in create mode regardless.
   */
  canDelete?: boolean;
  /**
   * When true, the destructive button is disabled and shows a spinner.
   * Use while the delete mutation is in-flight.
   */
  isDeleting?: boolean;

  /**
   * Optional overflow slot for secondary actions (Duplicate, Archive, Export).
   * Rendered to the left of the primary action group, to the right of the
   * destructive button.
   */
  overflowMenu?: React.ReactNode;

  /**
   * When true (default), the actions row becomes sticky to the bottom of the
   * viewport on narrow screens with a background fill, then static on
   * `sm` and up. Disable when the form is already inside a scroll container
   * that has its own sticky footer behavior.
   */
  stickyOnMobile?: boolean;

  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FormPageActions — mode-aware footer for B (form-page) dialogs.
 *
 * Layout:
 *   [destructive (left)] ... [overflowMenu] [secondary] [primary]
 *
 * Mode mapping:
 *
 *   Create:
 *     (no destructive)  | secondary="Cancel" primary="Create"
 *
 *   Edit:
 *     Delete (if canDelete)  | secondary="Cancel" primary="Save"
 *
 * When isSubmitting=true, the primary button shows a spinner + "Saving…" /
 * "Creating…" text derived from primaryLabel (appends "…") and is disabled.
 * The derivation is English-only; pass `submittingLabel` explicitly for
 * non-English UIs.
 *
 * The destructive button calls `onDestructive` directly. Consumers must
 * wrap their delete mutation in a confirm flow (shadcn <AlertDialog>
 * recommended) before invoking it — the primitive does not provide one.
 */
export function FormPageActions({
  mode,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  isSubmitting = false,
  submittingLabel,
  secondaryLabel,
  onSecondary,
  destructiveLabel,
  onDestructive,
  canDelete = true,
  isDeleting = false,
  overflowMenu,
  stickyOnMobile = true,
  className,
}: FormPageActionsProps): React.ReactElement {
  // Thin wrapper over the shared ActionFooterBar core. B's distinct surface:
  // the sticky-on-mobile container, `mode`/`canDelete` gating of the
  // destructive button, form-aware button `type`s (the footer lives in a
  // native <form>), and freezing every action while a delete is in flight —
  // hence `formAware` and `disableActionsWhileDeleting`.
  return (
    <ActionFooterBar
      className={cn(
        "pt-2",
        stickyOnMobile &&
          "sticky bottom-0 -mx-6 border-t bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none",
        className,
      )}
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
      showDestructive={mode === "edit" && canDelete}
      overflowMenu={overflowMenu}
      formAware
      disableActionsWhileDeleting
    />
  );
}

FormPageActions.displayName = "FormPageActions";
