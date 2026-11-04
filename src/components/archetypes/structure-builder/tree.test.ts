import { describe, expect, it } from "vitest";
import { dropTarget, keyboardTarget, moveNode, type StructureNode } from "./tree";

const tree = (): StructureNode[] => [
  { id: "a", children: [{ id: "a1" }, { id: "a2" }] },
  { id: "b", children: [] },
  { id: "c" },
];
const ids = (ns: StructureNode[]): unknown =>
  ns.map((n) => (n.children ? { [n.id]: ids(n.children) } : n.id));
const canContain = (n: StructureNode) => Array.isArray(n.children);

describe("moveNode", () => {
  it("reorders among siblings", () => {
    expect(ids(moveNode(tree(), "c", null, 0))).toEqual(["c", { a: ["a1", "a2"] }, { b: [] }]);
  });
  it("re-parents into another container", () => {
    expect(ids(moveNode(tree(), "a1", "b", 0))).toEqual([{ a: ["a2"] }, { b: ["a1"] }, "c"]);
  });
  it("refuses a move into the node's own subtree or an unknown parent", () => {
    const t = tree();
    expect(moveNode(t, "a", "a1", 0)).toBe(t);
    expect(moveNode(t, "a", "a", 0)).toBe(t);
    expect(moveNode(t, "c", "nope", 0)).toBe(t);
  });
});

describe("keyboardTarget", () => {
  const t = tree();
  const run = (id: string, key: Parameters<typeof keyboardTarget>[2]) => {
    const to = keyboardTarget(t, id, key, canContain);
    return to && ids(moveNode(t, id, to.parentId, to.index));
  };
  it("up / down reorder and stop at the ends", () => {
    expect(run("a2", "up")).toEqual([{ a: ["a2", "a1"] }, { b: [] }, "c"]);
    expect(run("a1", "down")).toEqual([{ a: ["a2", "a1"] }, { b: [] }, "c"]);
    expect(run("a1", "up")).toBeUndefined();
    expect(run("c", "down")).toBeUndefined();
  });
  it("indent re-parents into the container above, as its last child", () => {
    expect(run("c", "indent")).toEqual([{ a: ["a1", "a2"] }, { b: ["c"] }]);
    expect(run("b", "indent")).toEqual([{ a: ["a1", "a2", { b: [] }] }, "c"]);
  });
  it("indent needs a container above", () => {
    expect(run("a", "indent")).toBeUndefined();
    expect(run("a2", "indent")).toBeUndefined(); // a1 is a leaf
  });
  it("outdent lands right after the former parent", () => {
    expect(run("a1", "outdent")).toEqual([{ a: ["a2"] }, "a1", { b: [] }, "c"]);
    expect(run("c", "outdent")).toBeUndefined();
  });
});

describe("dropTarget", () => {
  const t = tree();
  it("counts after removal for a tree drag", () => {
    const to = dropTarget(t, "a", "c", "after")!;
    expect(ids(moveNode(t, "a", to.parentId, to.index))).toEqual([{ b: [] }, "c", { a: ["a1", "a2"] }]);
  });
  it("drops inside a container as its last child", () => {
    expect(dropTarget(t, "c", "a", "inside")).toEqual({ parentId: "a", index: 2 });
  });
  it("palette drops take nothing out", () => {
    expect(dropTarget(t, null, "a2", "before")).toEqual({ parentId: "a", index: 1 });
  });
  it("refuses a drop into the dragged subtree", () => {
    expect(dropTarget(t, "a", "a1", "after")).toBeUndefined();
  });
});
