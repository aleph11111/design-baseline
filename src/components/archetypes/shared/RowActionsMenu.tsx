"use client";
import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";

/**
 * One menu action. `label` and `disabled` accept either a value or a function of
 * the row: the actions list is shared by every row, so a per-row toggle label
 * ("Pin" / "Unpin") or a per-row permission gate needs the row to resolve.
 * Behaviour, not appearance — the menu resolves the function form at render.
 */
export type RowAction<Row> = {
  label: string | ((row: Row) => string);
  onSelect: (row: Row) => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  /** Disable the item (e.g. no permission, not applicable to this row). */
  disabled?: boolean | ((row: Row) => boolean);
};

/** A horizontal rule grouping the items around it. */
export type RowActionSeparator = { separator: true };

/** A non-interactive section heading inside the menu. */
export type RowActionLabel = { label: string; heading: true };

/**
 * One entry in a RowActionsMenu: an action, a separator, or a section label.
 * A plain `RowAction<Row>[]` is still a valid `RowActionItem<Row>[]`, so existing
 * flat-list callers need no change.
 */
export type RowActionItem<Row> =
  | RowAction<Row>
  | RowActionSeparator
  | RowActionLabel;

export type RowActionsMenuProps<Row> = {
  row: Row;
  actions: RowActionItem<Row>[];
  /** Accessible label for the trigger. */
  triggerLabel?: string;
  /**
   * Disable the trigger itself — for an in-flight row mutation (a delete the
   * consumer is awaiting), where re-opening the menu could double-fire the
   * action. A capability boolean, not an appearance: it reports whether the
   * row can currently accept an action at all.
   */
  triggerDisabled?: boolean;
};

function isSeparator<Row>(item: RowActionItem<Row>): item is RowActionSeparator {
  return "separator" in item;
}

function isHeading<Row>(item: RowActionItem<Row>): item is RowActionLabel {
  return "heading" in item;
}

/**
 * RowActionsMenu — the single owner of the per-row overflow menu (the trailing
 * `⋯` dropdown in every table row). Previously duplicated byte-for-byte as
 * private components inside the list-with-detail and settings-table shells;
 * promoted here so the trigger, alignment, and destructive-item treatment can
 * only be changed in one place.
 *
 * Entries may be actions, `{ separator: true }` rules, or `{ label, heading: true }`
 * section labels — so a grouped menu (the common "edit actions … / destructive")
 * shape is representable without hand-rolling the `DropdownMenu`. A flat
 * `RowAction<Row>[]` still works unchanged.
 */
export function RowActionsMenu<Row>({
  row,
  actions,
  triggerLabel = "Row actions",
  triggerDisabled,
}: RowActionsMenuProps<Row>): React.ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={triggerDisabled}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{triggerLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((item, i) => {
          if (isSeparator(item)) {
            return <DropdownMenuSeparator key={`sep-${i}`} />;
          }
          if (isHeading(item)) {
            return <DropdownMenuLabel key={`head-${i}`}>{item.label}</DropdownMenuLabel>;
          }
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={`act-${i}`}
              disabled={
                typeof item.disabled === "function" ? item.disabled(row) : item.disabled
              }
              onSelect={() => item.onSelect(row)}
              className={
                item.destructive
                  ? "text-destructive focus:text-destructive"
                  : undefined
              }
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {typeof item.label === "function" ? item.label(row) : item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

RowActionsMenu.displayName = "RowActionsMenu";
