import * as React from "react";
import { cn } from "../../../lib/utils";
import { OVERLINE_CLASS } from "../../layout/overline";

// The shared owner of a **typed overline** — the small, uppercase, letter-spaced
// "eyebrow / kicker" label that sits above a heading or section title. The fleet
// re-invents it everywhere: mistra and hk-crm each keep a copy of an `OVERLINE_CLASS`
// string (already drifted — `text-xs`/`0.08em` vs `text-[10.5px]`/`0.09em`);
// my-finance-app hand-types the class inline at ~5 sites AND recolors it per category
// (`text-blue-700` / `text-purple-700` …); the dashboard hub inlines a muted
// `text-[10px] uppercase tracking-wide` at ~7 sites. The baseline already owns the
// base signature via `OVERLINE_CLASS` — what was still hand-rolled is a component
// to compose instead of a bare string.
//
// `<Overline>` composes the existing `OVERLINE_CLASS` (never re-types it). The color
// is part of the fixed signature (contract L7, v2): there is **no `tone` prop** — the
// tone set this promotion shipped with was retired as a non-derivable appearance axis
// (emphasis is a per-page judgement, not a value derivable from the entity or its
// data; a closed recolor set behind a backwards-compatible default is the
// inherited-default defect the archetype-convergence roadmap retires). The two
// documented channels: a surface contract's binding recolors its own labels on an
// accent-filled surface (`headerFillClasses().kicker`), and a *single* site passes a
// one-off color through the `className` passthrough (a documented leaf exemption
// from the `*Shell`/`*Sheet` className ban — that ban scopes to page/overlay shells,
// never over a leaf label). A *set* of per-category recolors is drift: it belongs to
// a badge or a local fork, not to this label.
//
// It is presentational and stateless — text in, styled label out.

/** Elements an overline may render as — it is a label, not always a heading. */
export type OverlineElement = "div" | "span" | "p" | "h2" | "h3" | "h4";

export interface OverlineProps {
  /** The label text (a short noun phrase — "Season 3", "Featured", "Archived"). */
  children: React.ReactNode;
  /** Element to render as. Defaults to `div`; use `h2`/`h3` when the overline *is* the section heading. */
  as?: OverlineElement;
  /** Extra classes — layout classes (`mb-1`) or, at a single site, a one-off `text-*` color the base signature does not cover (the contract's documented one-off channel; never a per-category set). */
  className?: string;
}

/**
 * Overline — a typed overline: the baseline's uppercase, tracked, muted eyebrow
 * label on the canonical `OVERLINE_CLASS` signature, color included (L7, v2).
 */
export function Overline({
  children,
  as = "div",
  className,
}: OverlineProps): React.ReactElement {
  return React.createElement(
    as,
    { className: cn(OVERLINE_CLASS, className) },
    children,
  );
}

Overline.displayName = "Overline";
