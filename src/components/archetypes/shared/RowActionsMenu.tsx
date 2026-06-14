import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type RowAction<Row> = {
  label: string;
  onSelect: (row: Row) => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
};

export type RowActionsMenuProps<Row> = {
  row: Row;
  actions: RowAction<Row>[];
  /** Accessible label for the trigger. */
  triggerLabel?: string;
};

/**
 * RowActionsMenu — the single owner of the per-row overflow menu (the trailing
 * `⋯` dropdown in every table row). Previously duplicated byte-for-byte as
 * private `RowActionsMenu`/`RowActionsDropdown` components inside both the
 * list-with-detail and settings-table shells; promoted here so the trigger,
 * alignment, and destructive-item treatment can only be changed in one place.
 */
export function RowActionsMenu<Row>({
  row,
  actions,
  triggerLabel = "Row actions",
}: RowActionsMenuProps<Row>): React.ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{triggerLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onSelect={() => action.onSelect(row)}
              className={
                action.destructive
                  ? "text-destructive focus:text-destructive"
                  : undefined
              }
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

RowActionsMenu.displayName = "RowActionsMenu";
