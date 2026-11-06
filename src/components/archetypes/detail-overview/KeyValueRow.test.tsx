import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  it("without the enrichment props the value is the dd's only content", () => {
    render(<KeyValueRow label="Kunde" value="Hofmann" />);
    expect(screen.getByText("Hofmann").innerHTML).toBe("Hofmann");
  });

  const SRC = {
    source: "Commercial register",
    id: "HRB 4207",
    date: "05.11.2026",
    via: "Register lookup",
    cost: "33 credits",
  };

  it("provenance: compact chip, no inline source line, full provenance on click", () => {
    render(<KeyValueRow label="Legal form" value="GmbH" provenance={SRC} />);
    expect(screen.queryByText(/HRB 4207/)).toBeNull();
    const chip = screen.getByRole("button", { name: "Source: Commercial register" });
    expect(chip.tagName).toBe("BUTTON"); // native button: Enter/Space operable
    fireEvent.click(chip);
    expect(screen.getByText(/HRB 4207/)).toBeTruthy();
    expect(screen.getByText("05.11.2026 · Register lookup · 33 credits")).toBeTruthy();
  });

  it("alternatives: winning value + conflict marker, every claim with its source on demand", () => {
    render(
      <KeyValueRow
        label="Owner-managed"
        value="yes"
        provenance={{ source: "Register" }}
        alternatives={[{ value: "no", provenance: { source: "Website imprint", date: "01.10.2026" } }]}
      />,
    );
    expect(screen.queryByText("no")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Contested (2)" }));
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]!.textContent).toContain("Register");
    expect(items[1]!.textContent).toContain("no");
    expect(items[1]!.textContent).toContain("Website imprint");
  });

  it("missing: distinct marker, reason when given, never the em-dash", () => {
    const { rerender } = render(<KeyValueRow label="Revenue" missing />);
    expect(screen.getByText("Missing")).toBeTruthy();
    rerender(<KeyValueRow label="Revenue" missing={{ reason: "not enriched yet" }} />);
    const marker = screen.getByText("not enriched yet").parentElement!;
    expect(marker.className).toContain("border-dashed");
    expect(marker.textContent).not.toContain("—");
  });

  it("block rows take the affordances and stay stacked", () => {
    render(<KeyValueRow block label="Note" value="long text" provenance={{ source: "CRM" }} />);
    expect(screen.getByRole("button", { name: "Source: CRM" })).toBeTruthy();
    expect(screen.getByText("Note").parentElement!.className).not.toContain("md:flex-row");
  });
});
