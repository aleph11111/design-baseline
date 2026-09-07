import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { COL_HEADER_CLASS } from "../../layout/overline";
import {
  ReportLineTable,
  ReportLineRow,
} from "../report";
import {
  StatementTable,
  StatementRow,
  StatementTotalRow,
} from "../statement-with-filters";
import { statementGridClass } from "./FigureTable";

afterEach(() => {
  cleanup();
});

/** The figure-table column-header row — the div carrying `COL_HEADER_CLASS`. */
function headerRow(container: HTMLElement): HTMLElement | null {
  return (
    Array.from(container.querySelectorAll("div")).find(
      (el) => typeof el.className === "string" && el.className.includes("text-[9.5px]"),
    ) ?? null
  );
}

/** The figure (numeric) cells — mono tabular `text-[13px]` divs. */
function figureCells(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll("div"),
  ).filter(
    (el) =>
      typeof el.className === "string" &&
      el.className.includes("font-mono") &&
      el.className.includes("tabular-nums") &&
      el.className.includes("text-[13px]"),
  );
}

describe("FigureTable — shared figure-table signature", () => {
  it("renders one column-header treatment across both archetypes", () => {
    const { container: r } = render(
      <ReportLineTable>
        <ReportLineRow
          name="Plakate A2"
          qty="120"
          unit="3,40 €"
          sum="408,00 €"
        />
      </ReportLineTable>,
    );
    const { container: s } = render(
      <StatementTable columns={["Hive", "Honey", "Wax"]}>
        <StatementRow label="Meadow hive" cells={["12.4", "3.1"]} />
      </StatementTable>,
    );

    for (const container of [r, s]) {
      // The 9.5px overline scale is composed once (COL_HEADER_CLASS) and
      // never re-typed: header carries it plus the bottom hairline + py-2.
      const header = headerRow(container);
      expect(header).not.toBeNull();
      expect(header?.className).toContain(COL_HEADER_CLASS);
      expect(header?.className).toContain("border-b border-border py-2");

      // The hairline row-divide body sits under the header.
      const body = Array.from(container.querySelectorAll("div")).find(
        (el) =>
          typeof el.className === "string" &&
          el.className.includes("divide-y divide-border/70"),
      );
      expect(body).not.toBeNull();
    }
  });

  it("renders one figure-cell treatment across both archetypes (terminal promotion)", () => {
    const { container: r } = render(
      <ReportLineTable>
        <ReportLineRow
          name="Plakate A2"
          qty="120"
          unit="3,40 €"
          sum="408,00 €"
        />
      </ReportLineTable>,
    );
    const { container: s } = render(
      <StatementTable columns={["Hive", "Honey", "Wax"]}>
        <StatementRow label="Meadow hive" cells={["12.4", "3.1"]} />
      </StatementTable>,
    );

    for (const container of [r, s]) {
      const cells = figureCells(container);
      // Every non-terminal figure cell: the muted figure-cell base treatment —
      // mono tabular 13px, muted (the terminal cell carries the promotion
      // instead; alignment is per-archetype via `cellAlign` and asserted
      // separately for the statement below).
      cells.slice(0, -1).forEach((cell) => {
        expect(cell.className).toContain("font-mono text-[13px] tabular-nums");
        expect(cell.className).toContain("text-muted-foreground");
        expect(cell.className).not.toContain("font-semibold");
      });
      // The terminal cell is the promoted headline figure.
      const terminal = cells[cells.length - 1];
      expect(terminal).toBeDefined();
      expect(terminal!.className).toContain("font-semibold text-foreground");
    }

    // The statement keeps the shared right-alignment default for every
    // numeric cell (the report's qty column opts into `text-center`).
    figureCells(s).forEach((cell) => {
      expect(cell.className).toContain("text-right");
    });
  });

  it("shares one static grid per archetype between header and every row", () => {
    const { container: r } = render(
      <ReportLineTable>
        <ReportLineRow
          name="Plakate A2"
          qty="120"
          unit="3,40 €"
          sum="408,00 €"
        />
      </ReportLineTable>,
    );
    const { container: s } = render(
      <StatementTable columns={["Hive", "Honey", "Wax"]}>
        <StatementRow label="Meadow hive" cells={["12.4", "3.1"]} />
        <StatementTotalRow label="Total" cells={["96.0", "22.9"]} />
      </StatementTable>,
    );

    const reportGrid = "grid grid-cols-[1fr_3rem_5.5rem_6rem] gap-x-3";
    const statementGrid = statementGridClass(2);

    for (const [grid, container, minRows] of [
      [reportGrid, r, 2], // header + one line row
      [statementGrid, s, 3], // header + data + totals rows
    ] as const) {
      const gridRows = Array.from(container.querySelectorAll("div")).filter(
        (el) =>
          typeof el.className === "string" &&
          el.className.includes(grid.split(" ")[1] ?? ""),
      );
      // Header + every data/total row share the exact template.
      expect(gridRows.length).toBeGreaterThanOrEqual(minRows);
      for (const row of gridRows) {
        expect(row.className).toContain(grid.replace("grid ", ""));
      }
    }
  });

  it("emits only static statement grid templates", () => {
    // Every grid class is a fixed literal the Tailwind scanner sees — one per
    // column count, no runtime composition.
    const expected: Record<number, string> = {
      1: "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem]",
      2: "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem_5.5rem]",
      3: "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_5.5rem]",
    };
    for (const [count, grid] of Object.entries(expected)) {
      expect(statementGridClass(Number(count))).toBe(grid);
    }
    // Past the table's realistic width there is no template to emit.
    expect(() => statementGridClass(7)).toThrow(
      /no static grid template for 7 numeric columns/,
    );
  });

  it("promotes every totals-row cell (strong emphasis)", () => {
    const { container } = render(
      <StatementTable columns={["Hive", "Honey", "Wax"]}>
        <StatementRow label="Meadow hive" cells={["12.4", "3.1"]} />
        <StatementTotalRow label="Total" cells={["96.0", "22.9"]} />
      </StatementTable>,
    );

    const tinted = Array.from(container.querySelectorAll("div")).find(
      (el) => typeof el.className === "string" && el.className.includes("bg-muted/40"),
    );
    expect(tinted).not.toBeNull();
    const cells = Array.from(tinted!.children).filter(
      (el) =>
        el instanceof HTMLDivElement &&
        typeof el.className === "string" &&
        el.className.includes("font-mono"),
    );
    expect(cells.length).toBe(2);
    cells.forEach((cell) => {
      expect(cell.className).toContain("font-semibold text-foreground");
    });
  });
});
