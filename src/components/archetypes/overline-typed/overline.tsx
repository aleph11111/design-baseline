import * as React from "react";
import { cn } from "@/lib/utils";
import { OVERLINE_CLASS } from "@/components/layout/overline";

// The shared owner of a **typed overline** — the small, uppercase, letter-spaced
// "eyebrow / kicker" label that sits above a heading or section title. The fleet
// re-invents it everywhere: mistra and hk-crm each keep a copy of an `OVERLINE_CLASS`
// string (already drifted — `text-xs`/`0.08em` vs `text-[10.5px]`/`0.09em`);
// my-finance-app hand-types the class inline at ~5 sites AND recolors it per category
// (`text-blue-700` / `text-purple-700` …), proving the "typed" tone need; the dashboard
// hub inlines a muted `text-[10px] uppercase tracking-wide` at ~7 sites. The baseline
// already owns the base signature via `OVERLINE_CLASS` — what was still hand-rolled is
// (1) a component to compose instead of a bare string, and (2) the semantic tone layer.
//
// `<Overline>` composes the existing `OVERLINE_CLASS` (never re-types it) and adds a
// closed, token-backed `tone` set. It is presentational and stateless — text in, styled
// label out.
//
// Scoped out: arbitrary per-category color (finance's domain palette) — that is a
// `className` passthrough, the one sanctioned per-site deviation, not a baseline tone.
// A tone outside this closed set is drift, not variation.

/** The closed semantic tone set. `muted` is the base signature; the rest override color only. */
export type OverlineTone = "muted" | "foreground" | "primary" | "inverted";

/** Elements an overline may render as — it is a label, not always a heading. */
export type OverlineElement = "div" | "span" | "p" | "h2" | "h3" | "h4";

// Only the color role changes per tone; size / weight / tracking / case stay in
// OVERLINE_CLASS so the signature never drifts. `muted` adds nothing — OVERLINE_CLASS
// is already muted; the others win over it via tailwind-merge in `cn`.
const TONE_CLASS: Record<OverlineTone, string> = {
  muted: "",
  foreground: "text-foreground",
  primary: "text-primary",
  inverted: "text-primary-foreground/80",
};

export interface OverlineProps {
  /** The label text (a short noun phrase — "Season 3", "Featured", "Archived"). */
  children: React.ReactNode;
  /** Semantic color tone. Defaults to the muted base signature. */
  tone?: OverlineTone;
  /** Element to render as. Defaults to `div`; use `h2`/`h3` when the overline *is* the section heading. */
  as?: OverlineElement;
  /** Extra classes (e.g. a `mb-1` gap, or a sanctioned per-category color the tone set doesn't cover). */
  className?: string;
}

/**
 * Overline — a typed overline: the baseline's uppercase, tracked, muted eyebrow label,
 * with a closed semantic `tone` set layered on the canonical `OVERLINE_CLASS`.
 */
export function Overline({
  children,
  tone = "muted",
  as = "div",
  className,
}: OverlineProps): React.ReactElement {
  return React.createElement(
    as,
    { className: cn(OVERLINE_CLASS, TONE_CLASS[tone], className) },
    children,
  );
}

Overline.displayName = "Overline";
