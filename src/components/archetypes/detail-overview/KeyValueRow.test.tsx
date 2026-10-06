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
});
