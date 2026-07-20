import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MatrixGridShell, type MatrixColumn, type MatrixRow } from "./MatrixGridShell";

const columns: MatrixColumn[] = [{ key: "mon", label: "Mon" }];
const rows: MatrixRow<string>[] = [{ id: "1", label: "Ada", cells: { mon: "P" } }];

afterEach(() => {
  cleanup();
});

describe("MatrixGridShell", () => {
  it("clickable cells are focusable button-role cells that activate on Enter/Space", () => {
    const onCellClick = vi.fn();
    render(
      <MatrixGridShell
        columns={columns}
        rows={rows}
        renderCell={(ctx) => ctx.cell}
        onCellClick={onCellClick}
      />,
    );
    const cell = screen.getByRole("button", { name: "P" });
    expect(cell.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(cell, { key: "Enter" });
    expect(onCellClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(cell, { key: " " });
    expect(onCellClick).toHaveBeenCalledTimes(2);
  });

  it("no onCellClick: cells are not tab stops", () => {
    render(<MatrixGridShell columns={columns} rows={rows} renderCell={(ctx) => ctx.cell} />);
    expect(screen.queryByRole("button", { name: "P" })).toBeNull();
  });
});

// A dense matrix, well beyond what a single visible tooltip could justify —
// stands in for the ticket's "50x20 gradebook" scenario.
const ROWS_N = 20;
const COLS_N = 15;

const denseColumns: MatrixColumn[] = Array.from({ length: COLS_N }, (_, i) => ({
  key: `c${i}`,
  label: `Col ${i}`,
}));

function buildDenseRows(): MatrixRow<number>[] {
  return Array.from({ length: ROWS_N }, (_, r) => ({
    id: `r${r}`,
    label: `Row ${r}`,
    cells: Object.fromEntries(
      denseColumns.map((col, c) => [col.key, r * COLS_N + c]),
    ),
  }));
}

function countMountedTooltipTriggers(): number {
  // Radix's TooltipTrigger (asChild) stamps `data-state` on the element it
  // wraps — the only reliable "a Tooltip subtree is mounted here" signal,
  // since Tooltip.Root itself renders no DOM node.
  return document.querySelectorAll("td[data-state]").length;
}

describe("MatrixGridShell per-cell tooltips", () => {
  it("uses a native title attribute for plain-text tooltips — no Tooltip mounted at all", () => {
    render(
      <TooltipProvider>
        <MatrixGridShell<number>
          columns={denseColumns}
          rows={buildDenseRows()}
          renderCell={(ctx) => ctx.cell}
          cellStyle={(ctx) => ({ tooltip: `value ${ctx.cell}` })}
        />
      </TooltipProvider>,
    );

    expect(countMountedTooltipTriggers()).toBe(0);

    const firstCell = screen.getByText("0");
    expect(firstCell.closest("td")?.getAttribute("title")).toBe("value 0");
  });

  it("mounts at most one Tooltip regardless of cell count, for rich-content tooltips", () => {
    render(
      <TooltipProvider>
        <MatrixGridShell<number>
          columns={denseColumns}
          rows={buildDenseRows()}
          renderCell={(ctx) => ctx.cell}
          cellStyle={(ctx) => ({
            tooltip: <strong>Rich note for {ctx.cell}</strong>,
          })}
        />
      </TooltipProvider>,
    );

    // Idle: nothing hovered, nothing mounted — O(1), not O(cells).
    expect(countMountedTooltipTriggers()).toBe(0);

    const cellA = screen.getByText("0").closest("td")!;
    fireEvent.mouseEnter(cellA);

    expect(countMountedTooltipTriggers()).toBe(1);
    // Radix mirrors the visible content into a visually-hidden `role="tooltip"`
    // node for screen readers — assert against that single accessible node
    // rather than the (duplicated) visible text.
    expect(screen.getByRole("tooltip").textContent).toBe("Rich note for 0");

    // Hovering a different cell swaps the single shared instance rather than
    // accumulating a second one.
    const cellB = screen.getByText("5").closest("td")!;
    fireEvent.mouseEnter(cellB);

    expect(countMountedTooltipTriggers()).toBe(1);
    expect(screen.getByRole("tooltip").textContent).toBe("Rich note for 5");

    // Re-query: wrapping cellB in the shared Tooltip remounted its <td>, so
    // the earlier `cellB` reference now points at a detached node.
    const liveCellB = screen.getByText("5").closest("td")!;
    fireEvent.mouseLeave(liveCellB);
    expect(countMountedTooltipTriggers()).toBe(0);
  });
});
