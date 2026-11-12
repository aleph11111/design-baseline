import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DashboardGrid } from "./DashboardGrid";
import { DashboardWidget } from "./DashboardWidget";
import { DashboardTitleEditor } from "./DashboardTitleEditor";
import { DashboardAssignmentList } from "./DashboardAssignmentList";

afterEach(cleanup);

const edit = (name: string, index: number, onMove: (from: number, to: number) => void = vi.fn()) => ({
  name,
  index,
  count: 2,
  onMove,
  onConfigure: vi.fn(),
  onRemove: vi.fn(),
});

describe("analytics-dashboard edit mode (ADR-0011)", () => {
  it("read-only widgets carry no edit controls", () => {
    render(
      <DashboardGrid>
        <DashboardWidget title="A" span={1}>a</DashboardWidget>
      </DashboardGrid>,
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("reorders by keyboard-operable move buttons, disabled at the ends", () => {
    const onMove = vi.fn();
    render(
      <DashboardGrid>
        <DashboardWidget title="Alpha" span={1} edit={edit("Alpha", 0, onMove)}>a</DashboardWidget>
        <DashboardWidget title="Beta" span={1} edit={edit("Beta", 1, onMove)}>b</DashboardWidget>
      </DashboardGrid>,
    );
    expect((screen.getByRole("button", { name: "Move Alpha earlier" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Move Beta later" }) as HTMLButtonElement).disabled).toBe(true);
    const later = screen.getByRole("button", { name: "Move Alpha later" });
    expect(later.tagName).toBe("BUTTON"); // native button: focusable, Enter/Space activate
    fireEvent.click(later);
    expect(onMove).toHaveBeenCalledWith(0, 1);
    fireEvent.click(screen.getByRole("button", { name: "Move Beta earlier" }));
    expect(onMove).toHaveBeenCalledWith(1, 0);
  });

  it("keeps focus on the move control after a keyboard reorder", () => {
    function Grid() {
      const [ids, setIds] = React.useState(["Alpha", "Beta", "Gamma"]);
      const onMove = (from: number, to: number) =>
        setIds((xs) => {
          const next = [...xs];
          next.splice(to, 0, ...next.splice(from, 1));
          return next;
        });
      return (
        <DashboardGrid>
          {ids.map((id, i) => (
            <DashboardWidget key={id} title={id} span={1} edit={{ ...edit(id, i, onMove), count: ids.length }}>
              {id}
            </DashboardWidget>
          ))}
        </DashboardGrid>
      );
    }
    render(<Grid />);
    const later = screen.getByRole("button", { name: "Move Alpha later" });
    later.focus();
    fireEvent.click(later);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move Alpha later" }));
    fireEvent.click(document.activeElement as HTMLElement);
    // Alpha is now last: "later" is disabled, focus lands on "earlier".
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move Alpha earlier" }));
  });

  it("configure and remove are named after the tile", () => {
    const e = edit("Alpha", 0);
    render(<DashboardWidget title="Alpha" span={1} edit={e}>a</DashboardWidget>);
    fireEvent.click(screen.getByRole("button", { name: "Configure Alpha" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(e.onConfigure).toHaveBeenCalledOnce();
    expect(e.onRemove).toHaveBeenCalledOnce();
  });

  it("renames inline: Enter saves a trimmed change once, Escape cancels", async () => {
    const onRename = vi.fn();
    render(<DashboardTitleEditor value="Old" onRename={onRename} />);
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: "Rename" });
    fireEvent.change(input, { target: { value: "  New  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onRename).toHaveBeenCalledWith("New");

    cleanup();
    // Enter then blur while the save is in flight renames once.
    let resolve!: () => void;
    const slow = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<DashboardTitleEditor value="Old" onRename={slow} />);
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    const pending = screen.getByRole("textbox", { name: "Rename" });
    fireEvent.change(pending, { target: { value: "New" } });
    fireEvent.keyDown(pending, { key: "Enter" });
    fireEvent.blur(pending);
    fireEvent.keyDown(pending, { key: "Enter" });
    expect(slow).toHaveBeenCalledTimes(1);
    await act(async () => resolve());

    cleanup();
    onRename.mockClear();
    render(<DashboardTitleEditor value="Old" onRename={onRename} />);
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    const box = screen.getByRole("textbox");
    fireEvent.change(box, { target: { value: "Abandoned" } });
    fireEvent.keyDown(box, { key: "Escape" });
    fireEvent.blur(box);
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText("Old")).toBeTruthy();
  });

  it("assignment toggles one target and disables a pending row", () => {
    const onToggle = vi.fn();
    render(
      <DashboardAssignmentList
        title="Shops"
        onToggle={onToggle}
        targets={[
          { id: "a", label: "North", assigned: true },
          { id: "b", label: "South", assigned: false, pending: true },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "North" }));
    expect(onToggle).toHaveBeenCalledWith("a");
    expect((screen.getByRole("checkbox", { name: /South/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("edit-mode widgets are cards on a gapped grid; the drop target shows a ring", () => {
    const { container } = render(
      <DashboardGrid>
        <DashboardWidget title="Alpha" span={1} edit={edit("Alpha", 0)}>a</DashboardWidget>
        <DashboardWidget title="Beta" span={1} edit={edit("Beta", 1)}>b</DashboardWidget>
      </DashboardGrid>,
    );
    expect(container.firstElementChild!.className).toMatch(/gap-4.*md:gap-5/);
    expect(container.innerHTML).not.toMatch(/-mr-px|-mb-px|border-r/);
    for (const section of container.querySelectorAll("section")) {
      expect(section.className).toMatch(/(^|\s)border(\s|$)/);
      expect(section.className).toContain("rounded-lg");
    }
    const wrapper = container.querySelector('[data-slot="dashboard-widget-edit"]') as HTMLElement;
    const dataTransfer = { types: ["application/x-dashboard-widget"], getData: () => "1", setData: vi.fn() };
    fireEvent.dragOver(wrapper, { dataTransfer });
    expect(wrapper.className).toContain("ring-2");
  });

  it("assignment list is a raised card", () => {
    const { container } = render(<DashboardAssignmentList title="Shops" onToggle={vi.fn()} targets={[]} />);
    const section = container.querySelector("section")!;
    expect(section.className).toMatch(/(^|\s)border(\s|$)/);
    expect(section.className).toContain("rounded-lg");
  });
});
