import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { UseCrudDialogModeResult } from "./useCrudDialogMode";
import { deriveSubmittingLabel } from "@/components/archetypes/shared/submittingLabel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Structural subset of @tanstack/react-query's UseMutationResult that the
 * controller needs. Dialogs pass their useMutation results directly.
 */
export type CrudDialogMutation<TValues> = {
  mutateAsync: (values: TValues) => Promise<unknown>;
  isPending: boolean;
};

/**
 * The user-facing strings the controller derives for the footer and the
 * dirty-close confirmation. The baseline ships English neutral defaults
 * (DEFAULT_CRUD_DIALOG_LABELS); consumers in another language pass their own
 * via the controller's `labels` option. i18n stays the consumer's concern —
 * the baseline never bakes a specific language into the primitive.
 */
export type CrudDialogLabels = {
  /** Primary action in view mode (enters edit). */
  edit: string;
  /** Primary action in create mode (dispatches create). */
  create: string;
  /** Primary action in edit mode (dispatches update). */
  save: string;
  /** Secondary action in view mode (closes the dialog). */
  close: string;
  /** Secondary action in edit/create mode (cancels). */
  cancel: string;
  /** Confirmation message shown when closing with unsaved changes. */
  discardPrompt: string;
  /**
   * Primary button label while the update mutation is in-flight. When
   * omitted, derived from `save` by stripping a trailing "e" and appending
   * "ing…" ("Save" → "Saving…"). That derivation only works for English;
   * non-English consumers MUST pass this to avoid mangled output (e.g.
   * "Speichern" → "Speicherning…").
   */
  saving?: string;
  /**
   * Primary button label while the create mutation is in-flight. When
   * omitted, derived from `create` the same way ("Create" → "Creating…").
   */
  creating?: string;
};

export const DEFAULT_CRUD_DIALOG_LABELS: CrudDialogLabels = {
  edit: "Edit",
  create: "Create",
  save: "Save",
  close: "Close",
  cancel: "Cancel",
  discardPrompt: "Discard changes?",
};

export type UseCrudDialogControllerOptions<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>;
  /** Result of useCrudDialogMode, wired with the form's isDirty. */
  mode: UseCrudDialogModeResult;
  /** Values handleSecondary resets to when leaving edit mode. */
  defaultValues: TValues;
  /**
   * Omit for an edit-only dialog whose entity is created outside the UI
   * (import, sync, matcher, provisioning) — see Layer 13's edit-only allowed
   * variation. `handlePrimary` then refuses to submit in create mode rather
   * than falling through to `updateMutation`.
   */
  createMutation?: CrudDialogMutation<TValues>;
  /** Omit for a create-only dialog, mirroring `createMutation`. */
  updateMutation?: CrudDialogMutation<TValues>;
  onClose: () => void;
  /**
   * When false, hides the primary action in view mode so users without write
   * permission cannot enter edit mode. Create/edit flows are unaffected.
   * Defaults to true.
   */
  canEdit?: boolean;
  /**
   * Footer labels and discard prompt. Merged over
   * DEFAULT_CRUD_DIALOG_LABELS, so consumers may override any subset. Pass a
   * localized set here rather than translating downstream of primaryLabel /
   * secondaryLabel.
   */
  labels?: Partial<CrudDialogLabels>;
};

export type UseCrudDialogControllerResult = {
  /** Close the dialog, prompting to discard unsaved create/edit changes. */
  handleClose: () => Promise<void>;
  /**
   * view → edit; create/edit → validate and dispatch the matching mutation.
   * On success: create closes the dialog, edit returns to view (Layer 13).
   */
  handlePrimary: () => Promise<void>;
  /** view/create → close; edit → back to view, resetting the form. */
  handleSecondary: () => Promise<void>;
  isSubmitting: boolean;
  primaryLabel: string;
  /**
   * Primary button label while `isSubmitting` is true — pass straight to
   * `<CrudDialogFooter submittingLabel>`. Resolved from `labels.saving` /
   * `labels.creating` when provided, otherwise derived from `labels.save` /
   * `labels.create` (English-only derivation — see `CrudDialogLabels`).
   */
  submittingLabel: string;
  secondaryLabel: string;
  readOnly: boolean;
  showPrimary: boolean;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useCrudDialogController — shared submit/discard controller for J
 * (crud-dialog) dialogs.
 *
 * Owns the view/edit/create action flow that every CRUD dialog repeats:
 * the dirty-guarded close, the primary action (enter edit, or validate and
 * create/update), the secondary action (close, or back to view with reset),
 * and the derived footer labels. Dialogs keep their schema, default values,
 * mutation bodies, and form JSX.
 */
export function useCrudDialogController<TValues extends FieldValues>(
  options: UseCrudDialogControllerOptions<TValues>,
): UseCrudDialogControllerResult {
  const {
    form,
    mode,
    defaultValues,
    createMutation,
    updateMutation,
    onClose,
    canEdit = true,
  } = options;

  const labels: CrudDialogLabels = { ...DEFAULT_CRUD_DIALOG_LABELS, ...options.labels };

  async function handleClose() {
    // mode.requestDiscard() is the single discard-confirm guard shared with
    // the edit/create -> view transition (mode.setMode), so both exit paths
    // read the same isDirty and call the same onConfirmDiscard.
    const ok = await mode.requestDiscard();
    if (!ok) return;
    onClose();
  }

  async function handlePrimary() {
    if (mode.isView) {
      await mode.setMode("edit");
      return;
    }
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    const mutation = mode.isCreate ? createMutation : updateMutation;
    if (!mutation) {
      // The dialog reached a mode it declared no mutation for — a wiring bug
      // (e.g. initialMode="create" on an edit-only dialog), not a user error.
      // Refuse loudly: falling through to the other mutation would issue an
      // update while the footer says "Create". Not a throw — call sites do
      // `void handlePrimary()`, so it would surface as an unhandled rejection.
      console.error(
        `useCrudDialogController: no ${mode.isCreate ? "createMutation" : "updateMutation"} was supplied, but the dialog is in ${mode.isCreate ? "create" : "edit"} mode. Nothing was submitted.`,
      );
      return;
    }
    try {
      await mutation.mutateAsync(values);
    } catch {
      // Mutation onError (dialog-owned) surfaces the failure; stay in edit mode.
      return;
    }
    // Save succeeded. Reset the form to the saved values so it is no longer
    // dirty. Layer 13 then splits the two outcomes: a create is done and the
    // dialog closes; an edit drops back to the read-only view of the record
    // that was just saved, so the user keeps their place. Both bypass the
    // dirty-discard guard — it only catches *unsaved* changes.
    form.reset(values);
    if (mode.isCreate) {
      onClose();
      return;
    }
    await mode.setMode("view", { force: true });
  }

  async function handleSecondary() {
    if (mode.isView || mode.isCreate) {
      await handleClose();
      return;
    }
    const ok = await mode.setMode("view");
    if (ok) form.reset(defaultValues);
  }

  return {
    handleClose,
    handlePrimary,
    handleSecondary,
    isSubmitting: Boolean(createMutation?.isPending || updateMutation?.isPending),
    primaryLabel: mode.isView ? labels.edit : mode.isCreate ? labels.create : labels.save,
    submittingLabel: mode.isCreate
      ? labels.creating ?? deriveSubmittingLabel(labels.create)
      : labels.saving ?? deriveSubmittingLabel(labels.save),
    secondaryLabel: mode.isView ? labels.close : labels.cancel,
    readOnly: mode.isView,
    showPrimary: mode.isCreate || mode.isEdit || canEdit,
  };
}
