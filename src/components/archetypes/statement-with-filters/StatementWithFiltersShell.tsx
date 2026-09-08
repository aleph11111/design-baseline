"use client";
import * as React from "react";
import { SurfaceFrame } from "../../layout/SurfaceFrame";
import type { SurfaceHeaderSlotProps } from "../../layout/SurfaceHeaderSlot";

export type StatementWithFiltersShellProps = Omit<
  SurfaceHeaderSlotProps,
  "title"
> & {
  /**
   * Statement title — the human name of the computed statement
   * (e.g. "GuV 2026", "Cashflow", "Liquiditätsplan"). Rendered in the
   * canonical page-title style. Unlike the report shell, the title is plain
   * document text — the identifying scenario/period figures live in the
   * toolbar selectors, not the title.
   */
  title: React.ReactNode;
  /**
   * The governed statement body — the read-only comparison/report table. The
   * shell pads it (`p-4`) and wraps it in a horizontal scroll region so wide
   * statements scroll internally, not the page.
   */
  children: React.ReactNode;
  /**
   * **The toolbar.** The statement's full scoping band — the right-aligned,
   * horizontal composition of view-scoping selectors (scenario / period /
   * view / unit) plus any page-level action. A `ReactNode` **content** slot,
   * not an appearance prop: the shell never prescribes selector count, kind,
   * or width. Render here, not as a hand-rolled row between the header and
   * the statement.
   */
  actions?: React.ReactNode;
};

/**
 * StatementWithFiltersShell — the one primitive that owns the F
 * (statement-with-filters) archetype's chrome: a canonical page header (via
 * the shared `SurfaceHeader`, carrying the scoping toolbar in its
 * `headerActions` band) over a single flat bounded card that holds the
 * governed statement.
 *
 * Shape:
 *   ┌──────────────────────────────────────────────┐
 *   │ KICKER        [ selector · selector · ⋯ ]   │  ← on-surface header (border-b)
 *   │ Title                                            │
 *   ├──────────────────────────────────────────────┤
 *   │ (padded read-only statement table, scrolls)      │
 *   └──────────────────────────────────────────────┘
 *
 * House style B: flat bounded card (no shadow) — the canonical `<SurfaceFrame>`
 * chrome, owned there so the statement frame never drifts between pages —
 * token-pure. The body is caller-composed (a `StatementTable` of
 * `StatementRow`s, optionally a totals row); the shell owns only the header +
 * bounded-statement contract so the scoping band never drifts.
 */
export function StatementWithFiltersShell({
  kicker,
  title,
  headerActions,
  actions,
  children,
}: StatementWithFiltersShellProps): React.ReactElement {
  return (
    <SurfaceFrame
      kicker={kicker}
      title={title}
      headerActions={headerActions ?? actions}
    >
      <div className="overflow-x-auto p-4">{children}</div>
    </SurfaceFrame>
  );
}

StatementWithFiltersShell.displayName = "StatementWithFiltersShell";
