import * as React from "react";
import { cn } from "../../../lib/utils";
import { getInteractiveRowProps, interactiveRowFocusRing } from "./interactiveRow";

/**
 * The column-descriptor fields shared by every archetype table body. list-with-detail's
 * `ListColumn` and settings-table's `SettingsColumn` are this base plus their own
 * extensions, so the identifier-cell recipe below can never silently diverge between
 * the two archetypes.
 */
export type TableColumn<Row> = {
  key: string;
  header: React.ReactNode;
  cell: (row: Row) => React.ReactNode;
  /**
   * Cell alignment. NOT a free look choice: the shared contract decision rule
   * (settings-table's Layer 6, which list-with-detail adopts) keys the value to
   * the column's value kind — numeric / monetary / date / count figures `right`,
   * short tokens (status / category / badge) `center`, everything else `left`
   * (default). Both readers of the same column config derive the same value.
   */
  align?: "left" | "right" | "center";
  /**
   * Marks the identifier cell. Gets `text-primary hover:underline`; with
   * `identifierMono` set it renders `font-mono text-sm font-medium`. When an
   * activate handler exists it also gets `cursor-pointer` and the interactive-row
   * focus ring, and becomes a keyboard-operable tab stop (role="button",
   * Enter/Space). This is the archetypes' core click contract.
   */
  isIdentifier?: boolean;
  /**
   * Per-row gate on the identifier cell's click contract: when it returns false
   * the cell skips the clickable treatment and the activate handler for that row,
   * even though `isIdentifier` is true. Use for rows that cannot be opened
   * (terminated, archived, superseded). A capability predicate derived from the
   * row, not a per-call-site look — both readers of the same row derive the same
   * value.
   */
  isClickable?: (row: Row) => boolean;
  /**
   * Style the identifier cell with `font-mono text-sm font-medium`.
   * Off by default: keyed to the identifier's character style, on for
   * alphanumeric codes or slugs, off for human-readable name identifiers.
   */
  identifierMono?: boolean;
  /**
   * Hide the column below the `md` breakpoint (table bodies only). NOT a free
   * look choice: the shared contract decision rule (Layer 6, both
   * list-with-detail and settings-table) keys it to the column's role — the
   * identifier, row-state tokens (status / priority / stage), and the one
   * figure the list is ranked by stay; every context column (relational,
   * descriptive, record metadata) hides. Ignored on the identifier column,
   * which never hides.
   */
  hideBelowMd?: boolean;
};

/**
 * The single alignment → Tailwind-class mapping for archetype table bodies.
 */
export function alignClass(align: TableColumn<unknown>["align"]): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

/**
 * The narrow-viewport visibility class for one column's head and cells.
 * The identifier column never hides — it carries the row's click contract.
 */
export function hideBelowMdClass(
  col: Pick<TableColumn<unknown>, "hideBelowMd" | "isIdentifier">,
): string | undefined {
  return col.hideBelowMd === true && col.isIdentifier !== true
    ? "hidden md:table-cell"
    : undefined;
}

/**
 * Identifier-cell className + interactivity props for one table cell.
 *
 * `onActivate` is the row's activate handler — the shell's `onRowEdit` /
 * `onRowSelect`, already guarded by `isIdentifier`. When it exists the cell
 * becomes a keyboard-operable button-role tab stop via
 * `getInteractiveRowProps` (Enter/Space fire it) and gets the interactive-row
 * focus ring; without it the cell stays a plain (but styled) cell.
 */
export function identifierCell<Row = unknown>(
  col: TableColumn<Row>,
  onActivate?: () => void,
  row?: Row,
) {
  const mono = col.identifierMono === true;
  // Per-row gate: a column may declare rows that cannot be opened. Drop the
  // activate handler for those, so the cell keeps the identifier's typography
  // but none of the click affordance (cursor, focus ring, keyboard tab stop).
  const gated =
    col.isClickable !== undefined && row !== undefined && !col.isClickable(row);
  const activate = gated ? undefined : onActivate;
  return {
    className: cn(
      "text-primary hover:underline",
      activate !== undefined &&
        cn("cursor-pointer", interactiveRowFocusRing),
      mono && "font-mono text-sm font-medium",
    ),
    onClick: activate,
    ...getInteractiveRowProps(activate),
  };
}
