import * as React from "react";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SectionCardProps = {
  /**
   * Section title. Rendered in the ruled title bar via `<SectionHeading>` (the
   * canonical overline). Omit for a bounded surface with no header bar.
   */
  title?: React.ReactNode;
  /**
   * Optional one-line clarifier under the title in the bar. Passed through to
   * `<SectionHeading>`.
   */
  description?: React.ReactNode;
  /**
   * Optional right-aligned controls in the title bar (a small ghost button, a
   * count `<Badge>`, a status chip). Size them to the bar: `size="sm"` with
   * `className="-my-1.5 h-7 text-xs"` keeps the bar height stable.
   */
  actions?: React.ReactNode;
  /**
   * Raw header override. When provided, it replaces the default
   * `<SectionHeading>` inside the title bar entirely — use for dense custom
   * headers (sync indicators, multi-control rows). Wins over `title`.
   */
  header?: React.ReactNode;
  /**
   * Content layout.
   * - `false` (default): content is wrapped in `px-5 py-4` padding — for
   *   free-form content (prose, field groups, custom panels).
   * - `true`: content renders flush to the section edges — for ruled lists and
   *   embedded tables that manage their own padding and dividers.
   */
  flush?: boolean;
  /**
   * Surface weight.
   * - `"default"`: flat hairline card — `border`, no shadow — for primary
   *   data sections.
   * - `"muted"`: muted background, no shadow — for the lightest sections
   *   (reference panels).
   */
  tone?: "default" | "muted";
  /**
   * Card chrome.
   * - `true` (default): the bounded card — `rounded-lg border` + tone surface.
   * - `false`: chromeless — drop the border/rounding/background/shadow and keep
   *   only the ruled title bar + body padding. Used when the section renders
   *   inside an already-bounded surface that owns separation via hairline
   *   dividers (e.g. a `<DetailOverviewShell>`'s rail). Gutters (`px-5 py-*`)
   *   are preserved so the framed rail keeps consistent padding; only the
   *   outer card is dropped.
   */
  chrome?: boolean;
  children: React.ReactNode;
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SectionCard — the canonical titled bounded section.
 *
 * A bounded card with an optional ruled overline title bar (built from
 * `<SectionHeading>`) and a flush-or-padded body, graded by `tone`. This is
 * the single source of the "titled section" look: a heading is bound to its
 * content as one block, never floating above a detached card.
 *
 * Composed by every archetype that needs a titled content block —
 * `<DetailSection>` (detail-overview), grouped-list groups, and form-page
 * field groups all wrap this. Iterating the section look baseline-wide is one
 * edit here.
 *
 * Do not reach for the shadcn `<Card>` family at section level — `SectionCard`
 * IS the section boundary. `<Card>` remains fine for smaller surfaces nested
 * inside a section's body.
 */
export function SectionCard({
  title,
  description,
  actions,
  header,
  flush = false,
  tone = "default",
  chrome = true,
  children,
  className,
}: SectionCardProps): React.ReactElement {
  const hasBar = header !== undefined || title !== undefined;
  const bar = header ?? (
    <SectionHeading title={title} description={description} actions={actions} />
  );

  // Chromeless (embedded in an already-bounded surface, e.g. the unified rail):
  // no card, and the title is a plain overline — NOT a bordered title bar — so
  // the section reads as "overline over content" in one gutter, separated from
  // its neighbours only by the host surface's hairline dividers. Symmetric `py-4`
  // keeps each divider floating in whitespace.
  if (!chrome) {
    return (
      <section className={cn("py-4", className)}>
        {hasBar && <div className="mb-3 px-5">{bar}</div>}
        {flush ? children : <div className="px-5">{children}</div>}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border",
        tone === "muted" ? "bg-muted/40" : "bg-card text-card-foreground",
        className,
      )}
    >
      {hasBar && (
        <div className="border-b border-border px-5 py-3">{bar}</div>
      )}
      {flush ? children : <div className="px-5 py-4">{children}</div>}
    </section>
  );
}

SectionCard.displayName = "SectionCard";
