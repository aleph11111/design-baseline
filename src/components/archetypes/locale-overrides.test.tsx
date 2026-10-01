import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StateView } from "../ui/state-view";
import { SearchInput } from "../ui/search-input";
import { CrudDialogHeader, CrudDialogSheet } from "./crud-dialog";
import { SettingsTableShell } from "./settings-table";
import { ListWithDetailShell } from "./list-with-detail";

// The list shell's detail renders as a Sheet on mobile only — force that path
// so its close button (and so its label) is in the tree.
vi.mock("../../hooks/use-mobile", () => ({ useIsMobile: () => true }));

// Every string a package component renders on its own is an English default a
// non-English consumer can override per call site. One case per seam, so a
// literal that loses its override fails here.

type Row = { id: string; name: string };
const rows: Row[] = [{ id: "a", name: "Alpha" }];
const columns = [
  { key: "name", header: "Name", cell: (r: Row) => r.name, isIdentifier: true },
];

afterEach(cleanup);

describe("StateView", () => {
  it("labels the retry button with retryLabel", () => {
    render(<StateView variant="error" error="x" onRetry={() => {}} retryLabel="Erneut versuchen" />);
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();
  });

  it("keeps the English default", () => {
    render(<StateView variant="error" error="x" onRetry={() => {}} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});

describe("SearchInput", () => {
  it("is a native searchbox named after its placeholder", () => {
    render(<SearchInput placeholder="Suchen…" />);
    expect(screen.getByRole("searchbox", { name: "Suchen" })).toBeTruthy();
  });

  it("falls back to the English name for an empty placeholder", () => {
    render(<SearchInput placeholder="" />);
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeTruthy();
  });

  it("strips a three-dot ellipsis from the derived name", () => {
    render(<SearchInput placeholder="Suchen..." />);
    expect(screen.getByRole("searchbox", { name: "Suchen" })).toBeTruthy();
  });

  it("labels the clear button with clearLabel", () => {
    render(<SearchInput value="q" clearable clearLabel="Suche löschen" />);
    expect(screen.getByRole("button", { name: "Suche löschen" })).toBeTruthy();
  });
});

describe("crud-dialog", () => {
  it("labels the header close button with closeLabel", () => {
    render(
      <CrudDialogSheet open onOpenChange={() => {}} closeLabel="Dialog schließen">
        <CrudDialogHeader title="Kunde" onClose={() => {}} closeLabel="Schließen" />
      </CrudDialogSheet>,
    );
    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dialog schließen" })).toBeTruthy();
  });
});

describe("SettingsTableShell labels", () => {
  it("overrides the bulk-select, bulk-delete and plane copy", () => {
    const { rerender } = render(
      <SettingsTableShell
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        bulkSelectable
        selectedIds={["a"]}
        onBulkSelectChange={() => {}}
        onBulkDelete={() => {}}
        labels={{
          selectAll: "Alle Zeilen auswählen",
          selectRow: "Zeile auswählen",
          selectedCount: (n) => `${n} ausgewählt`,
          deleteSelected: (n) => `${n} löschen`,
        }}
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Alle Zeilen auswählen" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Zeile auswählen" })).toBeTruthy();
    // A fixed-string override replaces the per-row default for every row.
    expect(screen.queryByRole("checkbox", { name: /Select row: .*Alpha/ })).toBeNull();
    expect(screen.getByText("1 ausgewählt")).toBeTruthy();
    expect(screen.getByRole("button", { name: "1 löschen" })).toBeTruthy();

    rerender(
      <SettingsTableShell rows={[]} columns={columns} getRowId={(r) => r.id} isLoading labels={{ loading: "Laden…" }} />,
    );
    expect(screen.getByText("Laden…")).toBeTruthy();

    rerender(
      <SettingsTableShell
        rows={[]}
        columns={columns}
        getRowId={(r) => r.id}
        error={new Error("boom")}
        onRetry={() => {}}
        labels={{ errorTitle: "Etwas ist schiefgelaufen", retry: "Erneut versuchen" }}
      />,
    );
    expect(screen.getByText("Etwas ist schiefgelaufen")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();
  });
});

describe("ListWithDetailShell labels", () => {
  const labels = {
    loading: "Laden…",
    errorTitle: "Etwas ist schiefgelaufen",
    retry: "Erneut versuchen",
    empty: "Keine Einträge vorhanden.",
    filteredEmpty: "Keine Treffer. Filter zurücksetzen.",
    close: "Schließen",
  };
  const base = { columns, getRowId: (r: Row) => r.id, labels };

  it("overrides the loading, error and both empty planes", () => {
    const { rerender } = render(<ListWithDetailShell {...base} rows={[]} isLoading />);
    expect(screen.getByText("Laden…")).toBeTruthy();

    rerender(<ListWithDetailShell {...base} rows={[]} error={new Error("boom")} onRetry={() => {}} />);
    expect(screen.getByText("Etwas ist schiefgelaufen")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();

    rerender(<ListWithDetailShell {...base} rows={[]} />);
    expect(screen.getByText("Keine Einträge vorhanden.")).toBeTruthy();

    rerender(<ListWithDetailShell {...base} rows={[]} filteredEmpty />);
    expect(screen.getByText("Keine Treffer. Filter zurücksetzen.")).toBeTruthy();
  });

  it("labels the mobile detail Sheet's close button", () => {
    render(
      <ListWithDetailShell {...base} rows={rows} onRowSelect={() => {}} detail={<p>detail</p>} />,
    );
    fireEvent.click(screen.getByText("Alpha"));
    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
  });
});

describe("row-actions trigger label", () => {
  const rowActions = [{ label: "Edit", onSelect: () => {} }];
  const manyRows: Row[] = [
    { id: "a", name: "Alpha" },
    { id: "b", name: "Beta" },
    { id: "c", name: "Gamma" },
  ];
  const presentations = ["table", "card-grid", "action-row"] as const;

  // Every row's trigger carries the name — none left on the other one.
  const expectAll = (present: string, absent: string) => {
    expect(screen.getAllByRole("button", { name: present })).toHaveLength(manyRows.length);
    expect(screen.queryAllByRole("button", { name: absent })).toHaveLength(0);
  };

  it.each(presentations)("list shell (%s): override and English default", (presentation) => {
    const props = { columns, getRowId: (r: Row) => r.id, rows: manyRows, rowActions, presentation };
    const { rerender } = render(
      <ListWithDetailShell {...props} labels={{ rowActions: "Zeilenaktionen" }} />,
    );
    expectAll("Zeilenaktionen", "Row actions");
    rerender(<ListWithDetailShell {...props} />);
    expectAll("Row actions", "Zeilenaktionen");
  });

  it("settings shell: override and English default", () => {
    const props = { rows: manyRows, columns, getRowId: (r: Row) => r.id, rowActions };
    const { rerender } = render(
      <SettingsTableShell {...props} labels={{ rowActions: "Zeilenaktionen" }} />,
    );
    expectAll("Zeilenaktionen", "Row actions");
    rerender(<SettingsTableShell {...props} />);
    expectAll("Row actions", "Zeilenaktionen");
  });
});

// Omitting every override renders the English default — one render per seam,
// so a dropped default (an unnamed checkbox or close button) fails here.
describe("English defaults when no override is passed", () => {
  it("SearchInput clear button", () => {
    render(<SearchInput value="q" clearable />);
    expect(screen.getByRole("button", { name: "Clear search" })).toBeTruthy();
  });

  it("crud-dialog header and sheet close buttons", () => {
    render(
      <CrudDialogSheet open onOpenChange={() => {}}>
        <CrudDialogHeader title="Customer" onClose={() => {}} />
      </CrudDialogSheet>,
    );
    expect(screen.getAllByRole("button", { name: "Close" })).toHaveLength(2);
  });

  it("SettingsTableShell bulk and plane copy", () => {
    const { rerender } = render(
      <SettingsTableShell
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        bulkSelectable
        selectedIds={["a"]}
        onBulkSelectChange={() => {}}
        onBulkDelete={() => {}}
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeTruthy();
    // The default row-checkbox label names the row's identifier — a
    // screen-reader user hears which record the checkbox opens.
    expect(screen.getByRole("checkbox", { name: "Select row: Alpha" })).toBeTruthy();
    expect(screen.getByText("1 selected")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete 1 selected" })).toBeTruthy();

    rerender(<SettingsTableShell rows={[]} columns={columns} getRowId={(r) => r.id} isLoading />);
    expect(screen.getByText("Loading…")).toBeTruthy();

    rerender(
      <SettingsTableShell
        rows={[]}
        columns={columns}
        getRowId={(r) => r.id}
        error={new Error("boom")}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });

  it("ListWithDetailShell planes and mobile Sheet close", () => {
    const base = { columns, getRowId: (r: Row) => r.id };
    const { rerender } = render(<ListWithDetailShell {...base} rows={[]} isLoading />);
    expect(screen.getByText("Loading…")).toBeTruthy();

    rerender(<ListWithDetailShell {...base} rows={[]} error={new Error("boom")} onRetry={() => {}} />);
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();

    rerender(<ListWithDetailShell {...base} rows={[]} />);
    expect(screen.getByText("No items yet")).toBeTruthy();

    rerender(<ListWithDetailShell {...base} rows={[]} filteredEmpty />);
    expect(screen.getByText("No matches. Try clearing filters.")).toBeTruthy();

    cleanup();
    render(<ListWithDetailShell {...base} rows={rows} onRowSelect={() => {}} detail={<p>detail</p>} />);
    fireEvent.click(screen.getByText("Alpha"));
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });
});
