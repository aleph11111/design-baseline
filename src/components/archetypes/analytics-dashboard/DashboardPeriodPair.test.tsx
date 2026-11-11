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

  it("renders a state plane in place of both figures", () => {
    render(
      <DashboardPeriodPair
        title="Revenue"
        month={{ label: "Month", value: "1" }}
        ytd={{ label: "YTD", value: "10" }}
        state={<p>Failed to load.</p>}
      />,
    );
    expect(screen.getByText("Failed to load.")).toBeTruthy();
    expect(screen.queryByText("Month")).toBeNull();
    expect(screen.queryByText("YTD")).toBeNull();
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

  it("takes { label, body, actions } halves: sub-headings, bodies, month before YTD, actions on one half only", () => {
    const { container } = render(
      <DashboardGrid>
        <DashboardPeriodPair
          title="EBITDA"
          month={{ label: "Monat", body: <p>month chart</p>, actions: <button>Edit month</button> }}
          ytd={{ label: "YTD", body: <p>ytd chart</p> }}
        />
        <DashboardPeriodPair title="EBIT" month={{ label: "Monat", body: <p>m2</p> }} ytd={{ label: "YTD", body: <p>y2</p> }} />
      </DashboardGrid>,
    );
    const heads = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(heads.slice(0, 2)).toEqual(["Monat", "YTD"]);
    const month = screen.getByText("month chart");
    const ytd = screen.getByText("ytd chart");
    expect(month.compareDocumentPosition(ytd) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const edit = screen.getByRole("button", { name: "Edit month" });
    expect(edit.parentElement!.textContent).toContain("Monat");
    expect(ytd.parentElement!.textContent).not.toContain("Edit month");
    const cells = container.querySelectorAll("section");
    expect(cells).toHaveLength(2);
    for (const cell of cells) expect(cell.className).toContain("lg:col-span-3");
  });
});
