import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Overline } from "./overline";

afterEach(() => {
  cleanup();
});

describe("Overline — typed overline label", () => {
  it("carries the base signature (uppercase, tracked, muted) by default", () => {
    render(<Overline>Season 3</Overline>);
    const el = screen.getByText("Season 3");
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("uppercase");
    expect(el.className).toContain("text-muted-foreground");
  });

  it("exposes no tone prop — the color is fixed in the base signature (L7, v2)", () => {
    render(<Overline>Featured</Overline>);
    const cls = screen.getByText("Featured").className;
    // the fixed muted color comes from OVERLINE_CLASS; no per-call-site recolor exists
    expect(cls).toContain("text-muted-foreground");
  });

  it("renders as the requested element", () => {
    render(<Overline as="h2">Details</Overline>);
    expect(screen.getByText("Details").tagName).toBe("H2");
  });

  it("appends a passthrough className without dropping the signature", () => {
    render(
      <Overline className="mb-1 text-emerald-700">Income</Overline>,
    );
    const cls = screen.getByText("Income").className;
    expect(cls).toContain("uppercase");
    expect(cls).toContain("mb-1");
    expect(cls).toContain("text-emerald-700");
  });
});
