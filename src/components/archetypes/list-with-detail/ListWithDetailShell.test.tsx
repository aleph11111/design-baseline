import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ListWithDetailShell, type ListColumn } from "./ListWithDetailShell";

// jsdom has no matchMedia; ListWithDetailShell reads it (via useIsMobile) on
// every mount to decide rail vs. sheet presentation.
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

afterEach(() => {
  cleanup();
});

type Row = { id: string; name: string };

const rows: Row[] = [{ id: "1", name: "Ada Lovelace" }];

const columns: ListColumn<Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name, isIdentifier: true },
];

describe("ListWithDetailShell", () => {
  it("table presentation: identifier cell is a focusable button-role that activates on Enter/Space", () => {
    const onRowSelect = vi.fn();
    render(
      <ListWithDetailShell
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowSelect={onRowSelect}
        presentation="table"
      />,
    );
    const cell = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(cell.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(cell, { key: "Enter" });
    expect(onRowSelect).toHaveBeenCalledWith(rows[0]);

    fireEvent.keyDown(cell, { key: " " });
    expect(onRowSelect).toHaveBeenCalledTimes(2);
  });

  it("card-grid presentation: row is a focusable button-role that activates on Enter/Space", () => {
    const onRowSelect = vi.fn();
    render(
      <ListWithDetailShell
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowSelect={onRowSelect}
        presentation="card-grid"
      />,
    );
    const card = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(card.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(card, { key: "Enter" });
    expect(onRowSelect).toHaveBeenCalledWith(rows[0]);
  });

  it("action-row presentation: row is a focusable button-role that activates on Enter/Space", () => {
    const onRowSelect = vi.fn();
    render(
      <ListWithDetailShell
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowSelect={onRowSelect}
        presentation="action-row"
      />,
    );
    const row = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(row.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(row, { key: "Enter" });
    expect(onRowSelect).toHaveBeenCalledWith(rows[0]);
  });

  it("no onRowSelect: rows are not tab stops", () => {
    render(
      <ListWithDetailShell
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        presentation="action-row"
      />,
    );
    expect(screen.queryByRole("button", { name: "Ada Lovelace" })).toBeNull();
  });

  it("forwards the ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ListWithDetailShell ref={ref} rows={rows} columns={columns} getRowId={(row) => row.id} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
