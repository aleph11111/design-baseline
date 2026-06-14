/**
 * crud-dialog-demo.tsx
 *
 * Sandbox demo for the J (crud-dialog) archetype.
 * Domain: fitness log — far from brickshop nouns (no inventory, lots, customers).
 *
 * Exercises:
 *   - Opening the dialog in VIEW mode for an existing workout.
 *   - Mode transition: view → edit.
 *   - Edit with dirty state → close attempt → confirm-discard (via window.confirm).
 *   - Opening the dialog in CREATE mode for a new workout.
 *   - Footer primary / secondary / destructive layout in each mode.
 *   - Loading skeleton (simulated 1-second delay on open).
 *
 * NOTE: This demo uses window.confirm for the discard-confirmation dialog.
 * Real consumers must use shadcn <AlertDialog> — window.confirm blocks the
 * JS thread and provides no accessible UX. See the spec (Layer 13) for the
 * required pattern.
 */

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CrudDialogSheet,
  CrudDialogHeader,
  CrudDialogBody,
  CrudDialogFooter,
  useCrudDialogMode,
} from "@/components/archetypes/crud-dialog";
import { PageHeader } from "@/components/layout";

// ---------------------------------------------------------------------------
// Domain type
// ---------------------------------------------------------------------------

type WorkoutKind = "run" | "lift" | "bike" | "swim";

type Workout = {
  id: string;
  date: string;
  kind: WorkoutKind;
  durationMinutes: number;
  notes: string;
};

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const KIND_LABELS: Record<WorkoutKind, string> = {
  run: "Run",
  lift: "Lift",
  bike: "Bike",
  swim: "Swim",
};

const SEED_WORKOUTS: Workout[] = [
  { id: "w1", date: "2026-05-19", kind: "run", durationMinutes: 35, notes: "Easy 5k in the park." },
  { id: "w2", date: "2026-05-20", kind: "lift", durationMinutes: 55, notes: "Upper body day." },
  { id: "w3", date: "2026-05-21", kind: "bike", durationMinutes: 70, notes: "Hill repeats on riverside trail." },
];

const EMPTY_FORM: Omit<Workout, "id"> = {
  date: "",
  kind: "run",
  notes: "",
  durationMinutes: 30,
};

// ---------------------------------------------------------------------------
// Workout dialog
// ---------------------------------------------------------------------------

type WorkoutDialogProps = {
  open: boolean;
  onClose: () => void;
  /** entityId=null means create mode. */
  entityId: string | null;
  workouts: Workout[];
  onSave: (updated: Workout) => void;
  onCreate: (created: Omit<Workout, "id">) => void;
  onDelete: (id: string) => void;
};

