import { formatFigure, type FigureKind } from "../../../lib/format";

/**
 * One money column of the ledger, declared per document type (a sales order
 * declares Charged · Cost; an offer Their ask · Market · Max ·
 * Our offer · Profit). `priority` orders which columns stay inline when the
 * ledger narrows: 1 is kept longest, higher numbers move first into each row's
 * second line. The column order on screen is the declaration order.
 * Per-line Profit/Margin columns are optional: a sales order shows the result
 * once, as the ledger's `result` line.
 */
export type LedgerColumn = {
  key: string;
  label: string;
  kind: FigureKind;
  priority: number;
  /** In the editable mode, this column's cells are inputs. */
  editable?: boolean;
  /** Field lock: the column can't be edited, for a stated reason. */
  lock?: Lock;
};

/** One ledger line: a set, a position, a fee. `values` is keyed by column `key`. */
export type LedgerRow = {
  id: string;
  label: string;
  /** Compact second identifier under the label (a set number, a SKU). */
  detail?: string;
  values: Record<string, number | null | undefined>;
  /**
   * Cell locks, keyed by column `key`: this row's cell in that column can't be
   * edited, for a stated reason (a cost taken from the stock lot). Same `Lock`
   * and treatment as `LedgerColumn.lock`, scoped to one cell.
   */
  locks?: Record<string, Lock>;
  /** With the ledger's `onRemoveRow`: `false` keeps this line (an item line that can't be dropped). */
  removable?: boolean;
  /** This line's own actions (Open lot, Split), rendered with the line. */
  actions?: LinkAction[];
};

/**
 * The ledger's result line, after the totals: one labelled figure across the
 * amount columns, with a sub-line (a sales order's Profit "39,99 €" with
 * "22,7 % margin · target 20 %"). Its tone follows the sign: a profit is
 * positive, a loss negative — nothing for the call site to choose.
 */
export type LedgerResult = {
  label: string;
  value: number;
  kind: FigureKind;
  detail?: string;
};

/** A way out of a lock, or any link the shell renders: a route or a handler. */
export type LinkAction = { label: string; href?: string; onSelect?: () => void };

/** A lock on a slot or a single field: why it can't change here, and where it can. */
export type Lock = { reason: string; wayOut?: LinkAction };

/** Smallest width of the row label column and of one figure column, in px. */
export const LABEL_MIN = 160;
export const COLUMN_MIN = 112; // the inline column's fixed width

/**
 * Splits the declared columns into those that fit inline at `width` and those
 * that move to each row's second line. Columns are taken by ascending
 * `priority` (ties: declaration order) while they fit; at least one column
 * always stays inline. Both lists keep the declaration order.
 */
export function fitColumns(
  columns: readonly LedgerColumn[],
  width: number,
): { inline: LedgerColumn[]; overflow: LedgerColumn[] } {
  const room = Math.max(1, Math.floor((width - LABEL_MIN) / COLUMN_MIN));
  const keep = new Set(
    columns
      .map((c, i) => ({ c, i }))
      .sort((a, b) => a.c.priority - b.c.priority || a.i - b.i)
      .slice(0, room)
      .map(({ c }) => c.key),
  );
  return {
    inline: columns.filter((c) => keep.has(c.key)),
    overflow: columns.filter((c) => !keep.has(c.key)),
  };
}

/**
 * Parses a figure typed in `locale` ("1.234,5" in de-DE, "1,234.5" in en-US).
 * Empty → null; anything that isn't a number → NaN.
 */
export function parseFigure(text: string, locale: string): number | null {
  // The locale's separators, read off a known figure: "1.234.567,5" → group ".", decimal ",".
  const probe = formatFigure(1234567.5, "count", { decimals: 1, locale });
  const decimal = probe.charAt(probe.length - 2);
  const group = probe.slice(0, -2).match(/\D/)?.[0] ?? (decimal === "," ? "." : ",");
  let raw = text.replace(/[\s  €$£%]/g, "").replace("−", "-");
  if (raw === "") return null;
  // A group separator is only ever followed by exactly three digits. A single
  // one that isn't ("195.5" typed into de-DE) was meant as the decimal point:
  // never strip it into a silent 10× amount.
  const parts = raw.split(group);
  if (!raw.includes(decimal) && parts.length === 2 && !/^\d{3}$/.test(parts[1]!)) raw = parts.join(decimal);
  const clean = raw.split(group).join("").replace(decimal, ".");
  return /^-?\d*\.?\d+$/.test(clean) ? Number(clean) : NaN;
}
