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

  it("identifier cell is a focusable button-role that activates onRowEdit on Enter/Space", () => {
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

    const cell = screen.getByRole("button", { name: "Row 0" });
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
