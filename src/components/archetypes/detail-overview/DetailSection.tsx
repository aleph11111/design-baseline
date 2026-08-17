import * as React from "react";
import { SectionCard } from "@/components/layout/SectionCard";
import { UnifiedSurfaceContext } from "./DetailOverviewShell";

export type DetailSectionProps = {
  /**
   * Optional section heading. Rendered in the section's ruled title bar via
   * the shared `<SectionHeading>` primitive (the canonical overline). Use a
   * short noun phrase (e.g. "Details", "Recent plays", "Resources"). The
   * ruled overline bar is the archetype's sectional signature — identical in
   * every app.
   */
  title?: React.ReactNode;
  /**
   * Optional right-aligned controls in the title bar (e.g. a small ghost
   * button). Size them to the bar: `size="sm"` with `className="-my-1.5 h-7
   * text-xs"` keeps the bar height stable. Ignored when `title` is undefined.
   */
  actions?: React.ReactNode;
  /**
   * Content layout.
   * - `false` (default): content is wrapped in `px-5 py-4` padding — use for
   *   free-form content (islands, prose, custom panels).
   * - `true`: content renders flush to the section edges — use for ruled
   *   lists (`<KeyValueList>`, row lists) that manage their own `px-5` row
   *   padding and hairline dividers.
   */
  flush?: boolean;
  /**
   * Surface weight.
   * - `"default"`: flat hairline card — `border`, no shadow — for data
   *   sections (master data, transactional lists).
   * - `"muted"`: muted background, no shadow — for the page's lightest
   *   sections (reference panels).
   */
  tone?: "default" | "muted";
  children: React.ReactNode;
  className?: string;
};

/**
 * DetailSection — the bounded section surface used inside a
 * `<DetailOverviewShell>`.
 *
 * v2.0 (ledger design): every zone below the page header renders inside one
 * of these. The section is a bounded surface with a ruled overline title bar;
 * surface weight is graded via `tone` so the page has hierarchy instead of
 * uniform boxes. No naked sections — content floating between bounded
 * neighbours is the archetype's defining anti-pattern.
 *
 * Do not use the shadcn `<Card>` family directly at section level in this
 * archetype — `<DetailSection>` IS the section boundary. `<Card>` remains
 * fine for smaller surfaces nested inside a section's content.
 */
export function DetailSection({
  title,
  actions,
  flush = false,
  tone = "default",
  children,
  className,
}: DetailSectionProps): React.ReactElement {
  // Inside a `<DetailOverviewShell>`'s rail, sections render chromeless —
  // the shell's one bounded frame + hairline dividers own all separation.
  // Outside the rail (or outside the shell entirely), this is the bordered
  // card.
  const unified = React.useContext(UnifiedSurfaceContext);
  return (
    <SectionCard
      title={title}
      actions={actions}
      flush={flush}
      tone={tone}
      chrome={!unified}
      className={className}
    >
      {children}
    </SectionCard>
  );
}

DetailSection.displayName = "DetailSection";
