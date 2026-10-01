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
 *   - Result-count line (`rowLabel`, singular/plural function form)
 *   - Narrow-viewport column subset (`hideBelow` on the context columns)
 *   - Row-derived action gate (`disabled` as a function of the row)
 */

import * as React from "react";
import { SettingsTableShell } from "@/components/archetypes/settings-table";
import type { SettingsColumn, SettingsRowAction } from "@/components/archetypes/settings-table";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { SearchInput } from "@/components/ui/search-input";
import { OVERLINE_CLASS } from "@/components/layout/overline";
import { cn } from "@/lib/utils";

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
    // Layer 6 role rule: descriptive context → drops out below `md`.
    hideBelow: "md",
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
    // Record metadata → drops out below `md`; prep time is the ranked figure.
    hideBelow: "md",
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
  const [pendingDelete, setPendingDelete] = React.useState<Recipe[] | null>(null);
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

  // Layer 10: every delete (row or bulk) waits for the shared confirmation dialog.
  function confirmDelete() {
    if (!pendingDelete) return;
    const ids = pendingDelete.map((r) => r.id);
    setRecipes((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    setLastAction(
      ids.length === 1 ? `Deleted: ${pendingDelete[0]?.name}` : `Deleted ${ids.length} recipes`,
    );
    setPendingDelete(null);
  }

  const rowActions: SettingsRowAction<Recipe>[] = [
    {
      label: "Duplicate",
      // Row-derived gate: a copy cannot be duplicated again.
      disabled: (recipe) => recipe.id.includes("-copy-"),
      onSelect: handleDuplicate,
    },
    {
      label: "Delete",
      destructive: true,
      onSelect: (recipe) => setPendingDelete([recipe]),
    },
  ];

  const toolbarContent = (
    <SearchInput
      value={query}
      onChange={setQuery}
      placeholder="Search recipes…"
    />
  );

  const bulkActions = (
    <Button variant="destructive" size="sm"
      onClick={() => setPendingDelete(recipes.filter((r) => selectedIds.includes(r.id)))}
      disabled={selectedIds.length === 0}
    >
      Delete selected
    </Button>
  );

  return (
    <div className="space-y-5">
      {lastAction && (
        <div className="rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          Last action: <span className="font-medium text-foreground">{lastAction}</span>
        </div>
      )}

      {/* Plex Ledger board form: the title + actions sit ON the bounded
          surface (SurfaceHeader), one frame on a muted mat. */}
      <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
        <SettingsTableShell
          kicker="Catalog"
          title="Recipe Collection"
          headerActions={
            <>
              <Button variant="outline" size="sm">
                Import
              </Button>
              <Button size="sm" onClick={handleAddNew}>
                Add recipe
              </Button>
            </>
          }
          rows={filtered}
          columns={COLUMNS}
          getRowId={(r) => r.id}
          onRowEdit={handleRowEdit}
          toolbar={toolbarContent}
          rowLabel={(n) => (n === 1 ? "recipe" : "recipes")}
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
      </div>

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
            <p className={cn(OVERLINE_CLASS, "mb-2")}>
              {label}
            </p>
            <SettingsTableShell rows={[]} columns={COLUMNS} getRowId={(r) => r.id} {...props} />
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={
          pendingDelete?.length === 1
            ? `Delete ${pendingDelete[0]?.name}?`
            : `Delete ${pendingDelete?.length ?? 0} recipes?`
        }
        description={`${
          pendingDelete?.length === 1 ? "1 recipe" : `${pendingDelete?.length ?? 0} recipes`
        } will be deleted. This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
