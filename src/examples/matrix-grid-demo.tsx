import { useState } from "react";
import {
  MatrixGridShell,
  type MatrixColumn,
  type MatrixRow,
  type MatrixSelection,
} from "@/components/archetypes/matrix-grid";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StateView } from "@/components/ui/state-view";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { CellSelect } from "@/components/ui/cell-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronRight, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Demo domain — a school-year gradebook.
// Rows: students. Columns: subjects, grouped by department.
// Cells: a grade entry (or absence of one).
// ---------------------------------------------------------------------------

type Grade = "A" | "B" | "C" | "D" | "F" | "INCOMPLETE";

type GradeEntry = {
  grade: Grade;
  /** ISO date the grade was recorded. */
  recordedAt: string;
  /** Optional short note (e.g. "retake pending"). */
  note?: string;
};

type Student = { id: string; name: string; year: number };

type Subject = { key: string; label: string; department: string };

const SUBJECTS: Subject[] = [
  { key: "math.algebra", label: "Algebra", department: "Mathematics" },
  { key: "math.geometry", label: "Geometry", department: "Mathematics" },
  { key: "sci.biology", label: "Biology", department: "Sciences" },
  { key: "sci.chemistry", label: "Chemistry", department: "Sciences" },
  { key: "lang.english", label: "English", department: "Languages" },
  { key: "lang.spanish", label: "Spanish", department: "Languages" },
  { key: "arts.music", label: "Music", department: "Arts" },
];

const STUDENTS: Student[] = [
  { id: "s1", name: "Ana Reyes", year: 10 },
  { id: "s2", name: "Bo Chen", year: 10 },
  { id: "s3", name: "Cyrus Ali", year: 10 },
  { id: "s4", name: "Dawn Park", year: 10 },
];

// Seed grades. Empty entries = subject not taken this term.
const SEED_GRADES: Record<string, Record<string, GradeEntry>> = {
  s1: {
    "math.algebra": { grade: "A", recordedAt: "2026-05-14" },
    "math.geometry": { grade: "B", recordedAt: "2026-05-14" },
    "sci.biology": { grade: "A", recordedAt: "2026-05-15" },
    "lang.english": { grade: "B", recordedAt: "2026-05-16" },
    "arts.music": { grade: "A", recordedAt: "2026-05-18" },
  },
  s2: {
    "math.algebra": { grade: "C", recordedAt: "2026-05-14" },
    "sci.biology": { grade: "B", recordedAt: "2026-05-15" },
    "sci.chemistry": { grade: "INCOMPLETE", recordedAt: "2026-05-15", note: "Retake pending" },
    "lang.spanish": { grade: "A", recordedAt: "2026-05-17" },
  },
  s3: {
    "math.geometry": { grade: "F", recordedAt: "2026-05-14", note: "Retake scheduled" },
    "sci.chemistry": { grade: "D", recordedAt: "2026-05-15" },
    "lang.english": { grade: "C", recordedAt: "2026-05-16" },
    "lang.spanish": { grade: "C", recordedAt: "2026-05-17" },
  },
  s4: {
    "math.algebra": { grade: "A", recordedAt: "2026-05-14" },
    "math.geometry": { grade: "A", recordedAt: "2026-05-14" },
    "sci.biology": { grade: "A", recordedAt: "2026-05-15" },
    "sci.chemistry": { grade: "B", recordedAt: "2026-05-15" },
    "lang.english": { grade: "A", recordedAt: "2026-05-16" },
    "arts.music": { grade: "B", recordedAt: "2026-05-18" },
  },
};

// Ordinal good→bad scale expressed in semantic tokens, per archetype M's
// acceptance gate ("legend/scale uses tokens, no literal color ramps").
// The tint carries the meaning; the label stays `text-foreground` so it
// remains legible when the theme flips — a `text-<hue>` on a same-hue tint
// only ever has contrast in one of the two themes.
function classNameForGrade(g: Grade): string {
  switch (g) {
    case "A":
    case "B":
      return "bg-success/15 text-foreground hover:bg-success/25";
    case "C":
      return "bg-primary/10 text-foreground hover:bg-primary/20";
    case "D":
      return "bg-warning/15 text-foreground hover:bg-warning/25";
    case "F":
      return "bg-destructive/15 text-foreground hover:bg-destructive/25";
    case "INCOMPLETE":
      return "bg-muted text-muted-foreground hover:bg-muted/80";
  }
}

