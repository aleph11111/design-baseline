import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TooltipProvider } from "../../ui/tooltip";
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

  it("stamps data-filled on filled cells, omits it on empty cells", () => {
    const mixedColumns: MatrixColumn[] = [{ key: "mon", label: "Mon" }, { key: "tue", label: "Tue" }];
    const mixedRows: MatrixRow<string>[] = [
      { id: "1", label: "Ada", cells: { mon: "P" } },
    ];
    render(
      <MatrixGridShell
        columns={mixedColumns}
        rows={mixedRows}
        renderCell={(ctx) => ctx.cell}
      />,
    );
    const filledCell = screen.getByText("P").closest("td")!;
    expect(filledCell.getAttribute("data-filled")).toBe("");

    const emptyCell = document.querySelectorAll("tbody td")[1]!;
    expect(emptyCell.hasAttribute("data-filled")).toBe(false);
  });

  it("renders renderEmptyCell content on empty cells without stamping data-filled", () => {
    const mixedColumns: MatrixColumn[] = [{ key: "mon", label: "Mon" }, { key: "tue", label: "Tue" }];
    const mixedRows: MatrixRow<string>[] = [
      { id: "1", label: "Ada", cells: { mon: "P" } },
    ];
    render(
      <MatrixGridShell
        columns={mixedColumns}
        rows={mixedRows}
        renderCell={(ctx) => ctx.cell}
        renderEmptyCell={() => "—"}
      />,
    );
    const cells = document.querySelectorAll("tbody td");
    expect(cells[0]!.getAttribute("data-filled")).toBe("");
    expect(cells[0]!.textContent).toBe("P");
    expect(cells[1]!.hasAttribute("data-filled")).toBe(false);
    expect(cells[1]!.textContent).toBe("—");
  });

  it("renders no content by default on empty cells (no renderEmptyCell)", () => {
    const emptyRows: MatrixRow<string>[] = [{ id: "1", label: "Ada", cells: {} }];
    render(<MatrixGridShell columns={columns} rows={emptyRows} renderCell={(ctx) => ctx.cell} />);
    expect(document.querySelector("tbody td")!.textContent).toBe("");
  });
});

const groupedColumns: MatrixColumn[] = [
  { key: "a1", label: "A1", group: "Alpha" },
  { key: "a2", label: "A2", group: "Alpha" },
  { key: "b1", label: "B1" },
  { key: "c1", label: "C1", group: "Gamma" },
  { key: "c2", label: "C2", group: "Gamma" },
  { key: "c3", label: "C3", group: "Gamma" },
];

describe("banded header group merge", () => {
  it("merges adjacent same-group columns into one colSpan, leaves ungrouped columns alone", () => {
    const groupedRows: MatrixRow<string>[] = [
      { id: "1", label: "Ada", cells: { a1: "x" } },
    ];
    render(
      <MatrixGridShell
        columns={groupedColumns}
        rows={groupedRows}
        renderCell={(ctx) => ctx.cell}
      />,
    );

    const bandedRow = document.querySelectorAll("thead tr")[0]!;
    // First th is the empty sticky anchor, then one merged span per group run.
    const groupCells = Array.from(bandedRow.querySelectorAll("th")).slice(1);
    expect(groupCells).toHaveLength(3);
    expect(Array.from(groupCells).map((th) => th.textContent)).toEqual(["Alpha", "", "Gamma"]);
    expect(Array.from(groupCells).map((th) => th.getAttribute("colspan"))).toEqual(["2", "1", "3"]);

    const perColumnRow = document.querySelectorAll("thead tr")[1]!;
    expect(perColumnRow.querySelectorAll("th")).toHaveLength(7); // anchor + 6 columns
  });

  it("suppresses the banded row entirely when no column has a group", () => {
    render(
      <MatrixGridShell
        columns={columns}
        rows={rows}
        renderCell={(ctx) => ctx.cell}
      />,
    );
    expect(document.querySelectorAll("thead tr")).toHaveLength(1);
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
