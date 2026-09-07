import * as React from "react";
import { SurfaceFrame } from "../../layout/SurfaceFrame";
import type { SurfaceHeaderSlotProps } from "../../layout/SurfaceHeaderSlot";

export type ReportShellProps = Omit<SurfaceHeaderSlotProps, "title"> & {
  /**
   * The document title — the human identifier of the document (e.g.
   * "Rechnung RE-2025-0417"). Rendered as `text-lg font-semibold`. The
   * caller wraps any embedded ID figure in `font-mono` itself. Unlike the
   * other framed shells, a report's header is never optional.
   */
  title: React.ReactNode;
  /**
   * Document body — the parties row, line-item table, and totals stack. The
   * shell pads it (`p-6`); the body composes its own internal rhythm.
   */
  children: React.ReactNode;
  /**
   * Surface width. A formal document is bounded, never full-bleed. Derived
   * per the contract's width keying rule (docs/archetypes/report.md,
   * Structure section) from the document's shape — not a free choice:
   *   "sm" — a compact receipt / short Beleg
   *   "md" — the standard document column (default; the canonical line-item
   *          table reads at this width)
   *   "lg" — a wide statement with many columns
   * Defaults to "md".
   */
  width?: "sm" | "md" | "lg";
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
 * House style B: flat bounded card (no shadow) — the canonical `<SurfaceFrame>`
 * chrome, owned there so the document frame never drifts between apps — with a
 * faint internal hairline under the header. Token-pure — the document carries
 * no literal colors; the accent stays the donor neutral default. The body is
 * caller-composed (parties row, `ReportLineTable`-shaped grid, totals stack);
 * the shell owns only the surface + header bar contract.
 */
export function ReportShell({
  kicker,
  title,
  headerActions,
  children,
  width = "md",
}: ReportShellProps): React.ReactElement {
  return (
    <SurfaceFrame
      kicker={kicker}
      title={title}
      headerActions={headerActions}
      className={WIDTH[width]}
    >
      <div className="p-6">{children}</div>
    </SurfaceFrame>
  );
}

ReportShell.displayName = "ReportShell";
