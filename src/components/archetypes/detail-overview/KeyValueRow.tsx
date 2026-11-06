"use client";
import * as React from "react";
import { CircleDashed, TriangleAlert } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useTouchTarget } from "../../ui/toolbar-band";

/**
 * Where a value came from. Every field is pre-formatted text — the row never
 * formats dates or costs. `source` is the chip text; the rest shows on demand.
 */
export type KeyValueProvenance = {
  /** Source label, e.g. a register or a website. */
  source: string;
  /** Record id inside the source. */
  id?: string;
  /** Date the value was read, pre-formatted. */
  date?: string;
  /** Channel / connector that fetched it. */
  via?: string;
  /** What the lookup cost, pre-formatted. */
  cost?: string;
};

/** One competing claim for a contested field: a value plus where it came from. */
export type KeyValueClaim = {
  value: React.ReactNode;
  provenance?: KeyValueProvenance;
};

export type KeyValueRowLabels = {
  /** Missing-state text when no reason is given. Default "Missing". */
  missing?: string;
  /** Conflict-marker text. Default "Contested". */
  contested?: string;
  /** Accessible name prefix of the source chip. Default "Source". */
  source?: string;
};

export type KeyValueRowProps = {
  /**
   * Field label. Rendered as `<dt>` at `text-[13px] text-muted-foreground`
   * (ledger body scale), anchored left.
   */
  label: React.ReactNode;
  /**
   * Field value. Rendered as `<dd>` at `text-[13px]` in the house sans,
   * anchored right with `tabular-nums` (aligned digits for figures; inert on
   * text, so names, badges and sentences render as plain sans — ADR-0009). When the underlying
   * data is unavailable, pass the
   * em-dash string `"—"` — the primitive does NOT auto-render a placeholder
   * for falsy values. When the value was never captured, omit it and pass
   * `missing` instead.
   *
   * Consumers may pre-format the value (e.g. `fmtCurrency(amount)`,
   * `fmtDate(at)`); the row never formats. Chip strips (categorical master
   * data) pass a right-justified flex span:
   * `<span className="flex flex-wrap justify-end gap-1.5">…badges…</span>`.
   */
  value?: React.ReactNode;
  /**
   * When `true`, switch to a stacked layout — label on top, value below at
   * `text-sm leading-relaxed` (prose stays at `text-sm` for readability, per
   * the house type scale). Use for long free-text fields (notes, reasons)
   * that would fight the right-aligned column.
   */
  block?: boolean;
  /**
   * Where the value came from. Renders a compact source chip beside the value
   * (no inline source line); activating the chip (click, tap, Enter/Space)
   * opens the full provenance in a popover.
   */
  provenance?: KeyValueProvenance;
  /**
   * Competing claims that lost to `value`. When non-empty, a conflict marker
   * sits beside the value; activating it lists every claim — the winning one
   * (`value` + `provenance`) first — with its source.
   */
  alternatives?: KeyValueClaim[];
  /**
   * The field was never captured (distinct from `"—"`, which means the data
   * does not exist). Replaces `value` with a dashed, muted missing marker;
   * pass `{ reason }` to say why (e.g. "not enriched yet").
   */
  missing?: boolean | { reason?: string };
  /** Copy for the new affordances (defaults are English). */
  labels?: KeyValueRowLabels;
  className?: string;
};

const chip =
  "inline-flex max-w-[12rem] items-center gap-1 rounded-full px-1.5 text-[11px] leading-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ProvenanceLines({ p }: { p: KeyValueProvenance }): React.ReactElement {
  const meta = [p.date, p.via, p.cost].filter(Boolean).join(" · ");
  return (
    <>
      <span className="block font-medium text-foreground">
        {p.source}
        {p.id && <span className="font-normal text-muted-foreground"> ({p.id})</span>}
      </span>
      {meta && <span className="block text-xs text-muted-foreground">{meta}</span>}
    </>
  );
}

const popover =
  "w-auto max-w-[min(20rem,calc(100vw-2rem))] p-3 text-left text-[13px] [overflow-wrap:anywhere]";

/**
 * KeyValueRow — one ruled row inside a `<KeyValueList>`.
 *
 * Default layout (stacked below `md`, label above a left-aligned value; single line from `md` up):
 *   [label (13px muted)]             [value (13px mono medium, right, tabular)]
 *
 * Block layout (`block`):
 *   [label (sm muted)]
 *   [value (sm, leading-relaxed)]
 *
 * Enrichment affordances (`provenance`, `alternatives`, `missing`) wrap the
 * value in a flex line with a source chip and/or conflict marker; without
 * them the markup is the plain value.
 */
export function KeyValueRow({
  label,
  value,
  block,
  provenance,
  alternatives,
  missing,
  labels,
  className,
}: KeyValueRowProps): React.ReactElement {
  const contested = alternatives && alternatives.length > 0;
  // touch density: a 44pt hit area around the small chip / marker
  const touch = useTouchTarget();
  const body =
    provenance || contested || missing ? (
      <span
        className={cn(
          "inline-flex max-w-full flex-wrap items-baseline gap-1.5",
          !block && "md:justify-end",
        )}
      >
        {missing ? (
          <span className="inline-flex min-w-0 items-baseline gap-1 rounded border border-dashed border-border px-1.5 text-[12px] italic text-muted-foreground">
            <CircleDashed aria-hidden className="size-3 shrink-0 self-center" />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {(typeof missing === "object" && missing.reason) ||
                labels?.missing ||
                "Missing"}
            </span>
          </span>
        ) : (
          <span className="min-w-0 [overflow-wrap:anywhere]">{value}</span>
        )}
        {provenance && (
          <Popover>
            <PopoverTrigger
              aria-label={`${labels?.source ?? "Source"}: ${provenance.source}`}
              className={cn(chip, touch, "border border-border font-sans text-muted-foreground hover:text-foreground")}
            >
              <span className="truncate">{provenance.source}</span>
            </PopoverTrigger>
            <PopoverContent align="end" className={popover}>
              <ProvenanceLines p={provenance} />
            </PopoverContent>
          </Popover>
        )}
        {contested && (
          <Popover>
            <PopoverTrigger
              aria-label={`${labels?.contested ?? "Contested"} (${alternatives.length + 1})`}
              className={cn(chip, touch, "bg-status-warning-bg font-sans font-medium text-status-warning-fg")}
            >
              <TriangleAlert aria-hidden className="size-3 shrink-0" />
              {labels?.contested ?? "Contested"}
            </PopoverTrigger>
            <PopoverContent align="end" className={popover}>
              <ul className="divide-y divide-border">
                {[{ value, provenance }, ...alternatives].map((c, i) => (
                  <li key={i} className="py-2 first:pt-0 last:pb-0">
                    <span className="block text-foreground">{c.value}</span>
                    {c.provenance && (
                      <span className="mt-0.5 block text-xs">
                        <ProvenanceLines p={c.provenance} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}
      </span>
    ) : (
      value
    );

  if (block) {
    return (
      <div className={cn("px-5 py-2.5", className)}>
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm leading-relaxed text-foreground">
          {body}
        </dd>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-5 py-2.5 md:flex-row md:items-baseline md:justify-between md:gap-6",
        className,
      )}
    >
      <dt className="md:shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-left text-[13px] break-words md:text-right text-foreground tabular-nums">
        {body}
      </dd>
    </div>
  );
}

KeyValueRow.displayName = "KeyValueRow";
