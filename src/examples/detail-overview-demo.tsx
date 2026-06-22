/**
 * detail-overview-demo.tsx
 *
 * Sandbox demo for the C (detail-overview) archetype — the canonical
 * money-dense **Command Rail** page (the shape the rail + unified surface were
 * built for). Domain: a building/renovation project — deliberately far from
 * CRM/MSP nouns (no companies, contacts, opportunities, deals, devices), so it
 * still proves the primitives don't leak any source project's domain.
 *
 * Exercises (the full rail vocabulary, mirroring the reference mockup):
 *   - DetailOverviewShell `layout="rail"` + `surface="unified"` — the cohesive
 *     framed surface: a sticky, chromeless, hairline-divided rail beside a
 *     carded main column. Toggle both axes live.
 *   - summary (rail) = a STACK of hairline-divided sections: status badges →
 *     `MetricList` financial readout (headline figures + "show more" disclosure)
 *     → contractor identity → `KeyValueList` facts.
 *   - content (main) = `ProgressTracker` lifecycle → a line-item cost table with
 *     a subtotal footer → an inline-edit notes section (the editability axis).
 *   - references (rail foot) = documents.
 *   - House style B (Plex Ledger): every figure renders mono/tabular via the
 *     primitives (StatTile/KeyValueRow/MetricRow already carry `font-mono`); the
 *     table's figure cells opt in explicitly.
 *
 * Types are LOCAL with zero reference to any source project's domain.
 */

