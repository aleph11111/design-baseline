import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ListWithDetailShell, type ListColumn } from "./ListWithDetailShell";

afterEach(cleanup);

type Row = { id: string; name: string };
const all: Row[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Bravo" },
  { id: "c", name: "Charlie" },
];
const columns: ListColumn<Row>[] = [
  { key: "name", header: "Name", cell: (r) => r.name, isIdentifier: true },
];

/** A consumer that owns filter + selection, like a real page. */
function BulkPage({ onApply }: { onApply: (ids: string[]) => void }) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const rows = all.filter((r) => r.name.includes(query));
  return (
    <>
      <button onClick={() => setQuery("Bravo")}>filter</button>
      <ListWithDetailShell
        title="T"
        toolbar={<input aria-label="search" />}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        bulkSelectable
        selectedIds={selected}
        onBulkSelectChange={setSelected}
        bulkActions={<button onClick={() => onApply(selected)}>apply</button>}
      />
    </>
  );
}

describe("ListWithDetailShell bulk selection", () => {
  it("the bulk band replaces the toolbar while a row is ticked; clearing brings it back", () => {
    render(<BulkPage onApply={() => {}} />);
    expect(screen.getByLabelText("search")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row: Alpha" }));
    expect(screen.queryByLabelText("search")).toBeNull();
    expect(screen.getByText("1 selected")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByLabelText("search")).toBeTruthy();
    expect(screen.queryByText("1 selected")).toBeNull();
  });

  it("a row hidden by a filter is pruned from the consumer's selection", () => {
    const onApply = vi.fn();
    render(<BulkPage onApply={onApply} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(screen.getByText("3 selected")).toBeTruthy();
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("1 selected")).toBeTruthy();
    fireEvent.click(screen.getByText("apply"));
    expect(onApply).toHaveBeenCalledWith(["b"]);
  });

  it("does not prune while loading", () => {
    const onChange = vi.fn();
    render(
      <ListWithDetailShell title="T" rows={[]} columns={columns} getRowId={(r: Row) => r.id}
        isLoading bulkSelectable selectedIds={["a"]} onBulkSelectChange={onChange} />,
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});

function SteppingPage({ rows }: { rows: Row[] }) {
  const [sel, setSel] = React.useState<string | null>("b");
  const row = rows.find((r) => r.id === sel);
  return (
    <ListWithDetailShell
      title="T"
      rows={rows}
      columns={columns}
      getRowId={(r) => r.id}
      onRowSelect={(r) => setSel(r.id)}
      selectedRowId={sel}
      detail={<p>detail {row?.name}</p>}
      detailTitle={row?.name}
      detailStepping
    />
  );
}

describe("ListWithDetailShell detail stepping", () => {
  it("steps in displayed order and disables at the ends", () => {
    // Displayed order (sorted by the consumer): Charlie, Bravo, Alpha.
    render(<SteppingPage rows={[...all].reverse()} />);
    expect(screen.getByText("detail Bravo")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("detail Alpha")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("detail Charlie")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("ListWithDetailShell summary band", () => {
  it("renders the pinned band only when passed", () => {
    const { container, rerender } = render(
      <ListWithDetailShell title="T" rows={all} columns={columns} getRowId={(r) => r.id} summary={<span>Sum 42</span>} />,
    );
    const band = container.querySelector('[data-slot="list-summary"]');
    expect(band?.textContent).toBe("Sum 42");
    expect(band?.className).toContain("sticky");
    rerender(<ListWithDetailShell title="T" rows={all} columns={columns} getRowId={(r) => r.id} />);
    expect(container.querySelector('[data-slot="list-summary"]')).toBeNull();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
});
