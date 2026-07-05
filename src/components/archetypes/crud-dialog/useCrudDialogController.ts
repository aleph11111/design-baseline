import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { UseCrudDialogModeResult } from "./useCrudDialogMode";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Structural subset of @tanstack/react-query's UseMutationResult that the
 * controller needs. Dialogs pass their useMutation results directly.
 */
export type CrudDialogMutation<TValues> = {
  mutate: (values: TValues) => void;
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
  createMutation: CrudDialogMutation<TValues>;
  updateMutation: CrudDialogMutation<TValues>;
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
  /** view → edit; create/edit → validate and dispatch the matching mutation. */
  handlePrimary: () => Promise<void>;
  /** view/create → close; edit → back to view, resetting the form. */
  handleSecondary: () => Promise<void>;
  isSubmitting: boolean;
  primaryLabel: string;
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
    if (mode.isCreate) {
      createMutation.mutate(values);
    } else {
      updateMutation.mutate(values);
    }
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
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    primaryLabel: mode.isView ? labels.edit : mode.isCreate ? labels.create : labels.save,
    secondaryLabel: mode.isView ? labels.close : labels.cancel,
    readOnly: mode.isView,
    showPrimary: mode.isCreate || mode.isEdit || canEdit,
  };
}
