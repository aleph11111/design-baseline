import * as React from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useConfirm, usePrompt } from "@/components/archetypes/native-browser-dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

/**
 * native-browser-dialog demo — a recipe box (domain deliberately far from any
 * source project). Each action stands in for the native call it replaces:
 *   - Add / Rename  → usePrompt   (was window.prompt)
 *   - Delete        → useConfirm  (was window.confirm) — destructive tone
 *   - Publish       → useConfirm  with `destructive: false` — default tone
 *   - Share         → toast       (was window.alert)
 */

interface Recipe {
  id: number;
  name: string;
}

const SEED: Recipe[] = [
  { id: 1, name: "Saffron risotto" },
  { id: 2, name: "Charred leek tart" },
  { id: 3, name: "Brown-butter financiers" },
];

export function NativeBrowserDialogDemo(): React.ReactElement {
  const [recipes, setRecipes] = React.useState(SEED);
  const { askConfirm, dialog: confirmDialog } = useConfirm();
  const { askPrompt, dialog: promptDialog } = usePrompt();

  async function add() {
    const name = await askPrompt({ title: "New recipe", label: "Name", placeholder: "e.g. Miso soup", confirmText: "Add" });
    if (name) setRecipes((rs) => [...rs, { id: Date.now(), name }]);
  }

  async function rename(r: Recipe) {
    const name = await askPrompt({ title: "Rename recipe", defaultValue: r.name });
    if (name) setRecipes((rs) => rs.map((x) => (x.id === r.id ? { ...x, name } : x)));
  }

  async function remove(r: Recipe) {
    const ok = await askConfirm({
      title: `Delete "${r.name}"?`,
      description: "The recipe and its notes are removed from the box. This cannot be undone.",
      confirmText: "Delete",
    });
    if (ok) setRecipes((rs) => rs.filter((x) => x.id !== r.id));
  }

  async function publish() {
    const ok = await askConfirm({
      title: "Publish the recipe box?",
      description: "Anyone with the link can read your recipes. You can unpublish at any time.",
      confirmText: "Publish",
      destructive: false,
    });
    if (ok) toast.success("Recipe box published");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recipe box</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={publish}>
            Publish
          </Button>
          <Button size="sm" onClick={add}>
            <Plus /> Add recipe
          </Button>
        </div>
      </div>
      <ul className="divide-y rounded-lg border bg-card">
        {recipes.map((r) => (
          <li key={r.id} className="flex items-center gap-2 px-4 py-2">
            <span className="flex-1 text-sm text-foreground">{r.name}</span>
            <Button size="sm" variant="ghost" onClick={() => toast.success(`Link to "${r.name}" copied`)}>
              Share
            </Button>
            <Button size="icon" variant="ghost" aria-label={`Rename ${r.name}`} onClick={() => rename(r)}>
              <Pencil />
            </Button>
            <Button size="icon" variant="ghost" aria-label={`Delete ${r.name}`} onClick={() => remove(r)}>
              <Trash2 />
            </Button>
          </li>
        ))}
        {recipes.length === 0 ? <li className="px-4 py-6 text-center text-sm text-muted-foreground">No recipes yet.</li> : null}
      </ul>
      {confirmDialog}
      {promptDialog}
      <Toaster />
    </div>
  );
}
