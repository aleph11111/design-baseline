import * as React from "react";
import { Field } from "@/components/archetypes/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * field demo — a recipe editor (domain deliberately far from any source project).
 * Types are defined here first, then fed to <Field>; the primitive never sees a
 * domain type, only label/description/error/required/orientation knobs and a
 * render-prop that spreads the wiring onto each control.
 */

type Course = "starter" | "main" | "dessert";

interface RecipeDraft {
  name: string;
  course: Course;
  servings: string;
  notes: string;
}

const COURSES: { value: Course; label: string }[] = [
  { value: "starter", label: "Starter" },
  { value: "main", label: "Main" },
  { value: "dessert", label: "Dessert" },
];

export function FieldDemo(): React.ReactElement {
  const [draft, setDraft] = React.useState<RecipeDraft>({
    name: "",
    course: "main",
    servings: "4",
    notes: "",
  });
  const [courseFilter, setCourseFilter] = React.useState<Course | "all">("all");

  // Trivial standalone validation — the point is that Field renders the error, no
  // form library involved.
  const nameError = draft.name.trim() === "" ? "A recipe needs a name." : undefined;

  const set = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="mx-auto max-w-xl space-y-8 px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">New recipe</h1>
        <p className="text-sm text-muted-foreground">
          Every field is a standalone <code>Field</code> — no form library. Wiring
          (<code>htmlFor</code>, <code>aria-describedby</code>,{" "}
          <code>aria-invalid</code>) is automatic.
        </p>
      </div>

      {/* Inline orientation — a filter row above the form. */}
      <Field label="Filter by course" orientation="inline">
        {(props) => (
          <Select
            value={courseFilter}
            onValueChange={(v) => setCourseFilter(v as Course | "all")}
          >
            <SelectTrigger
              id={props.id}
              aria-describedby={props["aria-describedby"]}
              className="w-44"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {COURSES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>

      <div className="space-y-5 rounded-lg border bg-card p-6 shadow-sm">
        {/* Required + error. */}
        <Field label="Recipe name" required error={nameError}>
          {(props) => (
            <Input
              {...props}
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Charred leek tart"
            />
          )}
        </Field>

        {/* Select in a stacked field. */}
        <Field label="Course" description="Where it lands on the menu.">
          {(props) => (
            <Select
              value={draft.course}
              onValueChange={(v) => set("course", v as Course)}
            >
              <SelectTrigger
                id={props.id}
                aria-describedby={props["aria-describedby"]}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COURSES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>

        {/* Number input with a helper line. */}
        <Field label="Servings" description="Used to scale the ingredient list.">
          {(props) => (
            <Input
              {...props}
              type="number"
              min={1}
              value={draft.servings}
              onChange={(e) => set("servings", e.target.value)}
            />
          )}
        </Field>

        {/* Textarea. */}
        <Field label="Notes">
          {(props) => (
            <Textarea
              {...props}
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Make-ahead tips, substitutions…"
              className="min-h-24"
            />
          )}
        </Field>
      </div>
    </div>
  );
}

FieldDemo.displayName = "FieldDemo";
