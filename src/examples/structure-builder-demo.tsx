/**
 * structure-builder-demo.tsx
 *
 * Reference demo for the Sb (structure-builder) archetype, in a project-far
 * domain: a course syllabus built from a pool of lessons. Modules are
 * containers, lessons are leaves. Every move works by keyboard (focus a line,
 * Alt+Arrow keys) and by native pointer drag; every pool lesson can be placed
 * by keyboard ("Place" puts it into the selected module, or after the
 * selected lesson) or dragged onto the tree.
 */

import * as React from "react";
import { GripVertical, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLabels } from "@/lib/labels";
import {
  STRUCTURE_PALETTE_TYPE,
  StructureBuilderShell,
  StructureTree,
  findNode,
  findPosition,
  insertNode,
  moveNode,
} from "@/components/archetypes/structure-builder";

type Lesson = { id: string; title: string; minutes: number };
type SyllabusLine = { id: string; title: string; minutes?: number; children?: SyllabusLine[] };

const POOL: Lesson[] = [
  { id: "l1", title: "Why sourdough rises", minutes: 20 },
  { id: "l2", title: "Feeding a starter", minutes: 15 },
  { id: "l3", title: "Autolyse and hydration", minutes: 25 },
  { id: "l4", title: "Stretch and fold", minutes: 15 },
  { id: "l5", title: "Shaping a batard", minutes: 30 },
  { id: "l6", title: "Scoring patterns", minutes: 10 },
  { id: "l7", title: "Dutch-oven baking", minutes: 20 },
  { id: "l8", title: "Troubleshooting dense crumb", minutes: 25 },
];

const lessonLine = (id: string): SyllabusLine => {
  const l = POOL.find((p) => p.id === id)!;
  return { id: l.id, title: l.title, minutes: l.minutes };
};

const SEED: SyllabusLine[] = [
  { id: "m1", title: "Module 1 — The starter", children: [lessonLine("l1"), lessonLine("l2")] },
  { id: "m2", title: "Module 2 — The dough", children: [lessonLine("l3"), lessonLine("l5")] },
  { id: "m3", title: "Module 3 — The bake", children: [] },
];

const SYLLABI = [
  { id: "s1", name: "Weekend bread course" },
  { id: "s2", name: "Evening class (4 weeks)" },
];

const VERSIONS = [
  { id: "v3", label: "v3 — moved shaping to module 2", when: "today, 09:12" },
  { id: "v2", label: "v2 — added the bake module", when: "Mon, 16:40" },
  { id: "v1", label: "v1 — first draft", when: "last week" },
];

type DemoState = "Loaded" | "Loading" | "Empty" | "Error";

function ids(nodes: SyllabusLine[], out = new Set<string>()): Set<string> {
  for (const n of nodes) {
    out.add(n.id);
    if (n.children) ids(n.children, out);
  }
  return out;
}

export function StructureBuilderDemo(): React.ReactElement {
  const L = useLabels();
  const [lines, setLines] = React.useState<SyllabusLine[]>(SEED);
  const [selectedId, setSelectedId] = React.useState<string | null>("m3");
  const [syllabus, setSyllabus] = React.useState("s1");
  const [dirty, setDirty] = React.useState(false);
  const [state, setState] = React.useState<DemoState>("Loaded");

  const placed = ids(lines);
  const unplaced = POOL.filter((l) => !placed.has(l.id));

  const edit = (next: (t: SyllabusLine[]) => SyllabusLine[]) => {
    setLines(next);
    setDirty(true);
  };

  // Keyboard placement target: into the selected module, or right after the
  // selected lesson; with nothing selected, at the end of the last module.
  const placeTarget = (): { parentId: string | null; index: number } => {
    const sel = selectedId ? findNode(lines, selectedId) : undefined;
    if (sel?.children) return { parentId: sel.id, index: sel.children.length };
    const pos = sel && findPosition(lines, sel.id);
    if (pos) return { parentId: pos.parentId, index: pos.index + 1 };
    const last = lines[lines.length - 1];
    return last ? { parentId: last.id, index: last.children?.length ?? 0 } : { parentId: null, index: 0 };
  };

  const place = (id: string, parentId: string | null, index: number) =>
    edit((t) => insertNode(t, lessonLine(id), parentId, index));

  return (
    <StructureBuilderShell
      title="Syllabus builder"
      subtitle="Arrange lessons into modules"
      templates={
        <Select value={syllabus} onValueChange={setSyllabus}>
          <SelectTrigger aria-label="Syllabus" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SYLLABI.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      onCreate={() => {}}
      onClone={() => {}}
      viewOptions={
        <SegmentedControl
          aria-label="Demo state"
          value={state}
          onValueChange={setState}
          options={(["Loaded", "Loading", "Empty", "Error"] as const).map((v) => ({ value: v, label: v }))}
        />
      }
      isLoading={state === "Loading"}
      isEmpty={state === "Empty"}
      error={state === "Error" ? new Error("The syllabus could not be loaded.") : undefined}
      onRetry={() => setState("Loaded")}
      history={
        <ul className="divide-y divide-border">
          {VERSIONS.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm">{v.label}</div>
                <div className="text-xs text-muted-foreground">{v.when}</div>
              </div>
              <Button type="button" variant="outline" size="sm">
                Restore
              </Button>
            </li>
          ))}
        </ul>
      }
      onSave={() => setDirty(false)}
      dirty={dirty}
      paletteTitle="Lesson pool"
      coverage={{ unplaced: unplaced.length }}
      palette={
        unplaced.length === 0 ? (
          <p className="text-sm text-muted-foreground">Every lesson is in the syllabus.</p>
        ) : (
          <ul className="space-y-1">
            {unplaced.map((l) => (
              <li
                key={l.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData(STRUCTURE_PALETTE_TYPE, l.id)}
                className="flex cursor-grab items-center gap-2 rounded-md border border-border px-2 py-1 text-sm"
              >
                <GripVertical aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{l.title}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={L.structurePlace(l.title)}
                  onClick={() => {
                    const to = placeTarget();
                    place(l.id, to.parentId, to.index);
                  }}
                >
                  <Plus aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )
      }
    >
      <StructureTree
        nodes={lines}
        label="Syllabus"
        getLabel={(n) => n.title}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={(id, parentId, index) => edit((t) => moveNode(t, id, parentId, index))}
        onPlace={place}
        renderRow={(n) => (
          <>
            <span className={n.children ? "min-w-0 flex-1 truncate font-medium" : "min-w-0 flex-1 truncate"}>
              {n.title}
            </span>
            {n.minutes != null ? (
              <span className="text-sm tabular-nums text-muted-foreground">{n.minutes} min</span>
            ) : (
              <Badge variant="secondary">{n.children?.length ?? 0} lessons</Badge>
            )}
          </>
        )}
      />
    </StructureBuilderShell>
  );
}
