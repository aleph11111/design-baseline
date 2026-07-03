import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  FormPageShell,
  FormPageActions,
  Label,
  Input,
  Alert,
  AlertTitle,
  AlertDescription,
} from "design-baseline";

// FormPageActions only renders meaningfully as a form's footer — every cell
// mounts it inside a <FormPageShell> board form, below a couple of fields.

// Create mode, submitting — spinner + "Creating…" on the primary button, no
// destructive button (create mode never shows Delete).
export function CreateSubmitting() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell kicker="Recipes" title="New Recipe" width="sm">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fpa-title">Title</Label>
            <Input id="fpa-title" placeholder="Sunday Carbonara" />
          </div>
          <FormPageActions
            mode="create"
            primaryLabel="Create"
            secondaryLabel="Cancel"
            isSubmitting
          />
        </div>
      </FormPageShell>
    </div>
  );
}

// Edit mode — Delete on the leading edge, Cancel + Save trailing.
export function EditWithDelete() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell
        kicker="Recipes"
        title={
          <>
            Edit Recipe — <span className="font-mono">Sunday Carbonara</span>
          </>
        }
        width="sm"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fpa-title-edit">Title</Label>
            <Input id="fpa-title-edit" defaultValue="Sunday Carbonara" />
          </div>
          <FormPageActions
            mode="edit"
            primaryLabel="Save"
            secondaryLabel="Cancel"
            destructiveLabel="Delete"
            onDestructive={() => {}}
            canDelete
          />
        </div>
      </FormPageShell>
    </div>
  );
}

// Root-level submit error — the archetype's Alert-above-the-footer pattern,
// with the destructive button mid-delete (spinner + disabled primary/secondary).
export function DeletingWithError() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell
        kicker="Recipes"
        title={
          <>
            Edit Recipe — <span className="font-mono">Mole Negro</span>
          </>
        }
        width="sm"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fpa-title-error">Title</Label>
            <Input id="fpa-title-error" defaultValue="Mole Negro" />
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              The server rejected the request. Try saving again.
            </AlertDescription>
          </Alert>
          <FormPageActions
            mode="edit"
            primaryLabel="Save"
            secondaryLabel="Cancel"
            destructiveLabel="Delete"
            onDestructive={() => {}}
            canDelete
            isDeleting
          />
        </div>
      </FormPageShell>
    </div>
  );
}
