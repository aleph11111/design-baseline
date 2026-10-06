import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  ListWithDetailShell,
  type ListColumn,
  type ListWithDetailShellProps,
} from "./ListWithDetailShell";

afterEach(() => {
  cleanup();
});

type Row = { id: string; name: string };

const rows: Row[] = [{ id: "1", name: "Ada Lovelace" }];

const columns: ListColumn<Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name, isIdentifier: true },
];

describe("ListWithDetailShell", () => {
  it("table presentation: identifier cell stays a cell, is focusable, and activates on Enter/Space", () => {
    const onRowSelect = vi.fn();
    render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowSelect={onRowSelect}
        presentation="table"
      />,
    );
    const cell = screen.getByRole("cell", { name: "Ada Lovelace" });
    expect(cell.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(cell, { key: "Enter" });
    expect(onRowSelect).toHaveBeenCalledWith(rows[0]);

    fireEvent.keyDown(cell, { key: " " });
    expect(onRowSelect).toHaveBeenCalledTimes(2);
  });

  it("card-grid presentation: row is a focusable button-role that activates on Enter/Space", () => {
    const onRowSelect = vi.fn();
    render(
      <ListWithDetailShell title="T"
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
      <ListWithDetailShell title="T"
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

  it("exposes the selected row to assistive tech in every presentation", () => {
    for (const presentation of ["table", "card-grid", "action-row"] as const) {
      const { unmount } = render(
        <ListWithDetailShell title="T"
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          onRowSelect={() => {}}
          selectedRowId="1"
          presentation={presentation}
        />,
      );
      if (presentation === "table") {
        expect(screen.getAllByRole("row", { selected: true })).toHaveLength(1);
      } else {
        expect(screen.getByRole("button", { name: "Ada Lovelace", pressed: true })).toBeTruthy();
      }
      unmount();
    }
  });

  it("table: actions column header has a visually hidden accessible name", () => {
    render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowActions={[{ label: "Delete", onSelect: () => {} }]}
        labels={{ rowActions: "Zeilenaktionen" }}
        presentation="table"
      />,
    );
    const head = screen.getByRole("columnheader", { name: "Zeilenaktionen" });
    expect(head.firstElementChild?.className).toContain("sr-only");
  });

  it("no onRowSelect: rows are not tab stops", () => {
    render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        presentation="action-row"
      />,
    );
    expect(screen.queryByRole("button", { name: "Ada Lovelace" })).toBeNull();
  });

  it("detail Sheet: the Sheet's bar is the shared surface bar and inverts on solid", () => {
    // The detail surface is the overlay (Sheet), opened by `selectedRowId`;
    // its header bar must be the one shared implementation (`data-slot=
    // surface-header`) — not a hand-rolled padding + header-fill wrapper.
    render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowSelect={() => {}}
        selectedRowId="1"
        detail={<div>Details for Ada</div>}
        detailTitle="Ada Lovelace"
        detailActions={<button type="button">Edit</button>}
      />,
    );

    const sheetTitle = screen.getByRole("heading", { name: "Ada Lovelace" });
    const bar = sheetTitle.closest(
      '[data-slot="surface-header"]',
    ) as HTMLElement;
    expect(bar).not.toBeNull();
    // the bar owns the canonical padding; the shell re-types no fill or
    // title-scale classes — the title carries only the primitive's defaults
    // plus its structural truncate
    expect(bar.className).toContain("px-5");
    expect(bar.className).toContain("py-4");
    expect(sheetTitle.className).toContain("truncate");
    expect(sheetTitle.className).not.toContain("leading-tight");
    // one fixed neutral treatment — no accent fill, no inversion (ADR-0008)
    expect(bar.className).toContain("bg-surface-raised");
    expect(bar.className).not.toContain("bg-primary");
    // the actions row clears the Sheet's built-in close button (structural)
    const actionsRow = bar.querySelector(".pr-8") as HTMLElement;
    expect(actionsRow.textContent).toContain("Edit");
  });

  it("desktop: the detail never renders in-flow beside the list — a row click opens the Sheet", () => {
    // v3.0: no rail. An in-flow panel sits at the top of the list, so a row
    // selected far down a long list showed its detail off-screen.
    const { container } = render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowSelect={() => {}}
        detail={<div>Details for Ada</div>}
        detailTitle="Ada Lovelace"
        detailActions={<button type="button">Edit</button>}
      />,
    );
    expect(container.textContent).not.toContain("Details for Ada");
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("cell", { name: "Ada Lovelace" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Details for Ada");
    expect(dialog.textContent).toContain("Edit");
    expect(container.textContent).not.toContain("Details for Ada");
  });

  it("a selection set from outside (deep link) opens the Sheet on mount", () => {
    render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        selectedRowId="1"
        detail={<div>Details for Ada</div>}
      />,
    );
    expect(screen.getByRole("dialog").textContent).toContain("Details for Ada");
  });

  it("no detailTitle renders only the detail in the Sheet", () => {
    render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        selectedRowId="1"
        detail={<div>Details for Ada</div>}
        detailActions={<button type="button">Edit</button>}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(dialog.textContent).toContain("Details for Ada");
  });

  it("dismissing the Sheet (Esc) calls onDetailClose", () => {
    const onDetailClose = vi.fn();
    render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowSelect={() => {}}
        detail={<div>Details for Ada</div>}
        onDetailClose={onDetailClose}
      />,
    );
    fireEvent.click(screen.getByRole("cell", { name: "Ada Lovelace" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onDetailClose).toHaveBeenCalledTimes(1);
  });

  it("page frame (ADR-0008): one h1, no on-surface title; actions in the header, toolbar + count in the band", () => {
    const { container } = render(
      <ListWithDetailShell
        title="People"
        actions={<button type="button">Add person</button>}
        toolbar={<input aria-label="Search" />}
        count="1 result"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("People")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Add person" }).closest(".bg-surface-raised")).toBeNull();
    const band = screen.getByRole("textbox", { name: "Search" }).closest(".border-b") as HTMLElement;
    expect(band.textContent).toContain("1 result");
    // One raised surface; full-bleed as the page's own frame (ADR-0007 §1).
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
    expect((container.firstElementChild as HTMLElement).className).toContain("db-full-bleed");
  });

  it("renders the footer band below the body, and the empty-state action", () => {
    const { rerender } = render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        footer={<button type="button">Load more</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Load more" })).toBeTruthy();

    rerender(
      <ListWithDetailShell title="T"
        rows={[]}
        columns={columns}
        getRowId={(r) => r.id}
        emptyStateAction={<button type="button">Add person</button>}
      />,
    );
    expect(screen.getByText("No items yet")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add person" })).toBeTruthy();
  });

  it('hideBelow="2xl" hides a record-provenance column below 2xl, but never the identifier', () => {
    type Wide = Row & { created: string };
    const wideColumns: ListColumn<Wide>[] = [
      { key: "name", header: "Name", cell: (r) => r.name, isIdentifier: true, hideBelow: "2xl" },
      { key: "created", header: "Created", cell: (r) => r.created, hideBelow: "2xl" },
    ];
    render(
      <ListWithDetailShell title="T"
        rows={[{ ...rows[0]!, created: "2026-01-01" }]}
        columns={wideColumns}
        getRowId={(r) => r.id}
      />,
    );
    expect(screen.getByText("Created").className).toContain("hidden 2xl:table-cell");
    expect(screen.getByText("2026-01-01").className).toContain("hidden 2xl:table-cell");
    expect(screen.getByText("Name").className).not.toContain("hidden");
  });
});

// ---------------------------------------------------------------------------
// Type-level regression guard (checked by `tsc`, not the runtime).
//
// The acceptance for closing this API is that `ListWithDetailShellProps`
// declares none of `detailPresentation` / `unstyled` / `className` — the three
// axes deleted in the archetype-convergence close-API — nor the header props
// ADR-0008 retired (`kicker`, `headerActions`) or the dropped root `ref`. If any retired axis
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
  Absent<ListWithDetailShellProps<Row>, "kicker">,
  Absent<ListWithDetailShellProps<Row>, "headerActions">,
  Absent<ListWithDetailShellProps<Row>, "ref">,
] extends [true, true, true, true, true, true]
  ? true
  : never;

const closedPropGuard: _ClosedAxesGuard = true;
expect(closedPropGuard).toBe(true);

// ---------------------------------------------------------------------------
// Export-contract tripwire (checked by `tsc`, not the runtime).
//
// The export is the generic function itself — no wrapper and no
// hand-written `as <Row>(…)` re-declaration (the wrapper + cast let the export
// signature drift from `ListWithDetailShellProps`, so a wrong-arity `rows`
// typechecked against the hand-written signature). If the export ever stops
// accepting `ListWithDetailShellProps<Row>` again (a reintroduced wrapper, a
// dropped generic, a prop the public type doesn't declare), this spread fails
// to compile against the component's own JSX contract.
// ---------------------------------------------------------------------------
function _exportContractTripwire(props: ListWithDetailShellProps<Row>) {
  return <ListWithDetailShell {...props} />;
}
void _exportContractTripwire;

describe("ListWithDetailShell sort header", () => {
  it("is a keyboard-operable button inside the aria-sort header cell", () => {
    const onSortChange = vi.fn();
    render(
      <ListWithDetailShell title="T"
        rows={rows}
        columns={[{ ...columns[0]!, sortable: true }]}
        getRowId={(row) => row.id}
        sortBy="name"
        sortDirection="asc"
        onSortChange={onSortChange}
      />,
    );
    const header = screen.getByRole("columnheader", { name: /name/i });
    expect(header.getAttribute("aria-sort")).toBe("ascending");

    const button = screen.getByRole("button", { name: /name/i });
    expect(header.contains(button)).toBe(true);
    // A native <button> is in the Tab order and activates on Enter/Space.
    expect(button.tagName).toBe("BUTTON");
    fireEvent.click(button);
    expect(onSortChange).toHaveBeenCalledWith("name", "desc");
  });
});

describe("ListWithDetailShell — viewOptions", () => {
  it("forwards viewOptions and its label to the toolbar band", () => {
    render(
      <ListWithDetailShell
        title="T"
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        count="1 result"
        viewOptions={<div data-testid="vo" />}
        viewOptionsLabel="Ansicht"
      />,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Ansicht" }), { key: "Enter" });
    expect(screen.getByTestId("vo")).toBeTruthy();
  });
});
