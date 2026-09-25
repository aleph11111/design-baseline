"use client";
import * as React from "react";
import { ChevronRight } from "lucide-react";
import { SectionCard } from "../../layout/SectionCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { cn } from "../../../lib/utils";
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
  /**
   * Behaviour: when true, the title becomes a disclosure toggle and the body
   * shows only while open. Use for secondary sections a reader opens on demand
   * (run history, raw payloads). Requires `title`. Defaults to false.
   */
  collapsible?: boolean;
  /** Initial open state of a `collapsible` section. Defaults to false. */
  defaultOpen?: boolean;
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
  collapsible = false,
  defaultOpen = false,
  children,
  className,
}: DetailSectionProps): React.ReactElement {
  // Inside a `<DetailOverviewShell>`'s rail, sections render chromeless —
  // the shell's one bounded frame + hairline dividers own all separation.
  // Outside the rail (or outside the shell entirely), this is the bordered
  // card.
  const unified = React.useContext(UnifiedSurfaceContext);
  const [open, setOpen] = React.useState(defaultOpen);

  if (collapsible && title !== undefined) {
    // The trigger button sits inside the section's `<h2>` (heading wraps
    // button — the disclosure pattern that keeps it heading-navigable). The
    // body padding rides on the content, so a closed section renders only
    // its title bar.
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <SectionCard
          title={
            <CollapsibleTrigger className="inline-flex cursor-pointer items-center gap-1.5 text-left uppercase hover:text-foreground">
              <ChevronRight
                aria-hidden
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-150",
                  open && "rotate-90",
                )}
              />
              {title}
            </CollapsibleTrigger>
          }
          actions={actions}
          flush
          tone={tone}
          chrome={!unified}
          className={className}
        >
          <CollapsibleContent
            className={cn(!flush && (unified ? "px-5" : "px-5 py-4"))}
          >
            {children}
          </CollapsibleContent>
        </SectionCard>
      </Collapsible>
    );
  }

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
