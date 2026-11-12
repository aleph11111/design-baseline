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

  it("is a section-card stack: band-only first card, KPI card, one card per widget", () => {
    const { container } = renderDashboard();
    const stack = container.querySelector('[data-page-body="stack"]') as HTMLElement;
    expect(stack).not.toBeNull();
    const cards = Array.from(stack.children) as HTMLElement[];
    // band-only first card (filters), KPI row, grid of widgets
    expect(cards[0]!.textContent).toBe("Period");
    expect(cards[0]!.className).toContain("border");
    expect(cards[1]!.textContent).toContain("Revenue");
    for (const widget of stack.querySelectorAll("section")) {
      expect(widget.className).toMatch(/(^|\s)border(\s|$)/);
      expect(widget.className).toContain("rounded-lg");
    }
    expect(stack.querySelectorAll("section")).toHaveLength(2);
  });

  it("no band-only card without a toolbar, and no divided cell grid remains", () => {
    const { container } = render(
      <DashboardShell title="T">
        <DashboardGrid>
          <DashboardWidget title="Trend" span={3}>chart</DashboardWidget>
        </DashboardGrid>
      </DashboardShell>,
    );
    const stack = container.querySelector('[data-page-body="stack"]') as HTMLElement;
    expect(stack.children).toHaveLength(1);
    expect(container.innerHTML).not.toMatch(/-mr-px|border-r|divide-y/);
  });
});
