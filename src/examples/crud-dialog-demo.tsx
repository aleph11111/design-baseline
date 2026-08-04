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
import { History, Plus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StateView } from "@/components/ui/state-view";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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

type DialogWidth = "sm" | "md" | "lg";
type DialogBodyLayout = "flat" | "two-column" | "two-tab";

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
  /** Drives `<CrudDialogSheet width>`. */
  width: DialogWidth;
  /** Drives `<CrudDialogBody layout>` — "two-tab" composes shadcn `<Tabs>` manually. */
  bodyLayout: DialogBodyLayout;
};

function WorkoutDialog({
  open,
  onClose,
  entityId,
  workouts,
  onSave,
  onCreate,
  onDelete,
  width,
  bodyLayout,
}: WorkoutDialogProps): React.ReactElement {
  // Simulate a fetch delay when opening an existing workout in view mode.
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // The values handleSecondary resets to when cancelling an edit — the last
  // loaded entity (EMPTY_FORM in create mode).
  const [loadedValues, setLoadedValues] = React.useState<WorkoutFormValues>(EMPTY_FORM);
  // Controls the accessible delete-confirmation dialog (rendered below).
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

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
  // ({ mutateAsync, isPending }) — exactly the structural subset the controller
  // consumes. The controller owns the post-save transition (Layer 13): it
  // awaits mutateAsync, resets the form, then closes on create or returns to
  // view on edit. The mutation itself must not close the dialog or transition
  // the mode.
  const createMutation = React.useMemo(
    () => ({
      isPending: isSubmitting,
      mutateAsync: (values: WorkoutFormValues) =>
        new Promise<void>((resolve) => {
          setIsSubmitting(true);
          setTimeout(() => {
            onCreate(values);
            setIsSubmitting(false);
            resolve();
          }, 600);
        }),
    }),
    [isSubmitting, onCreate],
  );

  const updateMutation = React.useMemo(
    () => ({
      isPending: isSubmitting,
      mutateAsync: (values: WorkoutFormValues) =>
        new Promise<void>((resolve, reject) => {
          if (!entityId) {
            reject(new Error("no entityId"));
            return;
          }
          setIsSubmitting(true);
          setTimeout(() => {
            onSave({ id: entityId, ...values });
            setIsSubmitting(false);
            resolve();
          }, 600);
        }),
    }),
    [isSubmitting, entityId, onSave],
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
  // close, never deletion. Shown in view/edit, never in create. onDestructive
  // opens the baseline's accessible <ConfirmationDialog> (rendered below) instead
  // of a blocking window.confirm — the confirm flow CrudDialogFooter's contract
  // says the consumer must own.
  function confirmDelete() {
    if (!entityId) return;
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

  // Two-tab shape's read-only Tab 2 — other logged workouts of the same kind.
  const relatedHistory = workout
    ? workouts.filter((w) => w.kind === workout.kind && w.id !== workout.id)
    : [];

  const destructiveProps = mode.isCreate
    ? {}
    : { destructiveLabel: "Delete", onDestructive: () => setConfirmDeleteOpen(true) };

  // Mode badge — indicates current mode visually. `sm:col-span-2` is a no-op
  // in flat/two-tab layouts and spans the full row under `layout="two-column"`.
  const modeBadge = (
    <div className="sm:col-span-2">
      <Badge variant="outline" className="capitalize">{mode.mode}</Badge>
    </div>
  );

  // Canonical RHF field stack: shadcn <FormField>/<FormLabel>/<FormControl> —
  // the bound variant of the shared field molecule, visually identical to the
  // manual <Label>+<Input> stack. View mode renders the value as text. Fields
  // are flat siblings (no wrapping <div>s) so `<CrudDialogBody layout>` can
  // arrange them into a stack or a 2-col grid on its own — see Layer 6.
  const fields = (
    <>
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            {isView ? (
              <p className="text-sm font-mono tabular-nums text-foreground">{field.value || "—"}</p>
            ) : (
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

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
              <p className="text-sm font-mono tabular-nums text-foreground">{field.value}</p>
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

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
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
    </>
  );

  return (
    <CrudDialogSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) void controller.handleClose();
      }}
      width={width}
    >
      <CrudDialogHeader title={title} subtitle={subtitle} />

      {bodyLayout === "two-tab" ? (
        // Two-tab shape — shadcn <Tabs>, `layout` omitted and composed
        // manually (Layer 6). Tab 1 owns mode state (the entity form); Tab 2
        // is read-only (other logged workouts of the same kind).
        <CrudDialogBody isLoading={isLoading}>
          <div className="mb-4">
            <Badge variant="outline" className="capitalize">{mode.mode}</Badge>
          </div>
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <Form {...form}>{fields}</Form>
            </TabsContent>
            <TabsContent value="history">
              {relatedHistory.length === 0 ? (
                <StateView
                  variant="empty"
                  icon={History}
                  title="No history yet."
                  description="Other workouts of this type will show up here."
                />
              ) : (
                <ul className="space-y-2">
                  {relatedHistory.map((w) => (
                    <li
                      key={w.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="font-mono tabular-nums text-foreground">{w.date}</span>
                      <span className="text-muted-foreground">{w.durationMinutes} min</span>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </CrudDialogBody>
      ) : (
        // Flat stack / two-column grid — the pure shapes, driven by the real
        // `layout` prop (Layer 6).
        <CrudDialogBody isLoading={isLoading} layout={bodyLayout}>
          {modeBadge}
          <Form {...form}>{fields}</Form>
        </CrudDialogBody>
      )}

      {/* Every footer prop except delete is derived by the controller. */}
      <CrudDialogFooter
        primaryLabel={controller.showPrimary ? controller.primaryLabel : undefined}
        onPrimary={controller.handlePrimary}
        secondaryLabel={controller.secondaryLabel}
        onSecondary={controller.handleSecondary}
        isSubmitting={controller.isSubmitting}
        submittingLabel={controller.submittingLabel}
        {...destructiveProps}
      />

      {/* Accessible delete confirmation — the <AlertDialog>-based flow
          CrudDialogFooter's contract says the consumer must own, replacing a
          blocking window.confirm. */}
      <ConfirmationDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete this workout?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
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
  const [width, setWidth] = React.useState<DialogWidth>("md");
  const [bodyLayout, setBodyLayout] = React.useState<DialogBodyLayout>("flat");

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
    <div className="space-y-5">
      <PageHeader
        title="Fitness Log"
        subtitle="J (crud-dialog) archetype demo — workout domain"
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          The dialog body's graded richness axis — <strong>Layout</strong>{" "}
          (flat stack / two-column grid / two-tab with a read-only History
          tab) — and the slide-in <strong>Width</strong>. Open a workout to
          see them applied.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Dialog body layout"
            value={bodyLayout}
            onValueChange={setBodyLayout}
            options={[
              { value: "flat", label: "Flat" },
              { value: "two-column", label: "Two-column" },
              { value: "two-tab", label: "Two-tab" },
            ]}
          />
          <SegmentedControl
            aria-label="Dialog width"
            value={width}
            onValueChange={setWidth}
            options={[
              { value: "sm", label: "Sm" },
              { value: "md", label: "Md" },
              { value: "lg", label: "Lg" },
            ]}
          />
        </div>
      </div>

      {lastAction && (
        <div className="rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          Last action:{" "}
          <span className="font-medium text-foreground">{lastAction}</span>
        </div>
      )}

      {/* Workout list */}
      <div className="rounded-lg border bg-card overflow-hidden">
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
                  <TableCell className="text-right font-mono tabular-nums">{w.durationMinutes} min</TableCell>
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
          <li>Click <strong>Save</strong> → simulates 0.6s save, then returns to VIEW mode showing the saved values (edit never closes the dialog).</li>
          <li>Click <strong>Log workout</strong> → dialog opens in CREATE mode (no fetch).</li>
          <li>Fill fields → click <strong>Create</strong> → new workout appears in list, dialog closes.</li>
          <li>Open a workout → click <strong>Delete</strong> → confirm → removed from list.</li>
          <li>
            Toggle <strong>Layout</strong> to two-tab, open a workout with a
            sibling of the same type in the list → its <strong>History</strong>{" "}
            tab lists it; otherwise it shows the empty state.
          </li>
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
        width={width}
        bodyLayout={bodyLayout}
      />
    </div>
  );
}
