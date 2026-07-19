import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RowActionsMenu, type RowActionItem } from "./RowActionsMenu";

type Row = { id: string; name: string };

const row: Row = { id: "row-1", name: "Row 1" };

/**
 * Radix opens the menu on pointerdown, not click; jsdom has no PointerEvent so
 * the handlers are driven directly.
 */
function openMenu(actions: RowActionItem<Row>[]) {
  render(<RowActionsMenu row={row} actions={actions} />);
  fireEvent.pointerDown(screen.getByText("Row actions").closest("button")!, {
    button: 0,
    ctrlKey: false,
  });
  const menu = document.querySelector<HTMLElement>('[role="menu"]');
  if (!menu) throw new Error("menu did not open");
  return menu;
}

function itemsOf(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

function nth(items: HTMLElement[], index: number): HTMLElement {
  const item = items[index];
  if (!item) throw new Error(`no menu item at index ${index}`);
  return item;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("RowActionsMenu", () => {
  it("renders one item per action and passes the row to onSelect", () => {
    const onEdit = vi.fn();
    const onDuplicate = vi.fn();

    const menu = openMenu([
      { label: "Edit", onSelect: onEdit },
      { label: "Duplicate", onSelect: onDuplicate },
    ]);

    const items = itemsOf(menu);
    expect(items.map((item) => item.textContent)).toEqual([
      "Edit",
      "Duplicate",
    ]);

    fireEvent.click(nth(items, 0));
    expect(onEdit).toHaveBeenCalledWith(row);
    expect(onDuplicate).not.toHaveBeenCalled();
  });

  it("renders a separator entry as a separator, not an interactive item", () => {
    const menu = openMenu([
      { label: "Edit", onSelect: vi.fn() },
      { separator: true },
      { label: "Delete", onSelect: vi.fn() },
    ]);

    expect(menu.querySelectorAll('[role="separator"]')).toHaveLength(1);
    expect(itemsOf(menu)).toHaveLength(2);
  });

  it("renders a heading entry as a non-interactive label", () => {
    const menu = openMenu([
      { label: "Danger zone", heading: true },
      { label: "Delete", onSelect: vi.fn() },
    ]);

    const items = itemsOf(menu);
    expect(items).toHaveLength(1);
    expect(nth(items, 0).textContent).toBe("Delete");

    // The heading text is present, but not as anything selectable.
    expect(menu.textContent).toContain("Danger zone");
    expect(items.some((item) => item.textContent === "Danger zone")).toBe(false);
  });

  it("applies destructive styling and disables a disabled item without affecting others", () => {
    const onDelete = vi.fn();
    const onArchive = vi.fn();
    const onEdit = vi.fn();

    const menu = openMenu([
      { label: "Edit", onSelect: onEdit },
      { label: "Archive", onSelect: onArchive, disabled: true },
      { label: "Delete", onSelect: onDelete, destructive: true },
    ]);

    const items = itemsOf(menu);
    const [edit, archive, del] = [nth(items, 0), nth(items, 1), nth(items, 2)];

    expect(del.className).toContain("text-destructive");
    expect(edit.className).not.toContain("text-destructive");

    expect(archive.hasAttribute("data-disabled")).toBe(true);
    fireEvent.click(archive);
    expect(onArchive).not.toHaveBeenCalled();

    fireEvent.click(edit);
    expect(onEdit).toHaveBeenCalledWith(row);
  });

  it("renders a mixed list of actions, separators and headings in order", () => {
    const menu = openMenu([
      { label: "Manage", heading: true },
      { label: "Edit", onSelect: vi.fn() },
      { separator: true },
      { label: "Danger zone", heading: true },
      { label: "Delete", onSelect: vi.fn(), destructive: true },
    ]);

    const rendered = Array.from(menu.children).map((child) => [
      child.getAttribute("role"),
      child.textContent,
    ]);

    expect(rendered).toEqual([
      [null, "Manage"],
      ["menuitem", "Edit"],
      ["separator", ""],
      [null, "Danger zone"],
      ["menuitem", "Delete"],
    ]);
  });
});
