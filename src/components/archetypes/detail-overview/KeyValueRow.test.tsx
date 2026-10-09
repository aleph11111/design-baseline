import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { KeyValueRow } from "./KeyValueRow";

afterEach(() => {
  cleanup();
});

describe("KeyValueRow", () => {
  // ADR-0009: values render in the house sans — tabular digits, no mono, no
  // figure weight — so text values (names, emails) don't read as code.
  it("renders the value in the house sans with tabular digits", () => {
    render(<KeyValueRow label="Kunde" value="Brauerei Hofmann GmbH" />);
    const dd = screen.getByText("Brauerei Hofmann GmbH");
    expect(dd.tagName).toBe("DD");
    expect(dd.className).toContain("tabular-nums");
    expect(dd.className).not.toContain("font-mono");
    expect(dd.className).not.toContain("font-medium");
  });

  it("stacks below md and goes side by side from md", () => {
    render(<KeyValueRow label="E-Mail" value="a@b.de" />);
    const row = screen.getByText("a@b.de").parentElement!;
    expect(row.className).toContain("flex-col");
    expect(row.className).toContain("md:flex-row");
    expect(screen.getByText("a@b.de").className).toContain("md:text-right");
  });

  it("block layout stays stacked", () => {
    render(<KeyValueRow block label="Note" value="text" />);
    expect(screen.getByText("text").parentElement!.className).not.toContain("md:flex-row");
  });
});
