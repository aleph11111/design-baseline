"use client";
import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { CellInput } from "../../ui/cell-input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../../ui/table";
import { formatFigure } from "../../../lib/format";
import { useLabels } from "../../../lib/labels";
import { fitColumns, parseFigure, type LedgerColumn, type LedgerResult, type LedgerRow } from "./ledger";
import { ActionLink, LockNote } from "./parts";

export type LedgerTableProps = {
  columns: LedgerColumn[];
  rows: LedgerRow[];
  /** Total line(s) under the rows, e.g. one "Total". */
  totals?: LedgerRow[];
  /** The result line after the totals (a sales order's Profit). */
  result?: LedgerResult;
  /** Editable mode: set to make `editable` columns inputs (unless locked). */
  onCellChange?: (rowId: string, columnKey: string, value: number | null) => void;
  /** The whole ledger is locked: read-only, with the reason. */
  locked?: boolean;
  /** Add a line: renders the ledger's own add control (hidden while locked). */
  onAddRow?: () => void;
  /** The add control's label; default "Add line". */
  addRowLabel?: string;
  /** Remove a line: each row (unless `removable: false`) gets a remove control. */
  onRemoveRow?: (rowId: string) => void;
  locale: string;
};

/** Width of the trailing remove column, in px (`w-14`: a 44px touch target plus padding). */
const REMOVE_COL = 56;

/** Width of the ledger's own box; Infinity until measured (and in jsdom). */
function useWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = React.useState(Infinity);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    setWidth(el.getBoundingClientRect().width || Infinity); // first paint already fitted
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
export function LedgerTable({
  columns,
  rows,
  totals = [],
  result,
  onCellChange,
  locked = false,
  onAddRow,
  addRowLabel,
  onRemoveRow,
  locale,
}: LedgerTableProps): React.ReactElement {
  const L = useLabels();
  const ref = React.useRef<HTMLDivElement>(null);
  const removing = !locked && !!onRemoveRow;
  const { inline, overflow } = fitColumns(columns, useWidth(ref) - (removing ? REMOVE_COL : 0));
  // A column is editable unless the ledger or the column is locked; a row lock then closes one cell.
  const columnEditable = (c: LedgerColumn) => !locked && !!onCellChange && !!c.editable && !c.lock;
  const canEdit = (c: LedgerColumn, row: LedgerRow) => columnEditable(c) && !row.locks?.[c.key];

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
        {total
          ? null
          : columns
              .filter((c) => row.locks?.[c.key] && columnEditable(c))
              .map((c) => <LockNote key={c.key} lock={row.locks![c.key]!} field={c.label} />)}
        {!total && row.actions?.length ? (
          <div data-slot="td-ledger-row-actions" className="mt-1 flex flex-wrap gap-x-3 text-sm">
            {row.actions.map((a) => (
              <ActionLink key={a.label} action={a} />
            ))}
          </div>
        ) : null}
        {overflow.length > 0 ? (
          <dl data-slot="td-ledger-more" className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {overflow.map((c) => (
              <div key={c.key} className="flex items-center gap-1">
                <dt>{c.label}</dt>
                <dd className="tabular-nums text-foreground">{value(row, c, !total && canEdit(c, row))}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </TableCell>
      {inline.map((c) => (
        <TableCell key={c.key} className="align-top text-right tabular-nums">
          {value(row, c, !total && canEdit(c, row))}
        </TableCell>
      ))}
      {removing ? (
        <TableCell className="px-1 align-top text-right">
          {!total && row.removable !== false ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={L.removeNamed(row.label)}
              onClick={() => onRemoveRow!(row.id)}
            >
              <Trash2 aria-hidden />
            </Button>
          ) : null}
        </TableCell>
      ) : null}
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
            {removing ? (
              <TableHead className="w-14">
                <span className="sr-only">{L.rowActions}</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>{rows.map((r) => line(r, false))}</TableBody>
        {totals.length > 0 || result ? (
          <TableFooter>
            {totals.map((r) => line(r, true))}
            {result ? <ResultLine result={result} span={inline.length + (removing ? 1 : 0)} locale={locale} /> : null}
          </TableFooter>
        ) : null}
      </Table>
      {onAddRow && !locked ? (
        <Button type="button" variant="ghost" size="sm" data-slot="td-ledger-add" className="mt-2" onClick={onAddRow}>
          <Plus aria-hidden />
          {addRowLabel ?? L.addLine}
        </Button>
      ) : null}
    </div>
  );
}

const RESULT_TONE = {
  positive: "bg-status-success-bg hover:bg-status-success-bg text-status-success-fg",
  negative: "bg-status-danger-bg hover:bg-status-danger-bg text-status-danger-fg",
} as const;

/** The ledger's one result line: label, then the figure and its sub-line across the amount columns. */
function ResultLine({ result, span, locale }: { result: LedgerResult; span: number; locale: string }) {
  const tone = result.value < 0 ? "negative" : "positive";
  return (
    <TableRow data-slot="td-ledger-result" data-tone={tone} className={RESULT_TONE[tone]}>
      {/* One cell across the row: the figure never squeezes into one fixed amount column (phone). */}
      <TableCell colSpan={span + 1} className="whitespace-normal">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-semibold">{result.label}</span>
          <span className="ml-auto text-right">
            <span className="text-lg font-bold tabular-nums whitespace-nowrap">{formatFigure(result.value, result.kind, { locale })}</span>
            {result.detail ? <span className="ml-2.5 text-sm">{result.detail}</span> : null}
          </span>
        </div>
      </TableCell>
    </TableRow>
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
