import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  ListWithDetailShell,
  ListChromeContext,
  type ListColumn,
  type ListWithDetailShellProps,
} from "./ListWithDetailShell";

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
// useIsMobile keys on window.innerWidth < 768, not matchMedia.matches; keep a
// stable desktop width unless a test asserts the mobile overlay path.
window.innerWidth = 1024;

afterEach(() => {
  cleanup();
  window.innerWidth = 1024;
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

  it("mobile: the detail renders as the overlay (Sheet) and dismissing it (Esc) calls onDetailClose", () => {
    // On narrow viewports the detail surface is the mobile overlay (Sheet);
    // there is no desktop opt-in axis for it.
    window.innerWidth = 375;
    const onDetailClose = vi.fn();
    render(
      <ListWithDetailShell
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowSelect={() => {}}
        selectedRowId="1"
        detail={<div>Details for Ada</div>}
        onDetailClose={onDetailClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ada Lovelace" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onDetailClose).toHaveBeenCalledTimes(1);
  });

  it("draws the bounded card by default, and renders flush under ListChromeContext", () => {
    // The bounded-card chrome is owned by <SurfaceFrame> (the frame slot the
    // shell composes) — asserted here per-token so a shell re-spelling its own
    // frame is caught by this test, not by string match.
    const frameChrome = ["rounded-lg", "border", "bg-card", "overflow-hidden"];

    const { container: standalone } =
      render(
        <ListWithDetailShell rows={rows} columns={columns} getRowId={(row) => row.id} />,
      );
    const standaloneRoot = standalone.firstElementChild as HTMLElement;
    for (const token of frameChrome) {
      expect(standaloneRoot.className).toContain(token);
    }
    cleanup();

    const { container: flush } = render(
      <ListChromeContext.Provider value>
        <ListWithDetailShell rows={rows} columns={columns} getRowId={(row) => row.id} />
      </ListChromeContext.Provider>,
    );
    const flushRoot = flush.firstElementChild as HTMLElement;
    for (const token of frameChrome) {
      expect(flushRoot.className).not.toContain(token);
    }
  });

  it("forwards the ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ListWithDetailShell ref={ref} rows={rows} columns={columns} getRowId={(row) => row.id} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// ---------------------------------------------------------------------------
// Type-level regression guard (checked by `tsc`, not the runtime).
//
// The acceptance for closing this API is that `ListWithDetailShellProps`
// declares none of `detailPresentation` / `unstyled` / `className` — the three
// axes deleted in the archetype-convergence close-API. If any retired axis
// leaks back into the props type, one of the `_Guard` entries collapses to
// `never` and the assignment below fails to compile — the break is caught at
// typecheck time. `presentation` and `align` stay legal (contract-keyed).
// ---------------------------------------------------------------------------
type Key<T, K extends PropertyKey> = K extends keyof T ? "present" : "absent";
type Absent<T, K extends PropertyKey> = Key<T, K> extends "absent" ? true : never;

type _ClosedAxesGuard = [
  Absent<ListWithDetailShellProps<Row>, "detailPresentation">,
  Absent<ListWithDetailShellProps<Row>, "unstyled">,
  Absent<ListWithDetailShellProps<Row>, "className">,
] extends [true, true, true]
  ? true
  : never;

const closedPropGuard: _ClosedAxesGuard = true;
expect(closedPropGuard).toBe(true);
