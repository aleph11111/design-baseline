/**
 * settings-table-demo.tsx
 *
 * Sandbox demo for the D2 (settings-table) archetype.
 * Domain: recipe collection — far from brickshop nouns.
 *
 * Exercises:
 *   - Table render with all columns
 *   - Identifier cell (name) click → onRowEdit
 *   - "Add new" button click → onAddNew
 *   - Row action ("Duplicate")
 *   - Empty state when filter produces no rows
 *   - Bulk select demonstration
 */

import * as React from "react";
import { Search } from "lucide-react";
import { SettingsTableShell } from "@/components/archetypes/settings-table";
import { PageHeader } from "@/components/layout";
import type { SettingsColumn, SettingsRowAction } from "@/components/archetypes/settings-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Domain type
// ---------------------------------------------------------------------------

type Cuisine = "italian" | "japanese" | "mexican" | "indian" | "french" | "other";

type Recipe = {
  id: string;
  name: string;
  cuisine: Cuisine;
  prepMinutes: number;
  servings: number;
};

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_RECIPES: Recipe[] = [
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
  other: "Other",
};

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const COLUMNS: SettingsColumn<Recipe>[] = [
  {
    key: "name",
    header: "Name",
    isIdentifier: true,
    cell: (r) => r.name,
  },
  {
    key: "cuisine",
    header: "Cuisine",
    cell: (r) => CUISINE_LABELS[r.cuisine],
  },
  {
    key: "prepMinutes",
    header: "Prep time",
    align: "right",
    cell: (r) => `${r.prepMinutes} min`,
  },
  {
    key: "servings",
    header: "Servings",
    align: "right",
    cell: (r) => r.servings,
  },
];

// ---------------------------------------------------------------------------
// Demo component
// ---------------------------------------------------------------------------

export function SettingsTableDemo() {
  const [recipes, setRecipes] = React.useState<Recipe[]>(SEED_RECIPES);
  const [query, setQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const filtered = query.trim()
    ? recipes.filter((r) =>
        r.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : recipes;

  function handleRowEdit(recipe: Recipe) {
    setLastAction(`Edit opened for: ${recipe.name}`);
  }

  function handleAddNew() {
    setLastAction("Add new recipe dialog opened");
  }

  function handleDuplicate(recipe: Recipe) {
    const copy: Recipe = {
      ...recipe,
      id: `${recipe.id}-copy-${Date.now()}`,
      name: `${recipe.name} (copy)`,
    };
    setRecipes((prev) => [...prev, copy]);
    setLastAction(`Duplicated: ${recipe.name}`);
  }

  function handleBulkDelete() {
    setRecipes((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    setLastAction(`Deleted ${selectedIds.length} recipe(s)`);
    setSelectedIds([]);
  }

  const rowActions: SettingsRowAction<Recipe>[] = [
    {
      label: "Duplicate",
      onSelect: handleDuplicate,
    },
    // NOTE: real consumers must gate destructive actions through <AlertDialog>
    // per the spec (Layer 10, "Confirm destructive actions"). This demo skips it
    // because the J/crud-dialog archetype primitives are not promoted yet.
    {
      label: "Delete",
      destructive: true,
      onSelect: (recipe) => {
        setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
        setLastAction(`Deleted: ${recipe.name}`);
      },
    },
  ];

  const toolbarContent = (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search recipes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );

  const bulkActions = (
    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
      Delete selected
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recipe Collection"
        subtitle="D2 (settings-table) archetype demo"
      />

      {lastAction && (
        <div className="rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          Last action: <span className="font-medium text-foreground">{lastAction}</span>
        </div>
      )}

      <SettingsTableShell
        rows={filtered}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        onRowEdit={handleRowEdit}
        onAddNew={handleAddNew}
        addNewLabel="Add recipe"
        toolbar={toolbarContent}
        rowActions={rowActions}
        emptyMessage={
          query.trim()
            ? `No recipes match "${query}".`
            : "No recipes yet."
        }
        bulkSelectable
        selectedIds={selectedIds}
        onBulkSelectChange={setSelectedIds}
        bulkActions={bulkActions}
      />

      {/* Alternate states */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Loading", props: { isLoading: true } },
          {
            label: "Error",
            props: {
              error: new Error("Failed to load recipes."),
              onRetry: () => setLastAction("Retry triggered"),
            },
          },
          {
            label: "Empty (with CTA)",
            props: { onAddNew: handleAddNew, addNewLabel: "Add recipe", emptyMessage: "No recipes yet." },
          },
        ].map(({ label, props }) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              {label}
            </p>
            <SettingsTableShell rows={[]} columns={COLUMNS} getRowId={(r) => r.id} {...props} />
          </div>
        ))}
      </div>
    </div>
  );
}
