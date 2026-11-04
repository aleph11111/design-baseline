import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { StructureBuilderShell } from "./StructureBuilderShell";
import { StructureTree } from "./StructureTree";
import { moveNode, type StructureNode } from "./tree";
import { STRUCTURE_PALETTE_TYPE } from "./StructureTree";

afterEach(cleanup);

type Line = StructureNode & { name: string; children?: Line[] };
const SEED: Line[] = [
  { id: "g1", name: "Group 1", children: [{ id: "x", name: "X" }, { id: "y", name: "Y" }] },
  { id: "g2", name: "Group 2", children: [] },
];

function Harness() {
  const [nodes, setNodes] = React.useState(SEED);
  const [sel, setSel] = React.useState<string | null>("x");
  return (
    <StructureTree
      nodes={nodes}
      label="Lines"
      getLabel={(n) => n.name}
      renderRow={(n) => <span>{n.name}</span>}
      onMove={(id, p, i) => setNodes((t) => moveNode(t, id, p, i))}
      selectedId={sel}
      onSelect={setSel}
    />
  );
}

const order = () => screen.getAllByRole("treeitem").map((li) => `${li.getAttribute("aria-level")}:${li.querySelector("[data-slot=structure-row]")!.textContent}`);

describe("StructureTree — keyboard-only moves", () => {
  it("reorders, indents and outdents with Alt+Arrows and keeps focus on the moved line", () => {
    render(<Harness />);
    const x = () => screen.getAllByRole("treeitem").find((li) => li.textContent === "X")!;
    x().focus();
    fireEvent.keyDown(x(), { key: "ArrowDown", altKey: true });
    expect(order()).toEqual(["1:Group 1", "2:Y", "2:X", "1:Group 2"]);
    expect(document.activeElement).toBe(x());
    fireEvent.keyDown(x(), { key: "ArrowLeft", altKey: true });
    expect(order()).toEqual(["1:Group 1", "2:Y", "1:X", "1:Group 2"]);
    fireEvent.keyDown(x(), { key: "ArrowDown", altKey: true });
    fireEvent.keyDown(x(), { key: "ArrowRight", altKey: true });
    expect(order()).toEqual(["1:Group 1", "2:Y", "1:Group 2", "2:X"]);
    expect(screen.getByText("Moved X to position 1 in Group 2")).toBeTruthy();
  });

  it("announces every consecutive move, not just the first", () => {
    render(<Harness />);
    const x = () => screen.getAllByRole("treeitem").find((li) => li.textContent === "X")!;
    const live = () => document.querySelector("[aria-live=polite]")!.textContent;
    x().focus();
    fireEvent.keyDown(x(), { key: "ArrowDown", altKey: true });
    const first = live();
    fireEvent.keyDown(x(), { key: "ArrowLeft", altKey: true });
    expect(first).toBe("Moved X to position 2 in Group 1");
    expect(live()).toBe("Moved X to position 2 at the top level");
  });

  it("arrow keys alone move focus and selection, not lines", () => {
    render(<Harness />);
    const items = screen.getAllByRole("treeitem");
    items[1]!.focus();
    fireEvent.keyDown(items[1]!, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("Y");
    expect(screen.getAllByRole("treeitem")[2]!.getAttribute("aria-selected")).toBe("true");
    expect(order()).toEqual(["1:Group 1", "2:X", "2:Y", "1:Group 2"]);
  });
});

describe("StructureTree — root drop", () => {
  it("a palette drop onto an empty tree places at the root", () => {
    const onPlace = vi.fn();
    render(<StructureTree nodes={[]} label="Lines" getLabel={() => ""} renderRow={() => null} onMove={() => {}} onPlace={onPlace} />);
    const data = { getData: (t: string) => (t === STRUCTURE_PALETTE_TYPE ? "p1" : "") };
    fireEvent.drop(screen.getByRole("tree"), { dataTransfer: data });
    expect(onPlace).toHaveBeenCalledWith("p1", null, 0);
  });
});

// jsdom ignores clientY in a drag event's init dict; set it on the event.
function dropAt(el: HTMLElement, getData: (t: string) => string, clientY: number) {
  const ev = createEvent.drop(el, { dataTransfer: { getData } });
  Object.defineProperty(ev, "clientY", { value: clientY });
  fireEvent(el, ev);
}

describe("StructureTree — root drop refuses gutters", () => {
  it("a drop that misses every row but is not below the last row changes nothing", () => {
    const onMove = vi.fn();
    render(<StructureTree nodes={SEED} label="Lines" getLabel={(n) => n.name} renderRow={(n) => <span>{n.name}</span>} onMove={onMove} />);
    const tree = screen.getByRole("tree");
    const last = tree.lastElementChild as HTMLElement;
    last.getBoundingClientRect = () => ({ bottom: 100 }) as DOMRect;
    const data = { getData: (t: string) => (t === "application/x-structure-node" ? "x" : "") };
    dropAt(tree, data.getData, 50);
    expect(onMove).not.toHaveBeenCalled();
    dropAt(tree, data.getData, 150);
    expect(onMove).toHaveBeenCalledWith("x", null, 2);
  });

  it("a root line dropped at the end lands at the last index, not one past it", () => {
    const onMove = vi.fn();
    render(<StructureTree nodes={SEED} label="Lines" getLabel={(n) => n.name} renderRow={(n) => <span>{n.name}</span>} onMove={onMove} />);
    const tree = screen.getByRole("tree");
    const data = { getData: (t: string) => (t === "application/x-structure-node" ? "g1" : "") };
    dropAt(tree, data.getData, 1e6);
    expect(onMove).toHaveBeenCalledWith("g1", null, 1);
    expect(screen.getByText("Moved Group 1 to position 2 at the top level")).toBeTruthy();
  });
});

describe("StructureBuilderShell — page frame", () => {
  const base = {
    title: "Report templates",
    paletteTitle: "Unplaced accounts",
    palette: <ul><li>4000 Revenue</li></ul>,
  };

  it("renders one h1, the palette aside, coverage, New/Clone in the band and Save + badge when dirty", () => {
    const onSave = vi.fn();
    render(
      <StructureBuilderShell {...base} coverage={{ unplaced: 2, duplicates: 1 }} onCreate={() => {}} onClone={() => {}} onSave={onSave} dirty history={<p>v1</p>}>
        <div>tree</div>
      </StructureBuilderShell>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("Unplaced accounts")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("2 not placed · 1 placed twice");
    expect(screen.getAllByRole("button", { name: "New" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Clone" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Unsaved changes")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Version history" }));
    expect(screen.getByText("v1")).toBeTruthy();
  });

  it("Save is disabled when clean; coverage reads complete at zero", () => {
    render(
      <StructureBuilderShell {...base} coverage={{ unplaced: 0 }} onSave={() => {}}>
        <div>tree</div>
      </StructureBuilderShell>,
    );
    expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Everything is placed");
    expect(screen.queryByText("Unsaved changes")).toBeNull();
  });

  it("error wins over loading and replaces the body", () => {
    render(
      <StructureBuilderShell {...base} isLoading error={new Error("boom")} onSave={() => {}}>
        <div>tree</div>
      </StructureBuilderShell>,
    );
    expect(screen.getByText("boom")).toBeTruthy();
    expect(screen.queryByText("tree")).toBeNull();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  it("empty offers New as its action", () => {
    const onCreate = vi.fn();
    render(
      <StructureBuilderShell {...base} isEmpty onCreate={onCreate}>
        <div>tree</div>
      </StructureBuilderShell>,
    );
    expect(screen.getByText("No structure yet")).toBeTruthy();
    expect(screen.queryByText("tree")).toBeNull();
    const news = screen.getAllByRole("button", { name: "New" });
    expect(news).toHaveLength(1);
    fireEvent.click(news[0]!);
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