import * as React from "react";
import { FileText, MoreHorizontal, PanelLeft, Rows3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { IconAvatar } from "@/components/ui/icon-avatar";
import {
  DetailOverviewShell,
  DetailOverviewHeader,
  DetailSection,
  KeyValueList,
  KeyValueRow,
  MetricList,
  MetricRow,
  ProgressTracker,
  type ProgressStep,
} from "@/components/archetypes/detail-overview";

// ---------------------------------------------------------------------------
// Domain — a building / renovation project
// ---------------------------------------------------------------------------

type LineItem = {
  id: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number; // whole GBP
};

type RenovationProject = {
  id: string;
  ref: string;
  title: string;
  status: string;
  onBudget: boolean;
  contractValue: number;
  spent: number;
  spentBreakdown: { labour: number; materials: number; permitsFees: number };
  contractor: { name: string; trade: string; initials: string };
  lead: string;
  startedOn: string; // ISO
  targetOn: string; // ISO
  permitRef: string;
  phases: ProgressStep[];
  lineItems: LineItem[];
  documents: { name: string; kind: string }[];
  notes: string;
};

// ---------------------------------------------------------------------------
// Local formatters (pre-format values; primitives never format)
// ---------------------------------------------------------------------------

function fmtGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const PROJECT: RenovationProject = {
  id: "proj-0142",
  ref: "LC-0142",
  title: "Loft Conversion — 14 Elm Row",
  status: "In build",
  onBudget: true,
  contractValue: 48200,
  spent: 31460,
  spentBreakdown: { labour: 18900, materials: 9240, permitsFees: 3320 },
  contractor: {
    name: "Hartley & Voss Builders",
    trade: "General contractor · 24 staff",
    initials: "HV",
  },
  lead: "Dana Okafor",
  startedOn: "2026-03-02",
  targetOn: "2026-08-14",
  permitRef: "BC-2026-0884",
  phases: [
    { label: "Survey", meta: "2 Mar", state: "done" },
    { label: "Design", meta: "19 Mar", state: "done" },
    { label: "Permits", meta: "24 Apr", state: "done" },
    { label: "Build", meta: "In progress", state: "current" },
    { label: "Handover", meta: "est. 14 Aug", state: "pending" },
  ],
  lineItems: [
    { id: "li-1", name: "Structural steelwork", unit: "RSJ beams", qty: 2, unitPrice: 1850 },
    { id: "li-2", name: "First-fix electrical", unit: "circuits + points", qty: 38, unitPrice: 45 },
    { id: "li-3", name: "Plumbing & heating", unit: "full system", qty: 1, unitPrice: 6800 },
    { id: "li-4", name: "Plastering", unit: "per m²", qty: 64, unitPrice: 22 },
    { id: "li-5", name: "Joinery & fit-out", unit: "fixed package", qty: 1, unitPrice: 8400 },
  ],
  documents: [
    { name: "Structural survey.pdf", kind: "PDF" },
    { name: "Building permit.pdf", kind: "PDF" },
    { name: "Fixed-price quote.pdf", kind: "PDF" },
  ],
  notes:
    "Steel delivery slipped a week — Build phase still on track for the 14 Aug " +
    "handover. Party-wall sign-off received; awaiting the final electrical " +
    "inspection before the stairwell can be plastered.",
};

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------

export function DetailOverviewDemo(): React.ReactElement {
  const p = PROJECT;
  // Layout (v2.1) + Surface (v2.3) variants — default to the dense pairing.
  const [layout, setLayout] = React.useState<"vertical" | "rail">("rail");
  const [surface, setSurface] = React.useState<"separated" | "unified">("unified");
  // Editability variant (inline-edit): same DetailSection, value ↔ editor in place.
  const [editingNotes, setEditingNotes] = React.useState(false);
  const [notes, setNotes] = React.useState(PROJECT.notes);

  const subtotal = p.lineItems.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          The canonical money-dense record page. <strong>Layout</strong> (v2.1)
          pins identity in a sticky rail; <strong>Surface</strong> (v2.3)
          “unified” frames the whole record — chromeless hairline-divided rail
          beside carded main panels.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Detail-overview layout"
            value={layout}
            onValueChange={setLayout}
            options={[
              { value: "rail", label: "Command rail", icon: PanelLeft },
              { value: "vertical", label: "Vertical", icon: Rows3 },
            ]}
          />
          <SegmentedControl
            aria-label="Detail-overview surface"
            value={surface}
            onValueChange={setSurface}
            options={[
              { value: "unified", label: "Unified" },
              { value: "separated", label: "Separated" },
            ]}
          />
        </div>
      </div>

      {/* Muted mat — `surface="unified"` reads as one framed surface only when the
          page behind it is muted (the app does this via AppShell's `<main>` on
          bg-muted/30; the gallery has no AppShell, so the demo supplies it).
          The teal `--primary` override is hk-crm's brand, scoped to this surface:
          the donor default stays neutral slate; each app brings its own accent.
          Setting one token re-skins every primary action, accent figure, badge,
          and ProgressTracker dot — the whole point of token-driven theming. */}
      <div
        className="rounded-xl bg-muted/50 p-4 sm:p-6"
        style={
          {
            "--primary": "187 100% 25%",
            "--primary-foreground": "0 0% 100%",
            "--ring": "187 100% 25%",
          } as React.CSSProperties
        }
      >
        <DetailOverviewShell
          layout={layout}
          surface={surface}
          width="md"
          header={
            <DetailOverviewHeader
              title={p.title}
              subtitle={
                <>
                  <span>Renovations</span>
                  <span className="mx-2 text-border">·</span>
                  <span className="font-mono">{p.ref}</span>
                </>
              }
              actions={
                <>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <Button size="sm">Next phase →</Button>
                </>
              }
            />
          }
          summary={
            <>
              {/* Status — leads the rail (the identity column) */}
              <DetailSection>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{p.status}</Badge>
                  {p.onBudget && <Badge variant="success">On budget</Badge>}
                </div>
              </DetailSection>

              {/* Financials at a glance — MetricList with a disclosure */}
              <DetailSection title="Budget &amp; spend">
                <MetricList
                  more={
                    <>
                      <MetricRow label="Labour" value={fmtGBP(p.spentBreakdown.labour)} />
                      <MetricRow label="Materials" value={fmtGBP(p.spentBreakdown.materials)} />
                      <MetricRow label="Permits &amp; fees" value={fmtGBP(p.spentBreakdown.permitsFees)} />
                    </>
                  }
                >
                  <MetricRow
                    label="Contract value"
                    value={fmtGBP(p.contractValue)}
                    hint="fixed price, inc. VAT"
                    emphasis
                    accent
                  />
                  <MetricRow
                    label="Spent to date"
                    value={fmtGBP(p.spent)}
                    hint="65% of contract"
                    emphasis
                  />
                </MetricList>
              </DetailSection>

              {/* Contractor identity */}
              <DetailSection title="Contractor">
                <div className="flex items-center gap-3">
                  <IconAvatar size="md">{p.contractor.initials}</IconAvatar>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground">
                      {p.contractor.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.contractor.trade}
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Master-data facts */}
              <DetailSection title="Details" flush>
                <KeyValueList>
                  <KeyValueRow label="Project lead" value={p.lead} />
                  <KeyValueRow label="Started" value={fmtDate(p.startedOn)} />
                  <KeyValueRow label="Target handover" value={fmtDate(p.targetOn)} />
                  <KeyValueRow label="Permit ref" value={p.permitRef} />
                </KeyValueList>
              </DetailSection>
            </>
          }
          content={
            <>
              {/* Lifecycle */}
              <DetailSection title="Stage">
                <ProgressTracker steps={p.phases} />
              </DetailSection>

              {/* Line-item cost table with a subtotal footer */}
              <DetailSection
                title="Cost breakdown"
                actions={<Badge variant="secondary">{p.lineItems.length}</Badge>}
              >
                <div className="grid grid-cols-[1fr_2.5rem_5.5rem_6rem] gap-x-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                  <div>Item</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Unit</div>
                  <div className="text-right">Line total</div>
                </div>
                <div className="divide-y divide-border/70">
                  {p.lineItems.map((li) => (
                    <div
                      key={li.id}
                      className="grid grid-cols-[1fr_2.5rem_5.5rem_6rem] items-center gap-x-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-foreground">
                          {li.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{li.unit}</div>
                      </div>
                      <div className="text-center font-mono text-[13px] tabular-nums text-muted-foreground">
                        {li.qty}
                      </div>
                      <div className="text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {fmtGBP(li.unitPrice)}
                      </div>
                      <div className="text-right font-mono text-[13px] font-semibold tabular-nums text-foreground">
                        {fmtGBP(li.qty * li.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between border-t-2 border-border pt-3">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {fmtGBP(subtotal)}
                  </span>
                </div>
              </DetailSection>

              {/* Editability variant — inline-edit (read-only value ↔ in-place editor) */}
              <DetailSection
                title="Site notes"
                actions={
                  editingNotes ? (
                    <Button
                      size="sm"
                      className="-my-1.5 h-7 text-xs"
                      onClick={() => setEditingNotes(false)}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-my-1.5 h-7 text-xs"
                      onClick={() => setEditingNotes(true)}
                    >
                      Edit
                    </Button>
                  )
                }
              >
                {editingNotes ? (
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-foreground">{notes}</p>
                )}
              </DetailSection>
            </>
          }
          references={
            <DetailSection title="Documents">
              <ul className="space-y-2">
                {p.documents.map((d) => (
                  <li key={d.name}>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 rounded-md border border-border bg-card px-2.5 py-2 hover:bg-accent"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-[11.5px] font-medium text-foreground">
                        {d.name}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {d.kind}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </DetailSection>
          }
        />
      </div>
    </div>
  );
}

DetailOverviewDemo.displayName = "DetailOverviewDemo";
