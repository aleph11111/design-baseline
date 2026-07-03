/**
 * form-page-demo.tsx
 *
 * Sandbox demo for the B (form-page) archetype.
 * Domain: recipe library — far from hk-crm nouns (no companies, contacts, opportunities).
 *
 * Exercises:
 *   - Mounting the form in CREATE mode (no `initial`, no Delete button).
 *   - Mounting the form in EDIT mode (existing recipe, Delete button visible).
 *   - Field validation via Zod (required title, positive serves, kebab-case tag).
 *   - Submit lifecycle (beginSubmit → simulated 800ms server call → endSubmit).
 *   - Dirty-guarded cancel via `useFormPageState.requestDiscard`.
 *   - Mode-aware footer (Create has no destructive button; Edit does).
 *
 * NOTE: This demo uses window.confirm for the discard-confirmation dialog.
 * Real consumers should use shadcn <AlertDialog> for an accessible UX. The
 * spec (Layer 13) requires <AlertDialog> in production.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { SectionCard } from "@/components/layout";
import {
  FormPageShell,
  FormPageHeader,
  FormPageActions,
  useFormPageState,
} from "@/components/archetypes/form-page";

type FormWidth = "sm" | "md" | "lg" | "xl";
type FormChrome = "board" | "classic";

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

const CUISINES = ["italian", "japanese", "mexican", "thai", "french"] as const;
type Cuisine = (typeof CUISINES)[number];

const CUISINE_LABELS: Record<Cuisine, string> = {
  italian: "Italian",
  japanese: "Japanese",
  mexican: "Mexican",
  thai: "Thai",
  french: "French",
};

const DIFFICULTIES = ["easy", "medium", "hard"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const VISIBILITIES = ["private", "unlisted", "public"] as const;
type Visibility = (typeof VISIBILITIES)[number];
const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: "Private",
  unlisted: "Unlisted",
  public: "Public",
};

type Recipe = {
  id: string;
  title: string;
  cuisine: Cuisine;
  serves: number;
  difficulty: Difficulty;
  prepMinutes: number;
  cookMinutes: number;
  ingredients: string;
  tag: string;
  visibility: Visibility;
  notes: string;
};

const SEED_RECIPE: Recipe = {
  id: "r1",
  title: "Sunday Carbonara",
  cuisine: "italian",
  serves: 4,
  difficulty: "medium",
  prepMinutes: 15,
  cookMinutes: 20,
  ingredients: "Guanciale, eggs, pecorino romano, spaghetti, black pepper.",
  tag: "weeknight-classic",
  visibility: "unlisted",
  notes:
    "Render the guanciale slowly. Temper the eggs off-heat. Black pepper, not red.",
};

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

// Numbers are strings at the UI boundary; transformed in buildPayload.
const posInt = (msg: string) =>
  z
    .string()
    .min(1, "Required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, msg);

const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  cuisine: z.enum(CUISINES),
  serves: posInt("Must be a positive integer"),
  difficulty: z.enum(DIFFICULTIES),
  prepMinutes: posInt("Must be a positive integer"),
  cookMinutes: posInt("Must be a positive integer"),
  ingredients: z.string().trim().min(1, "List at least one ingredient"),
  tag: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers, and dashes only"),
  visibility: z.enum(VISIBILITIES),
  notes: z.string(),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(recipe: Recipe): FormValues {
  return {
    title: recipe.title,
    cuisine: recipe.cuisine,
    serves: String(recipe.serves),
    difficulty: recipe.difficulty,
    prepMinutes: String(recipe.prepMinutes),
    cookMinutes: String(recipe.cookMinutes),
    ingredients: recipe.ingredients,
    tag: recipe.tag,
    visibility: recipe.visibility,
    notes: recipe.notes,
  };
}

function buildPayload(values: FormValues) {
  return {
    title: values.title,
    cuisine: values.cuisine,
    serves: Number(values.serves),
    difficulty: values.difficulty,
    prepMinutes: Number(values.prepMinutes),
    cookMinutes: Number(values.cookMinutes),
    ingredients: values.ingredients,
    tag: values.tag,
    visibility: values.visibility,
    notes: values.notes,
  };
}

// ---------------------------------------------------------------------------
// Recipe form (consumes the form-page archetype)
// ---------------------------------------------------------------------------

type RecipeFormCommonProps = {
  /** Drives `<FormPageShell width>` — the demo's Width toggle. */
  width: FormWidth;
  /**
   * "board" = the on-surface header (title on FormPageShell, current default).
   * "classic" = the classic floating `<FormPageHeader>` + the documented
   * "Card chrome wrapper around the form body" allowed variation
   * (docs/archetypes/form-page.md Layer 2).
   */
  chrome: FormChrome;
  /** When true, onSubmit throws so the root-level error Alert is reachable. */
  simulateError: boolean;
};

