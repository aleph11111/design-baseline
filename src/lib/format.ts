/**
 * formatFigure — the baseline's one figure formatter.
 *
 * The baseline owns how a figure *looks* (ADR-0009: Inter, tabular-nums, regular
 * weight; the table primitives right-align numeric columns) and, with this, what it
 * says. Value slots take `React.ReactNode`, so before `formatFigure` every
 * consumer formatted its own numbers with ad-hoc `Intl.NumberFormat` / `toFixed`
 * call sites — six independent percentage formatters in a single consumer app,
 * two coexisting value scales (percent points vs fractions) with no type telling
 * them apart. Figures now go through one helper whose *scale* is explicit in the
 * kind: `percent` takes percent points (47 → `47,0 %`), `fraction` takes 0–1
 * (0.47 → `47,0 %`); the scale is never inferred.
 *
 * Domain mapping stays in the consumer (e.g. a BWA `display_format` → `kind`);
 * the baseline ships only the generic kinds. Locale defaults to `de-DE` (the
 * fleet is German today); the default keeps call sites short, the locale is a
 * parameter, not a hardcode.
 *
 * House formatting: German output (`1.234,56 €`, `47,3 %`), a no-break space
 * (U+00A0) before `%` as de-DE `Intl` percent style emits, a real U+2212 minus
 * sign `−` for negatives (de-DE `Intl` emits an ASCII hyphen), and `—` for
 * null / undefined.
 */

/** The kinds of figure the baseline formats. Scale is part of the kind. */
export type FigureKind =
  | "currency"
  | "percent"
  | "fraction"
  | "ratio"
  | "count";

/** Options for `formatFigure`. Every field optional. */
export interface FigureOptions {
  /**
   * Decimal digits to show. When omitted the kind's default applies
   * (`DEFAULT_DECIMALS`) — the house scale for each figure kind.
   */
  decimals?: number;
  /** Show a sign on non-negative values too (`+47,3 %`). Off by default. */
  signed?: boolean;
  /** BCP-47 tag. Defaults to `de-DE`. */
  locale?: string;
  /** ISO 4217 code for `currency`. Defaults to `EUR`. */
  currency?: string;
}

const DEFAULT_LOCALE = "de-DE";
/**
 * Per-kind default decimal scale, and what the ticket pins: `percent`/`fraction`
 * display one decimal (`47,3 %`), `currency` two (`1.234,56 €`), `count` and
 * `ratio` zero. Rounding at display is the house style's job, not the caller's —
 * the caller passes the raw number and the kind's scale shapes it.
 */
const DEFAULT_DECIMALS: Record<FigureKind, number> = {
  currency: 2,
  percent: 1,
  fraction: 1,
  ratio: 0,
  count: 0,
};
/** A missing value renders as an em dash — the house style for an empty figure cell. */
const PLACEHOLDER = "—";
/** de-DE `Intl` emits an ASCII hyphen for negatives; the house face uses a U+2212 minus. */
const ASCII_MINUS = "-";
const MINUS_SIGN = "\u2212";

/**
 * Format a figure for display. `kind` is REQUIRED — the scale is part of the
 * kind, never inferred: an omitted `kind` is a type error, so a consumer cannot
 * ship an omitted scale as money (the root defect this ticket exists to kill).
 *
 * ```ts
 * formatFigure(1234.56, "currency")        // "1.234,56 €"  (de-DE)
 * formatFigure(47.3, "percent")            // "47,3 %"
 * formatFigure(0.473, "fraction")          // "47,3 %"  (0–1 scale)
 * formatFigure(null, "currency")           // "—"
 * formatFigure(-47.3, "percent", { signed: true }) // "−47,3 %"
 * ```
 *
 * - `value` null / undefined → `—`.
 * - `percent` takes percent points; `fraction` takes 0–1 (×100) — both render the
 *   same `47,0 %` for 47 / 0.47, so the scale is explicit, never guessed.
 * - `ratio` renders a plain number for a computed ratio (×100, no `%`).
 */
export function formatFigure(
  value: number | null | undefined,
  kind: FigureKind,
  opts: FigureOptions = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return PLACEHOLDER;
  }

  const {
    decimals = DEFAULT_DECIMALS[kind],
    signed = false,
    locale = DEFAULT_LOCALE,
    currency = "EUR",
  } = opts;

  const options: Intl.NumberFormatOptions = {
    // `Intl`'s own "auto" precision (de-DE percent renders at 0 decimals) is not
    // the house scale — the kind's default (or the caller's override) pins it.
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...(signed ? { signDisplay: "always" as const } : {}),
  };

  let formatted: string;
  if (kind === "currency") {
    formatted = new Intl.NumberFormat(locale, {
      ...options,
      style: "currency",
      currency,
    }).format(value);
  } else if (kind === "percent" || kind === "fraction") {
    // `Intl` percent style always renders x×100 with a `%`, so it takes the 0–1
    // scale: `fraction` (0.47) passes through; `percent` (percent points, 47) is
    // divided back to 0.47 first. Both render `47,0 %`.
    formatted = new Intl.NumberFormat(locale, {
      ...options,
      style: "percent",
    }).format(kind === "percent" ? value / 100 : value);
  } else if (kind === "ratio") {
    formatted = new Intl.NumberFormat(locale, options).format(value * 100);
  } else {
    // count
    formatted = new Intl.NumberFormat(locale, options).format(value);
  }

  // de-DE `Intl` renders a leading ASCII hyphen for negatives; the house face uses
  // a U+2212 minus. `signDisplay: always` prepends `+` (no `-` to map) or a `-` the
  // same substitution turns into `−`, so this is a no-op for non-negatives.
  return formatted.replace(ASCII_MINUS, MINUS_SIGN);
}
