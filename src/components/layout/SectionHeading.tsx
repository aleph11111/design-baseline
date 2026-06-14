import * as React from "react";
import { cn } from "@/lib/utils";
import { OVERLINE_CLASS } from "./overline";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SectionHeadingProps = {
  /**
   * Section label. Rendered as an `<h2>` overline at
   * `text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground`
   * — the baseline's canonical section-title signature. Use a short noun
   * phrase ("Details", "Recent plays", "Contact info").
   */
  title: React.ReactNode;
  /**
   * Optional one-line clarifier below the title. Rendered normal-case at
   * `text-sm text-muted-foreground` so it reads as prose, not a second label.
   */
  description?: React.ReactNode;
  /**
   * Optional right-aligned controls (e.g. a small ghost button). Size them to
   * the heading: `size="sm"` with `className="-my-1.5 h-7 text-xs"` keeps the
   * row height stable when the heading sits in a ruled bar.
   */
  actions?: React.ReactNode;
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SectionHeading — the canonical section-title signature shared across
 * archetypes.
 *
 * This is the single source of the "ledger" overline heading: a quiet,
 * uppercase, tracked `<h2>` that names a sub-section of a page. It is the
 * sectional counterpart to `<PageHeader>` — iterating the section-title look
 * baseline-wide is one edit here.
 *
 * It renders only the heading row (title + optional description + optional
 * actions); surrounding chrome is the consumer's. `<DetailSection>` wraps it
 * in a ruled `border-b` bar; grouped-list and form-page render it bare above
 * their content blocks. Do NOT hand-roll the overline class string — compose
 * this primitive so the signature stays uniform.
 *
 * Layout:
 *   [TITLE (overline)]                                      [actions (optional)]
 *   [description (optional, normal-case)]
 */
export function SectionHeading({
  title,
  description,
  actions,
  className,
}: SectionHeadingProps): React.ReactElement {
  return (
    <div
      className={cn("flex items-start justify-between gap-3", className)}
    >
      <div className="min-w-0">
        <h2 className={OVERLINE_CLASS}>{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm font-normal normal-case tracking-normal text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

SectionHeading.displayName = "SectionHeading";
