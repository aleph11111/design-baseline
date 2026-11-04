// Scaffolded by `design-baseline new-page structure-builder __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/structure-builder.md
import { useState } from "react";
import {
  StructureBuilderShell,
  StructureTree,
  moveNode,
  type StructureNode,
} from "design-baseline/archetypes/structure-builder";

type __Name__Line = StructureNode & { label: string; children?: __Name__Line[] };
type __Name__Item = { id: string; label: string };

// TODO: replace with the page's real data hook.
function use__Name__Structure(): {
  lines: __Name__Line[] | null;
  palette: __Name__Item[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { lines: null, palette: [], isLoading: false, error: null, refetch: () => {} };
}

export function __Name__Page() {
  const { lines: loaded, palette, isLoading, error, refetch } = use__Name__Structure();
  const [lines, setLines] = useState<__Name__Line[]>([]);
  const [dirty, setDirty] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const current = dirty ? lines : (loaded ?? []);

  return (
    <StructureBuilderShell
      title="__Name__"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={!isLoading && loaded?.length === 0}
      onCreate={() => {}}
      onSave={() => setDirty(false)}
      dirty={dirty}
      paletteTitle="Unplaced"
      coverage={{ unplaced: palette.length }}
      palette={
        <ul>
          {palette.map((item) => (
            // Contract: every item is draggable onto the tree AND has a keyboard place action.
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      }
    >
      <StructureTree
        nodes={current}
        label="__Name__"
        getLabel={(n) => n.label}
        renderRow={(n) => <span>{n.label}</span>}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={(id, parentId, index) => {
          setLines(moveNode(current, id, parentId, index));
          setDirty(true);
        }}
      />
    </StructureBuilderShell>
  );
}
