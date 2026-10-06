/**
 * statement-with-filters-demo.tsx
 *
 * Sandbox demo for the F (statement-with-filters) archetype — one read-only
 * statement re-scoped by a set of selectors. Domain: a community beekeeping
 * club's **profit & loss** — a statement shape, with club nouns (honey sales,
 * hive treatment) far from any source project's ledger.
 *
 * Every slot of the one page frame (ADR-0008) is shown:
 *   - `title` — "Profit & Loss", the page h1, passed once.
 *   - `actions` — the document verbs: Export, PDF.
 *   - `toolbar` — the scoping selectors (Scenario · Year · Structure); each
 *     re-scopes the whole statement. Each carries its label joined to the box
 *     at the band's one control height (STYLE.md "Toolbar field labels").
 *   - `viewOptions` — display-only toggles in the View menu (decimals, KPI
 *     rows, zero rows); they change how the statement shows, not which.
 *   - body — a `<StatementTable>` of section + line rows and a tinted total.
 *
 * The page holds no P&L math — `computeStatement` (the "backend") returns the
 * statement for the full selector tuple. Types are LOCAL.
 */

import * as React from "react";
import { Download, FileText } from "lucide-react";
import {
  StatementWithFiltersShell,
  StatementTable,
  StatementRow,
  StatementTotalRow,
} from "@/components/archetypes/statement-with-filters";
import { Button } from "@/components/ui/button";
import { formatFigure } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";

// ---------------------------------------------------------------------------
// Domain — a beekeeping club's P&L
// ---------------------------------------------------------------------------

type Scenario = "actual" | "budget";
type Year = "2025" | "2026";
type Structure = "lines" | "sections";

/** The selector tuple — the single source of "which statement is showing". */
type Tuple = { scenario: Scenario; year: Year; structure: Structure };

type Line = { section: "Revenue" | "Expenses"; name: string; cur: number; prior: number };

const BASE: Line[] = [
  { section: "Revenue", name: "Honey sales", cur: 18_420, prior: 15_960 },
  { section: "Revenue", name: "Wax & candles", cur: 2_310, prior: 2_045 },
  { section: "Revenue", name: "Membership fees", cur: 6_600, prior: 6_300 },
  { section: "Revenue", name: "Grants", cur: 0, prior: 1_500 },
  { section: "Expenses", name: "Equipment", cur: -4_870, prior: -6_120 },
  { section: "Expenses", name: "Feed sugar", cur: -1_940, prior: -1_710 },
  { section: "Expenses", name: "Varroa treatment", cur: -1_265, prior: -1_180 },
  { section: "Expenses", name: "Insurance", cur: -980, prior: -950 },
  { section: "Expenses", name: "Open day", cur: 0, prior: -640 },
];

const HIVES = 14;

/** The "backend": the statement for the full tuple, pre-computed. */
function computeStatement({ scenario, year, structure }: Tuple): {
  rows: Array<{ label: string; section?: boolean; cur: number; prior: number }>;
  result: { cur: number; prior: number };
  kpis: Array<{ label: string; cur: string; prior: string }>;
} {
  const scale = (year === "2026" ? 1 : 0.9) * (scenario === "budget" ? 1.05 : 1);
  const lines = BASE.map((l) => ({
    ...l,
    cur: Math.round(l.cur * scale),
    prior: Math.round(l.prior * scale),
  }));
  const sum = (ls: Line[], k: "cur" | "prior") => ls.reduce((s, l) => s + l[k], 0);
  const sections = (["Revenue", "Expenses"] as const).map((section) => {
    const ls = lines.filter((l) => l.section === section);
    return { section, ls, cur: sum(ls, "cur"), prior: sum(ls, "prior") };
  });
  const rows = sections.flatMap(({ section, ls, cur, prior }) =>
    structure === "sections"
      ? [{ label: section, cur, prior }]
      : [
          { label: section, section: true, cur: 0, prior: 0 },
          ...ls.map((l) => ({ label: l.name, cur: l.cur, prior: l.prior })),
        ],
  );
  const result = { cur: sum(lines, "cur"), prior: sum(lines, "prior") };
  const [rev] = sections;
  // margin is a 0–1 ratio (result / revenue) — the `fraction` kind, one decimal
  // (the house scale), no-break space before %. Replaces the inline string-built
  // percent the reference code used to model (dot decimal, no-break space
  // dropped) — figures go through the one formatter.
  const pct = (a: number, b: number) => formatFigure(a / b, "fraction");
  return {
    rows,
    result,
    kpis: [
      { label: "Margin", cur: pct(result.cur, rev!.cur), prior: pct(result.prior, rev!.prior) },
      { label: "Result per hive", cur: String(Math.round(result.cur / HIVES)), prior: String(Math.round(result.prior / HIVES)) },
    ],
  };
}

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------

