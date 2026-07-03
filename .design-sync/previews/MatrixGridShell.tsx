import * as React from "react";
import { useState } from "react";
import {
  MatrixGridShell,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  type MatrixColumn,
  type MatrixRow,
} from "design-baseline";
import { Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Domain — a school-year gradebook (rows: students, columns: subjects grouped
// by department, cells: a grade entry or absence of one).
// ---------------------------------------------------------------------------

type Grade = "A" | "B" | "C" | "D" | "F" | "INCOMPLETE";
type GradeEntry = { grade: Grade; recordedAt: string; note?: string };

const SUBJECTS = [
  { key: "math.algebra", label: "Algebra", department: "Mathematics" },
  { key: "math.geometry", label: "Geometry", department: "Mathematics" },
  { key: "sci.biology", label: "Biology", department: "Sciences" },
  { key: "sci.chemistry", label: "Chemistry", department: "Sciences" },
  { key: "lang.english", label: "English", department: "Languages" },
];

const STUDENTS = [
  { id: "s1", name: "Ana Reyes", year: 10 },
  { id: "s2", name: "Bo Chen", year: 10 },
  { id: "s3", name: "Cyrus Ali", year: 10 },
];

const GRADES: Record<string, Record<string, GradeEntry>> = {
  s1: {
    "math.algebra": { grade: "A", recordedAt: "2026-05-14" },
    "math.geometry": { grade: "B", recordedAt: "2026-05-14" },
    "sci.biology": { grade: "A", recordedAt: "2026-05-15" },
    "lang.english": { grade: "B", recordedAt: "2026-05-16" },
  },
  s2: {
    "math.algebra": { grade: "C", recordedAt: "2026-05-14" },
    "sci.biology": { grade: "B", recordedAt: "2026-05-15" },
    "sci.chemistry": { grade: "INCOMPLETE", recordedAt: "2026-05-15", note: "Retake pending" },
  },
  s3: {
    "math.geometry": { grade: "F", recordedAt: "2026-05-14", note: "Retake scheduled" },
    "sci.chemistry": { grade: "D", recordedAt: "2026-05-15" },
    "lang.english": { grade: "C", recordedAt: "2026-05-16" },
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

const columns: MatrixColumn[] = SUBJECTS.map((s) => ({ key: s.key, label: s.label, group: s.department }));
const rows: MatrixRow<GradeEntry>[] = STUDENTS.map((student) => ({
  id: student.id,
  label: (
    <span>
      {student.name}{" "}
      <span className="text-[11px] font-mono tabular-nums text-muted-foreground">Y{student.year}</span>
    </span>
  ),
  cells: GRADES[student.id] ?? {},
}));

// Click-to-edit gradebook — grouped subject columns (banded header), colored
// grade cells with a tooltip note, and a term selector in the toolbar band.
export function StudentGrades() {
  const [term, setTerm] = useState("spring");
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <MatrixGridShell<GradeEntry>
        kicker="Gradebook"
        title="Student Grades"
        headerActions={
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        }
        toolbar={
          <div className="flex items-end gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="term">Term</Label>
              <Select value={term} onValueChange={setTerm}>
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
        columns={columns}
        rows={rows}
        rowHeaderLabel="Student"
        renderCell={(ctx) => (
          <span className="font-mono font-medium tabular-nums">
            {ctx.cell?.grade === "INCOMPLETE" ? "INC" : ctx.cell?.grade}
          </span>
        )}
        cellStyle={(ctx) => {
          if (!ctx.isFilled) return { className: "bg-background hover:bg-muted/50" };
          return { className: classNameForGrade(ctx.cell!.grade) };
        }}
        onCellClick={() => {}}
      />
    </div>
  );
}

// Inline-edit mode — a <select> rendered directly inside each filled cell
// (the editable-cell variant, vs. the click-to-open-sheet default).
export function StudentGradesInline() {
  const ALL_GRADES: Grade[] = ["A", "B", "C", "D", "F", "INCOMPLETE"];
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <MatrixGridShell<GradeEntry>
        kicker="Gradebook"
        title="Student Grades"
        columns={columns}
        rows={rows}
        rowHeaderLabel="Student"
        renderCell={(ctx) =>
          ctx.isFilled ? (
            <select
              value={ctx.cell!.grade}
              onChange={() => {}}
              className="w-full cursor-pointer bg-transparent text-center text-[13px] font-mono font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g === "INCOMPLETE" ? "INC" : g}
                </option>
              ))}
            </select>
          ) : null
        }
        cellStyle={(ctx) => ({
          className: ctx.isFilled ? classNameForGrade(ctx.cell!.grade) : "bg-background",
        })}
      />
    </div>
  );
}

// Empty-state slot — a term with no grades recorded yet, kept inside the
// bounded surface so the header and term toolbar stay usable.
export function NoGradesForTerm() {
  const [term, setTerm] = useState("summer");
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <MatrixGridShell<GradeEntry>
        kicker="Gradebook"
        title="Student Grades"
        toolbar={
          <div className="flex items-end gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="term2">Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger id="term2" className="w-44">
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
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">
            No grades recorded for this term yet.
          </div>
        }
        columns={columns}
        rows={[]}
        rowHeaderLabel="Student"
      />
    </div>
  );
}
