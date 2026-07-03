import * as React from "react";
import {
  RowActionsMenu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type RowAction,
  type RowActionItem,
} from "design-baseline";

type Recipe = { id: string; name: string; cuisine: string };

const RECIPES: Recipe[] = [
  { id: "r1", name: "Pasta Carbonara", cuisine: "Italian" },
  { id: "r2", name: "Tacos al Pastor", cuisine: "Mexican" },
];

const recipeActions: RowAction<Recipe>[] = [
  { label: "Duplicate", onSelect: () => {} },
  { label: "Delete", destructive: true, onSelect: () => {} },
];

// The per-row overflow menu composed inside a settings-table-style row — the
// trigger sits in a trailing, fixed-width action column.
export function InTableRow() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Cuisine</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {RECIPES.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium text-primary">{r.name}</TableCell>
              <TableCell>{r.cuisine}</TableCell>
              <TableCell className="w-10">
                <RowActionsMenu row={r} actions={recipeActions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// A grouped menu — a section heading and a separator ahead of the
// destructive entry, the "edit actions … / destructive" shape RowActionItem
// supports, composed next to a card-style row.
export function GroupedActions() {
  const recipe: Recipe = { id: "r3", name: "Sushi Rolls", cuisine: "Japanese" };
  const groupedActions: RowActionItem<Recipe>[] = [
    { label: "Edit actions", heading: true },
    { label: "Duplicate", onSelect: () => {} },
    { label: "Move to…", onSelect: () => {} },
    { separator: true },
    { label: "Delete", destructive: true, onSelect: () => {} },
  ];
  return (
    <div className="w-72 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{recipe.name}</div>
          <div className="text-[11px] text-muted-foreground">{recipe.cuisine}</div>
        </div>
        <RowActionsMenu row={recipe} actions={groupedActions} />
      </div>
    </div>
  );
}
