/**
 * Pure helpers over a structure tree. A node is any object with an `id` and
 * an optional `children` array — the shape carries zero domain types.
 */
export type StructureNode = { id: string; children?: StructureNode[] };

/** Where a node sits: its parent's id (`null` = root) and its sibling index. */
export type NodePosition = { parentId: string | null; index: number };

/** The node with `id`, or `undefined`. */
export function findNode<N extends StructureNode>(nodes: N[], id: string): N | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = n.children && findNode(n.children as N[], id);
    if (hit) return hit;
  }
  return undefined;
}

/** The parent id and sibling index of `id`, or `undefined`. */
export function findPosition(
  nodes: StructureNode[],
  id: string,
  parentId: string | null = null,
): NodePosition | undefined {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]!;
    if (n.id === id) return { parentId, index: i };
    const hit = n.children && findPosition(n.children, id, n.id);
    if (hit) return hit;
  }
  return undefined;
}

function contains(node: StructureNode, id: string): boolean {
  return !!node.children?.some((c) => c.id === id || contains(c, id));
}

function removeNode<N extends StructureNode>(nodes: N[], id: string): [N[], N | undefined] {
  let removed: N | undefined;
  const next = nodes.flatMap((n) => {
    if (n.id === id) {
      removed = n;
      return [];
    }
    if (!n.children) return [n];
    const [children, hit] = removeNode(n.children as N[], id);
    if (hit) removed = hit;
    return hit ? [{ ...n, children }] : [n];
  });
  return [removed ? next : nodes, removed];
}

/** Inserts `node` at `index` under `parentId` (`null` = root). Returns a new tree. */
export function insertNode<N extends StructureNode>(
  nodes: N[],
  node: N,
  parentId: string | null,
  index: number,
): N[] {
  if (parentId === null) {
    const next = [...nodes];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, node);
    return next;
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: insertNode((n.children ?? []) as N[], node, null, index) };
    }
    return n.children ? { ...n, children: insertNode(n.children as N[], node, parentId, index) } : n;
  });
}

/**
 * Moves `id` to `index` under `parentId` (`null` = root), where `index` is
 * counted in the target list *after* the node was taken out. Returns the tree
 * unchanged when `id` is unknown, the target parent is unknown, or the target
 * is the node itself or one of its descendants.
 */
export function moveNode<N extends StructureNode>(
  nodes: N[],
  id: string,
  parentId: string | null,
  index: number,
): N[] {
  const node = findNode(nodes, id);
  if (!node || parentId === id || (parentId !== null && contains(node, parentId))) return nodes;
  const [without] = removeNode(nodes, id);
  if (parentId !== null && !findNode(without, parentId)) return nodes;
  return insertNode(without, node, parentId, index);
}

/** The keyboard moves the tree offers. */
export type MoveKey = "up" | "down" | "indent" | "outdent";

/**
 * Resolves a keyboard move to its target position, or `undefined` when the
 * move is not possible (first line up, last line down, indent with no line
 * above that can hold children, outdent at the root).
 */
export function keyboardTarget(
  nodes: StructureNode[],
  id: string,
  key: MoveKey,
  canContain: (node: StructureNode) => boolean,
): NodePosition | undefined {
  const pos = findPosition(nodes, id);
  if (!pos) return undefined;
  const siblings = pos.parentId === null ? nodes : findNode(nodes, pos.parentId)!.children!;
  switch (key) {
    case "up":
      return pos.index > 0 ? { parentId: pos.parentId, index: pos.index - 1 } : undefined;
    case "down":
      return pos.index < siblings.length - 1 ? { parentId: pos.parentId, index: pos.index + 1 } : undefined;
    case "indent": {
      const above = siblings[pos.index - 1];
      return above && canContain(above)
        ? { parentId: above.id, index: above.children?.length ?? 0 }
        : undefined;
    }
    case "outdent": {
      if (pos.parentId === null) return undefined;
      const parent = findPosition(nodes, pos.parentId)!;
      return { parentId: parent.parentId, index: parent.index + 1 };
    }
  }
}

/** Where a pointer drop lands relative to the row under it. */
export type DropZone = "before" | "inside" | "after";

/**
 * The position a drop on `targetId` resolves to, counted the way `moveNode`
 * counts (after `dragId` was taken out). `dragId` is `null` for a palette
 * drop, which takes nothing out. `undefined` when the drop is impossible
 * (onto itself or into its own subtree).
 */
export function dropTarget(
  nodes: StructureNode[],
  dragId: string | null,
  targetId: string,
  zone: DropZone,
): NodePosition | undefined {
  if (dragId !== null) {
    const dragged = findNode(nodes, dragId);
    if (!dragged || dragId === targetId || contains(dragged, targetId)) return undefined;
    nodes = removeNode(nodes, dragId)[0];
  }
  if (zone === "inside") {
    const target = findNode(nodes, targetId);
    return target ? { parentId: targetId, index: target.children?.length ?? 0 } : undefined;
  }
  const pos = findPosition(nodes, targetId);
  return pos && { parentId: pos.parentId, index: pos.index + (zone === "after" ? 1 : 0) };
}
