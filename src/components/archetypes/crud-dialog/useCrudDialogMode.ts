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
   */
  setMode: (next: CrudDialogMode) => Promise<boolean>;
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

  const setMode = useCallback(
    async (next: CrudDialogMode): Promise<boolean> => {
      // No-op: already in the target mode.
      if (next === mode) return true;

      // Guard: leaving edit or create with dirty state.
      const isLeavingEdits = mode === "edit" || mode === "create";
      if (isLeavingEdits && isDirty && onConfirmDiscard) {
        const confirmed = await onConfirmDiscard();
        if (!confirmed) return false;
      }

      setModeState(next);
      return true;
    },
    [mode, isDirty, onConfirmDiscard],
  );

  return {
    mode,
    setMode,
    isView: mode === "view",
    isEdit: mode === "edit",
    isCreate: mode === "create",
  };
}
