import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  GroupedListShell,
  GroupedListSection,
  WaitingAgeCell,
  WorkQueueGroups,
  WorkQueueViewSwitch,
  type WorkQueueGroup,
  type WorkQueueView,
  type WorkflowStep,
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
  },
  {
    key: "prep",
    header: "Prep",
    cell: (r) => <span className="tabular-nums">{r.prepMinutes} min</span>,
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

const VARIANTS = ["taxonomy", "work-queue"] as const;

export function GroupedListDemo() {
  // Variant switch: taxonomy groups (the default) or the work-queue variant
  // (groups keyed by workflow step).
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("taxonomy");
  return (
    <div className="space-y-5">
      <SegmentedControl
        value={variant}
        onValueChange={(v) => setVariant(v as (typeof VARIANTS)[number])}
        options={[
          { value: "taxonomy", label: "Taxonomy" },
          { value: "work-queue", label: "Work queue" },
        ]}
        aria-label="Variant"
      />
      {variant === "taxonomy" ? <TaxonomyDemo /> : <WorkQueueDemo />}
    </div>
  );
}

function TaxonomyDemo() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // State plane: exercises the shell's loading/error StateView, driven by
  // isLoading/error/onRetry (Layer 7).
  const [state, setState] = useState<(typeof STATES)[number]>("loaded");
  // Toolbar-less shape (Layer 4 "no toolbar"): the Add action stays in the
  // page `actions` either way — only the search toolbar slot is omitted.
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
          Sections group rows by taxonomy into one card each, a
          heading over its table, sharing one column config. Toggle <strong>State</strong> to
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

      <GroupedListShell
        title="Recipe Book"
        // The list sits under a parent route (the app's catalog section): the
        // back link is the page header's, not a bespoke leading control.
        backHref="#"
        backLabel="Catalog"
        actions={
          <Button>
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
  );
}

// ---------------------------------------------------------------------------
// Work-queue variant — a print shop's orders, grouped by what has to happen
// next. The step list is the one state model a transaction-document detail
// page would read for its `nextStep` tone too.
// ---------------------------------------------------------------------------

type StepKey = "pay" | "print" | "pack" | "shipped" | "delivered";

const STEPS: WorkflowStep<StepKey>[] = [
  { key: "pay", label: "To pay", phase: "open", tone: "warning" },
  { key: "print", label: "To print", phase: "open" },
  { key: "pack", label: "To pack", phase: "open" },
  { key: "shipped", label: "Shipped, no delivery scan", phase: "open", tone: "warning" },
  { key: "delivered", label: "Delivered", phase: "completed", tone: "success" },
];

type PrintOrder = { id: string; customer: string; country: string; amount: string; step: StepKey; waitingDays: number; since: string };

const ORDERS: PrintOrder[] = [
  { id: "PO-2026-0146", customer: "Sofia Rossi", country: "IT", amount: "550,99 €", step: "shipped", waitingDays: 34, since: "04.10." },
  { id: "PO-2026-0149", customer: "Tom Berger", country: "DE", amount: "609,49 €", step: "shipped", waitingDays: 21, since: "17.10." },
  { id: "PO-2026-0150", customer: "Jan de Vries", country: "NL", amount: "216,49 €", step: "shipped", waitingDays: 9, since: "24.10." },
  { id: "PO-2026-0152", customer: "Piotr Nowak", country: "AT", amount: "322,49 €", step: "shipped", waitingDays: 2, since: "31.10." },
  { id: "PO-2026-0154", customer: "Lena Fischer", country: "DE", amount: "347,49 €", step: "pack", waitingDays: 1, since: "01.11." },
  { id: "PO-2026-0155", customer: "Max Mustermann", country: "DE", amount: "176,19 €", step: "pack", waitingDays: 8, since: "25.10." },
  ...["Eleni Papadaki", "Gábor Kiss", "Daan Jansen", "Olena Koval", "Anna Petrova", "Luc Martin", "Bram Peeters"].map(
    (customer, i): PrintOrder => ({
      id: `PO-2026-01${String(45 - i).padStart(2, "0")}`,
      customer,
      country: "EU",
      amount: `${120 + i * 37},49 €`,
      step: "delivered",
      waitingDays: 0,
      since: `${String(28 - i * 3).padStart(2, "0")}.10.2026`,
    }),
  ),
];

