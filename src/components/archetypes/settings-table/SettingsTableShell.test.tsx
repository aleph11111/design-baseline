import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SettingsTableBody, SettingsTableShell, type SettingsColumn } from "./SettingsTableShell";
import { PageFrame } from "../../layout/PageFrame";

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
      <SettingsTableShell title="T"
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
      <SettingsTableShell title="T"
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
      <SettingsTableShell title="T"
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
      <SettingsTableShell title="T"
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
      <SettingsTableShell title="T" rows={makeRows(3)} columns={columns} getRowId={(r) => r.id} rowLabel="suppliers" />,
    );
    expect(screen.getByText("3 suppliers")).toBeTruthy();

    rerender(
      <SettingsTableShell title="T"
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
    <SettingsTableShell title="T"
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
    // header create action + empty-state CTA
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
      <SettingsTableShell title="T"
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
      <SettingsTableShell title="T"
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
      <SettingsTableShell title="T"
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
      <SettingsTableShell title="T"
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
      <SettingsTableShell title="T"
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
    expect(screen.queryAllByRole("checkbox", { name: /\[object Object\]/ })).toHaveLength(0);
  });

  it("a function selectRow override customises the row name", () => {
    render(
      <SettingsTableShell title="T"
        rows={makeRows(2)}
        columns={columns}
        getRowId={(row) => row.id}
        bulkSelectable
        labels={{ selectRow: (row) => `Wähle ${row.name}` }}
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Wähle Row 0" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Wähle Row 1" })).toBeTruthy();
    expect(screen.queryAllByRole("checkbox", { name: /\[object Object\]/ })).toHaveLength(0);
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
      <SettingsTableShell title="T"
        rows={makeRows(2)}
        columns={jsxColumns}
        getRowId={(row) => row.id}
        bulkSelectable
      />,
    );
    // Both row checkboxes carry the flat default (the header keeps its own).
    expect(screen.getAllByRole("checkbox", { name: "Select row" })).toHaveLength(2);
    expect(screen.queryAllByRole("checkbox", { name: /\[object Object\]/ })).toHaveLength(0);
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
      <SettingsTableShell title="T"
        rows={makeRows(2)}
        columns={jsxColumns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        bulkSelectable
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Select row: Row 0" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Select row: Row 1" })).toBeTruthy();
    expect(screen.queryAllByRole("checkbox", { name: /\[object Object\]/ })).toHaveLength(0);
  });
});

