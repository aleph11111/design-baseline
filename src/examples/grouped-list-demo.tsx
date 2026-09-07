import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  GroupedListShell,
  GroupedListSection,
} from "@/components/archetypes/grouped-list";
import {
  ListWithDetailToolbar,
  type ListColumn,
} from "@/components/archetypes/list-with-detail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";

// ---------------------------------------------------------------------------
// Domain types — recipes by cuisine. Written without reference to the source
// project's nouns (services / service groups). If the primitive's contract
// fits these types as cleanly as the source types, the generalisation passes.
// ---------------------------------------------------------------------------

type Cuisine = {
  id: string;
  name: string;
  origin: string;
};

type Recipe = {
  id: string;
  cuisineId: string;
  name: string;
  prepMinutes: number;
  spiceLevel: 1 | 2 | 3 | 4 | 5;
  isVegan: boolean;
};

const CUISINES: Cuisine[] = [
  { id: "c1", name: "Sichuan", origin: "China" },
  { id: "c2", name: "Levantine", origin: "Mediterranean" },
  { id: "c3", name: "Oaxacan", origin: "Mexico" },
];

const RECIPES: Recipe[] = [
  { id: "r1", cuisineId: "c1", name: "Mapo Tofu", prepMinutes: 35, spiceLevel: 4, isVegan: false },
  { id: "r2", cuisineId: "c1", name: "Dan Dan Noodles", prepMinutes: 30, spiceLevel: 3, isVegan: false },
  { id: "r3", cuisineId: "c2", name: "Mujadara", prepMinutes: 50, spiceLevel: 1, isVegan: true },
  { id: "r4", cuisineId: "c2", name: "Mhammara", prepMinutes: 20, spiceLevel: 2, isVegan: true },
  { id: "r5", cuisineId: "c3", name: "Mole Negro", prepMinutes: 120, spiceLevel: 3, isVegan: false },
  // Orphan — no matching cuisine id.
  { id: "r6", cuisineId: "c-unknown", name: "Grandma's Mystery Stew", prepMinutes: 60, spiceLevel: 2, isVegan: false },
];

// ---------------------------------------------------------------------------
// Column config — shared across every section on this page.
// ---------------------------------------------------------------------------

const columns: ListColumn<Recipe>[] = [
  {
    key: "name",
    header: "Recipe",
    cell: (r) => r.name,
    isIdentifier: true,
    identifierMono: false,
  },
  {
    key: "prep",
    header: "Prep",
    cell: (r) => <span className="font-mono tabular-nums">{r.prepMinutes} min</span>,
    align: "right",
  },
  {
    key: "spice",
    header: "Heat",
    cell: (r) => "🌶️".repeat(r.spiceLevel),
  },
  {
    key: "vegan",
    header: "Vegan",
    cell: (r) => (r.isVegan ? "Yes" : "—"),
  },
];

const STATES = ["loaded", "loading", "error"] as const;
const TOOLBAR_MODES = ["full", "header-only"] as const;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function GroupedListDemo() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // State plane: exercises the shell's loading/error StateView, driven by
  // isLoading/error/onRetry (Layer 7).
  const [state, setState] = useState<(typeof STATES)[number]>("loaded");
  // Toolbar-less shape (Layer 4 "no toolbar"): the Add action stays in
  // headerActions either way — only the search toolbar slot is omitted.
  const [toolbarMode, setToolbarMode] =
    useState<(typeof TOOLBAR_MODES)[number]>("full");

  // Partition recipes by cuisine. In a real app this happens server-side or
  // in a wrapping client component — never inside the primitive.
  const { sections, ungrouped, isEmpty } = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matches = (r: Recipe) =>
      needle === "" || r.name.toLowerCase().includes(needle);

    const cuisineById = new Map(CUISINES.map((c) => [c.id, c]));

    const sections = CUISINES.flatMap((cuisine) => {
      const rows = RECIPES.filter((r) => r.cuisineId === cuisine.id && matches(r));
      if (rows.length === 0) return [];
      return [{ id: cuisine.id, cuisine, rows }];
    });

    const ungrouped = RECIPES.filter(
      (r) => !cuisineById.has(r.cuisineId) && matches(r),
    );

    const isEmpty = sections.length === 0 && ungrouped.length === 0;
    return { sections, ungrouped, isEmpty };
  }, [search]);

  const isLoading = state === "loading";
  const error = state === "error" ? new Error("Failed to load the recipe book.") : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          Sections group rows by taxonomy; each renders its own bounded
          section card sharing one column config. Toggle <strong>State</strong> to
          see the shell's loading/error planes, and <strong>Toolbar</strong> for the
          header-only shape — the Add action stays in the header either way.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            value={state}
            onValueChange={(v) => setState(v as (typeof STATES)[number])}
            options={[
              { value: "loaded", label: "Loaded" },
              { value: "loading", label: "Loading" },
              { value: "error", label: "Error" },
            ]}
            aria-label="State"
          />
          <SegmentedControl
            value={toolbarMode}
            onValueChange={(v) => setToolbarMode(v as (typeof TOOLBAR_MODES)[number])}
            options={[
              { value: "full", label: "Toolbar: full" },
              { value: "header-only", label: "Header-only" },
            ]}
            aria-label="Toolbar"
          />
        </div>
      </div>

      <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <GroupedListShell
        kicker="Catalog"
        title="Recipe Book"
        headerActions={
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add recipe
          </Button>
        }
        isLoading={isLoading}
        error={error}
        onRetry={() => setState("loaded")}
        isEmpty={isEmpty}
        emptyMessage={
          search
            ? "No recipes match your search."
            : "No recipes yet. Add one to get started."
        }
        toolbar={
          toolbarMode === "full" ? (
            <ListWithDetailToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search recipes…"
            />
          ) : undefined
        }
      >
        {sections.map(({ id, cuisine, rows }) => {
          const sectionProps = {
            title: cuisine.name,
            description: `From ${cuisine.origin}`,
            rows,
            columns,
            getRowId: (r: Recipe) => r.id,
            onRowSelect: (r: Recipe) => setSelectedId(r.id),
            selectedRowId: selectedId,
          };

          // Sichuan — a heat badge in place of the default row-count badge
          // (one right-aligned treatment per bar, via `actions`).
          if (id === "c1") {
            return (
              <GroupedListSection<Recipe>
                key={id}
                {...sectionProps}
                actions={<Badge variant="warning">{rows.length} · high heat</Badge>}
              />
            );
          }

          return <GroupedListSection<Recipe> key={id} {...sectionProps} />;
        })}

        {ungrouped.length > 0 && (
          <GroupedListSection<Recipe>
            title="Uncategorised"
            description="Recipes whose cuisine has been removed or never recorded."
            rows={ungrouped}
            columns={columns}
            getRowId={(r) => r.id}
            onRowSelect={(r) => setSelectedId(r.id)}
            selectedRowId={selectedId}
          />
        )}
      </GroupedListShell>
      </div>
    </div>
  );
}
