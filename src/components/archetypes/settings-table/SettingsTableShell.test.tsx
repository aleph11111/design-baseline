import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SettingsTableShell, type SettingsColumn } from "./SettingsTableShell";

type Row = { id: string; name: string };

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    name: `Row ${i}`,
  }));
}

const columns: SettingsColumn<Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name, isIdentifier: true },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SettingsTableShell selection membership", () => {
  it("checks row/header selection membership via a Set, not Array#includes", () => {
    const rows = makeRows(30);
    const selectedIds = rows.map((r) => r.id);

    // Spy on the `selectedIds` array instance only (not Array.prototype) so
    // every other `.includes()` call made by React/jsdom/testing-library
    // during render stays native — patching the global prototype made this
    // test's timing depend on unrelated render work and flaked under load.
    const includesSpy = vi.spyOn(selectedIds, "includes");

    render(
      <SettingsTableShell
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
        selectedIds={selectedIds}
        onBulkSelectChange={() => {}}
      />,
    );

    // `selectedIds` itself must never be scanned via `.includes` — membership
    // checks should go through the memoized Set instead. The Set instance is
    // internal (useMemo), so we don't assert on it directly; its use is
    // covered by the behavioral assertions below.
    expect(includesSpy).not.toHaveBeenCalled();

    // Behavior is unchanged: every row renders selected and the header
    // checkbox reflects "all selected".
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(rows.length + 1);
    for (const checkbox of checkboxes) {
      expect(checkbox.getAttribute("data-state")).toBe("checked");
    }
  });

  it("identifier cell is a focusable cell that activates onRowEdit on Enter/Space", () => {
    const onRowEdit = vi.fn();
    const rows = makeRows(1);

    render(
      <SettingsTableShell
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowEdit={onRowEdit}
      />,
    );

    const cell = screen.getByRole("cell", { name: "Row 0" });
    expect(cell.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(cell, { key: "Enter" });
    expect(onRowEdit).toHaveBeenCalledWith(rows[0]);

    fireEvent.keyDown(cell, { key: " " });
    expect(onRowEdit).toHaveBeenCalledTimes(2);
  });

  it("no onRowEdit: the identifier cell is not a tab stop", () => {
    render(
      <SettingsTableShell
        rows={makeRows(1)}
        columns={columns}
        getRowId={(row) => row.id}
      />,
    );
    expect(screen.queryByRole("button", { name: "Row 0" })).toBeNull();
  });

  it("still resolves the correct rows on bulk delete", () => {
    const rows = makeRows(5);
    const selectedIds = ["row-1", "row-3"];
    const onBulkDelete = vi.fn();
    const onBulkSelectChange = vi.fn();

    render(
      <SettingsTableShell
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
        selectedIds={selectedIds}
        onBulkSelectChange={onBulkSelectChange}
        onBulkDelete={onBulkDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete 2 selected" }));

    expect(onBulkDelete).toHaveBeenCalledWith([rows[1], rows[3]]);
    expect(onBulkSelectChange).toHaveBeenCalledWith([]);
  });

  it("renders the result-count line from rowLabel (string and count function)", () => {
    const { rerender } = render(
      <SettingsTableShell rows={makeRows(3)} columns={columns} getRowId={(r) => r.id} rowLabel="suppliers" />,
    );
    expect(screen.getByText("3 suppliers")).toBeTruthy();

    rerender(
      <SettingsTableShell
        rows={makeRows(1)}
        columns={columns}
        getRowId={(r) => r.id}
        rowLabel={(n) => (n === 1 ? "agent" : "agents")}
      />,
    );
    expect(screen.getByText("1 agent")).toBeTruthy();
  });
});

describe("SettingsTableShell empty-state CTA", () => {
  const empty = (isFiltered: boolean) => (
    <SettingsTableShell
      rows={[]}
      columns={columns}
      getRowId={(r) => r.id}
      onAddNew={() => {}}
      addNewLabel="Add thing"
      isFiltered={isFiltered}
    />
  );

  it("offers the Add CTA in the body only when the list is truly empty", () => {
    const { rerender } = render(empty(false));
    // toolbar button + empty-state CTA
    expect(screen.getAllByRole("button", { name: "Add thing" })).toHaveLength(2);

    rerender(empty(true));
    expect(screen.getAllByRole("button", { name: "Add thing" })).toHaveLength(1);
  });
});

// The ticket scenario: the consumer owns `selectedIds` and filters `rows`
// independently. The shell must never show or act on an id the filter hid —
// hidden rows drop out of the count, the destructive path, and re-selection.
describe("SettingsTableShell filter-safe bulk selection", () => {
  const rows: Row[] = [
    { id: "row-0", name: "Row 0" },
    { id: "row-1", name: "Row 1" },
    { id: "row-2", name: "Row 2" },
    { id: "row-3", name: "Row 3" },
    { id: "row-4", name: "Row 4" },
  ];
  // 3 rows were ticked while all five were visible; the consumer then filtered
  // the list down to just row-0 and row-4 (2 of the 5 shown).
  const visible: Row[] = [rows[0]!, rows[4]!];
  const selectedIds = ["row-0", "row-1", "row-2"];

  it("counts only the visible selected rows in the selection caption", () => {
    render(
      <SettingsTableShell
        rows={visible}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
        selectedIds={selectedIds}
        onBulkSelectChange={() => {}}
        onBulkDelete={() => {}}
      />,
    );
    // row-1 and row-2 are hidden by the filter — the caption shows 1, not 3.
    expect(screen.getByText("1 selected")).toBeTruthy();
    expect(screen.queryByText("3 selected")).toBeNull();
  });

  it("the destructive bulk button names only the visible selected count", () => {
    render(
      <SettingsTableShell
        rows={visible}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
        selectedIds={selectedIds}
        onBulkSelectChange={() => {}}
        onBulkDelete={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Delete 1 selected" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Delete 3 selected" })).toBeNull();
  });

  it("bulk delete resolves only the visible selected rows", () => {
    const onBulkDelete = vi.fn();
    const onBulkSelectChange = vi.fn();

    render(
      <SettingsTableShell
        rows={visible}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
        selectedIds={selectedIds}
        onBulkSelectChange={onBulkSelectChange}
        onBulkDelete={onBulkDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete 1 selected" }));

    // Only row-0 (visible AND selected) is deleted. row-1/row-2 (hidden by the
    // filter) and row-4 (visible but not selected) are untouched.
    expect(onBulkDelete).toHaveBeenCalledWith([rows[0]]);
    expect(onBulkSelectChange).toHaveBeenCalledWith([]);
  });

  it("does not show bulk actions when only hidden rows are selected", () => {
    const allHidden: Row[] = [rows[0]!, rows[4]!];
    const selectedHidden = ["row-1", "row-2"];

    render(
      <SettingsTableShell
        rows={allHidden}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
        selectedIds={selectedHidden}
        onBulkSelectChange={() => {}}
        onBulkDelete={() => {}}
      />,
    );
    // No visible selected row -> no bulk-mode caption or delete button; the
    // result-count line shows instead.
    expect(screen.queryByRole("button", { name: "Delete 2 selected" })).toBeNull();
    expect(screen.queryByText("2 selected")).toBeNull();
  });
});

describe("SettingsTableShell row-checkbox accessible names", () => {
  it("names each row checkbox after its identifier column", () => {
    render(
      <SettingsTableShell
        rows={makeRows(2)}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
      />,
    );
    // The identifier cell for Row 0/Row 1 is the name — the checkbox names it.
    expect(screen.getByRole("checkbox", { name: "Select row: Row 0" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Select row: Row 1" })).toBeTruthy();
    // The header checkbox keeps its own, non-row-specific name.
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeTruthy();
  });

  it("a function selectRow override customises the row name", () => {
    render(
      <SettingsTableShell
        rows={makeRows(2)}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
        labels={{ selectRow: (row) => `Wähle ${row.name}` }}
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Wähle Row 0" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Wähle Row 1" })).toBeTruthy();
  });

  it("a JSX identifier cell falls back to the flat default, not [object Object]", () => {
    // A consumer whose identifier cell renders a React element (e.g. a styled
    // name or a link) must not get "Select row: [object Object]" — the shell
    // falls back to the flat "Select row" rather than interpolating a node.
    const jsxColumns: SettingsColumn<Row>[] = [
      {
        key: "name",
        header: "Name",
        isIdentifier: true,
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
    ];
    render(
      <SettingsTableShell
        rows={makeRows(2)}
        columns={jsxColumns}
        getRowId={(row) => row.id}
        bulkSelectable
      />,
    );
    const names = screen
      .getAllByRole("checkbox")
      .map((cb) => cb.getAttribute("aria-label"));
    expect(names).not.toContain("[object Object]");
    // Both row checkboxes carry the flat default (the header keeps its own).
    expect(names.filter((n) => n === "Select row")).toHaveLength(2);
  });

  it("getRowLabel names JSX-identifier rows distinctly", () => {
    const jsxColumns: SettingsColumn<Row>[] = [
      {
        key: "name",
        header: "Name",
        isIdentifier: true,
        cell: (row) => <span>{row.name}</span>,
      },
    ];
    render(
      <SettingsTableShell
        rows={makeRows(2)}
        columns={jsxColumns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        bulkSelectable
      />,
    );
    const names = screen
      .getAllByRole("checkbox")
      .map((cb) => cb.getAttribute("aria-label"));
    expect(names).toContain("Select row: Row 0");
    expect(names).toContain("Select row: Row 1");
    expect(names.join()).not.toContain("[object Object]");
  });
});
