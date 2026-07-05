import * as React from "react";

/**
 * Focus ring for a clickable row/cell rendered as a non-button element (a `<div>`,
 * `<td>`, or `<th>` carrying `onClick`) — `ring-inset` keeps the ring inside the
 * row/cell bounds instead of overlapping neighbors, matching `CellInput`.
 */
export const interactiveRowFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

/**
 * Keyboard-operability contract for a clickable row/cell that isn't a native
 * `<button>`. Spread the result onto the element alongside its existing
 * `onClick`: it becomes a tab stop, is exposed to assistive tech as a button,
 * and fires `onActivate` on Enter/Space (Space also suppresses page scroll).
 * Returns `{}` when `onActivate` is undefined, so non-interactive rows/cells
 * are left untouched.
 */
export function getInteractiveRowProps(onActivate: (() => void) | undefined): {
  role?: "button";
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
} {
  if (!onActivate) return {};
  return {
    role: "button",
    tabIndex: 0,
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        if (event.key === " ") event.preventDefault();
        onActivate();
      }
    },
  };
}
