/**
 * settings-table-demo.tsx
 *
 * Sandbox demo for the D2 (settings-table) archetype.
 * Domain: recipe collection — far from brickshop nouns.
 *
 * Exercises:
 *   - Table render with all columns
 *   - Identifier cell (name) click → onRowEdit
 *   - "Add new" button (page header `actions`, before the page's own) → onAddNew
 *   - Row action ("Duplicate")
 *   - Empty state when filter produces no rows (filter-caused empty list, no
 *     Add CTA; truly empty shows the CTA)
 *   - Bulk select with filter-safe selection — the selected count and the
 *     destructive delete only ever act on rows currently visible; rows hidden
 *     by the search query drop out of the selection, and the selection is
 *     pruned when the filter changes so it does not outlive the filter
 *   - Per-row checkbox accessible name names the row ("Select row: {name}")
 *   - Result-count line (`rowLabel`, singular/plural function form)
 *   - Narrow-viewport column subset (`hideBelow` on the context columns)
 *   - Row-derived action gate (`disabled` as a function of the row)
 *   - Layer 10 delete confirmation — every destructive action (row or bulk)
 *     waits for the shared ConfirmationDialog
 *   - Split-pane editing variant (Layer 5) — the same shell renders a
 *     persistent edit form as the page frame's right pane, hairline-divided,
 *     with the row click contract driving the pane's selection
 */

import * as React from "react";
import { SettingsTableShell } from "@/components/archetypes/settings-table";
import type { SettingsColumn, RowAction } from "@/components/archetypes/settings-table";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { SearchInput } from "@/components/ui/search-input";

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

// Split-pane variant domain — numbering series, the contract's own
// rapid-successive-editing example (settings entities edited in one sitting).
type Series = {
  id: string;
  name: string;
  prefix: string;
};

const SEED_SERIES: Series[] = [
  { id: "n1", name: "Invoice", prefix: "INV" },
  { id: "n2", name: "Delivery note", prefix: "DN" },
  { id: "n3", name: "Credit note", prefix: "CR" },
  { id: "n4", name: "Purchase order", prefix: "PO" },
];

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

  // Prune the selection to the rows the new filter actually shows. Without
  // this, clearing a query that was hiding some ticked rows would silently
  // re-show them as ticked — the selection outlived the filter without the
  // user ever re-selecting those rows. Bails early (returning the same
  // reference) when the prune removed nothing, so the effect does not
  // trigger an extra re-render on an unchanged selection.
  React.useEffect(() => {
    const visible = new Set(filtered.map((r) => r.id));
    setSelectedIds((prev) => {
      const pruned = prev.filter((id) => visible.has(id));
      return pruned.length === prev.length ? prev : pruned;
    });
  }, [filtered]);

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

  const rowActions: RowAction<Recipe>[] = [
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

  // The candidate set is `filtered` (what the user sees), not `recipes` — a
  // row the search query hides must not be silently deleted by a bulk action.
  const bulkActions = (
    <Button variant="destructive" size="sm"
      onClick={() => setPendingDelete(filtered.filter((r) => selectedIds.includes(r.id)))}
      disabled={selectedIds.length === 0}
    >
      Delete selected
    </Button>
  );

  // --- Split-pane variant (Layer 5, ADR-0008 §3) --------------------------
  // The variant exists for rapid successive editing: the edit form stays
  // open beside the table, so there is no dialog open/close cycle. It is the
  // shell's ONE page frame split into two panes — hairline divider, no
  // second raised surface. The row-click contract (Layer 6) drives the
  // pane's selection (onRowEdit), and below `md` the pane drops out of the
  // frame so the mobile edit dialog takes over (Layer 11).
  const [series, setSeries] = React.useState<Series[]>(SEED_SERIES);
  const [editingSeriesId, setEditingSeriesId] = React.useState<string | null>(null);
  const [panePrefix, setPanePrefix] = React.useState("");
  const [paneSaveFlash, setPaneSaveFlash] = React.useState("");
  const editingSeries = series.find((s) => s.id === editingSeriesId) ?? null;

  // Row click (the D2 click contract) selects the row the pane edits —
  // no dialog open/close cycle between successive saves.
  function selectSeries(s: Series) {
    setEditingSeriesId(s.id);
    setPanePrefix(s.prefix);
    setPaneSaveFlash("");
  }

  function saveSeriesEdit() {
    if (!editingSeries) return;
    const prefix = panePrefix.trim() || editingSeries.prefix;
    setSeries((prev) =>
      prev.map((s) => (s.id === editingSeries.id ? { ...s, prefix } : s)),
    );
    setPaneSaveFlash(`Saved: ${editingSeries.name} (${prefix})`);
  }

  const SERIES_COLUMNS: SettingsColumn<Series>[] = [
    { key: "name", header: "Series", isIdentifier: true, cell: (s) => s.name },
    {
      key: "prefix",
      header: "Prefix",
      align: "center",
      cell: (s) => (
        <span className="font-mono text-muted-foreground">{s.prefix}-</span>
      ),
    },
  ];

  const editPane = editingSeries ? (
    <form
      className="flex h-full flex-col gap-3 p-4"
      onSubmit={saveSeriesEdit}
    >
      <div className="text-sm font-medium text-foreground">
        Edit {editingSeries.name}
      </div>
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Numeric prefix
        <input
          value={panePrefix}
          onChange={(e) => setPanePrefix(e.target.value)}
          className="h-9 rounded-md border bg-muted/50 px-3 font-mono text-sm text-foreground"
          aria-label="Numeric prefix"
        />
      </label>
      <Button type="submit" size="sm">
        Save
      </Button>
      {paneSaveFlash && (
        <div
          role="status"
          className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        >
          {paneSaveFlash}
        </div>
      )}
    </form>
  ) : (
    <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
      Select a series to edit
    </div>
  );

  return (
    <div className="space-y-5">
      {lastAction && (
        <div className="rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          Last action: <span className="font-medium text-foreground">{lastAction}</span>
        </div>
      )}

      {/* ADR-0008 page frame: the title is the page h1; Add recipe + Import
          are header actions, search is the toolbar, the count (or
          "{n} selected") sits in the toolbar band. */}
      <div>
        <SettingsTableShell
          title="Recipe Collection"
          actions={
            <Button variant="outline" size="sm">
              Import
            </Button>
          }
          rows={filtered}
          columns={COLUMNS}
          getRowId={(r) => r.id}
          onRowEdit={handleRowEdit}
          onAddNew={handleAddNew}
          addNewLabel="Add recipe"
          isFiltered={query.trim() !== ""}
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

      {/* Split-pane variant (Layer 5): the same shell, one page frame split
          into table + persistent edit form, hairline-divided. Click a series
          to select it for the right pane; below `md` the pane drops out of
          the frame and the edit dialog (the click contract) takes over. */}
      <div>
        <SettingsTableShell
          title="Numbering series"
          rows={series}
          columns={SERIES_COLUMNS}
          getRowId={(s) => s.id}
          onRowEdit={selectSeries}
          editPane={editPane}
          emptyMessage="No numbering series yet."
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
          <SettingsTableShell key={label} title={label} rows={[]} columns={COLUMNS} getRowId={(r) => r.id} {...props} />
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
