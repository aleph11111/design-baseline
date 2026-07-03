import * as React from "react";
import { useState } from "react";
import { SettingsTableShell, Button, SearchInput, type SettingsColumn, type SettingsRowAction } from "design-baseline";

type Cuisine = "italian" | "japanese" | "mexican" | "indian" | "french";
type Recipe = { id: string; name: string; cuisine: Cuisine; prepMinutes: number; servings: number };

const RECIPES: Recipe[] = [
  { id: "r1", name: "Pasta Carbonara", cuisine: "italian", prepMinutes: 25, servings: 2 },
  { id: "r2", name: "Chicken Tikka Masala", cuisine: "indian", prepMinutes: 45, servings: 4 },
  { id: "r3", name: "Sushi Rolls", cuisine: "japanese", prepMinutes: 60, servings: 2 },
  { id: "r4", name: "Tacos al Pastor", cuisine: "mexican", prepMinutes: 35, servings: 6 },
  { id: "r5", name: "Crème Brûlée", cuisine: "french", prepMinutes: 50, servings: 4 },
];

const CUISINE_LABELS: Record<Cuisine, string> = {
  italian: "Italian",
  japanese: "Japanese",
  mexican: "Mexican",
  indian: "Indian",
  french: "French",
};

const COLUMNS: SettingsColumn<Recipe>[] = [
  { key: "name", header: "Name", isIdentifier: true, cell: (r) => r.name },
  { key: "cuisine", header: "Cuisine", cell: (r) => CUISINE_LABELS[r.cuisine] },
  { key: "prepMinutes", header: "Prep time", align: "right", cell: (r) => `${r.prepMinutes} min` },
  { key: "servings", header: "Servings", align: "right", cell: (r) => r.servings },
];

const ROW_ACTIONS: SettingsRowAction<Recipe>[] = [
  { label: "Duplicate", onSelect: () => {} },
  { label: "Delete", destructive: true, onSelect: () => {} },
];

// Full recipe collection — search toolbar, header actions, identifier-click
// edit, per-row overflow menu, and bulk selection with two rows checked.
export function RecipeCollection() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["r2", "r4"]);
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsTableShell
        kicker="Catalog"
        title="Recipe Collection"
        headerActions={
          <>
            <Button variant="outline" size="sm">
              Import
            </Button>
            <Button size="sm">Add recipe</Button>
          </>
        }
        rows={RECIPES}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        onRowEdit={() => {}}
        toolbar={<SearchInput value="" onChange={() => {}} placeholder="Search recipes…" />}
        rowActions={ROW_ACTIONS}
        bulkSelectable
        selectedIds={selectedIds}
        onBulkSelectChange={setSelectedIds}
        bulkActions={
          <Button variant="destructive" size="sm">
            Delete selected
          </Button>
        }
      />
    </div>
  );
}

// Empty state with an "Add new" call to action — no recipes yet.
export function EmptyWithCallToAction() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsTableShell
        kicker="Catalog"
        title="Recipe Collection"
        rows={[]}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        onAddNew={() => {}}
        addNewLabel="Add recipe"
        emptyMessage="No recipes yet."
      />
    </div>
  );
}

// Loading plane — the shell's own StateView, in place of the table.
export function Loading() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsTableShell
        kicker="Catalog"
        title="Recipe Collection"
        rows={[]}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        isLoading
      />
    </div>
  );
}
