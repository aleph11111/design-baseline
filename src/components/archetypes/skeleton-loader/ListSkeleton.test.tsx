import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ListSkeleton } from "./ListSkeleton";

afterEach(() => {
  cleanup();
});

/** Direct children of the status wrapper, minus the sr-only label. */
function rowsOf(root: HTMLElement): HTMLElement[] {
  return Array.from(root.children).filter((el) => el.tagName !== "SPAN") as HTMLElement[];
}

describe("ListSkeleton — loading placeholder with status semantics", () => {
  it("announces itself as a polite busy status with the default label", () => {
    render(<ListSkeleton />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.getAttribute("aria-live")).toBe("polite");
    const label = screen.getByText("Loading…");
    expect(label.className).toContain("sr-only");
  });

  it("renders a custom label", () => {
    render(<ListSkeleton label="Loading orders" />);
    expect(screen.getByText("Loading orders").className).toContain("sr-only");
    expect(screen.queryByText("Loading…")).toBeNull();
  });

  it("renders 5 rows by default and `rows` otherwise", () => {
    const { rerender } = render(<ListSkeleton />);
    expect(rowsOf(screen.getByRole("status"))).toHaveLength(5);
    rerender(<ListSkeleton rows={2} />);
    expect(rowsOf(screen.getByRole("status"))).toHaveLength(2);
  });

  it("renders `columns` cells per row and the grid template when columns > 1", () => {
    render(<ListSkeleton rows={3} columns={4} />);
    const rows = rowsOf(screen.getByRole("status"));
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row.children).toHaveLength(4);
      expect(row.style.gridTemplateColumns).toBe("1.6fr repeat(3, minmax(0, 1fr))");
    }
  });

  it("adds a single header bar in single-column mode", () => {
    render(<ListSkeleton rows={2} showHeader />);
    const rows = rowsOf(screen.getByRole("status"));
    expect(rows).toHaveLength(3);
    expect(rows[0].className).toContain("w-40");
  });

  it("adds a header row of `columns` cells in grid mode", () => {
    render(<ListSkeleton rows={2} columns={3} showHeader />);
    const rows = rowsOf(screen.getByRole("status"));
    expect(rows).toHaveLength(3);
    expect(rows[0].children).toHaveLength(3);
    expect(rows[0].className).toContain("pb-1");
  });

  it("adds an avatar placeholder per row, ignored in grid mode", () => {
    const { container, rerender } = render(<ListSkeleton rows={2} avatar />);
    expect(container.querySelectorAll(".rounded-full")).toHaveLength(2);
    rerender(<ListSkeleton rows={2} columns={2} avatar />);
    expect(container.querySelectorAll(".rounded-full")).toHaveLength(0);
  });
});
