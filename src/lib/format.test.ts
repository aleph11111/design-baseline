// @vitest-environment node
// Pure formatter — no DOM. Covers every FigureKind, the percent-vs-fraction
// scale pair, null/undefined, negatives (U+2212 minus), `signed`, the
// per-kind default decimal scale, and a non-default locale.
//
// de-DE `Intl` puts a no-break space (U+00A0) before BOTH the `%` and the
// currency symbol; en-US uses no space. The expectations below are byte-precise
// against the Node 22 (ICU) `Intl` the donor targets — the `NBSP`/`MINUS`
// constants are what keep the NBSP / minus assertions honest (a regular space or
// ASCII hyphen would read as a silent locale regression).
import { describe, expect, it } from "vitest";
import { formatFigure, type FigureKind } from "./format";

const NBSP = "\u00a0";
const MINUS = "\u2212";
const PLACEHOLDER = "\u2014";

describe("formatFigure — scale is part of the kind, never inferred", () => {
  it("percent and fraction render identically (47.3 vs 0.473 → 47,3 %)", () => {
    expect(formatFigure(47.3, "percent")).toBe(`47,3${NBSP}%`);
    expect(formatFigure(0.473, "fraction")).toBe(`47,3${NBSP}%`);
  });

  it("the % uses a no-break space (U+00A0) before it, as de-DE Intl emits", () => {
    expect(formatFigure(47.3, "percent")).toBe(`47,3${NBSP}%`);
  });

  it("fraction takes the 0–1 scale while percent takes percent points (0.47 / 47)", () => {
    expect(formatFigure(47, "percent")).toBe(`47,0${NBSP}%`);
    expect(formatFigure(0.47, "fraction")).toBe(`47,0${NBSP}%`);
  });
});

describe("formatFigure — every kind", () => {
  it("currency defaults to 2 decimals (1.234,56 €)", () => {
    // NBSP before the € — de-DE currency style, not a regular space.
    expect(formatFigure(1234.56, "currency")).toBe(`1.234,56${NBSP}€`);
    expect(formatFigure(1, "currency")).toBe(`1,00${NBSP}€`);
  });

  it("percent and fraction default to 1 decimal (47,3 %)", () => {
    expect(formatFigure(19, "percent")).toBe(`19,0${NBSP}%`);
    expect(formatFigure(47, "percent")).toBe(`47,0${NBSP}%`);
    expect(formatFigure(47.345, "percent")).toBe(`47,3${NBSP}%`); // rounded at display
  });

  it("count defaults to 0 decimals (12.345)", () => {
    expect(formatFigure(12345, "count")).toBe("12.345");
    expect(formatFigure(14, "count")).toBe("14");
  });

  it("ratio renders a computed ratio ×100 without a % (default 0 decimals)", () => {
    expect(formatFigure(0.1234, "ratio")).toBe("12");
    expect(formatFigure(0.3, "ratio")).toBe("30");
  });

  it("honours an explicit decimals override per kind", () => {
    expect(formatFigure(47.345, "percent", { decimals: 0 })).toBe(`47${NBSP}%`);
    expect(formatFigure(47.345, "percent", { decimals: 2 })).toBe(`47,35${NBSP}%`);
    expect(formatFigure(1234.5, "currency", { decimals: 0 })).toBe(`1.235${NBSP}€`);
    expect(formatFigure(1234.5, "currency", { decimals: 3 })).toBe(`1.234,500${NBSP}€`);
    expect(formatFigure(0.1234, "ratio", { decimals: 1 })).toBe("12,3");
  });
});

describe("formatFigure — null / undefined / NaN", () => {
  it("renders the em-dash placeholder for all three", () => {
    expect(formatFigure(null, "currency")).toBe(PLACEHOLDER);
    expect(formatFigure(undefined, "percent")).toBe(PLACEHOLDER);
    expect(formatFigure(NaN, "count")).toBe(PLACEHOLDER);
  });
});

describe("formatFigure — negatives and signed", () => {
  it("negative values use a U+2212 minus, not an ASCII hyphen", () => {
    expect(formatFigure(-47.3, "percent")).toBe(`${MINUS}47,3${NBSP}%`);
    expect(formatFigure(-1234.56, "currency")).toBe(`${MINUS}1.234,56${NBSP}€`);
    expect(formatFigure(-1234.56, "currency")).not.toContain("-"); // no ASCII hyphen remains
  });

  it("signed adds an explicit plus to a non-negative", () => {
    const s = formatFigure(47.3, "percent", { signed: true });
    expect(s).toBe(`+47,3${NBSP}%`);
    expect(s.startsWith("+")).toBe(true);
  });

  it("signed still uses the U+2212 minus for negatives", () => {
    expect(formatFigure(-47.3, "percent", { signed: true })).toBe(`${MINUS}47,3${NBSP}%`);
  });

  it("negative integers round to their display scale", () => {
    expect(formatFigure(-12.4, "count")).toBe(`${MINUS}12`);
  });
});

describe("formatFigure — locale is a parameter, de-DE is the default", () => {
  it("a non-default locale changes separators and the % separator", () => {
    // de-DE (default): comma decimal, no-break space before %.
    expect(formatFigure(47.3, "percent")).toBe(`47,3${NBSP}%`);
    // en-US: dot decimal, a plain % with no NBSP.
    expect(formatFigure(47.3, "percent", { locale: "en-US" })).toBe("47.3%");
    expect(formatFigure(1234.56, "currency", { locale: "en-US", currency: "USD" })).toBe("$1,234.56");
  });

  it("negative values in a non-default locale use the U+2212 minus too", () => {
    expect(formatFigure(-47.3, "percent", { locale: "en-US" })).toBe(`${MINUS}47.3%`);
  });

  it("currency honours the currency option", () => {
    expect(formatFigure(1, "currency", { currency: "USD" })).toBe(`1,00${NBSP}$`);
  });
});

describe("formatFigure — type surface", () => {
  it("exports the FigureKind literal union (compile-time guard)", () => {
    const kinds: FigureKind[] = ["currency", "percent", "fraction", "ratio", "count"];
    expect(kinds).toHaveLength(5);
  });

  it("requires a `kind` — an omitted scale is a type error, never inferred as money", () => {
    // `kind` is a required second parameter (the ticket's own signature — scale
    // is part of the kind, never inferred). An omitted `kind` must not
    // compile; if a default is ever re-added, this `@ts-expect-error` becomes
    // an unused diagnostic and the donor's `tsc` gate (CI) goes red.
    // @ts-expect-error kind is a required parameter
    formatFigure(1234.56);
  });
});
