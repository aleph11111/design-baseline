import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { StatementWithFiltersShell } from "./StatementWithFiltersShell";
import { StatementTable, StatementRow, StatementTotalRow } from "./StatementTable";

afterEach(() => {
  cleanup();
});

describe("StatementWithFiltersShell", () => {
  it("renders its header through the shared SurfaceHeader", () => {
    const { container, getByText } = render(
      <StatementWithFiltersShell kicker="Statement" title="Yield 2026">
        <div>body</div>
      </StatementWithFiltersShell>,
    );

    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    expect(header?.contains(getByText("Statement"))).toBe(true);
    expect(header?.contains(getByText("Yield 2026"))).toBe(true);
  });

  it("renders the toolbar into the header's on-surface actions band", () => {
    const { container, getByText } = render(
      <StatementWithFiltersShell
        kicker="Statement"
        title="Yield 2026"
        actions={
          <>
            <button type="button">Season</button>
            <button type="button">Hive</button>
          </>
        }
      >
        <div>body</div>
      </StatementWithFiltersShell>,
    );

    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    expect(header?.contains(getByText("Season"))).toBe(true);
    expect(header?.contains(getByText("Hive"))).toBe(true);
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
