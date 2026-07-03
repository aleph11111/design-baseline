import * as React from "react";

/**
 * Header fill — the per-project "Plex Ledger" header treatment (House Style B).
 *
 * A framed surface's header bar (detail-overview, report, calendar, the
 * list-with-detail drawer) renders one of three ways, set ONCE per project and
 * read by every framed shell so the system stays consistent:
 *
 * - "solid" (default): the bar is filled with the brand accent (`bg-primary`),
 *   with white title/kicker and inverted action buttons. The bold default.
 * - "tint": a soft muted fill (`bg-muted`), normal dark text.
 * - "white": plain white, hairline border only — the quietest.
 *
 * The brand accent lives on `--primary` (each app's override). Semantic status
 * badges are deliberately NOT inverted on a solid header — they stay semantic.
 */
export type HeaderFill = "solid" | "tint" | "white";

/**
 * Default is "solid". A project sets its house treatment once — via
 * `<AppShell headerFill="…">` (which provides this context) — and every framed
 * header inherits it. A single shell may still override with a `headerFill` prop.
 */
export const HeaderFillContext = React.createContext<HeaderFill>("solid");

export function useHeaderFill(override?: HeaderFill): HeaderFill {
  const ctx = React.useContext(HeaderFillContext);
  return override ?? ctx;
}

export type HeaderFillClasses = {
  /** Apply to the header BAR wrapper (bg, border, and — on solid — the
   *  inversions for composed `<PageHeader>` content: h1/p/buttons). */
  bar: string;
  /** Apply to a custom kicker overline element (overrides its muted color). */
  kicker: string;
  /** Apply to a custom title element (overrides its foreground color). */
  title: string;
};

// Inversions for solid headers, scoped to the bar via arbitrary descendant
// selectors. Buttons: outline → transparent/white border; primary → white fill
// + accent text. `:is(button,a)` so a `<Button asChild>` link (renders as an
// `<a>` carrying the same button classes) inverts too. Composed PageHeader
// title (`h1`) → white, subtitle (`p`) → dimmed white. `<Badge>` status pills
// are intentionally untouched (semantic).
const SOLID_INVERT =
  "[&_:is(button,a)]:text-primary-foreground " +
  "[&_:is(button,a).border-input]:border-primary-foreground/40 [&_:is(button,a).border-input]:bg-transparent [&_:is(button,a).border-input]:hover:bg-primary-foreground/10 " +
  "[&_:is(button,a).bg-primary]:bg-primary-foreground [&_:is(button,a).bg-primary]:text-primary [&_:is(button,a).bg-primary]:hover:bg-primary-foreground/90 [&_:is(button,a).bg-primary]:hover:text-primary " +
  "[&_h1]:text-primary-foreground [&_p]:text-primary-foreground/70";

export function headerFillClasses(fill: HeaderFill): HeaderFillClasses {
  switch (fill) {
    case "solid":
      return {
        bar: `bg-primary text-primary-foreground ${SOLID_INVERT}`,
        kicker: "text-primary-foreground/80",
        title: "text-primary-foreground",
      };
    case "tint":
      return { bar: "bg-muted border-b border-border", kicker: "", title: "" };
    case "white":
    default:
      return { bar: "bg-card border-b border-border", kicker: "", title: "" };
  }
}
