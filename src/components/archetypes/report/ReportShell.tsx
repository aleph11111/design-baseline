import * as React from "react";
import { cn } from "@/lib/utils";
import { OVERLINE_CLASS } from "@/components/layout/overline";
import {
  useHeaderFill,
  headerFillClasses,
  type HeaderFill,
} from "@/components/layout/headerFill";

export type ReportShellProps = {
  /**
   * Overline kicker above the title — the document class (e.g. "Beleg",
   * "Invoice", "Quote"). Rendered via the shared `OVERLINE_CLASS` so the
   * uppercase-label signature never drifts.
   */
  kicker?: React.ReactNode;
  /**
   * The document title — the human identifier of the document (e.g.
   * "Rechnung RE-2025-0417"). Rendered as `text-lg font-semibold`. The
   * caller wraps any embedded ID figure in `font-mono` itself.
   */
  title: React.ReactNode;
  /**
   * Optional right-aligned actions row in the header bar. Pass `<Button>`s
   * (size="sm"): secondary = `variant="outline"`, primary = default. Actions
   * MUST NOT be mixed into the title — pass them here.
   */
  actions?: React.ReactNode;
  /**
   * Document body — the parties row, line-item table, and totals stack. The
   * shell pads it (`p-6`); the body composes its own internal rhythm.
   */
  children: React.ReactNode;
  /**
   * Surface width. A formal document is bounded, never full-bleed.
   * - `"md"` (default): `max-w-3xl` (~the canonical ~700px document column).
   * - `"sm"`: `max-w-xl` — a compact receipt / short Beleg.
   * - `"lg"`: `max-w-4xl` — a wide statement with many columns.
   */
  width?: "sm" | "md" | "lg";
  /**
   * Header treatment (House Style B). Defaults to the project's
   * `HeaderFillContext` ("solid" — accent-filled — unless overridden).
   */
  headerFill?: HeaderFill;
  className?: string;
};

const WIDTH: Record<NonNullable<ReportShellProps["width"]>, string> = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
};

/**
 * ReportShell — the bounded document surface for the R (report) archetype: a
 * formal document / invoice / Beleg rendered as a single self-contained card.
 *
 * Shape:
 *   ┌─────────────────────────────────────────────┐
 *   │ KICKER                              [actions] │  ← header bar (border-b)
 *   │ Title                                         │
 *   ├─────────────────────────────────────────────┤
 *   │ (padded body — parties · line items · totals) │
 *   └─────────────────────────────────────────────┘
 *
 * House style B: flat bounded card (`rounded-lg border bg-card`, no shadow),
 * faint internal hairline under the header. Token-pure — the document carries
 * no literal colors; the accent stays the donor neutral default. The body is
 * caller-composed (parties row, `ReportLineTable`-shaped grid, totals stack);
 * the shell owns only the surface + header bar contract so the document frame
 * never drifts between apps.
 */
export function ReportShell({
  kicker,
  title,
  actions,
  children,
  width = "md",
  headerFill,
  className,
}: ReportShellProps): React.ReactElement {
  const hfc = headerFillClasses(useHeaderFill(headerFill));
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card",
        WIDTH[width],
        className,
      )}
    >
      <div
        className={cn(
          "flex items-start justify-between gap-5 px-5 py-4",
          hfc.bar,
        )}
      >
        <div className="min-w-0">
          {kicker ? (
            <div className={cn(OVERLINE_CLASS, "mb-1", hfc.kicker)}>{kicker}</div>
          ) : null}
          <div
            className={cn(
              "text-lg font-semibold leading-tight text-foreground",
              hfc.title,
            )}
          >
            {title}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

ReportShell.displayName = "ReportShell";
