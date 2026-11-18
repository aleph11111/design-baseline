"use client";
import * as React from "react";
import { cn } from "../../lib/utils";
import { CARD_TITLE_CLASS, SECTION_HEADING_CLASS } from "./overline";

/**
 * Set by `SectionCard` around its title: the heading then renders on the card
 * title rung (13px) instead of the bare section-heading rung (15px). Internal —
 * not re-exported from the layout barrel; the rung is placement, never a prop.
 */
export const SectionHeadingInCardContext = React.createContext(false);

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SectionHeadingProps = {
  /**
   * Section label. Rendered as an `<h2>` in sentence case — 15px semibold
   * foreground bare (`SECTION_HEADING_CLASS`), 13px inside a `SectionCard`
   * (`CARD_TITLE_CLASS`), ADR-0016. Use a short noun
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
 * This is the single source of the section heading: a sentence-case,
 * semibold, foreground `<h2>` that names a sub-section of a page (ADR-0016
 * retired the uppercase overline). It is the
 * sectional counterpart to `<PageHeader>` — iterating the section-title look
 * baseline-wide is one edit here.
 *
 * It renders only the heading row (title + optional description + optional
 * actions); surrounding chrome is the consumer's. `<DetailSection>` wraps it
 * as its card title (via `SectionCard`); grouped-list and form-page render it bare above
 * their content blocks. Do NOT hand-roll the heading class string — compose
 * this primitive so the signature stays uniform.
 *
 * Layout:
 *   [Title (sentence case)]                                    [actions (optional)]
 *   [description (optional, normal-case)]
 */
export function SectionHeading({
  title,
  description,
  actions,
  className,
}: SectionHeadingProps): React.ReactElement {
  const inCard = React.useContext(SectionHeadingInCardContext);
  return (
    <div
      className={cn("flex items-start justify-between gap-3", className)}
    >
      <div className="min-w-0">
        <h2 className={inCard ? CARD_TITLE_CLASS : SECTION_HEADING_CLASS}>{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">
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
