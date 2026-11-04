"use client";
import * as React from "react";
import { cn } from "../../../lib/utils";
import { useLabels } from "../../../lib/labels";
import {
  dropTarget,
  findNode,
  keyboardTarget,
  type DropZone,
  type MoveKey,
  type NodePosition,
  type StructureNode,
} from "./tree";

/** The `dataTransfer` type a palette item sets on drag start; its value is
 *  the item's id, handed to `onPlace`. */
export const STRUCTURE_PALETTE_TYPE = "application/x-structure-palette";
const NODE_TYPE = "application/x-structure-node";

export type StructureTreeProps<N extends StructureNode> = {
  /** The tree. Controlled: every move is reported through `onMove`. */
  nodes: N[];
  /** Accessible name of the tree. */
  label: string;
  /** Plain-text name of a line, used in the move announcement. */
  getLabel: (node: N) => string;
  /** The row content of one line (label, badges, inline editors, row menu). */
  renderRow: (node: N, depth: number) => React.ReactNode;
  /**
   * Move `id` to `index` under `parentId` (`null` = root), `index` counted
   * after the line was taken out — pass it straight to `moveNode`. Omitted =
   * read-only tree (no keyboard moves, no drag).
   */
  onMove?: (id: string, parentId: string | null, index: number) => void;
  /** Whether a line can hold child lines (indent / drop-inside target).
   *  Default: the node has a `children` array. */
  canContain?: (node: N) => boolean;
  /** A palette item dropped on the tree — the id it put on the drag, and the
   *  position it lands on. */
  onPlace?: (paletteId: string, parentId: string | null, index: number) => void;
  /** The selected line: the target of keyboard palette placement. */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

const MOVE_KEYS: Record<string, MoveKey> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowRight: "indent",
  ArrowLeft: "outdent",
};

function flatten(nodes: StructureNode[], out: string[] = []): string[] {
  for (const n of nodes) {
    out.push(n.id);
    if (n.children) flatten(n.children, out);
  }
  return out;
}

const hasChildren = (n: StructureNode) => Array.isArray(n.children);

/**
 * StructureTree — the editable, hierarchical line tree of a structure-builder
 * (Sb) page. A WAI-ARIA tree: Arrow Up/Down moves focus, and every move is
 * keyboard-operable — Alt+Up/Down reorders among siblings, Alt+Right indents
 * into the line above (when it can hold children), Alt+Left outdents. Pointer
 * drag uses native HTML5 drag (no library): the top third of a row drops
 * before it, the bottom third after, the middle inside. Each completed move is
 * announced in a polite live region. Always expanded.
 */