function WorkoutDialog({
  open,
  onClose,
  entityId,
  workouts,
  onSave,
  onCreate,
  onDelete,
}: WorkoutDialogProps): React.ReactElement {
  // Simulate a 1-second fetch delay when opening in view/edit mode.
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state — in a real consumer use react-hook-form + zod.
  const [form, setForm] = React.useState<Omit<Workout, "id">>(EMPTY_FORM);
  const [isDirty, setIsDirty] = React.useState(false);

  const isCreateMode = entityId === null;

  // Confirm-discard via window.confirm.
  // Real consumers: replace with an <AlertDialog> controlled by a boolean flag.
  const confirmDiscard = React.useCallback(async (): Promise<boolean> => {
    return window.confirm(
      "You have unsaved changes. Discard them and leave?",
    );
  }, []);

  const { mode, setMode, isView, isEdit, isCreate } = useCrudDialogMode({
    initialMode: isCreateMode ? "create" : "view",
    isDirty,
    onConfirmDiscard: confirmDiscard,
  });

  // Re-initialize when the dialog opens.
  React.useEffect(() => {
    if (!open) return;

    if (isCreateMode) {
      setForm(EMPTY_FORM);
      setIsDirty(false);
      return;
    }

    // Simulate fetch delay for existing entity.
    setIsLoading(true);
    const timer = setTimeout(() => {
      const found = workouts.find((w) => w.id === entityId);
      if (found) {
        const { id: _id, ...rest } = found;
        setForm(rest);
      }
      setIsDirty(false);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entityId]);

  // Dirty-guarded close.
  async function handleClose() {
    // If user is in edit or create mode with dirty state, guard the close.
    if ((isEdit || isCreate) && isDirty) {
      const ok = await confirmDiscard();
      if (!ok) return;
    }
    onClose();
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      // Async guard — but onOpenChange must be synchronous for shadcn Sheet.
      // We call handleClose which is async; if the user cancels, the Sheet
      // has already started closing. In a real consumer, prevent Sheet from
      // closing while the AlertDialog is open via event.preventDefault().
      // For this demo, window.confirm is synchronous so this is fine.
      handleClose();
    }
  }

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  async function handleSave() {
    if (!entityId) return;
    setIsSubmitting(true);
    // Simulate async save.
    await new Promise((r) => setTimeout(r, 600));
    onSave({ id: entityId, ...form });
    setIsDirty(false);
    setIsSubmitting(false);
    await setMode("view");
  }

  async function handleCreate() {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onCreate(form);
    setIsSubmitting(false);
    onClose();
  }

  async function handleDelete() {
    if (!entityId) return;
    // In a real consumer replace this with <AlertDialog> — see Layer 14.
    const ok = window.confirm("Delete this workout? This action cannot be undone.");
    if (!ok) return;
    onDelete(entityId);
    onClose();
  }

  // Resolve title.
  const workout = entityId ? workouts.find((w) => w.id === entityId) : null;
  const title = isCreate
    ? "New Workout"
    : workout
    ? `Workout · ${KIND_LABELS[workout.kind]}`
    : "Workout";

  const subtitle = isCreate
    ? undefined
    : workout
    ? workout.date
    : undefined;

  // Footer props per mode.
  const footerProps = (() => {
    if (isView) {
      return {
        primaryLabel: "Edit",
        onPrimary: () => setMode("edit"),
        secondaryLabel: "Close",
        onSecondary: onClose,
        destructiveLabel: "Delete",
        onDestructive: handleDelete,
      };
    }
    if (isEdit) {
      return {
        primaryLabel: "Save",
        onPrimary: handleSave,
        secondaryLabel: "Cancel",
        onSecondary: () => setMode("view"),
        destructiveLabel: "Delete",
        onDestructive: handleDelete,
        isSubmitting,
      };
    }
    // create
    return {
      primaryLabel: "Create",
      onPrimary: handleCreate,
      secondaryLabel: "Cancel",
      onSecondary: onClose,
      isSubmitting,
    };
  })();

  return (
    <CrudDialogSheet open={open} onOpenChange={handleOpenChange} width="md">
      <CrudDialogHeader
        title={title}
        subtitle={subtitle}
      />

      {/* Mixed body (full-width field + a 2-col section), so `layout` is omitted
          and composed manually. A pure paired-field dialog would instead pass
          `<CrudDialogBody layout="two-column">` (or `"flat"`) — see Layer 6. */}
      <CrudDialogBody isLoading={isLoading}>
        {/* Mode badge — indicates current mode visually */}
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
            {mode}
          </span>
        </div>

        <div className="space-y-4">
          {/* Date field */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="wd-date">
              Date
            </label>
            {isView ? (
              <p className="text-sm text-foreground">{form.date || "—"}</p>
            ) : (
              <input
                id="wd-date"
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
              />
            )}
          </div>

          {/* Kind + Duration — 2-col grid (collapses on mobile, per Layer 6) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="wd-kind">
                Type
              </label>
              {isView ? (
                <p className="text-sm text-foreground">{KIND_LABELS[form.kind]}</p>
              ) : (
                <select
                  id="wd-kind"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={form.kind}
                  onChange={(e) =>
                    updateField("kind", e.target.value as WorkoutKind)
                  }
                >
                  {(Object.keys(KIND_LABELS) as WorkoutKind[]).map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABELS[k]}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="wd-duration"
              >
                Duration (min)
              </label>
              {isView ? (
                <p className="text-sm text-foreground">{form.durationMinutes}</p>
              ) : (
                <input
                  id="wd-duration"
                  type="number"
                  min={1}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    updateField("durationMinutes", Number(e.target.value))
                  }
                />
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="wd-notes">
              Notes
            </label>
            {isView ? (
              <p className="text-sm text-foreground whitespace-pre-line">
                {form.notes || "—"}
              </p>
            ) : (
              <textarea
                id="wd-notes"
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            )}
          </div>
        </div>
      </CrudDialogBody>

      <CrudDialogFooter {...footerProps} />
    </CrudDialogSheet>
  );
}

// ---------------------------------------------------------------------------
// Demo list + orchestration
// ---------------------------------------------------------------------------

export function CrudDialogDemo(): React.ReactElement {
  const [workouts, setWorkouts] = React.useState<Workout[]>(SEED_WORKOUTS);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  function openView(id: string) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  function openCreate() {
    setSelectedId(null);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setSelectedId(null);
  }

  function handleSave(updated: Workout) {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === updated.id ? updated : w)),
    );
    setLastAction(`Saved workout: ${updated.id}`);
  }

  function handleCreate(data: Omit<Workout, "id">) {
    const newWorkout: Workout = { ...data, id: `w${Date.now()}` };
    setWorkouts((prev) => [...prev, newWorkout]);
    setLastAction(`Created workout: ${KIND_LABELS[newWorkout.kind]} on ${newWorkout.date}`);
  }

  function handleDelete(id: string) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    setLastAction(`Deleted workout: ${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fitness Log"
        subtitle="J (crud-dialog) archetype demo — workout domain"
      />

      {lastAction && (
        <div className="rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          Last action:{" "}
          <span className="font-medium text-foreground">{lastAction}</span>
        </div>
      )}

      {/* Workout list */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {workouts.length} workout{workouts.length !== 1 ? "s" : ""}
          </span>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Log workout
          </Button>
        </div>

        {workouts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No workouts yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Duration</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr key={w.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td
                    className="px-4 py-3 font-mono text-sm font-medium text-primary hover:underline cursor-pointer"
                    onClick={() => openView(w.id)}
                  >
                    {w.date}
                  </td>
                  <td className="px-4 py-3">{KIND_LABELS[w.kind]}</td>
                  <td className="px-4 py-3 text-right">{w.durationMinutes} min</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[16rem]">
                    {w.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-md border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">Demo flows to exercise:</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Click a date → dialog opens in VIEW mode (simulates 0.8s fetch).</li>
          <li>Click <strong>Edit</strong> in the footer → transitions to EDIT mode.</li>
          <li>Change a field (dirty), then click ✕ or Cancel → confirm-discard prompt.</li>
          <li>Click <strong>Save</strong> → simulates 0.6s save, returns to VIEW mode.</li>
          <li>Click <strong>Log workout</strong> → dialog opens in CREATE mode (no fetch).</li>
          <li>Fill fields → click <strong>Create</strong> → new workout appears in list.</li>
          <li>Open a workout → click <strong>Delete</strong> → confirm → removed from list.</li>
        </ol>
      </div>

      {/* Dialog */}
      <WorkoutDialog
        open={dialogOpen}
        onClose={handleClose}
        entityId={selectedId}
        workouts={workouts}
        onSave={handleSave}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
    </div>
  );
}
