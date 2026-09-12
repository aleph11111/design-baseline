import { useState } from "react";
import {
  MatrixGridShell,
  type MatrixColumn,
  type MatrixRow,
} from "@/components/archetypes/matrix-grid";
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
import { Download } from "lucide-react";

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

export function MatrixGridDemo() {
  const [gradesByStudent, setGradesByStudent] = useState(SEED_GRADES);
  const [sheet, setSheet] = useState<SheetState>({ kind: "closed" });
  const [draftGrade, setDraftGrade] = useState<Grade>("A");
  const [draftNote, setDraftNote] = useState("");
  // Cell variant axis: "click" = read-only cells that open a side-sheet to edit;
  // "inline" = editable-cell — the shared `CellSelect` (ui/cell-input) flush in
  // each filled cell, per the contract (matrix-grid.md, Layer 6: "not a bare
  // native `<select>`").
  const [mode, setMode] = useState<"click" | "inline">("click");
  // Toolbar axis: a grid-driving control (the term) lives in the `toolbar` band
  // under the header — not in `headerActions`. Switching to a term with no
  // entries exercises the `emptyState` slot while keeping the header + toolbar.
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
        <span className="text-[11px] font-mono tabular-nums text-muted-foreground">Y{student.year}</span>
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

  const editingSubjectLabel =
    sheet.kind === "closed"
      ? ""
      : SUBJECTS.find((s) => s.key === sheet.subjectKey)?.label ?? "";
  const editingStudentName =
    sheet.kind === "closed"
      ? ""
      : STUDENTS.find((s) => s.id === sheet.studentId)?.name ?? "";

  return (
    <div className="space-y-4">
      {/* Plex Ledger board form: title + actions sit ON the bounded surface
          (SurfaceHeader), one frame on a muted mat. */}
      <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <MatrixGridShell<GradeEntry>
        kicker="Gradebook"
        title="Student Grades"
        headerActions={
          <>
            <SegmentedControl
              value={mode}
              onValueChange={(v) => setMode(v as "click" | "inline")}
              options={[
                { value: "click", label: "click to edit" },
                { value: "inline", label: "inline edit" },
              ]}
              aria-label="Edit mode"
            />
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </>
        }
        toolbar={
          <div className="flex items-end gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="term">Term</Label>
              <Select value={term} onValueChange={(v) => setTerm(v as "spring" | "summer")}>
                <SelectTrigger id="term" className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">Spring 2026</SelectItem>
                  <SelectItem value="summer">Summer 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
              className="text-center text-[13px] font-mono font-medium tabular-nums"
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g === "INCOMPLETE" ? "INC" : g}
                </option>
              ))}
            </CellSelect>
          ) : (
            <span className="font-mono font-medium tabular-nums">
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
          mode === "inline"
            ? undefined
            : (ctx) => openCell(ctx.row.id, ctx.column.key, ctx.cell)
        }
      />
      </div>

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
