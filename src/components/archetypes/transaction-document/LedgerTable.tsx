"use client";
import * as React from "react";
import { CellInput } from "../../ui/cell-input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../../ui/table";
import { formatFigure } from "../../../lib/format";
import { useLabels } from "../../../lib/labels";
import { fitColumns, parseFigure, type LedgerColumn, type LedgerRow } from "./ledger";
import { LockNote } from "./parts";

export type LedgerTableProps = {
  columns: LedgerColumn[];
  rows: LedgerRow[];
  /** Total line(s) under the rows, e.g. one "Total". */
  totals?: LedgerRow[];
  /** Editable mode: set to make `editable` columns inputs (unless locked). */
  onCellChange?: (rowId: string, columnKey: string, value: number | null) => void;
  /** The whole ledger is locked: read-only, with the reason. */
  locked?: boolean;
  locale: string;
};

/** Width of the ledger's own box; Infinity until measured (and in jsdom). */
function useWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = React.useState(Infinity);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/**
 * LedgerTable — the one money table of a transaction document. Columns that
 * don't fit inline (by `priority`) render as a second line inside each row,
 * so the ledger never scrolls sideways: on a phone a line is its label and
 * first-priority amount, then the remaining columns underneath.
 */
export function LedgerTable({ columns, rows, totals = [], onCellChange, locked = false, locale }: LedgerTableProps): React.ReactElement {
  const L = useLabels();
  const ref = React.useRef<HTMLDivElement>(null);
  const { inline, overflow } = fitColumns(columns, useWidth(ref));
  const canEdit = (c: LedgerColumn) => !locked && !!onCellChange && !!c.editable && !c.lock;

  const value = (row: LedgerRow, c: LedgerColumn, editable: boolean) =>
    editable ? (
      <FigureInput
        value={row.values[c.key] ?? null}
        kind={c.kind}
        locale={locale}
        label={`${c.label} ${row.label}`}
        onCommit={(v) => onCellChange!(row.id, c.key, v)}
      />
    ) : (
      formatFigure(row.values[c.key], c.kind, { locale })
    );

  const line = (row: LedgerRow, total: boolean) => (
    <TableRow key={row.id} data-slot="td-ledger-row" className={total ? "font-medium" : undefined}>
      <TableCell className="min-w-0 align-top whitespace-normal">
        <div className="break-words">{row.label}</div>
        {row.detail ? <div className="text-xs text-muted-foreground">{row.detail}</div> : null}
        {overflow.length > 0 ? (
          <dl data-slot="td-ledger-more" className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {overflow.map((c) => (
              <div key={c.key} className="flex items-center gap-1">
                <dt>{c.label}</dt>
                <dd className="tabular-nums text-foreground">{value(row, c, !total && canEdit(c))}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </TableCell>
      {inline.map((c) => (
        <TableCell key={c.key} className="align-top text-right tabular-nums">
          {value(row, c, !total && canEdit(c))}
        </TableCell>
      ))}
    </TableRow>
  );

  const fieldLocks = columns.filter((c) => c.lock && onCellChange && c.editable && !locked);
  return (
    <div ref={ref} data-slot="td-ledger-table" className="min-w-0">
      {fieldLocks.map((c) => (
        <LockNote key={c.key} lock={c.lock!} field={c.label} />
      ))}
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>{L.ledgerItem}</TableHead>
            {inline.map((c) => (
              <TableHead key={c.key} className="w-28 text-right">
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{rows.map((r) => line(r, false))}</TableBody>
        {totals.length > 0 ? <TableFooter>{totals.map((r) => line(r, true))}</TableFooter> : null}
      </Table>
    </div>
  );
}

/** An editable figure cell: shows the locale-formatted number, commits on blur / Enter. */
function FigureInput({
  value,
  kind,
  locale,
  label,
  onCommit,
}: {
  value: number | null;
  kind: LedgerColumn["kind"];
  locale: string;
  label: string;
  onCommit: (value: number | null) => void;
}): React.ReactElement {
  const shown = value == null ? "" : formatFigure(value, "count", { decimals: kind === "count" ? 0 : 2, locale });
  const [draft, setDraft] = React.useState<string | null>(null);
  const parsed = draft == null ? value : parseFigure(draft, locale);
  const invalid = parsed !== null && Number.isNaN(parsed);
  const commit = () => {
    if (draft == null || invalid) return; // an invalid draft stays, marked, until fixed or Escape
    if (parsed !== value) onCommit(parsed);
    setDraft(null);
  };
  return (
    <CellInput
      inputMode="decimal"
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={draft ?? shown}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setDraft(null);
      }}
      className="min-w-16 border border-input text-right tabular-nums max-md:min-h-11"
    />
  );
}
