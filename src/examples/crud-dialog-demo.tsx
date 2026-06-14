/**
 * crud-dialog-demo.tsx
 *
 * Sandbox demo for the J (crud-dialog) archetype.
 * Domain: fitness log — far from brickshop nouns (no inventory, lots, customers).
 *
 * Canonical consumer of the J archetype: react-hook-form + zod for the form,
 * `useCrudDialogMode` for the mode state, and `useCrudDialogController` for the
 * shared action flow. The dialog does NOT reimplement handleClose / handlePrimary
 * / handleSecondary or the per-mode footer labels — it reads them off the
 * controller (see the spec's anti-patterns). It keeps only what's its own: the
 * schema, default values, mutation bodies, field JSX, and delete.
 *
 * Exercises:
 *   - Opening the dialog in VIEW mode for an existing workout (read-only fields).
 *   - Mode transition: view → edit (controller.handlePrimary).
 *   - Edit with dirty state → close / cancel → confirm-discard.
 *   - Opening the dialog in CREATE mode for a new workout.
 *   - Footer primary / secondary / destructive layout per mode, all derived.
 *   - Loading skeleton (simulated delay on open).
 *
 * NOTE: discard confirmation uses the baseline's `confirmDiscard` (window.confirm).
 * Real consumers must swap it for a shadcn <AlertDialog> — window.confirm blocks
 * the JS thread and is inaccessible. See the spec (Layer 13).
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CrudDialogSheet,
  CrudDialogHeader,
  CrudDialogBody,
  CrudDialogFooter,
  useCrudDialogMode,
  useCrudDialogController,
  confirmDiscard,
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

const workoutSchema = z.object({
  date: z.string().min(1, "Date is required."),
  kind: z.enum(["run", "lift", "bike", "swim"]),
  durationMinutes: z.number().int().min(1, "Must be at least 1 minute."),
  notes: z.string(),
});

type WorkoutFormValues = z.infer<typeof workoutSchema>;

const EMPTY_FORM: WorkoutFormValues = {
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
  // Simulate a fetch delay when opening an existing workout in view mode.
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // The values handleSecondary resets to when cancelling an edit — the last
  // loaded entity (EMPTY_FORM in create mode).
  const [loadedValues, setLoadedValues] = React.useState<WorkoutFormValues>(EMPTY_FORM);

  const isCreateMode = entityId === null;

  // The form is the consumer's (schema + defaults + JSX). The controller reads
  // formState.isDirty, trigger(), getValues(), reset() off it.
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: EMPTY_FORM,
  });

  const mode = useCrudDialogMode({
    initialMode: isCreateMode ? "create" : "view",
    isDirty: form.formState.isDirty,
    onConfirmDiscard: () => confirmDiscard(),
  });
  const { isView } = mode;

  // Simulated mutations shaped like @tanstack/react-query useMutation results
  // ({ mutate, isPending }) — exactly the structural subset the controller
  // consumes. On success the dialog closes (a valid CRUD pattern that also keeps
  // the demo free of post-save edit→view dirty races).
  const createMutation = React.useMemo(
    () => ({
      isPending: isSubmitting,
      mutate: (values: WorkoutFormValues) => {
        setIsSubmitting(true);
        setTimeout(() => {
          onCreate(values);
          setIsSubmitting(false);
          onClose();
        }, 600);
      },
    }),
    [isSubmitting, onCreate, onClose],
  );

  const updateMutation = React.useMemo(
    () => ({
      isPending: isSubmitting,
      mutate: (values: WorkoutFormValues) => {
        if (!entityId) return;
        setIsSubmitting(true);
        setTimeout(() => {
          onSave({ id: entityId, ...values });
          setIsSubmitting(false);
          onClose();
        }, 600);
      },
    }),
    [isSubmitting, entityId, onSave, onClose],
  );

  // The shared controller owns the whole action flow + derived footer labels.
  const controller = useCrudDialogController<WorkoutFormValues>({
    form,
    mode,
    defaultValues: loadedValues,
    createMutation,
    updateMutation,
    onClose,
  });

  // Load the entity when opening in view mode (create needs no fetch). The dialog
  // is remounted per open (keyed in the parent), so this runs once per open.
  React.useEffect(() => {
    if (!open || isCreateMode) return;
    setIsLoading(true);
    const timer = setTimeout(() => {
      const found = workouts.find((w) => w.id === entityId);
      if (found) {
        const { id: _id, ...rest } = found;
        form.reset(rest);
        setLoadedValues(rest);
      }
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entityId]);

  // Delete is the consumer's concern — the controller owns create/update/edit +
  // close, never deletion. Shown in view/edit, never in create.
  function handleDelete() {
    if (!entityId) return;
    // Real consumers: swap window.confirm for a shadcn <AlertDialog> — see Layer 14.
    const ok = window.confirm("Delete this workout? This action cannot be undone.");
    if (!ok) return;
    onDelete(entityId);
    onClose();
  }

  // Resolve title from the entity (not the live form).
  const workout = entityId ? workouts.find((w) => w.id === entityId) : null;
  const title = mode.isCreate
    ? "New Workout"
    : workout
    ? `Workout · ${KIND_LABELS[workout.kind]}`
    : "Workout";
  const subtitle = mode.isCreate ? undefined : workout?.date;

  const destructiveProps = mode.isCreate
    ? {}
    : { destructiveLabel: "Delete", onDestructive: handleDelete };

  return (
    <CrudDialogSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) void controller.handleClose();
      }}
      width="md"
    >
      <CrudDialogHeader title={title} subtitle={subtitle} />

      {/* Mixed body (full-width field + a 2-col section), so `layout` is omitted
          and composed manually. A pure paired-field dialog would instead pass
          `<CrudDialogBody layout="two-column">` (or `"flat"`) — see Layer 6. */}
      <CrudDialogBody isLoading={isLoading}>
        {/* Mode badge — indicates current mode visually */}
        <div className="mb-4">
          <Badge variant="outline" className="capitalize">{mode.mode}</Badge>
        </div>

        {/* Canonical RHF field stack: shadcn <FormField>/<FormLabel>/<FormControl>
            — the bound variant of the shared field molecule, visually identical to
            the manual <Label>+<Input> stack. View mode renders the value as text. */}
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  {isView ? (
                    <p className="text-sm text-foreground">{field.value || "—"}</p>
                  ) : (
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kind + Duration — 2-col grid (collapses on mobile, per Layer 6) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    {isView ? (
                      <p className="text-sm text-foreground">
                        {KIND_LABELS[field.value]}
                      </p>
                    ) : (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.keys(KIND_LABELS) as WorkoutKind[]).map((k) => (
                            <SelectItem key={k} value={k}>
                              {KIND_LABELS[k]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    {isView ? (
                      <p className="text-sm text-foreground">{field.value}</p>
                    ) : (
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  {isView ? (
                    <p className="text-sm text-foreground whitespace-pre-line">
                      {field.value || "—"}
                    </p>
                  ) : (
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CrudDialogBody>

      {/* Every footer prop except delete is derived by the controller. */}
      <CrudDialogFooter
        primaryLabel={controller.showPrimary ? controller.primaryLabel : undefined}
        onPrimary={controller.handlePrimary}
        secondaryLabel={controller.secondaryLabel}
        onSecondary={controller.handleSecondary}
        isSubmitting={controller.isSubmitting}
        {...destructiveProps}
      />
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
  // Bumped on every open so the dialog (and its form/mode hooks) remounts fresh
  // each time — no stale mode/dirty state leaking across opens.
  const [openSeq, setOpenSeq] = React.useState(0);

  function openView(id: string) {
    setSelectedId(id);
    setDialogOpen(true);
    setOpenSeq((s) => s + 1);
  }

  function openCreate() {
    setSelectedId(null);
    setDialogOpen(true);
    setOpenSeq((s) => s + 1);
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.map((w) => (
                <TableRow key={w.id}>
                  <TableCell
                    className="font-medium font-mono text-primary hover:underline cursor-pointer"
                    onClick={() => openView(w.id)}
                  >
                    {w.date}
                  </TableCell>
                  <TableCell>{KIND_LABELS[w.kind]}</TableCell>
                  <TableCell className="text-right">{w.durationMinutes} min</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[16rem]">
                    {w.notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-md border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">Demo flows to exercise:</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Click a date → dialog opens in VIEW mode (simulates 0.8s fetch).</li>
          <li>Click <strong>Edit</strong> in the footer → transitions to EDIT mode.</li>
          <li>Change a field (dirty), then click ✕ or Cancel → confirm-discard prompt.</li>
          <li>Click <strong>Save</strong> → simulates 0.6s save, then closes the dialog.</li>
          <li>Click <strong>Log workout</strong> → dialog opens in CREATE mode (no fetch).</li>
          <li>Fill fields → click <strong>Create</strong> → new workout appears in list.</li>
          <li>Open a workout → click <strong>Delete</strong> → confirm → removed from list.</li>
        </ol>
      </div>

      {/* Dialog — keyed by openSeq so each open mounts a fresh form + mode. */}
      <WorkoutDialog
        key={openSeq}
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
