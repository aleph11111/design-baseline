"use client";
import * as React from "react";

/** Body-container width (px) below which the `editPane` is hidden and the consumer's edit dialog is the editing surface. Equals the pane's `@4xl` breakpoint. */
export const SETTINGS_TABLE_EDIT_PANE_MIN_WIDTH = 896;

/**
 * True while the `SettingsTableShell` body inside `ref` is too narrow to show
 * its `editPane` (container narrower than {@link SETTINGS_TABLE_EDIT_PANE_MIN_WIDTH}).
 * Open the edit dialog from this, never from a viewport check (`useIsMobile`):
 * the pane keys on the body's container, which inside `AppShell` is far
 * narrower than the window. `ref` must wrap the shell.
 */
export function useEditPaneNarrow(ref: React.RefObject<HTMLElement | null>): boolean {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    // the shell's own @container, not the wrapper: the body sits inside the frame's padding
    const el = ref.current?.querySelector<HTMLElement>('[data-slot="settings-table-body"]');
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setNarrow((e?.contentRect.width ?? Infinity) < SETTINGS_TABLE_EDIT_PANE_MIN_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return narrow;
}
