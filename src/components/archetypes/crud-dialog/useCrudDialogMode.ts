"use client";
import { useCallback, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CrudDialogMode = "view" | "edit" | "create";

export type UseCrudDialogModeOptions = {
  /**
   * The mode to start in. Defaults to "view".
   * Pass "create" when entityId is absent (no entity to view).
   * Pass "view" or "edit" when entityId is present.
   */
  initialMode?: CrudDialogMode;
  /**
   * Whether the form currently has unsaved changes.
   * Sync this from react-hook-form's formState.isDirty via useEffect, or
   * set it directly when using uncontrolled form fields.
   */
  isDirty?: boolean;
  /**
   * Called before a destructive mode transition (edit/create → view, or any
   * mode → close) when isDirty is true. Should prompt the user to confirm
   * discarding changes.
   *
   * Real consumers: use shadcn <AlertDialog> for this confirm flow.
   * Demo/prototype: window.confirm is acceptable.
   *
   * Resolves to:
   *   true  — user confirmed, proceed with the transition
   *   false — user cancelled, abort the transition
   */
  onConfirmDiscard?: () => Promise<boolean> | boolean;
};

export type UseCrudDialogModeResult = {
  mode: CrudDialogMode;
  /**
   * Request a mode transition. If the transition would discard dirty state
   * (i.e. current mode is edit or create and isDirty is true), calls
   * onConfirmDiscard first and only transitions if it resolves true.
   * Returns true if the transition completed, false if it was cancelled.
   *
   * Pass `{ force: true }` for the edit → view transition that follows a
   * *successful save*: nothing is discarded there, and the caller's isDirty
   * has not re-rendered yet after form.reset, so the guard would otherwise
   * prompt spuriously. Never force a user-initiated cancel.
   */
  setMode: (next: CrudDialogMode, opts?: { force?: boolean }) => Promise<boolean>;
  /**
   * The single discard-confirm guard: resolves true immediately unless the
   * current mode is edit/create, isDirty is true, and onConfirmDiscard is
   * provided — in which case it resolves to onConfirmDiscard's result. This
   * is the same guard setMode uses internally; call it directly for exit
   * paths that don't go through setMode (e.g. closing the dialog entirely),
   * so every exit path shares one isDirty source and one confirm mechanism.
   */
  requestDiscard: () => Promise<boolean>;
  isView: boolean;
  isEdit: boolean;
  isCreate: boolean;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useCrudDialogMode — centralized mode state machine for J (crud-dialog) dialogs.
 *
 * Encapsulates the view / edit / create mode state and guards destructive
 * transitions (edit → view when dirty) via onConfirmDiscard.
 *
 * Rules:
 *   - view → edit: always allowed (no data loss).
 *   - edit/create → view or edit/create → close: gated by dirty-check.
 *   - view → view, edit → edit, etc.: no-op (allowed, no guard needed).
 *
 * The isDirty guard only fires when transitioning away from edit or create
 * mode while isDirty is true AND onConfirmDiscard is provided. If
 * onConfirmDiscard is absent, the transition proceeds without confirmation
 * (unsafe — always provide onConfirmDiscard in production consumers).
 */
export function useCrudDialogMode(
  options: UseCrudDialogModeOptions = {},
): UseCrudDialogModeResult {
  const { initialMode = "view", isDirty = false, onConfirmDiscard } = options;

  const [mode, setModeState] = useState<CrudDialogMode>(initialMode);

  const requestDiscard = useCallback(async (): Promise<boolean> => {
    // Guard: leaving edit or create with dirty state.
    const isLeavingEdits = mode === "edit" || mode === "create";
    if (!isLeavingEdits || !isDirty || !onConfirmDiscard) return true;
    return onConfirmDiscard();
  }, [mode, isDirty, onConfirmDiscard]);

  const setMode = useCallback(
    async (next: CrudDialogMode, opts?: { force?: boolean }): Promise<boolean> => {
      // No-op: already in the target mode.
      if (next === mode) return true;

      // force bypasses the dirty guard — the post-save transition, where the
      // form was just reset to the saved values and there is nothing to discard.
      if (!opts?.force) {
        const confirmed = await requestDiscard();
        if (!confirmed) return false;
      }

      setModeState(next);
      return true;
    },
    [mode, requestDiscard],
  );

  return {
    mode,
    setMode,
    requestDiscard,
    isView: mode === "view",
    isEdit: mode === "edit",
    isCreate: mode === "create",
  };
}
