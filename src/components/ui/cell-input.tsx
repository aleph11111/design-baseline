import * as React from "react";
import { cn } from "../../lib/utils";

// The shared owner of an **editable control sitting flush inside a table/grid
// cell** — the inline-cell field molecule (editable grids, inline-edit rows).
// Distinct from the form field stack (no label, no FormItem) and from a normal
// shadcn Input/Select (those carry their own border/background, which doesn't sit
// flush in a `<td>`). Native controls (so they fit flush) + the standard
// on-token focus ring, transparent background, full-cell width. This is the
// promoted home for what the matrix-grid and positions-editor previously
// hand-rolled as one-off native controls.

const cellFieldClass =
  "w-full rounded bg-transparent px-2 py-1 text-sm text-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const CellInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(cellFieldClass, className)} {...props} />
));
CellInput.displayName = "CellInput";

export const CellSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(cellFieldClass, "cursor-pointer", className)} {...props}>
    {children}
  </select>
));
CellSelect.displayName = "CellSelect";
