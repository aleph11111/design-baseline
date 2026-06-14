import { useState } from "react";
import {
  MatrixGridShell,
  type MatrixColumn,
  type MatrixRow,
} from "@/components/archetypes/matrix-grid";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

function classNameForGrade(g: Grade): string {
  switch (g) {
    case "A":
    case "B":
      return "bg-emerald-100 text-emerald-900 hover:bg-emerald-200";
    case "C":
      return "bg-sky-100 text-sky-900 hover:bg-sky-200";
    case "D":
      return "bg-amber-100 text-amber-900 hover:bg-amber-200";
    case "F":
      return "bg-rose-100 text-rose-900 hover:bg-rose-200";
    case "INCOMPLETE":
      return "bg-slate-200 text-slate-700 hover:bg-slate-300";
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
  // "inline" = editable-cell (a <select> rendered directly in each filled cell).
  const [mode, setMode] = useState<"click" | "inline">("click");

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
        <span className="text-xs text-muted-foreground">Y{student.year}</span>
      </span>
    ),
    cells: gradesByStudent[student.id] ?? {},
  }));

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {STUDENTS.length} students · {SUBJECTS.length} subjects ·{" "}
          {mode === "click" ? "click any cell to grade or update." : "edit grades inline."}
        </p>
        <div className="flex gap-1 rounded-md border p-0.5">
          {(["click", "inline"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                "rounded px-2 py-1 text-xs " +
                (mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {m === "click" ? "click to edit" : "inline edit"}
            </button>
          ))}
        </div>
      </div>

      <MatrixGridShell<GradeEntry>
        columns={columns}
        rows={rows}
        rowHeaderLabel="Student"
        renderCell={(ctx) =>
          mode === "inline" && ctx.isFilled ? (
            <select
              value={ctx.cell!.grade}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                setCellGrade(ctx.row.id, ctx.column.key, e.target.value as Grade)
              }
              className="w-full cursor-pointer bg-transparent text-center text-sm font-medium focus:outline-none"
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g === "INCOMPLETE" ? "INC" : g}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-medium">
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
