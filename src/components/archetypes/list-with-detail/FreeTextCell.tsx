import * as React from "react";
import { TableCell } from "../../ui/table";

export type FreeTextCellProps = Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "className" | "style">;

/**
 * A table cell in the detail overlay that holds free text (a description, a
 * long value). The overlay holds every other cell on one line (ADR-0010); this
 * one wraps, inside a readable band — a ~24ch floor so min-content sizing does
 * not collapse it to one word, a ~48ch cap — so the sheet grows only by the
 * single-line columns plus one readable text column (ADR-0010 amendment).
 * Marks the kind of content, not a width: no className or style.
 *
 * The band sits on an inner block because browsers ignore min/max-width on a
 * table cell itself. Below `sm` the sheet is full-screen and every cell wraps,
 * so the band applies from `sm` up only.
 */
export const FreeTextCell = React.forwardRef<HTMLTableCellElement, FreeTextCellProps>(
  ({ children, ...props }, ref) => (
    <TableCell ref={ref} data-free-text="" {...props}>
      <div className="whitespace-normal sm:min-w-[24ch] sm:max-w-[48ch]">{children}</div>
    </TableCell>
  ),
);
FreeTextCell.displayName = "FreeTextCell";