// Sheet state machine. Demonstrates the picker-less, edit + create-from-empty pattern.
type SheetState =
  | { kind: "closed" }
  | { kind: "edit"; studentId: string; subjectKey: string }
  | { kind: "create"; studentId: string; subjectKey: string };

const ALL_GRADES: Grade[] = ["A", "B", "C", "D", "F", "INCOMPLETE"];

const GRADE_POINTS: Partial<Record<Grade, number>> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
/** Mean grade points over the graded entries, or "–" when none count. */
function gpa(entries: (GradeEntry | undefined)[]): string {
  const points = entries
    .map((e) => (e ? GRADE_POINTS[e.grade] : undefined))
    .filter((p): p is number => p !== undefined);
  return points.length ? (points.reduce((a, b) => a + b, 0) / points.length).toFixed(2) : "–";
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic attendance per month — demo data for the derivation section. */
function attendance(studentId: string, year: string, month: number): number {
  const seed = studentId.charCodeAt(1) * 7 + Number(year) + month * 13;
  return 80 + (seed % 21);
}

/**
 * The inspector body — tab-free: inputs and the live result first, the
 * derivation below in a collapsible section. Wide content is reshaped, never
 * scrolled sideways (12 months as a 6×2 grid plus a year toggle).
 */
function GradeInspectorBody({
  studentId,
  draft,
  onDraft,
  average,
}: {
  studentId: string;
  draft: { grade: Grade; note: string };
  onDraft: (d: { grade: Grade; note: string }) => void;
  average: string;
}) {
  const [year, setYear] = useState("2026");
  return (
    <>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="inspector-grade">Grade</Label>
          <Select value={draft.grade} onValueChange={(v) => onDraft({ ...draft, grade: v as Grade })}>
            <SelectTrigger id="inspector-grade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_GRADES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g === "INCOMPLETE" ? "Incomplete" : g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inspector-note">Note (optional)</Label>
          <Input
            id="inspector-note"
            value={draft.note}
            onChange={(e) => onDraft({ ...draft, note: e.target.value })}
            placeholder="Retake pending, makeup exam, …"
          />
        </div>
      </div>
      <div className="flex items-baseline justify-between rounded-md bg-muted/50 px-3 py-2">
        <span className="text-sm text-muted-foreground">Term GPA with this grade</span>
        <span className="text-lg font-semibold tabular-nums">{average}</span>
      </div>
      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-center gap-1 text-sm font-medium">
          <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
          Monthly attendance
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <SegmentedControl
            value={year}
            onValueChange={setYear}
            options={[
              { value: "2025", label: "2025" },
              { value: "2026", label: "2026" },
            ]}
            aria-label="Year"
          />
          <dl className="grid grid-cols-6 gap-x-2 gap-y-3">
            {MONTHS.map((m, i) => (
              <div key={m} className="min-w-0 text-center">
                <dt className="text-[11px] text-muted-foreground">{m}</dt>
                <dd className="text-sm tabular-nums">{attendance(studentId, year, i)}%</dd>
              </div>
            ))}
          </dl>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

export function MatrixGridDemo() {
  const [gradesByStudent, setGradesByStudent] = useState(SEED_GRADES);
  const [sheet, setSheet] = useState<SheetState>({ kind: "closed" });
  const [draftGrade, setDraftGrade] = useState<Grade>("A");
  const [draftNote, setDraftNote] = useState("");
  // Cell variant axis (matrix-grid.md, Layer 6): "click" = read-only cells that
  // open a side-sheet to edit; "inline" = editable-cell — the shared `CellSelect`
  // (ui/cell-input) flush in each filled cell. v3.1: both modes are conformant;
  // forbidden #1 bans only bare native / hand-rolled in-cell editors, so
  // "inline" routes through the shared control, never a raw `<select>`.
  // "workbench" (Layer 5 "Workbench satellites"): the inspector variant plus a
  // read-only preview matrix in `body` and a summary in `dock`; the gradebook
  // stays the route's one editable matrix.
  const [mode, setMode] = useState<"click" | "inline" | "inspector" | "workbench">("click");
  const withInspector = mode === "inspector" || mode === "workbench";
  // Inspector variant (Layer 6 "Inspector slot"): the shell docks the panel and
  // asks `onBeforeSelect` before every switch; this body is draft-with-apply,
  // so it guards unsaved edits. The shell prescribes no save model.
  const [selection, setSelection] = useState<MatrixSelection | null>(null);
  const [inspectorDraft, setInspectorDraft] = useState<{ grade: Grade; note: string }>({ grade: "A", note: "" });
  const [guard, setGuard] = useState<((ok: boolean) => void) | null>(null);
  // Toolbar axis: a grid-scoping control (the term) is `toolbar`, never
  // `actions`. Switching to a term with no entries exercises the `emptyState`
  // slot while keeping the title + toolbar.
  // Only the table scrolls sideways (v1.5), so the term control stays in view
  // on a narrow viewport.
  const [term, setTerm] = useState<"spring" | "summer">("spring");

  function setCellGrade(studentId: string, subjectKey: string, grade: Grade) {
    const today = new Date().toISOString().slice(0, 10);
    setGradesByStudent((prev) => {
      const studentGrades = { ...(prev[studentId] ?? {}) };
      const existing = studentGrades[subjectKey];
      if (existing) {
        studentGrades[subjectKey] = { ...existing, grade, recordedAt: today };
      }
      return { ...prev, [studentId]: studentGrades };
    });
  }

  const columns: MatrixColumn[] = SUBJECTS.map((s) => ({
    key: s.key,
    label: s.label,
    group: s.department,
  }));

  const rows: MatrixRow<GradeEntry>[] = STUDENTS.map((student) => ({
    id: student.id,
    label: (
      <span>
        {student.name}{" "}
        <span className="text-[11px] tabular-nums text-muted-foreground">Y{student.year}</span>
      </span>
    ),
    cells: gradesByStudent[student.id] ?? {},
  }));

  // The spring term carries the seeded grades; summer has none yet — the latter
  // drives the `emptyState` slot below.
  const visibleRows = term === "spring" ? rows : [];

  function closeSheet() {
    setSheet({ kind: "closed" });
    setDraftNote("");
    setDraftGrade("A");
  }

  function openCell(studentId: string, subjectKey: string, existing?: GradeEntry) {
    if (existing) {
      setDraftGrade(existing.grade);
      setDraftNote(existing.note ?? "");
      setSheet({ kind: "edit", studentId, subjectKey });
    } else {
      setDraftGrade("A");
      setDraftNote("");
      setSheet({ kind: "create", studentId, subjectKey });
    }
  }

  function saveDraft() {
    if (sheet.kind === "closed") return;
    const today = new Date().toISOString().slice(0, 10);
    setGradesByStudent((prev) => {
      const studentGrades = { ...(prev[sheet.studentId] ?? {}) };
      studentGrades[sheet.subjectKey] = {
        grade: draftGrade,
        recordedAt: today,
        note: draftNote.trim() === "" ? undefined : draftNote.trim(),
      };
      return { ...prev, [sheet.studentId]: studentGrades };
    });
    closeSheet();
  }

  const selectedEntry = selection ? gradesByStudent[selection.rowId]?.[selection.columnKey] : undefined;
  const seedDraft = (entry?: GradeEntry) => ({ grade: entry?.grade ?? "A", note: entry?.note ?? "" });
  const inspectorDirty =
    selection !== null &&
    (inspectorDraft.grade !== seedDraft(selectedEntry).grade ||
      inspectorDraft.note !== seedDraft(selectedEntry).note);

  function selectCell(next: MatrixSelection | null) {
    setSelection(next);
    if (next) setInspectorDraft(seedDraft(gradesByStudent[next.rowId]?.[next.columnKey]));
  }

  function applyInspector() {
    if (!selection) return;
    const today = new Date().toISOString().slice(0, 10);
    setGradesByStudent((prev) => ({
      ...prev,
      [selection.rowId]: {
        ...(prev[selection.rowId] ?? {}),
        [selection.columnKey]: {
          grade: inspectorDraft.grade,
          recordedAt: today,
          note: inspectorDraft.note.trim() === "" ? undefined : inspectorDraft.note.trim(),
        },
      },
    }));
  }

  // Live result: the student's GPA with the draft grade swapped in.
  function draftAverage(): string {
    if (!selection) return "–";
    const grades = { ...(gradesByStudent[selection.rowId] ?? {}) };
    grades[selection.columnKey] = { grade: inspectorDraft.grade, recordedAt: "" };
    return gpa(Object.values(grades));
  }

  // Workbench satellites: read-only figures derived from the live gradebook,
  // so applying a grade in the inspector updates them.
  const departments = [...new Set(SUBJECTS.map((s) => s.department))];
  const departmentRows: MatrixRow<string>[] = STUDENTS.map((student) => ({
    id: student.id,
    label: student.name,
    cells: Object.fromEntries(
      departments.map((d) => [
        d,
        gpa(SUBJECTS.filter((s) => s.department === d).map((s) => gradesByStudent[student.id]?.[s.key])),
      ]),
    ),
  }));
  const allEntries = STUDENTS.flatMap((st) => Object.values(gradesByStudent[st.id] ?? {}));
  const incomplete = allEntries.filter((e) => e.grade === "INCOMPLETE").length;

  const editingSubjectLabel =
    sheet.kind === "closed"
      ? ""
      : SUBJECTS.find((s) => s.key === sheet.subjectKey)?.label ?? "";
  const editingStudentName =
    sheet.kind === "closed"
      ? ""
      : STUDENTS.find((s) => s.id === sheet.studentId)?.name ?? "";

  return (
    <div className="space-y-5">
      {/* Demo control, not page chrome: switches between the contract's two
          documented cell-editing variants. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          The <strong>matrix-grid</strong> archetype — the <strong>Term</strong>{" "}
          selector scopes the grid from the toolbar; <strong>Export CSV</strong>{" "}
          acts on the whole grid from the page header. Toggle the cell-editing
          variant; <strong>workbench</strong> adds a read-only preview matrix
          and a summary below the grid.
          variant.
        </p>
        <SegmentedControl
          value={mode}
          onValueChange={(v) => {
            setMode(v as "click" | "inline" | "inspector" | "workbench");
            setSelection(null);
          }}
          options={[
            { value: "click", label: "overlay" },
            { value: "inline", label: "inline" },
            { value: "inspector", label: "inspector" },
            { value: "workbench", label: "workbench" },
          ]}
          aria-label="Edit mode"
        />
      </div>

      <MatrixGridShell<GradeEntry>
        title="Student Grades"
        // A matrix that sits under a parent page: the back link is the page
        // header's, not a bespoke leading control.
        backHref="#"
        backLabel="Classes"
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
        toolbar={
          <Select value={term} onValueChange={(v) => setTerm(v as "spring" | "summer")}>
            <SelectTrigger label="Term" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spring">Spring 2026</SelectItem>
              <SelectItem value="summer">Summer 2026</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyState={
          visibleRows.length === 0 ? (
            <StateView
              variant="empty"
              message="No grades recorded for this term yet."
            />
          ) : undefined
        }
        columns={columns}
        rows={visibleRows}
        rowHeaderLabel="Student"
        // Pass `isFilled` explicitly so the prop's contract is exercised here
        // (a tightened shell that drops or retypes it breaks this typecheck).
        // A present `GradeEntry` means the cell is filled; missing cells are
        // `undefined` — identical to the shell's default, so render is unchanged.
        isFilled={(cell) => cell !== undefined}
        renderCell={(ctx) =>
          mode === "inline" && ctx.isFilled ? (
            <CellSelect
              value={ctx.cell!.grade}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                setCellGrade(ctx.row.id, ctx.column.key, e.target.value as Grade)
              }
              className="text-center text-[13px] tabular-nums"
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g === "INCOMPLETE" ? "INC" : g}
                </option>
              ))}
            </CellSelect>
          ) : (
            <span className="font-medium tabular-nums">
              {ctx.cell?.grade === "INCOMPLETE" ? "INC" : ctx.cell?.grade}
            </span>
          )
        }
        cellStyle={(ctx) => {
          if (!ctx.isFilled) {
            return {
              className: "bg-background hover:bg-muted/50",
            };
          }
          const grade = ctx.cell!.grade;
          return {
            className: classNameForGrade(grade),
            tooltip:
              ctx.cell?.note !== undefined
                ? `${grade} — ${ctx.cell.note}`
                : grade === "INCOMPLETE"
                  ? "Incomplete"
                  : `Recorded ${ctx.cell?.recordedAt}`,
          };
        }}
        onCellClick={
          mode === "click"
            ? (ctx) => openCell(ctx.row.id, ctx.column.key, ctx.cell)
            : undefined
        }
        body={
          mode === "workbench" ? (
            <MatrixGridShell<string>
              title="Department GPA (preview)"
              columns={departments.map((d) => ({ key: d, label: d }))}
              rows={departmentRows}
              rowHeaderLabel="Student"
              renderCell={(ctx) => <span className="tabular-nums">{ctx.cell}</span>}
            />
          ) : undefined
        }
        dock={
          mode === "workbench" ? (
            <dl className="flex flex-wrap gap-x-8 gap-y-2 rounded-lg border bg-muted/40 px-4 py-3">
              <div>
                <dt className="text-xs text-muted-foreground">Class GPA</dt>
                <dd className="text-lg font-semibold tabular-nums">{gpa(allEntries)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Grades recorded</dt>
                <dd className="text-lg font-semibold tabular-nums">{allEntries.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Incomplete</dt>
                <dd className="text-lg font-semibold tabular-nums">{incomplete}</dd>
              </div>
            </dl>
          ) : undefined
        }
        inspector={
          withInspector
            ? {
                selection,
                onSelectionChange: selectCell,
                onBeforeSelect: () =>
                  inspectorDirty ? new Promise<boolean>((resolve) => setGuard(() => resolve)) : true,
                title: selection
                  ? STUDENTS.find((s) => s.id === selection.rowId)?.name ?? ""
                  : "",
                description: selection
                  ? SUBJECTS.find((s) => s.key === selection.columnKey)?.label
                  : undefined,
                footer: (
                  <Button type="button" disabled={!inspectorDirty} onClick={applyInspector}>
                    Apply
                  </Button>
                ),
                children: selection && (
                  <GradeInspectorBody
                    studentId={selection.rowId}
                    draft={inspectorDraft}
                    onDraft={setInspectorDraft}
                    average={draftAverage()}
                  />
                ),
              }
            : undefined
        }
      />

      <ConfirmationDialog
        isOpen={guard !== null}
        onClose={() => {
          guard?.(false);
          setGuard(null);
        }}
        onConfirm={() => {
          guard?.(true);
          setGuard(null);
        }}
        title="Discard unsaved changes?"
        description="This grade has edits that are not applied yet."
        confirmText="Discard"
        variant="destructive"
      />

      <Sheet
        open={sheet.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {sheet.kind === "edit" ? "Edit grade" : "Record grade"}
            </SheetTitle>
            <SheetDescription>
              {editingStudentName} · {editingSubjectLabel}
            </SheetDescription>
          </SheetHeader>
          {/* Shared field molecule: Label above the shadcn control (space-y-1.5),
              same as form-page / crud-dialog — never hand-rolled label/select. */}
          <div className="pt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="grade">Grade</Label>
              <Select value={draftGrade} onValueChange={(v) => setDraftGrade(v as Grade)}>
                <SelectTrigger id="grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g === "INCOMPLETE" ? "Incomplete" : g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Retake pending, makeup exam, …"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeSheet}>
                Cancel
              </Button>
              <Button type="button" onClick={saveDraft}>
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
