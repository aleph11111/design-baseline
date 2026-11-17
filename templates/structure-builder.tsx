// Scaffolded by `design-baseline new-page structure-builder __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/structure-builder.md
import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  STRUCTURE_PALETTE_TYPE,
  StructureBuilderShell,
  StructureTree,
  findNode,
  findPosition,
  insertNode,
  moveNode,
  type StructureNode,
} from "design-baseline/archetypes/structure-builder";

type __Name__Line = StructureNode & { label: string; children?: __Name__Line[] };
type __Name__Item = { id: string; label: string };

// TODO: replace with the page's real data hook.
function use__Name__Structure(): {
  lines: __Name__Line[] | null;
  items: __Name__Item[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { lines: null, items: [], isLoading: false, error: null, refetch: () => {} };
}

function placed(lines: __Name__Line[], out = new Set<string>()): Set<string> {
  for (const line of lines) {
    out.add(line.id);
    if (line.children) placed(line.children, out);
  }
  return out;
}

export function __Name__Page() {
  const { lines: loaded, items, isLoading, error, refetch } = use__Name__Structure();
  const [edited, setEdited] = useState<__Name__Line[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lines = edited ?? loaded ?? [];
  const inTree = placed(lines);
  const palette = items.filter((item) => !inTree.has(item.id));

  const place = (id: string, parentId: string | null, index: number) => {
    const item = items.find((i) => i.id === id);
    if (item) setEdited(insertNode(lines, { id: item.id, label: item.label }, parentId, index));
  };

  // Placing unmounts the focused place button; hand focus to the next palette item
  // (the previous if last), or to the placed line when the palette is now empty.
  const paletteRef = useRef<HTMLUListElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const focusAfter = useRef<{ palette?: string; line?: string } | null>(null);
  useLayoutEffect(() => {
    const f = focusAfter.current;
    if (!f) return;
    focusAfter.current = null;
    const root = f.palette ? paletteRef.current : treeRef.current;
    const attr = f.palette ? "data-place-id" : "data-node-id";
    root?.querySelector<HTMLElement>(`[${attr}="${f.palette ?? f.line}"]`)?.focus();
  }, [edited]);

  // Keyboard placement: into the selected line when it holds children, else right after it.
  const placeAtSelection = (id: string) => {
    const i = palette.findIndex((p) => p.id === id);
    const next = palette[i + 1] ?? palette[i - 1];
    focusAfter.current = next ? { palette: next.id } : { line: id };
    const sel = selectedId ? findNode(lines, selectedId) : undefined;
    const pos = sel ? findPosition(lines, sel.id) : undefined;
    if (sel?.children) place(id, sel.id, sel.children.length);
    else if (pos) place(id, pos.parentId, pos.index + 1);
    else place(id, null, lines.length);
  };

  return (
    <StructureBuilderShell
      title="__Name__"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      // Empty = no structure exists yet; a loaded structure with zero lines still
      // renders the tree so items can be placed into it.
      isEmpty={!isLoading && error == null && loaded === null && edited === null}
      onCreate={() => {}}
      // TODO: persist `lines` (one call with the structure version), then reload.
      onSave={() => setEdited(null)}
      dirty={edited !== null}
      paletteTitle="Unplaced"
      coverage={{ unplaced: palette.length }}
      palette={
        <ul ref={paletteRef}>
          {palette.map((item) => (
            <li
              key={item.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData(STRUCTURE_PALETTE_TYPE, item.id)}
            >
              {item.label}
              <Button type="button" variant="ghost" size="sm" data-place-id={item.id} aria-label={`Place ${item.label}`} onClick={() => placeAtSelection(item.id)}>
                Place
              </Button>
            </li>
          ))}
        </ul>
      }
    >
      <div ref={treeRef}>
      <StructureTree
        nodes={lines}
        label="__Name__"
        getLabel={(n) => n.label}
        renderRow={(n) => <span>{n.label}</span>}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={(id, parentId, index) => setEdited(moveNode(lines, id, parentId, index))}
        onPlace={place}
      />
      </div>
    </StructureBuilderShell>
  );
}
