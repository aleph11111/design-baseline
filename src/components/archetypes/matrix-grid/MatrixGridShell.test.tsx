import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import type { MatrixSelection } from "./MatrixInspector";
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
      <MatrixGridShell title="M"
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
    render(<MatrixGridShell title="M" columns={columns} rows={rows} renderCell={(ctx) => ctx.cell} />);
    expect(screen.queryByRole("button", { name: "P" })).toBeNull();
  });

  it("stamps data-filled on filled cells, omits it on empty cells", () => {
    const mixedColumns: MatrixColumn[] = [{ key: "mon", label: "Mon" }, { key: "tue", label: "Tue" }];
    const mixedRows: MatrixRow<string>[] = [
      { id: "1", label: "Ada", cells: { mon: "P" } },
    ];
    render(
      <MatrixGridShell title="M"
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
      <MatrixGridShell title="M"
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
    render(<MatrixGridShell title="M" columns={columns} rows={emptyRows} renderCell={(ctx) => ctx.cell} />);
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
      <MatrixGridShell title="M"
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
      <MatrixGridShell title="M"
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
        <MatrixGridShell<number> title="M"
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
        <MatrixGridShell<number> title="M"
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

describe("MatrixGridShell sticky first column", () => {
  it("paints every sticky cell opaque so scrolled cells never show through", () => {
    const grouped: MatrixColumn[] = [
      { key: "mon", label: "Mon", group: "W1" },
      { key: "tue", label: "Tue", group: "W1" },
    ];
    const { container } = render(
      <MatrixGridShell title="M" columns={grouped} rows={rows} renderCell={(ctx) => ctx.cell} />,
    );
    const sticky = [...container.querySelectorAll<HTMLElement>('[class*="sticky"]')];
    expect(sticky.length).toBeGreaterThanOrEqual(3); // group head, column head, body cell
    for (const cell of sticky) {
      // no `bg-<token>/<alpha>` translucency on a pinned cell
      expect(cell.className).not.toMatch(/(^|\s)bg-[\w-]+\/\d+/);
    }
  });
});

describe("MatrixGridShell page frame (ADR-0008)", () => {
  it("titles the page once, as the h1, with no on-surface title", () => {
    const { container } = render(
      <MatrixGridShell
        title="Attendance"
        toolbar={<span>As of</span>}
        actions={<button type="button">Export CSV</button>}
        columns={columns}
        rows={rows}
        renderCell={(ctx) => ctx.cell}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Attendance")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    const band = screen.getByText("As of").closest(".border-b") as HTMLElement;
    expect(band.contains(screen.getByText("Export CSV"))).toBe(false);
  });

  it("keeps title and toolbar visible in the empty state", () => {
    render(
      <MatrixGridShell
        title="Attendance"
        toolbar={<span>As of</span>}
        columns={columns}
        rows={[]}
        emptyState={<p>No rows</p>}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Attendance");
    expect(screen.getByText("As of")).toBeTruthy();
    expect(screen.getByText("No rows")).toBeTruthy();
    expect(document.querySelector('[data-slot="matrix-scroll"]')).toBeNull();
  });
});

describe("MatrixGridShell horizontal scroll", () => {
  it("scrolls only the table: the header band stays outside the scroll box", () => {
    const { container } = render(
      <MatrixGridShell title="Matrix"
        toolbar={<span data-testid="toolbar-control">Date</span>}
        columns={columns}
        rows={rows}
        renderCell={(ctx) => ctx.cell}
      />,
    );
    const scroller = container.querySelector<HTMLElement>('[data-slot="matrix-scroll"]')!;
    const frame = scroller.closest(".rounded-lg") as HTMLElement;

    expect(frame.className).not.toContain("overflow-x-auto");
    expect(scroller.className).toContain("overflow-x-auto");
    expect(scroller.className).toMatch(/(^|\s)relative(\s|$)/);
    // Title and toolbar are frame children above the scroller, not inside it.
    expect(scroller.contains(screen.getByRole("heading", { level: 1 }))).toBe(false);
    expect(scroller.contains(screen.getByTestId("toolbar-control"))).toBe(false);
    // Every sticky cell pins against the scroll box.
    for (const cell of container.querySelectorAll('[class*="sticky"]')) {
      expect(scroller.contains(cell)).toBe(true);
    }
  });

  describe("inspector", () => {
    const cols: MatrixColumn[] = [{ key: "y1", label: "Y1" }, { key: "y2", label: "Y2" }];
    const lines: MatrixRow<string>[] = [
      { id: "a", label: "Revenue", cells: { y1: "a1", y2: "a2" } },
      { id: "b", label: "Costs", cells: { y1: "b1", y2: "b2" } },
      { id: "c", label: "Result", cells: { y1: "c1", y2: "c2" } },
    ];

    function Harness({
      guard,
      onCellClick,
      initial = null,
    }: {
      guard?: (n: MatrixSelection | null) => boolean | Promise<boolean>;
      onCellClick?: () => void;
      initial?: MatrixSelection | null;
    }) {
      const [sel, setSel] = React.useState<MatrixSelection | null>(initial);
      return (
        <MatrixGridShell<string>
          title="Plan"
          columns={cols}
          rows={lines}
          renderCell={(ctx) => ctx.cell}
          onCellClick={onCellClick}
          inspector={{
            selection: sel,
            onSelectionChange: setSel,
            onBeforeSelect: guard,
            title: sel ? `Line ${sel.rowId}` : "",
            children: <p>body {sel?.rowId}:{sel?.columnKey}</p>,
          }}
        />
      );
    }
    const dock = () => document.querySelector('[data-slot="matrix-inspector"]');
    const flush = () => act(async () => {});

    it("a cell click opens the dock beside the grid, without a backdrop, and skips onCellClick", async () => {
      const onCellClick = vi.fn();
      render(<Harness onCellClick={onCellClick} />);
      expect(dock()).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "b2" }));
      await flush();
      expect(dock()?.tagName).toBe("ASIDE");
      expect(dock()?.className).toContain("w-[480px]");
      expect(screen.getByText("body b:y2")).toBeTruthy();
      expect(document.querySelector("[data-state=open][class*='bg-black']")).toBeNull();
      expect(onCellClick).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "b2" }).getAttribute("aria-current")).toBe("true");
    });

    it("another cell click re-roots the open inspector without closing it", async () => {
      render(<Harness initial={{ rowId: "a", columnKey: "y1" }} />);
      const first = dock();
      fireEvent.click(screen.getByRole("button", { name: "c1" }));
      await flush();
      expect(dock()).toBe(first);
      expect(screen.getByText("body c:y1")).toBeTruthy();
    });

    it("a blocking guard keeps selection and inspector unchanged (sync and async)", async () => {
      for (const guard of [() => false, async () => false]) {
        render(<Harness guard={guard} initial={{ rowId: "a", columnKey: "y1" }} />);
        fireEvent.click(screen.getByRole("button", { name: "b1" }));
        fireEvent.click(screen.getByRole("button", { name: "Next" }));
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        await flush();
        expect(screen.getByText("body a:y1")).toBeTruthy();
        cleanup();
      }
    });

    it("the guard is asked for grid clicks, prev / next and close, and an allowing guard switches", async () => {
      const guard = vi.fn(async () => true);
      render(<Harness guard={guard} initial={{ rowId: "a", columnKey: "y2" }} />);
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      await flush();
      expect(screen.getByText("body b:y2")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      await flush();
      expect(screen.getByText("body a:y2")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "c1" }));
      await flush();
      expect(screen.getByText("body c:y1")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Next" })).toHaveProperty("disabled", true);
      fireEvent.keyDown(dock()!, { key: "Escape" });
      await flush();
      expect(dock()).toBeNull();
      expect(guard.mock.calls.map((c) => (c as unknown[])[0])).toEqual([
        { rowId: "b", columnKey: "y2" },
        { rowId: "a", columnKey: "y2" },
        { rowId: "c", columnKey: "y1" },
        null,
      ]);
    });

    it("no guard: the switch is immediate (same tick)", () => {
      render(<Harness initial={{ rowId: "a", columnKey: "y1" }} />);
      fireEvent.click(screen.getByRole("button", { name: "b1" }));
      // no flush: an absent guard must not defer the switch to a microtask
      expect(screen.getByText("body b:y1")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(dock()).toBeNull();
    });
  });
});