const DEFAULT_TUPLE: Tuple = { scenario: "actual", year: "2026", structure: "lines" };

export function StatementWithFiltersDemo(): React.ReactElement {
  const [tuple, setTuple] = React.useState<Tuple>(DEFAULT_TUPLE);
  const [decimals, setDecimals] = React.useState(false);
  const [showKpis, setShowKpis] = React.useState(true);
  const [showZero, setShowZero] = React.useState(false);

  const { rows, result, kpis } = React.useMemo(() => computeStatement(tuple), [tuple]);
  // Figure values route through the baseline's `formatFigure` — the one figure
  // formatter. The View-menu "Show decimals" toggle maps to `decimals` (0 or 2);
  // the currency kind's default (2) is what "Show decimals" ON renders.
  const fmt = (v: number) => formatFigure(v, "currency", { decimals: decimals ? 2 : 0 });
  const prior = String(Number(tuple.year) - 1);

  const selector = <K extends keyof Tuple>(
    key: K,
    label: string,
    options: Array<[Tuple[K], string]>,
    width: string,
  ) => (
    <Select value={tuple[key]} onValueChange={(v) => setTuple((t) => ({ ...t, [key]: v }))}>
      <SelectTrigger label={label} className={width}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([value, text]) => (
          <SelectItem key={value} value={value}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-5">
      <p className="max-w-prose text-sm text-muted-foreground">
        The <strong>statement-with-filters</strong> archetype — one read-only
        statement in one frame. <strong>Scenario</strong>, <strong>Year</strong>{" "}
        and <strong>Structure</strong> in the toolbar re-scope the whole
        statement; the <strong>View</strong> menu only changes how it shows
        (decimals, KPI rows, zero rows); Export and PDF are the document verbs
        next to the title. Narrower than 768px the band collapses to one row
        and the selectors move into the <strong>Filter</strong> sheet.
      </p>

      <StatementWithFiltersShell
        title="Profit & Loss"
        subtitle={`Beekeeping club · ${tuple.scenario === "actual" ? "Actual" : "Budget"} ${tuple.year}`}
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </>
        }
        toolbar={
          <>
            {selector("scenario", "Scenario", [["actual", "Actual"], ["budget", "Budget"]], "w-44")}
            {selector("year", "Year", [["2025", "2025"], ["2026", "2026"]], "w-36")}
            {selector("structure", "Structure", [["lines", "By line"], ["sections", "By section"]], "w-52")}
          </>
        }
        filterCount={(Object.keys(DEFAULT_TUPLE) as Array<keyof Tuple>).filter((k) => tuple[k] !== DEFAULT_TUPLE[k]).length}
        filterSummary={`${tuple.scenario === "actual" ? "Actual" : "Budget"} · ${tuple.year} · ${tuple.structure === "lines" ? "By line" : "By section"}`}
        onResetFilters={() => setTuple(DEFAULT_TUPLE)}
        viewOptions={
          <>
            <DropdownMenuCheckboxItem checked={decimals} onCheckedChange={(v) => setDecimals(v === true)}>
              Show decimals
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showKpis} onCheckedChange={(v) => setShowKpis(v === true)}>
              Show KPI rows
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showZero} onCheckedChange={(v) => setShowZero(v === true)}>
              Show zero rows
            </DropdownMenuCheckboxItem>
          </>
        }
      >
        <StatementTable columns={["Line", tuple.year, prior, "Δ"]}>
          {rows
            .filter((r) => r.section || showZero || r.cur !== 0 || r.prior !== 0)
            .map((r) =>
              r.section ? (
                <StatementRow key={r.label} label={r.label} cells={[]} section />
              ) : (
                <StatementRow
                  key={r.label}
                  label={r.label}
                  indent={tuple.structure === "lines" ? 1 : 0}
                  cells={[fmt(r.cur), fmt(r.prior), fmt(r.cur - r.prior)]}
                />
              ),
            )}
          <StatementTotalRow
            label="Result"
            cells={[fmt(result.cur), fmt(result.prior), fmt(result.cur - result.prior)]}
          />
          {showKpis &&
            kpis.map((k) => (
              <StatementRow key={k.label} label={k.label} cells={[k.cur, k.prior, ""]} />
            ))}
        </StatementTable>
      </StatementWithFiltersShell>
    </div>
  );
}

StatementWithFiltersDemo.displayName = "StatementWithFiltersDemo";
