import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GroupedListShell } from "./GroupedListShell";
import { WaitingAgeCell, WorkQueueGroups, WorkQueueViewSwitch, type WorkQueueGroup } from "./WorkQueue";
import type { ListColumn } from "../list-with-detail";
import type { WorkflowStep } from "../shared/workflowStep";

// jsdom has no matchMedia; the list body reads it (via useIsMobile) on mount.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

type Row = { id: string; name: string };
const columns: ListColumn<Row>[] = [{ key: "name", header: "Order", cell: (r) => r.name, isIdentifier: true }];
const steps: WorkflowStep[] = [
  { key: "pay", label: "To pay", phase: "open" },
  { key: "pack", label: "To pack", phase: "open", tone: "warning" },
  { key: "shipped", label: "Shipped", phase: "open", tone: "danger" },
];
const onBulk = vi.fn();
const groups: WorkQueueGroup<Row>[] = [
  { step: steps[0]!, rows: [] },
  { step: steps[1]!, rows: [{ id: "1", name: "SO-1" }, { id: "2", name: "SO-2" }], bulkAction: { label: "Pack 2", onSelect: onBulk } },
  { step: steps[2]!, rows: [{ id: "3", name: "SO-3" }] },
];

describe("WorkQueueGroups", () => {
  it("renders one card per non-empty step with count, tone and bulk action; empties only in the pipeline line", () => {
    const { container } = render(
      <GroupedListShell title="Orders" toolbar={<input aria-label="Search" />}>
        <WorkQueueGroups<Row> groups={groups} density="open" columns={columns} getRowId={(r) => r.id} />
      </GroupedListShell>,
    );
    const cards = container.querySelectorAll("[data-slot='work-queue-group']");
    expect([...cards].map((c) => c.getAttribute("data-tone"))).toEqual(["warning", "danger"]);
    expect(cards[0]!.textContent).toContain("To pack");
    expect(screen.queryByRole("heading", { name: "To pay" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Pack 2" }));
    expect(onBulk).toHaveBeenCalledOnce();

    const pipeline = screen.getByRole("navigation", { name: "Pipeline" });
    expect(pipeline.textContent).toBe("To pay 0›To pack 2›Shipped 1");
    expect(pipeline.querySelectorAll("[data-empty]")).toHaveLength(1);
    // The toolbar band rides on the first card only (the pipeline line).
    expect(screen.getAllByRole("textbox", { name: "Search" })).toHaveLength(1);
    expect(container.querySelector("[data-slot='work-queue-pipeline']")!.contains(screen.getByRole("textbox"))).toBe(true);
  });

  it("a single-step view renders no pipeline line", () => {
    render(<WorkQueueGroups<Row> groups={[groups[1]!]} density="archive" columns={columns} getRowId={(r) => r.id} />);
    expect(screen.queryByRole("navigation", { name: "Pipeline" })).toBeNull();
  });
});

describe("WorkQueueViewSwitch", () => {
  it("offers exactly Open, Completed and All with counts", () => {
    render(<WorkQueueViewSwitch value="open" onValueChange={() => {}} counts={{ open: 6, completed: 82, all: 88 }} />);
    expect(screen.getAllByRole("radio").map((r) => r.textContent)).toEqual(["Open 6", "Completed 82", "All 88"]);
  });
});

describe("WaitingAgeCell", () => {
  it.each([
    [3, "default"],
    [7, "warning"],
    [13, "warning"],
    [14, "danger"],
  ])("%i days → %s", (days, tone) => {
    const { container } = render(<WaitingAgeCell days={days} thresholds={{ warning: 7, danger: 14 }} />);
    expect(container.querySelector("[data-slot='waiting-age']")!.getAttribute("data-tone")).toBe(tone);
    expect(container.textContent).toBe(`${days} d`);
  });
});
