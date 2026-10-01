import { GroupedListShell, GroupedListSection, Badge } from "design-baseline";

// GroupedListSection only renders meaningfully inside a <GroupedListShell> —
// the section is a bounded SectionCard block within the shell's stack, so
// every cell mounts it that way (per the archetype's own demo: three
// sections sharing one shell, one column config).

type Recipe = { id: string; name: string; prepMinutes: number; spiceLevel: 1 | 2 | 3 | 4 };

const columns = [
  { key: "name", header: "Recipe", cell: (r: Recipe) => r.name, isIdentifier: true },
  {
    key: "prep",
    header: "Prep",
    cell: (r: Recipe) => <span className="font-mono tabular-nums">{r.prepMinutes} min</span>,
    align: "right" as const,
  },
];

const OAXACAN: Recipe[] = [
  { id: "r5", name: "Mole Negro", prepMinutes: 120, spiceLevel: 3 },
  { id: "r6", name: "Tlayudas", prepMinutes: 40, spiceLevel: 1 },
];
const SICHUAN: Recipe[] = [
  { id: "r1", name: "Mapo Tofu", prepMinutes: 35, spiceLevel: 4 },
  { id: "r2", name: "Dan Dan Noodles", prepMinutes: 30, spiceLevel: 3 },
];

// Default — the title bar's default row-count <Badge>.
export function DefaultCount() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <GroupedListShell kicker="Catalog" title="Recipe Book">
        <GroupedListSection<Recipe>
          title="Oaxacan"
          description="From Mexico"
          rows={OAXACAN}
          columns={columns}
          getRowId={(r) => r.id}
        />
      </GroupedListShell>
    </div>
  );
}

// actions override — a heat badge in place of the default row-count badge.
export function CustomHeader() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <GroupedListShell kicker="Catalog" title="Recipe Book">
        <GroupedListSection<Recipe>
          title="Sichuan"
          description="From China"
          rows={SICHUAN}
          columns={columns}
          getRowId={(r) => r.id}
          actions={<Badge variant="warning">{SICHUAN.length} · high heat</Badge>}
        />
      </GroupedListShell>
    </div>
  );
}
