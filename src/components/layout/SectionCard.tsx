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
   * - `"default"`: card surface with shadow — for primary data sections.
   * - `"muted"`: muted background, no shadow — for the lightest sections
   *   (reference panels).
   */
  tone?: "default" | "muted";
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
  children,
  className,
}: SectionCardProps): React.ReactElement {
  const hasBar = header !== undefined || title !== undefined;
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border",
        tone === "muted"
          ? "bg-muted/40"
          : "bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {hasBar && (
        <div className="border-b border-border px-5 py-3">
          {header ?? (
            <SectionHeading
              title={title}
              description={description}
              actions={actions}
            />
          )}
        </div>
      )}
      {flush ? children : <div className="px-5 py-4">{children}</div>}
    </section>
  );
}

SectionCard.displayName = "SectionCard";
