/**
 * statement-with-filters-demo.tsx
 *
 * Sandbox demo for the F (statement-with-filters) archetype — one read-only
 * statement table under a heavy filter/selector toolbar that re-scopes the
 * whole statement. Domain: a community beekeeping club's **annual hive-yield
 * statement** — deliberately far from the source project's
 * accounting/real-estate/financial-statement nouns.
 *
 * Composes the full statement-with-filters vocabulary:
 *   - StatementWithFiltersShell — the bounded statement surface: a kicker +
 *     title header bar whose right-aligned `actions` band carries the
 *     scoping toolbar (Season select · Unit segmented toggle), over one flat
 *     card.
 *   - body: a `<StatementTable>` of `<StatementRow>`s (group section rows +
 *     per-hive rows, three numeric yield columns, mono + tabular,
 *     right-aligned) ending in a tinted `<StatementTotalRow>`.
 *
 * Both selectors re-scope the **whole** statement: **Season** picks which
 * year's statement is shown; **Unit** re-scopes every figure (kg vs g). The
 * page holds no yield math — `computeYieldStatement` (the "backend") computes
 * the statement from the active season and the page formats for the active
 * unit. Types are LOCAL with zero reference to any source project's domain.
 */

import * as React from "react";
import {
  StatementWithFiltersShell,
  StatementTable,
  StatementRow,
  StatementTotalRow,
} from "@/components/archetypes/statement-with-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";

// ---------------------------------------------------------------------------
// Domain — a beekeeping club's hive-yield statement
// ---------------------------------------------------------------------------

type YieldRow = {
  id: string;
  group: string; // hive block (a section row)
  name: string; // hive (a data row)
  honeyKg: number;
  propolisKg: number;
  waxKg: number;
};

type Season = "2025" | "2026";
type Unit = "kg" | "g";

const FIGURES: Record<Season, YieldRow[]> = {
  "2025": [
    { id: "h1", group: "Meadow hives", name: "Meadow A", honeyKg: 9.2, propolisKg: 0.084, waxKg: 0.52 },
    { id: "h2", group: "Meadow hives", name: "Meadow B", honeyKg: 11.8, propolisKg: 0.102, waxKg: 0.61 },
    { id: "h3", group: "Orchard hives", name: "Orchard A", honeyKg: 6.4, propolisKg: 0.061, waxKg: 0.38 },
    { id: "h4", group: "Orchard hives", name: "Orchard B", honeyKg: 7.9, propolisKg: 0.077, waxKg: 0.44 },
  ],
  "2026": [
    { id: "h1", group: "Meadow hives", name: "Meadow A", honeyKg: 12.4, propolisKg: 0.118, waxKg: 0.72 },
    { id: "h2", group: "Meadow hives", name: "Meadow B", honeyKg: 13.1, propolisKg: 0.096, waxKg: 0.66 },
    { id: "h3", group: "Orchard hives", name: "Orchard A", honeyKg: 8.3, propolisKg: 0.07, waxKg: 0.5 },
    { id: "h4", group: "Orchard hives", name: "Orchard B", honeyKg: 9.6, propolisKg: 0.088, waxKg: 0.56 },
    { id: "h5", group: "Orchard hives", name: "Orchard C", honeyKg: 4.1, propolisKg: 0.039, waxKg: 0.24 },
  ],
};

/**
 * The "backend" compute: the statement for a season. Returns the raw row
 * list + raw totals — the (season) tuple is the single source of "which
 * statement is showing"; the page alone decides the display unit.
 */
function computeYieldStatement(season: Season): {
  rows: YieldRow[];
  totals: { honeyKg: number; propolisKg: number; waxKg: number };
} {
  const rows = FIGURES[season];
  return {
    rows,
    totals: {
      honeyKg: rows.reduce((s, r) => s + r.honeyKg, 0),
      propolisKg: rows.reduce((s, r) => s + r.propolisKg, 0),
      waxKg: rows.reduce((s, r) => s + r.waxKg, 0),
    },
  };
}

/** Format a yield figure for the active unit. */
function fmt(kg: number, unit: Unit): string {
  const v = unit === "kg" ? kg : kg * 1000;
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: unit === "kg" ? 1 : 0,
    maximumFractionDigits: unit === "kg" ? 1 : 0,
  }).format(v);
}

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------

export function StatementWithFiltersDemo(): React.ReactElement {
  const [season, setSeason] = React.useState<Season>("2026");
  const [unit, setUnit] = React.useState<Unit>("kg");
  const { rows, totals } = React.useMemo(
    () => computeYieldStatement(season),
    [season],
  );

  // Section rows (hive blocks) render as muted overlines; hive rows nest.
  const groups = Array.from(new Set(rows.map((r) => r.group)));

  return (
    <div className="space-y-5">
      <p className="max-w-prose text-sm text-muted-foreground">
        The <strong>statement-with-filters</strong> archetype — one read-only
        statement under a heavy scoping toolbar in the header's{" "}
        <strong>actions band</strong>. The <strong>Season</strong> select picks
        which year's statement is shown and the <strong>Unit</strong> toggle
        re-scopes <em>every</em> figure (kg vs g); the table renders group →
        hive rows with the three numeric columns (mono, tabular, right-aligned)
        and a tinted totals row. Changing either selector recomputes the
        statement.
      </p>

      <StatementWithFiltersShell
        kicker="Annual statement"
        title="Hive yield"
        actions={
          <>
            <Select value={season} onValueChange={(v) => setSeason(v as Season)}>
              <SelectTrigger size="sm" className="w-28" aria-label="Season">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            <SegmentedControl
              value={unit}
              onValueChange={setUnit}
              options={[
                { value: "kg", label: "kg" },
                { value: "g", label: "g" },
              ]}
              aria-label="Unit"
            />
          </>
        }
      >
        <StatementTable columns={["Hive", "Honey", "Propolis", "Wax"]}>
          {groups.map((group) => (
            <React.Fragment key={group}>
              <StatementRow label={group} cells={[]} section />
              {rows
                .filter((r) => r.group === group)
                .map((r) => (
                  <StatementRow
                    key={r.id}
                    label={r.name}
                    indent={1}
                    cells={[
                      fmt(r.honeyKg, unit),
                      fmt(r.propolisKg, unit),
                      fmt(r.waxKg, unit),
                    ]}
                  />
                ))}
            </React.Fragment>
          ))}
          <StatementTotalRow
            label={`Total · ${season}`}
            cells={[
              fmt(totals.honeyKg, unit),
              fmt(totals.propolisKg, unit),
              fmt(totals.waxKg, unit),
            ]}
          />
        </StatementTable>
      </StatementWithFiltersShell>
    </div>
  );
}

StatementWithFiltersDemo.displayName = "StatementWithFiltersDemo";
