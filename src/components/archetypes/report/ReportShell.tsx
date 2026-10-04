"use client";
import * as React from "react";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";

/**
 * A report has no toolbar (report.md): the header props only, no
 * `toolbar` / `count` / `viewOptions`.
 */
export type ReportShellProps = Pick<
  PageFrameProps,
  "title" | "subtitle" | "badges" | "actions"
> & {
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
 * ReportShell — the R (report) page: a formal document / invoice / Beleg,
 * built through the one `PageFrame` (ADR-0008). The document's identifier is
 * the page `title`; document verbs (PDF, send) are `actions`; the body is the
 * padded paper. A formal document is bounded, never full-bleed — `width`
 * bounds the whole page column. Token-pure; the body is caller-composed
 * (parties row, `ReportLineTable`, totals stack).
 */
export function ReportShell({
  children,
  width = "md",
  ...frame
}: ReportShellProps): React.ReactElement {
  return (
    <PageFrame {...frame} className={WIDTH[width]}>
      <div className="p-6">{children}</div>
    </PageFrame>
  );
}

ReportShell.displayName = "ReportShell";
