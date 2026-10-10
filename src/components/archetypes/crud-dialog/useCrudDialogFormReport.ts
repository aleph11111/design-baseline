"use client";
import * as React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * What a form island reports up to the dialog that owns it — exactly the
 * state the dialog needs to render `CrudDialogFooter` as a sibling of
 * `CrudDialogBody` (Layer 14).
 */
export type CrudDialogFooterReport = {
  /** The form's validated submit (e.g. `form.handleSubmit(onValid)`). Wire to the footer's `onPrimary`. */
  submit: () => void;
  /** react-hook-form `formState.isSubmitting`. Wire to the footer's `isSubmitting`. */
  isSubmitting: boolean;
  /** Delete in flight. `false` when the form has no delete action. Wire to the footer's `isDeleting`. */
  isDeleting: boolean;
  /** Delete-confirm trigger; absent when the form offers no delete. Wire to the footer's `onDestructive`. */
  onDelete?: () => void;
};

/**
 * useCrudDialogFormReport — the form-island half of the J footer lift.
 *
 * Use it when the form, not the dialog, owns its react-hook-form instance and
 * its save (a form reused across dialogs, or one whose submit is a server
 * action). The form calls this hook and renders NO footer; the dialog keeps
 * `useState<CrudDialogFooterReport | null>(null)`, passes the setter as
 * `onFooterReady`, and renders `CrudDialogFooter` from the report. A dialog
 * that owns the form itself does not need this — it reads the action-flow
 * controller directly.
 *
 * - The report keeps one identity until `isSubmitting`, `isDeleting` or the
 *   presence of `onDelete` changes; handler bodies stay live through refs.
 * - Nothing is reported before the form mounts, and `null` is reported on
 *   unmount, so the dialog renders no footer while its body shows a skeleton.
 * - `onDirtyChange` receives `formState.isDirty` for the dialog's mode-state
 *   hook (Layer 13 dirty-close guard).
 *
 * Callbacks may be inline functions; they are read through refs.
 */
export function useCrudDialogFormReport<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  footer: {
    /** The form's validated submit (e.g. `form.handleSubmit(onValid)`). */
    submit: () => void;
    /** Delete in flight. Omit when the form has no delete action. */
    isDeleting?: boolean;
    /** Delete-confirm trigger. Omit when the form offers no delete. */
    onDelete?: () => void;
  },
  callbacks: {
    /** Receives `formState.isDirty` on every change (Layer 13). */
    onDirtyChange?: (dirty: boolean) => void;
    /** Receives the report, then `null` on unmount — pass the dialog's `useState` setter (Layer 14). */
    onFooterReady?: (report: CrudDialogFooterReport | null) => void;
  },
): CrudDialogFooterReport {
  const { isSubmitting, isDirty } = form.formState;
  const isDeleting = footer.isDeleting ?? false;
  const hasDelete = footer.onDelete !== undefined;

  const latest = React.useRef({ footer, callbacks });
  latest.current = { footer, callbacks };

  React.useEffect(() => {
    latest.current.callbacks.onDirtyChange?.(isDirty);
  }, [isDirty]);

  const report = React.useMemo<CrudDialogFooterReport>(
    () => ({
      submit: () => latest.current.footer.submit(),
      isSubmitting,
      isDeleting,
      onDelete: hasDelete ? () => latest.current.footer.onDelete?.() : undefined,
    }),
    [isSubmitting, isDeleting, hasDelete],
  );

  React.useEffect(() => {
    latest.current.callbacks.onFooterReady?.(report);
  }, [report]);

  React.useEffect(() => () => latest.current.callbacks.onFooterReady?.(null), []);

  return report;
}
