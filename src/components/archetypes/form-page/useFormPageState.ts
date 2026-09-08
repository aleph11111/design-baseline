"use client";
import { useCallback, useState } from "react";
import type { FormPageMode } from "./FormPageActions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UseFormPageStateOptions = {
  /**
   * Fixed at mount. The form does not transition between create and edit at
   * runtime — that's J's territory. A new entity that has just been created
   * navigates to the edit route, where a fresh component instance mounts in
   * edit mode.
   */
  mode: FormPageMode;
  /**
   * Whether the form currently has unsaved changes. Sync from RHF's
   * `formState.isDirty` (via `useEffect`) or set directly when using
   * uncontrolled fields.
   */
  isDirty?: boolean;
  /**
   * Called when the user requests a destructive transition (Cancel after
   * dirty edits, navigating away with unsaved changes). Should prompt the
   * user via the project's confirm dialog (shadcn `<AlertDialog>`
   * recommended) and resolve true (proceed) or false (abort).
   *
   * If omitted, `requestDiscard` always resolves true (unsafe — provide
   * `onConfirmDiscard` in production consumers).
   */
  onConfirmDiscard?: () => Promise<boolean> | boolean;
};

export type UseFormPageStateResult = {
  mode: FormPageMode;
  isCreate: boolean;
  isEdit: boolean;
  /**
   * Mirror of the input. Exposed so consumers don't pass `isDirty` twice
   * (once to this hook, once to <FormPageActions>).
   */
  isDirty: boolean;
  isSubmitting: boolean;
  beginSubmit: () => void;
  endSubmit: () => void;
  /**
   * Request a destructive transition. If `isDirty` is true and
   * `onConfirmDiscard` is provided, calls it and resolves with its result.
   * Otherwise resolves true.
   */
  requestDiscard: () => Promise<boolean>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useFormPageState — centralized state machine for B (form-page) archetype
 * instances.
 *
 * Encapsulates:
 *   - The fixed `mode` (create or edit) for this form instance.
 *   - The `isSubmitting` flag (toggled via beginSubmit / endSubmit).
 *   - The dirty-guarded discard request (Cancel / browser-nav-away).
 *
 * Compose with react-hook-form's `formState.isDirty` to wire `isDirty` from
 * the form. Typically:
 *
 *   const form = useForm({ ... });
 *   const page = useFormPageState({
 *     mode: 'edit',
 *     isDirty: form.formState.isDirty,
 *     onConfirmDiscard: () => alertDialogConfirm('Discard changes?'),
 *   });
 *
 *   async function handleCancel() {
 *     const ok = await page.requestDiscard();
 *     if (!ok) return;
 *     router.back();
 *   }
 *
 *   <FormPageActions
 *     mode={page.mode}
 *     primaryLabel={page.isEdit ? 'Save' : 'Create'}
 *     isSubmitting={page.isSubmitting}
 *     secondaryLabel="Cancel"
 *     onSecondary={handleCancel}
 *     destructiveLabel={page.isEdit ? 'Delete' : undefined}
 *     onDestructive={page.isEdit ? handleDelete : undefined}
 *   />
 */
export function useFormPageState(
  options: UseFormPageStateOptions,
): UseFormPageStateResult {
  const { mode, isDirty = false, onConfirmDiscard } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const beginSubmit = useCallback(() => setIsSubmitting(true), []);
  const endSubmit = useCallback(() => setIsSubmitting(false), []);

  const requestDiscard = useCallback(async (): Promise<boolean> => {
    if (!isDirty) return true;
    if (!onConfirmDiscard) return true;
    return onConfirmDiscard();
  }, [isDirty, onConfirmDiscard]);

  return {
    mode,
    isCreate: mode === "create",
    isEdit: mode === "edit",
    isDirty,
    isSubmitting,
    beginSubmit,
    endSubmit,
    requestDiscard,
  };
}
