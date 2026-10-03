import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StatTile, StatTileRow } from "../../layout";
import { DashboardShell } from "./DashboardShell";
import { DashboardGrid } from "./DashboardGrid";
import { DashboardWidget } from "./DashboardWidget";

afterEach(cleanup);

function renderDashboard() {
  return render(
    <DashboardShell
      title="Revenue Analytics"
      toolbar={<span>Period</span>}
      actions={<button type="button">Export</button>}
    >
      <StatTileRow>
        <StatTile label="Revenue" value="1" />
        <StatTile label="Orders" value="2" />
      </StatTileRow>
      <DashboardGrid>
        <DashboardWidget title="Trend" span={3}>chart</DashboardWidget>
        <DashboardWidget title="Channels" span={1}>bars</DashboardWidget>
      </DashboardGrid>
    </DashboardShell>,
  );
}

describe("DashboardShell — one page frame (ADR-0008)", () => {
  it("titles the page once, as the h1, with no on-surface title", () => {
    const { container } = renderDashboard();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Revenue Analytics")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });

  it("filters go in the toolbar band, export stays in the header", () => {
    renderDashboard();
    const band = screen.getByText("Period").closest(".border-b") as HTMLElement;
    expect(band.contains(screen.getByText("Export"))).toBe(false);
  });

  it("is one raised surface: KPI row and widgets are cells, never cards", () => {
    const { container } = renderDashboard();
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
    for (const widget of container.querySelectorAll("section")) {
      expect(widget.className).not.toMatch(/(^|\s)(bg-|rounded)/);
      expect(widget.className).toContain("border-r");
    }
  });
});
