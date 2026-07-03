import * as React from "react";
import { Plus } from "lucide-react";
import {
  GroupedListShell,
  GroupedListSection,
  ListWithDetailToolbar,
  Button,
} from "design-baseline";

// Domain: a recipe book grouped by cuisine.
type Recipe = { id: string; name: string; prepMinutes: number; spiceLevel: 1 | 2 | 3 };

const columns = [
  { key: "name", header: "Recipe", cell: (r: Recipe) => r.name, isIdentifier: true },
  {
    key: "prep",
    header: "Prep",
    cell: (r: Recipe) => <span className="font-mono tabular-nums">{r.prepMinutes} min</span>,
    align: "right" as const,
  },
  { key: "spice", header: "Heat", cell: (r: Recipe) => "🌶️".repeat(r.spiceLevel) },
];

const SICHUAN: Recipe[] = [
  { id: "r1", name: "Mapo Tofu", prepMinutes: 35, spiceLevel: 3 },
  { id: "r2", name: "Dan Dan Noodles", prepMinutes: 30, spiceLevel: 2 },
];
const LEVANTINE: Recipe[] = [
  { id: "r3", name: "Mujadara", prepMinutes: 50, spiceLevel: 1 },
  { id: "r4", name: "Mhammara", prepMinutes: 20, spiceLevel: 1 },
];

const headerActions = (
  <Button size="sm">
    <Plus className="mr-1 h-4 w-4" />
    Add recipe
  </Button>
);

const toolbar = (
  <ListWithDetailToolbar
    searchValue=""
    onSearchChange={() => {}}
    searchPlaceholder="Search recipes…"
  />
);

// Loaded — toolbar, header actions, two grouped sections.
export function Loaded() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <GroupedListShell
        kicker="Catalog"
        title="Recipe Book"
        headerActions={headerActions}
        toolbar={toolbar}
      >
        <GroupedListSection<Recipe>
          title="Sichuan"
          description="From China"
          rows={SICHUAN}
          columns={columns}
          getRowId={(r) => r.id}
        />
        <GroupedListSection<Recipe>
          title="Levantine"
          description="From Mediterranean"
          rows={LEVANTINE}
          columns={columns}
          getRowId={(r) => r.id}
        />
      </GroupedListShell>
    </div>
  );
}

// Loading plane — page-level StateView, sections not rendered.
export function Loading() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <GroupedListShell
        kicker="Catalog"
        title="Recipe Book"
        headerActions={headerActions}
        toolbar={toolbar}
        isLoading
      >
        <GroupedListSection<Recipe> title="Sichuan" rows={SICHUAN} columns={columns} getRowId={(r) => r.id} />
      </GroupedListShell>
    </div>
  );
}

// Empty plane — zero sections and zero ungrouped rows.
export function Empty() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <GroupedListShell
        kicker="Catalog"
        title="Recipe Book"
        headerActions={headerActions}
        toolbar={toolbar}
        isEmpty
        emptyMessage="No recipes yet. Add one to get started."
      >
        <GroupedListSection<Recipe> title="Sichuan" rows={[]} columns={columns} getRowId={(r) => r.id} />
      </GroupedListShell>
    </div>
  );
}

// Error plane — fetch failure with a retry affordance.
export function ErrorState() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <GroupedListShell
        kicker="Catalog"
        title="Recipe Book"
        headerActions={headerActions}
        toolbar={toolbar}
        error={new Error("Failed to load the recipe book.")}
        onRetry={() => {}}
      >
        <GroupedListSection<Recipe> title="Sichuan" rows={SICHUAN} columns={columns} getRowId={(r) => r.id} />
      </GroupedListShell>
    </div>
  );
}
