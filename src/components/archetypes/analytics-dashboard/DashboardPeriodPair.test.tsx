import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DashboardGrid } from "./DashboardGrid";
import { DashboardPeriodPair } from "./DashboardPeriodPair";

afterEach(cleanup);

describe("DashboardPeriodPair — paired-period widget kind (contract 4.3)", () => {
  it("is one full-width cell per pair: month first, YTD second, split side by side from sm", () => {
    const { container } = render(
      <DashboardGrid>
        <DashboardPeriodPair title="Revenue" month={{ label: "Month", value: "1" }} ytd={{ label: "YTD", value: "10" }} />
        <DashboardPeriodPair title="Profit" month={{ label: "Month", value: "2" }} ytd={{ label: "YTD", value: "20" }} />
      </DashboardGrid>,
    );
    const cells = container.querySelectorAll("section");
    expect(cells).toHaveLength(2);
    for (const cell of cells) {
      expect(cell.className).toContain("sm:col-span-2");
      expect(cell.className).toContain("lg:col-span-3");
    }
    const [month, ytd] = screen.getAllByText(/^(Month|YTD)$/) as [HTMLElement, HTMLElement];
    expect(month.textContent).toBe("Month");
    expect(ytd.textContent).toBe("YTD");
    const split = month.parentElement!.parentElement!;
    expect(split.className).toMatch(/(^|\s)grid-cols-1(\s|$)/);
    expect(split.className).toContain("sm:grid-cols-2");
  });

  it("leaves the grid's fixed column count alone", () => {
    const { container } = render(
      <DashboardGrid>
        <DashboardPeriodPair title="Revenue" month={{ label: "Month", value: "1" }} ytd={{ label: "YTD", value: "10" }} />
      </DashboardGrid>,
    );
    const grid = container.querySelector(".grid") as HTMLElement;
    expect(grid.className).toContain("lg:grid-cols-3");
  });
});
