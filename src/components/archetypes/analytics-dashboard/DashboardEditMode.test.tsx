import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DashboardGrid } from "./DashboardGrid";
import { DashboardWidget } from "./DashboardWidget";
import { DashboardTitleEditor } from "./DashboardTitleEditor";
import { DashboardAssignmentList } from "./DashboardAssignmentList";

afterEach(cleanup);

const edit = (name: string, index: number, onMove = vi.fn()) => ({
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

  it("configure and remove are named after the tile", () => {
    const e = edit("Alpha", 0);
    render(<DashboardWidget title="Alpha" span={1} edit={e}>a</DashboardWidget>);
    fireEvent.click(screen.getByRole("button", { name: "Configure Alpha" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(e.onConfigure).toHaveBeenCalledOnce();
    expect(e.onRemove).toHaveBeenCalledOnce();
  });

  it("renames inline: Enter saves a trimmed change, Escape cancels", () => {
    const onRename = vi.fn();
    render(<DashboardTitleEditor value="Old" onRename={onRename} />);
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: "Rename" });
    fireEvent.change(input, { target: { value: "  New  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onRename).toHaveBeenCalledWith("New");

    cleanup();
    onRename.mockClear();
    render(<DashboardTitleEditor value="Old" onRename={onRename} />);
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
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
});