type RecipeFormProps = RecipeFormCommonProps &
  (
    | {
        mode: "create";
        onSubmitSuccess: (recipe: Recipe) => void;
        onCancel: () => void;
      }
    | {
        mode: "edit";
        id: string;
        initial: Recipe;
        onSubmitSuccess: (recipe: Recipe) => void;
        onDelete: (id: string) => void;
        onCancel: () => void;
      }
  );

function RecipeForm(props: RecipeFormProps): React.ReactElement {
  const { mode, width, chrome, simulateError } = props;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit"
        ? toFormValues(props.initial)
        : {
            title: "",
            cuisine: "italian",
            serves: "2",
            difficulty: "easy",
            prepMinutes: "10",
            cookMinutes: "20",
            ingredients: "",
            tag: "",
            visibility: "private",
            notes: "",
          },
  });

  const page = useFormPageState({
    mode,
    isDirty: form.formState.isDirty,
    onConfirmDiscard: async () =>
      window.confirm("Discard your unsaved changes?"),
  });

  const [isDeleting, setIsDeleting] = React.useState(false);

  async function onSubmit(values: FormValues) {
    page.beginSubmit();
    try {
      // Simulate server call.
      await new Promise((r) => setTimeout(r, 800));
      if (simulateError) {
        throw new Error(
          "The server rejected the request (simulated — toggle off to save).",
        );
      }
      const payload = buildPayload(values);
      const saved: Recipe =
        mode === "edit"
          ? { id: props.id, ...payload }
          : { id: `r${Date.now()}`, ...payload };
      props.onSubmitSuccess(saved);
    } catch (err) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      page.endSubmit();
    }
  }

  async function handleCancel() {
    const ok = await page.requestDiscard();
    if (!ok) return;
    props.onCancel();
  }

  async function handleDelete() {
    if (mode !== "edit") return;
    const ok = window.confirm(
      "Delete this recipe? This action cannot be undone.",
    );
    if (!ok) return;
    setIsDeleting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      props.onDelete(props.id);
    } finally {
      setIsDeleting(false);
    }
  }

  const title =
    mode === "edit" ? `Edit Recipe — ${props.initial.title}` : "New Recipe";

  const formBody = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* 3+ logical groups → each wrapped in a SectionCard (form-page spec
              Layer 5). The field weight is what makes this a page, not a dialog. */}
          <SectionCard title="Basics">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Sunday Carbonara" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUISINES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {CUISINE_LABELS[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serves"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serves</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIFFICULTIES.map((d) => (
                            <SelectItem key={d} value={d}>
                              {DIFFICULTY_LABELS[d]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="prepMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep (min)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cookMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cook (min)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="One per line…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard title="Publishing">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag</FormLabel>
                      <FormControl>
                        <Input placeholder="weeknight-classic" {...field} />
                      </FormControl>
                      <FormDescription>
                        A single kebab-case label. Optional.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VISIBILITIES.map((v) => (
                            <SelectItem key={v} value={v}>
                              {VISIBILITY_LABELS[v]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>

          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          )}

          <FormPageActions
            mode={page.mode}
            primaryLabel={page.isEdit ? "Save" : "Create"}
            isSubmitting={page.isSubmitting}
            secondaryLabel="Cancel"
            onSecondary={handleCancel}
            destructiveLabel={page.isEdit ? "Delete" : undefined}
            onDestructive={page.isEdit ? handleDelete : undefined}
            isDeleting={isDeleting}
            canDelete
          />
        </form>
      </Form>
  );

  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      {chrome === "board" ? (
        <FormPageShell width={width} kicker="Recipes" title={title}>
          {formBody}
        </FormPageShell>
      ) : (
        <FormPageShell width={width}>
          <FormPageHeader title={title} />
          {/* Allowed variation (form-page.md Layer 2): a Card chrome wrapper
              around the form body for extra visual emphasis, on top of the
              classic floating header. */}
          <Card>
            <CardContent className="p-5">{formBody}</CardContent>
          </Card>
        </FormPageShell>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo orchestration
// ---------------------------------------------------------------------------

type DemoMode =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; id: string };

export function FormPageDemo(): React.ReactElement {
  const [recipes, setRecipes] = React.useState<Recipe[]>([SEED_RECIPE]);
  // Default to the create form so the gallery shows the archetype (the
  // multi-section form) rather than the list scaffold used to reach it.
  const [mode, setMode] = React.useState<DemoMode>({ kind: "create" });
  const [lastAction, setLastAction] = React.useState<string | null>(null);
  const [width, setWidth] = React.useState<FormWidth>("md");
  const [chrome, setChrome] = React.useState<FormChrome>("board");
  const [simulateError, setSimulateError] = React.useState(false);

  function handleCreated(recipe: Recipe) {
    setRecipes((prev) => [...prev, recipe]);
    setLastAction(`Created recipe: ${recipe.title}`);
    setMode({ kind: "list" });
  }

  function handleSaved(recipe: Recipe) {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipe.id ? recipe : r)),
    );
    setLastAction(`Saved recipe: ${recipe.title}`);
    setMode({ kind: "list" });
  }

  function handleDeleted(id: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setLastAction(`Deleted recipe: ${id}`);
    setMode({ kind: "list" });
  }

  // Toggle row shared by the create/edit form views — drives FormPageShell's
  // width, board-vs-classic chrome, and a deterministic root-error trigger.
  const controls = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="max-w-prose text-sm text-muted-foreground">
        Toggle <strong>Width</strong>, <strong>Chrome</strong> (on-surface
        board header vs. the classic floating header + Card wrapper), and{" "}
        <strong>Simulate server error</strong> to surface the root-level
        error banner on submit.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          aria-label="Form width"
          value={width}
          onValueChange={setWidth}
          options={[
            { value: "sm", label: "Sm" },
            { value: "md", label: "Md" },
            { value: "lg", label: "Lg" },
            { value: "xl", label: "Xl" },
          ]}
        />
        <SegmentedControl
          aria-label="Form chrome"
          value={chrome}
          onValueChange={setChrome}
          options={[
            { value: "board", label: "Board" },
            { value: "classic", label: "Classic + Card" },
          ]}
        />
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Switch checked={simulateError} onCheckedChange={setSimulateError} />
          Simulate server error
        </label>
      </div>
    </div>
  );

  if (mode.kind === "create") {
    return (
      <div className="space-y-5">
        {controls}
        <RecipeForm
          mode="create"
          width={width}
          chrome={chrome}
          simulateError={simulateError}
          onSubmitSuccess={handleCreated}
          onCancel={() => setMode({ kind: "list" })}
        />
      </div>
    );
  }

  if (mode.kind === "edit") {
    const recipe = recipes.find((r) => r.id === mode.id);
    if (!recipe) {
      // In a real app, the server component surfaces notFound() before
      // mounting the form. The demo simulates a missed lookup by falling
      // back to the list view.
      setMode({ kind: "list" });
      return <div />;
    }
    return (
      <div className="space-y-5">
        {controls}
        <RecipeForm
          mode="edit"
          id={recipe.id}
          initial={recipe}
          width={width}
          chrome={chrome}
          simulateError={simulateError}
          onSubmitSuccess={handleSaved}
          onDelete={handleDeleted}
          onCancel={() => setMode({ kind: "list" })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {lastAction && (
        <div className="rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          Last action:{" "}
          <span className="font-medium text-foreground">{lastAction}</span>
        </div>
      )}

      <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
          </span>
          <Button size="sm" onClick={() => setMode({ kind: "create" })}>
            New recipe
          </Button>
        </div>

        {recipes.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No recipes yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead className="text-right">Serves</TableHead>
                <TableHead>Tag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((r) => (
                <TableRow key={r.id}>
                  <TableCell
                    className="font-medium text-primary hover:underline cursor-pointer"
                    onClick={() => setMode({ kind: "edit", id: r.id })}
                  >
                    {r.title}
                  </TableCell>
                  <TableCell>{CUISINE_LABELS[r.cuisine]}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{r.serves}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.tag || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      </div>

      <div className="rounded-md border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">
          Demo flows to exercise:
        </p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>
            Click <strong>New recipe</strong> → form mounts in CREATE mode.
            Footer shows Cancel + Create. No Delete button.
          </li>
          <li>
            Enter a tag with spaces or uppercase → Zod validation surfaces
            under the field.
          </li>
          <li>
            Edit a field, then click <strong>Cancel</strong> → confirm-discard
            prompt (window.confirm; real consumers use AlertDialog).
          </li>
          <li>
            Click a recipe title → form mounts in EDIT mode. Footer shows
            Delete (left) + Cancel + Save (right).
          </li>
          <li>
            Click <strong>Delete</strong> → confirm → simulated 600ms delete,
            recipe removed.
          </li>
          <li>
            Submit a valid form → 800ms simulated server call (spinner on
            primary button), then return to list.
          </li>
          <li>
            Open <strong>New recipe</strong> or edit a recipe, flip{" "}
            <strong>Simulate server error</strong>, then submit → the
            root-level error Alert renders above the footer.
          </li>
        </ol>
      </div>
    </div>
  );
}
