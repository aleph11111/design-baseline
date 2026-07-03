import * as React from "react";
import { GroupedListShell, GroupedListSection, Badge } from "design-baseline";

// Mirrors the baseline's canonical overline signature (SectionHeading /
// StatTile / GroupedListSection's own default title bar) — not itself an
// exported design-baseline part, so a consumer overriding the header
// re-declares it locally, same as here.
const OVERLINE_CLASS =
  "text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground";

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

// renderHeader override — a dense custom title bar (a heat badge in place
// of the default row-count badge).
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
          renderHeader={({ title, description, rowCount }) => (
            <div className="flex flex-1 items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className={OVERLINE_CLASS}>{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm font-normal normal-case tracking-normal text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              <Badge variant="warning">{rowCount} · high heat</Badge>
            </div>
          )}
        />
      </GroupedListShell>
    </div>
  );
}

// hideCount — the row-count badge suppressed entirely.
export function HideCount() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <GroupedListShell kicker="Catalog" title="Recipe Book">
        <GroupedListSection<Recipe>
          title="Oaxacan"
          description="From Mexico"
          rows={OAXACAN}
          columns={columns}
          getRowId={(r) => r.id}
          hideCount
        />
      </GroupedListShell>
    </div>
  );
}