const order: ListColumn<PrintOrder> = { key: "id", header: "Order", cell: (o) => o.id, isIdentifier: true };
const customer: ListColumn<PrintOrder> = {
  key: "customer",
  header: "Customer",
  cell: (o) => (
    <>
      {o.customer} <span className="text-xs text-muted-foreground">· {o.country}</span>
    </>
  ),
};
const amount: ListColumn<PrintOrder> = { key: "amount", header: "Amount", cell: (o) => <span className="tabular-nums">{o.amount}</span>, align: "right" };

// Open: the waiting age is the column that matters (warning at 7 days, danger at 14).
const OPEN_COLUMNS = [order, customer, amount, {
  key: "waiting",
  header: "Waiting",
  cell: (o: PrintOrder) => <WaitingAgeCell days={o.waitingDays} thresholds={{ warning: 7, danger: 14 }} since={`since ${o.since}`} />,
}];
// Archive views: the completion date replaces the age.
const ARCHIVE_COLUMNS = [order, { key: "done", header: "Completed", cell: (o: PrintOrder) => o.since }, customer, amount];

function WorkQueueDemo() {
  const [view, setView] = useState<WorkQueueView>("open");
  const [search, setSearch] = useState("");

  const { groups, counts } = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matches = (o: PrintOrder) => needle === "" || `${o.id} ${o.customer}`.toLowerCase().includes(needle);
    const phase = (key: StepKey) => STEPS.find((s) => s.key === key)!.phase;
    const counts = {
      open: ORDERS.filter((o) => phase(o.step) === "open" && matches(o)).length,
      completed: ORDERS.filter((o) => phase(o.step) === "completed" && matches(o)).length,
      all: ORDERS.filter(matches).length,
    };
    // Partition upstream (contract Layer 8): every step of the view, in step
    // order, empty ones included — the primitive collapses those.
    const groups: WorkQueueGroup<PrintOrder>[] = STEPS.filter((s) => view === "all" || s.phase === view).map((step) => {
      const rows = ORDERS.filter((o) => o.step === step.key && matches(o)).sort((a, b) => b.waitingDays - a.waitingDays);
      return {
        step,
        rows,
        description: step.key === "shipped" && view === "open" && rows.length ? `Oldest ${rows[0]!.waitingDays} days. Tracking is only checked by hand.` : undefined,
        bulkAction:
          view !== "open" || rows.length === 0
            ? undefined
            : step.key === "shipped"
              ? { label: `Refresh tracking for ${rows.length}`, onSelect: () => {} }
              : step.key === "pack"
                ? { label: `Print labels for ${rows.length}`, onSelect: () => {} }
                : undefined,
      };
    });
    return { groups, counts };
  }, [view, search]);

  return (
    <GroupedListShell
      title="Print orders"
      actions={
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          New order
        </Button>
      }
      viewSwitch={<WorkQueueViewSwitch value={view} onValueChange={setView} counts={counts} />}
      toolbar={<ListWithDetailToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Order no., customer…" />}
      isEmpty={counts[view] === 0}
      emptyMessage="No orders match your search."
    >
      <WorkQueueGroups<PrintOrder>
        groups={groups}
        density={view === "open" ? "open" : "archive"}
        columns={view === "open" ? OPEN_COLUMNS : ARCHIVE_COLUMNS}
        getRowId={(o) => o.id}
        onRowSelect={() => {}}
      />
    </GroupedListShell>
  );
}
