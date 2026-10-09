"use client";
import * as React from "react";
import { ConfirmationDialog } from "../../ui/confirmation-dialog";

export interface ConfirmOptions {
  /** Dialog headline — the question being asked ("Delete this recipe?"). */
  title: string;
  /** Consequence line under the title ("This cannot be undone."). */
  description: string;
  /** Confirm-button label; defaults to the active labels' `confirm`. */
  confirmText?: string;
  /** Cancel-button label; defaults to the active labels' `cancel`. */
  cancelText?: string;
  /**
   * Whether the confirmed action deletes or overwrites data that cannot be recovered
   * (delete, discard, overwrite). Keys the confirm button's tone: destructive when
   * true, default otherwise. Defaults to `true` — most native confirms guard a delete.
   */
  destructive?: boolean;
}

export interface UseConfirm {
  /** Opens the dialog; resolves `true` on confirm, `false` on cancel / Escape / overlay dismiss. */
  askConfirm: (options: ConfirmOptions) => Promise<boolean>;
  /** The dialog element — render it once in the owning component's JSX. */
  dialog: React.ReactNode;
}

/**
 * Promise-based replacement for `window.confirm`, rendered through the shared
 * `ConfirmationDialog` (AlertDialog). Migration is mechanical — the guard
 * around a native `window.confirm` call becomes:
 *
 *   const { askConfirm, dialog } = useConfirm();
 *   if (!(await askConfirm({ title: "Delete?", description: "…" }))) return;
 *   // …and render {dialog}
 *
 * A second `askConfirm` while one is open resolves the earlier one `false`.
 * Named `askConfirm` (not `confirm`) so call sites never shadow the global and
 * stay clean under the `native-browser-dialog` audit signal.
 */
export function useConfirm(): UseConfirm {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolver = React.useRef<((ok: boolean) => void) | null>(null);

  // First settle wins: ConfirmationDialog fires onConfirm then onClose.
  const settle = React.useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  }, []);

  const askConfirm = React.useCallback((next: ConfirmOptions) => {
    resolver.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOptions(next);
    });
  }, []);

  // Never leave an awaiting caller hanging if the owner unmounts mid-question.
  React.useEffect(() => () => resolver.current?.(false), []);

  const dialog = (
    <ConfirmationDialog
      isOpen={options !== null}
      onClose={() => settle(false)}
      onConfirm={() => settle(true)}
      title={options?.title ?? ""}
      description={options?.description ?? ""}
      confirmText={options?.confirmText}
      cancelText={options?.cancelText}
      variant={(options?.destructive ?? true) ? "destructive" : "default"}
    />
  );

  return { askConfirm, dialog };
}
