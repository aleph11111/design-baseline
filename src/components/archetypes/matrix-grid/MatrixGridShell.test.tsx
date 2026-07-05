import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
