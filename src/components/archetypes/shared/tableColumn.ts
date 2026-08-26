import * as React from "react";
import { cn } from "@/lib/utils";
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
   * Style the identifier cell with `font-mono text-sm font-medium`.
   * Off by default: keyed to the identifier's character style, on for
   * alphanumeric codes or slugs, off for human-readable name identifiers.
   */
  identifierMono?: boolean;
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
) {
  const mono = col.identifierMono === true;
  return {
    className: cn(
      "text-primary hover:underline",
      onActivate !== undefined &&
        cn("cursor-pointer", interactiveRowFocusRing),
      mono && "font-mono text-sm font-medium",
    ),
    onClick: onActivate,
    ...getInteractiveRowProps(onActivate),
  };
}