export function StructureTree<N extends StructureNode>({
  nodes,
  label,
  getLabel,
  renderRow,
  onMove,
  canContain = hasChildren,
  onPlace,
  selectedId,
  onSelect,
}: StructureTreeProps<N>): React.ReactElement {
  const L = useLabels();
  const items = React.useRef(new Map<string, HTMLLIElement>());
  const pendingFocus = React.useRef<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const [hint, setHint] = React.useState<{ id: string; zone: DropZone } | null>(null);
  const hintId = React.useId();

  const order = flatten(nodes);
  const tabStop = selectedId && order.includes(selectedId) ? selectedId : order[0];

  // Keep focus on a line across the re-render its own move causes.
  React.useEffect(() => {
    if (!pendingFocus.current) return;
    items.current.get(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [nodes]);

  const move = (id: string, to: NodePosition | undefined) => {
    if (!to || !onMove) return;
    onMove(id, to.parentId, to.index);
    const node = findNode(nodes, id);
    const parent = to.parentId === null ? undefined : findNode(nodes, to.parentId);
    // Position + parent differ on every real move, so consecutive moves always
    // change the live region's text (an identical string is never re-spoken).
    if (node) setAnnouncement(L.structureMoved(getLabel(node), to.index + 1, parent ? getLabel(parent) : null));
    pendingFocus.current = id;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, id: string) => {
    if (e.target !== e.currentTarget) return;
    const key = MOVE_KEYS[e.key];
    if (key && e.altKey) {
      e.preventDefault();
      move(id, keyboardTarget(nodes, id, key, canContain as (n: StructureNode) => boolean));
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = order[order.indexOf(id) + (e.key === "ArrowDown" ? 1 : -1)];
      if (next) {
        items.current.get(next)?.focus();
        onSelect?.(next);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(id);
    }
  };

  const zoneOf = (e: React.DragEvent<HTMLElement>, node: N): DropZone => {
    const r = e.currentTarget.getBoundingClientRect();
    const y = (e.clientY - r.top) / (r.height || 1);
    if (canContain(node) && y > 1 / 3 && y < 2 / 3) return "inside";
    return y < 0.5 ? "before" : "after";
  };

  const draggable = !!onMove || !!onPlace;

  const belowLastRow = (e: React.DragEvent<HTMLElement>) => {
    const last = e.currentTarget.lastElementChild;
    return !last || e.clientY >= last.getBoundingClientRect().bottom;
  };

  const renderItems = (list: N[], depth: number): React.ReactNode =>
    list.map((node) => {
      const kids = node.children as N[] | undefined;
      const zone = hint?.id === node.id ? hint.zone : null;
      return (
        <li
          key={node.id}
          ref={(el) => {
            if (el) items.current.set(node.id, el);
            else items.current.delete(node.id);
          }}
          role="treeitem"
          aria-level={depth + 1}
          aria-selected={selectedId === node.id}
          aria-expanded={kids && kids.length > 0 ? true : undefined}
          aria-describedby={onMove ? hintId : undefined}
          tabIndex={node.id === tabStop ? 0 : -1}
          onKeyDown={(e) => onKeyDown(e, node.id)}
          className="outline-none [&:focus-visible>[data-slot=structure-row]]:ring-2 [&:focus-visible>[data-slot=structure-row]]:ring-ring"
        >
          <div
            data-slot="structure-row"
            draggable={!!onMove}
            onClick={() => onSelect?.(node.id)}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData(NODE_TYPE, node.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={
              draggable
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const z = zoneOf(e, node);
                    if (hint?.id !== node.id || hint.zone !== z) setHint({ id: node.id, zone: z });
                  }
                : undefined
            }
            onDragLeave={(e) => {
              // Crossing over the row's own content (label, badges) is not leaving the row.
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHint(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHint(null);
              const z = zoneOf(e, node);
              const dragged = e.dataTransfer.getData(NODE_TYPE);
              if (dragged) {
                move(dragged, dropTarget(nodes, dragged, node.id, z));
                return;
              }
              const placed = e.dataTransfer.getData(STRUCTURE_PALETTE_TYPE);
              const to = placed ? dropTarget(nodes, null, node.id, z) : undefined;
              if (to && onPlace) onPlace(placed, to.parentId, to.index);
            }}
            className={cn(
              "flex min-h-9 items-center gap-2 rounded-md border border-transparent px-2 py-1",
              onMove && "cursor-grab active:cursor-grabbing",
              selectedId === node.id && "bg-accent text-accent-foreground",
              zone === "before" && "border-t-primary",
              zone === "after" && "border-b-primary",
              zone === "inside" && "border-primary",
            )}
          >
            {renderRow(node, depth)}
          </div>
          {kids && kids.length > 0 ? (
            <ul role="group" className="ml-5 border-l border-border pl-1">
              {renderItems(kids, depth + 1)}
            </ul>
          ) : null}
        </li>
      );
    });

  return (
    <div data-slot="structure-tree">
      <ul
        role="tree"
        aria-label={label}
        // Only a drop BELOW the last row (or onto an empty tree) lands at the
        // end of the root level. Drops in indent gutters and gaps between rows
        // are refused rather than read as root drops; row drops stop
        // propagation before reaching here.
        onDragOver={
          draggable
            ? (e) => {
                if (belowLastRow(e)) e.preventDefault();
              }
            : undefined
        }
        // dragend bubbles from the source row: a cancelled drag clears the hint.
        onDragEnd={() => setHint(null)}
        onDrop={
          draggable
            ? (e) => {
                setHint(null);
                if (!belowLastRow(e)) return;
                e.preventDefault();
                const dragged = e.dataTransfer.getData(NODE_TYPE);
                if (dragged) {
                  // moveNode counts after removal: a root line leaves one slot.
                  const end = nodes.length - (nodes.some((n) => n.id === dragged) ? 1 : 0);
                  return move(dragged, { parentId: null, index: end });
                }
                const placed = e.dataTransfer.getData(STRUCTURE_PALETTE_TYPE);
                if (placed && onPlace) onPlace(placed, null, nodes.length);
              }
            : undefined
        }
        className="min-h-16 space-y-0.5 pb-4"
      >
        {renderItems(nodes, 0)}
      </ul>
      {onMove ? (
        <p id={hintId} className="mt-3 text-xs text-muted-foreground">
          {L.structureMoveHint}
        </p>
      ) : null}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

StructureTree.displayName = "StructureTree";
