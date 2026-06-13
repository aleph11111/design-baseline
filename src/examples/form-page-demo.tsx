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
import { ChefHat } from "lucide-react";
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
import {
  FormPageShell,
  FormPageHeader,
  FormPageActions,
  useFormPageState,
} from "@/components/archetypes/form-page";

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

type Recipe = {
  id: string;
  title: string;
  cuisine: Cuisine;
  serves: number;
  tag: string;
  notes: string;
};

const SEED_RECIPE: Recipe = {
  id: "r1",
  title: "Sunday Carbonara",
  cuisine: "italian",
  serves: 4,
  tag: "weeknight-classic",
  notes:
    "Render the guanciale slowly. Temper the eggs off-heat. Black pepper, not red.",
};

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  cuisine: z.enum(CUISINES),
  // Stored as string at the UI boundary; transform handled in buildPayload.
  serves: z
    .string()
    .min(1, "Required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, "Must be a positive integer"),
  tag: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers, and dashes only"),
  notes: z.string(),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(recipe: Recipe): FormValues {
  return {
    title: recipe.title,
    cuisine: recipe.cuisine,
    serves: String(recipe.serves),
    tag: recipe.tag,
    notes: recipe.notes,
  };
}

function buildPayload(values: FormValues) {
  return {
    title: values.title,
    cuisine: values.cuisine,
    serves: Number(values.serves),
    tag: values.tag,
    notes: values.notes,
  };
}

// ---------------------------------------------------------------------------
// Recipe form (consumes the form-page archetype)
// ---------------------------------------------------------------------------

type RecipeFormProps =
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
    };

function RecipeForm(props: RecipeFormProps): React.ReactElement {
  const { mode } = props;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit"
        ? toFormValues(props.initial)
        : {
            title: "",
            cuisine: "italian",
            serves: "2",
            tag: "",
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
  const subtitle =
    mode === "edit"
      ? "Update the fields and save to keep the recipe."
      : "Capture a new recipe for the library.";

  return (
    <FormPageShell width="md">
      <FormPageHeader title={title} subtitle={subtitle} icon={ChefHat} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>

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
                  A single kebab-case label for filtering. Optional.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
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
    </FormPageShell>
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
  const [mode, setMode] = React.useState<DemoMode>({ kind: "list" });
  const [lastAction, setLastAction] = React.useState<string | null>(null);

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

  if (mode.kind === "create") {
    return (
      <RecipeForm
        mode="create"
        onSubmitSuccess={handleCreated}
        onCancel={() => setMode({ kind: "list" })}
      />
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
      <RecipeForm
        mode="edit"
        id={recipe.id}
        initial={recipe}
        onSubmitSuccess={handleSaved}
        onDelete={handleDeleted}
        onCancel={() => setMode({ kind: "list" })}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Recipe Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          B (form-page) archetype demo — recipe domain
        </p>
      </div>

      {lastAction && (
        <div className="rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          Last action:{" "}
          <span className="font-medium text-foreground">{lastAction}</span>
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                  Cuisine
                </th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                  Serves
                </th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                  Tag
                </th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr
                  key={r.id}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td
                    className="px-4 py-3 font-medium text-primary hover:underline cursor-pointer"
                    onClick={() => setMode({ kind: "edit", id: r.id })}
                  >
                    {r.title}
                  </td>
                  <td className="px-4 py-3">{CUISINE_LABELS[r.cuisine]}</td>
                  <td className="px-4 py-3 text-right">{r.serves}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.tag || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
        </ol>
      </div>
    </div>
  );
}
