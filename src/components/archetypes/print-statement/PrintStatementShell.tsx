"use client";
import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "../../ui/button";
import { StateView } from "../../ui/state-view";
import { useLabels } from "../../../lib/labels";

/** The `@page` size each `pageSize` emits; the margin is fixed. */
const PAGE_SIZE = {
  "a4-landscape": "A4 landscape",
  "a4-portrait": "A4 portrait",
} as const;

/** The page margin every printed statement uses. */
export const PRINT_PAGE_MARGIN = "12mm";

/** Delay between the document's first ready render and the print dialog —
 *  long enough for the tables to paint, short enough to read as instant. */
export const PRINT_DELAY_MS = 300;

export type PrintStatementShellProps = {
  /** The document's title, rendered once as the page's h1 above the body. */
  title: React.ReactNode;
  /** One muted line under the title: entity, scenario, period. */
  subtitle?: React.ReactNode;
  /** A smaller meta line under the subtitle, e.g. "Generated on …". */
  meta?: React.ReactNode;
  /** The statement body: wide multi-column tables, banners, check strips.
   *  Unbounded — it takes the full width of the route. */
  children?: React.ReactNode;
  /** While true, a loading state replaces the whole document (no print action). */
  isLoading?: boolean;
  /** When set, an error state replaces the whole document (no print action). */
  error?: unknown;
  /** Adds a retry button to the error state. */
  onRetry?: () => void;
  /** The printed page size, emitted as the `@page` rule. Defaults to `"a4-landscape"`. */
  pageSize?: keyof typeof PAGE_SIZE;
  /** Opens the print dialog once, `PRINT_DELAY_MS` after the document first
   *  renders ready. Defaults to `true`; pass `false` for a preview. */
  autoPrint?: boolean;
};

/**
 * PrintStatementShell — the print-only statement page
 * (docs/archetypes/print-statement.md). Renders no app chrome: a screen-only
 * toolbar (hint + print button, hidden under print media), the document header
 * and the unbounded body. Owns the `@page` rule, header rows repeating on every
 * printed page, and the once-only auto print. Loading and error replace the
 * whole document, so a partial statement is never offered for print.
 */
export function PrintStatementShell({
  title,
  subtitle,
  meta,
  children,
  isLoading = false,
  error,
  onRetry,
  pageSize = "a4-landscape",
  autoPrint = true,
}: PrintStatementShellProps): React.ReactElement {
  const L = useLabels();
  const ready = !isLoading && error == null;

  const printed = React.useRef(false);
  React.useEffect(() => {
    if (!autoPrint || !ready || printed.current) return;
    printed.current = true;
    const t = setTimeout(() => window.print(), PRINT_DELAY_MS);
    return () => clearTimeout(t);
  }, [autoPrint, ready]);

  if (!ready) {
    return (
      <div data-slot="print-statement" className="p-6">
        {isLoading ? (
          <StateView variant="loading" />
        ) : (
          <StateView variant="error" error={error} onRetry={onRetry} />
        )}
      </div>
    );
  }

  return (
    <div data-slot="print-statement" className="min-w-0 bg-background text-foreground">
      <style>
        {`@page { size: ${PAGE_SIZE[pageSize]}; margin: ${PRINT_PAGE_MARGIN}; }
@media print {
  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  [data-slot="print-statement"] thead { display: table-header-group; }
  [data-slot="print-statement"] tr { break-inside: avoid; }
}`}
      </style>
      <div
        data-slot="print-toolbar"
        className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted px-6 py-3 print:hidden"
      >
        <p className="text-sm text-muted-foreground">{L.printHint}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
          <Printer aria-hidden />
          {L.printAction}
        </Button>
      </div>
      <div className="p-6 print:p-0">
        <header className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          {meta ? <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p> : null}
        </header>
        <div className="overflow-x-auto print:overflow-visible">{children}</div>
      </div>
    </div>
  );
}

PrintStatementShell.displayName = "PrintStatementShell";