describe("SettingsTableShell — page frame (ADR-0008)", () => {
  it("renders one h1, no on-surface title; Add + page actions in the header, count in the band", () => {
    const { container } = render(
      <SettingsTableShell
        title="Suppliers"
        rows={makeRows(3)}
        columns={columns}
        getRowId={(r) => r.id}
        rowLabel="suppliers"
        onAddNew={() => {}}
        addNewLabel="Add supplier"
        actions={<button type="button">Export</button>}
        toolbar={<input aria-label="Search" />}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Suppliers")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    // Create merges before the page's own actions, in the page header.
    const add = screen.getByRole("button", { name: "Add supplier" });
    const exp = screen.getByRole("button", { name: "Export" });
    expect(add.compareDocumentPosition(exp) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // …above the surface, not inside it.
    expect(add.closest(".bg-surface-raised")).toBeNull();
    expect(exp.closest(".bg-surface-raised")).toBeNull();
    // Toolbar band: search + count, no Add button there.
    const band = screen.getByRole("textbox", { name: "Search" }).closest(".border-b") as HTMLElement;
    expect(band.textContent).toContain("3 suppliers");
    expect(band.querySelector("button")).toBeNull();
  });

  it("bulk mode: '{n} selected' replaces the count; bulk delete is a header action", () => {
    render(
      <SettingsTableShell
        title="Suppliers"
        rows={makeRows(3)}
        columns={columns}
        getRowId={(r) => r.id}
        rowLabel="suppliers"
        bulkSelectable
        selectedIds={["row-0"]}
        onBulkSelectChange={() => {}}
        onBulkDelete={() => {}}
        toolbar={<input aria-label="Search" />}
      />,
    );
    const band = screen.getByRole("textbox", { name: "Search" }).closest(".border-b") as HTMLElement;
    expect(band.textContent).toContain("1 selected");
    expect(band.textContent).not.toContain("3 suppliers");
    expect(
      screen.getByRole("button", { name: "Delete 1 selected" }).closest(".bg-surface-raised"),
    ).toBeNull();
  });

  it("a falsy bulkActions node (e.g. `canArchive && <Button/>`) is no bulk action: the count stays", () => {
    const { container } = render(
      <SettingsTableShell
        title="Suppliers"
        rows={makeRows(3)}
        columns={columns}
        getRowId={(r) => r.id}
        rowLabel="suppliers"
        bulkSelectable
        selectedIds={["row-0"]}
        onBulkSelectChange={() => {}}
        bulkActions={false}
        toolbar={<input aria-label="Search" />}
      />,
    );
    expect(container.textContent).toContain("3 suppliers");
    expect(container.textContent).not.toContain("1 selected");
  });
});

describe("SettingsTableShell — split-pane variant (editPane)", () => {
  it("renders the consumer's edit form inside the one page frame, with a hairline divider and no second raised surface", () => {
    const { container } = render(
      <SettingsTableShell
        title="Numbering series"
        rows={makeRows(2)}
        columns={columns}
        getRowId={(r) => r.id}
        onRowEdit={() => {}}
        editPane={<form aria-label="Edit series"><input aria-label="Prefix" /></form>}
      />,
    );
    // The form is present…
    const form = screen.getByRole("form", { name: "Edit series" });
    // …inside the single raised surface, not a second one.
    expect(form.closest(".bg-surface-raised")).not.toBeNull();
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
    // Table and form are both descendants of that one surface.
    const table = container.querySelector("table")!;
    expect(table.closest(".bg-surface-raised")?.contains(form)).toBe(true);
    // ADR-0008 §3: the panes divide by a hairline, never a second card — the
    // pane wrapper (the form's parent) carries the left hairline.
    const pane = form.parentElement!;
    expect(pane.className).toContain("md:border-l");
    // …so exactly one bordered pane node exists, sitting beside the table.
    expect(container.querySelectorAll("[class*='md:border-l']")).toHaveLength(1);
    expect(screen.getByRole("cell", { name: "Row 0" })).toBeTruthy();
  });

  it("no editPane: single-pane layout, no second pane node or divider", () => {
    const { container } = render(
      <SettingsTableShell
        title="Numbering series"
        rows={makeRows(2)}
        columns={columns}
        getRowId={(r) => r.id}
      />,
    );
    // No divider node at all — the pane wrapper is simply not rendered.
    expect(container.querySelectorAll("[class*='md:border-l']")).toHaveLength(0);
    // The frame body is the flex wrapper holding only the table region (one
    // child), not a table region plus an empty bordered pane (two children).
    const table = container.querySelector("table")!;
    const flex = table.closest(".overflow-x-auto")!.parentElement as HTMLElement;
    expect(flex.children).toHaveLength(1);
  });
});

describe("SettingsTableBody — flush placement", () => {
  // The v3.3 rule: `flush` defaults to the `SettingsPageShell` tab placement; any other
  // frame (a bare `PageFrame` body, a detail pane) must pass `flush={false}`. These
  // tests assert the bleed classes ride the prop, not the placement.
  it("flush={false} in a bare PageFrame renders no bleed class on the band, the row wrapper, or the body root", () => {
    const { container } = render(
      <PageFrame title="Suppliers">
        <SettingsTableBody
          rows={makeRows(2)}
          columns={columns}
          getRowId={(r) => r.id}
          onAddNew={() => {}}
          addNewLabel="Add supplier"
          flush={false}
        />
      </PageFrame>,
    );
    // The body still renders its own band here (the create action is present)…
    const band = container.querySelector('[data-slot="settings-table-band"]') as HTMLElement;
    expect(band).toBeTruthy();
    // …with no horizontal bleed: the frame surface never pads its body, so there is
    // no inset to negate and the explicit `-mx-5` must be absent.
    expect(band.className).not.toContain("-mx-5");
    // …and the table row wrapper (the flex row) carries no horizontal bleed either.
    const rowWrapper = (container.querySelector(".overflow-x-auto") as HTMLElement)
      .parentElement as HTMLElement;
    expect(rowWrapper.className).toContain("flex");
    expect(rowWrapper.className).not.toContain("-mx-5");
    // …and the body root carries no top bleed (the `-mt-5` only exists when `flush`).
    const bodyRoot = band.parentElement as HTMLElement;
    expect(bodyRoot.firstElementChild).toBe(band);
    expect(bodyRoot.className).not.toContain("-mt-5");
    // Sanity: nothing anywhere in the body bleeds.
    expect(container.querySelector("[class*='-mx-5']")).toBeNull();
    expect(container.querySelector("[class*='-mt-5']")).toBeNull();
  });

  it("the default flush (direct tab placement) carries the bleed classes — the gate is on the prop, not the placement", () => {
    const { container } = render(
      <PageFrame title="Suppliers">
        <SettingsTableBody
          rows={makeRows(2)}
          columns={columns}
          getRowId={(r) => r.id}
          onAddNew={() => {}}
          addNewLabel="Add supplier"
          rowLabel="suppliers"
        />
      </PageFrame>,
    );
    // Proves the flush={false} test above is not vacuous: with the default the same
    // body DOES bleed (band + row wrapper horizontally, body root vertically). In a
    // bare PageFrame that bleed is wrong out of the box — which is why the docs
    // narrow the default to a `SettingsPageShell` tab and require flush={false} here.
    const band = container.querySelector('[data-slot="settings-table-band"]') as HTMLElement;
    expect(band.className).toContain("-mx-5");
    const rowWrapper = (container.querySelector(".overflow-x-auto") as HTMLElement)
      .parentElement as HTMLElement;
    expect(rowWrapper.className).toContain("-mx-5");
    expect(band.parentElement?.className).toContain("-mt-5");
  });
});
