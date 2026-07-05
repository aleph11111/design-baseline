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

    const includesSpy = vi.spyOn(Array.prototype, "includes");
    const hasSpy = vi.spyOn(Set.prototype, "has");

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

    // React itself calls Array#includes internally (e.g. lifecycle bookkeeping),
    // so assert on *what* is being scanned rather than banning the method
    // outright: `selectedIds` itself must never be the receiver of `.includes`,
    // and a `Set` must back the per-row/header membership checks instead.
    const scannedSelectedIdsArray = includesSpy.mock.contexts.some(
      (ctx) => ctx === selectedIds,
    );
    expect(scannedSelectedIdsArray).toBe(false);
    expect(hasSpy.mock.calls.length).toBeGreaterThanOrEqual(rows.length);

    // Behavior is unchanged: every row renders selected and the header
    // checkbox reflects "all selected".
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(rows.length + 1);
    for (const checkbox of checkboxes) {
      expect(checkbox.getAttribute("data-state")).toBe("checked");
    }
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
});
