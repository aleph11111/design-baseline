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
    cell: (r) => `${r.prepMinutes} min`,
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

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function GroupedListDemo() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipe book</h1>
          <p className="text-sm text-muted-foreground">
            Browse recipes grouped by cuisine.
          </p>
        </div>
      </header>

      <GroupedListShell
        isEmpty={isEmpty}
        emptyMessage={
          search
            ? "No recipes match your search."
            : "No recipes yet. Add one to get started."
        }
        toolbar={
          <ListWithDetailToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search recipes…"
            pageActions={
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add recipe
              </Button>
            }
          />
        }
      >
        {sections.map(({ id, cuisine, rows }) => (
          <GroupedListSection<Recipe>
            key={id}
            title={cuisine.name}
            description={`From ${cuisine.origin}`}
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            onRowSelect={(r) => setSelectedId(r.id)}
            selectedRowId={selectedId}
          />
        ))}

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
  );
}
