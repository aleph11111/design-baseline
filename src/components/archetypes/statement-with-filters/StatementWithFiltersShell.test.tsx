import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StatementWithFiltersShell } from "./StatementWithFiltersShell";
import { StatementTable, StatementRow, StatementTotalRow } from "./StatementTable";

afterEach(() => {
  cleanup();
});

describe("StatementWithFiltersShell", () => {
  it("titles the page once, as the h1, with no on-surface title", () => {
    const { container } = render(
      <StatementWithFiltersShell title="Yield 2026">
        <div>body</div>
      </StatementWithFiltersShell>,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Yield 2026");
    expect(screen.getAllByText("Yield 2026")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });

  it("puts selectors in the toolbar band, verbs in the header, toggles in the View menu", () => {
    render(
      <StatementWithFiltersShell
        title="Yield 2026"
        toolbar={<button type="button">Season</button>}
        actions={<button type="button">Export</button>}
        viewOptions={<div />}
      >
        <div>body</div>
      </StatementWithFiltersShell>,
    );

    const band = screen.getByText("Season").closest(".border-b") as HTMLElement;
    expect(band).not.toBeNull();
    expect(band.textContent).toContain("View");
    expect(band.contains(screen.getByText("Export"))).toBe(false);
  });
});

describe("StatementTable", () => {
  it("renders the column header row automatically from `columns`", () => {
    const { container } = render(
      <StatementTable columns={["Row", "Honey", "Wax"]}>
        <StatementRow label="Meadow hive" cells={["12.4", "3.1"]} />
      </StatementTable>,
    );

    ["Row", "Honey", "Wax"].forEach((label) => {
      expect(container.textContent).toContain(label);
    });
    expect(container.textContent).toContain("Meadow hive");
    expect(container.textContent).toContain("12.4");
  });

  it("renders a tinted totals row distinct from data rows", () => {
    const { container } = render(
      <StatementTable columns={["Row", "Honey", "Wax"]}>
        <StatementRow label="Meadow hive" cells={["12.4", "3.1"]} />
        <StatementTotalRow label="Total" cells={["96.0", "22.9"]} />
      </StatementTable>,
    );

    const tintedTotal = Array.from(
      container.querySelectorAll("div"),
    ).find((el) => el.className.includes("bg-muted/40"));
    expect(tintedTotal?.textContent).toContain("Total");
    expect(tintedTotal?.textContent).toContain("96.0");
  });
});
