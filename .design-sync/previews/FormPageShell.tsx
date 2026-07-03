import * as React from "react";
import {
  FormPageShell,
  FormPageHeader,
  FormPageActions,
  Label,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SectionCard,
} from "design-baseline";

// Board form (Plex Ledger): kicker + title sit ON the bounded surface via
// <SurfaceHeader>; SectionCards group fields inside the same card; the
// primary Create/Save actions stay in <FormPageActions> at the footer.

// CREATE mode — no Delete button, footer reads Cancel / Create.
export function CreateRecipe() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell kicker="Recipes" title="New Recipe" width="md">
        <div className="space-y-5">
          <SectionCard title="Basics">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fp-title">Title</Label>
                <Input id="fp-title" placeholder="Sunday Carbonara" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Cuisine</Label>
                  <Select defaultValue="italian">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fp-serves">Serves</Label>
                  <Input id="fp-serves" type="number" min={1} defaultValue={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Difficulty</Label>
                  <Select defaultValue="easy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Details">
            <div className="space-y-1.5">
              <Label htmlFor="fp-ingredients">Ingredients</Label>
              <Textarea id="fp-ingredients" rows={3} placeholder="One per line…" />
            </div>
          </SectionCard>
          <FormPageActions
            mode="create"
            primaryLabel="Create"
            secondaryLabel="Cancel"
          />
        </div>
      </FormPageShell>
    </div>
  );
}

// EDIT mode — pre-filled values, Delete button on the leading edge.
export function EditRecipe() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell
        kicker="Recipes"
        title={
          <>
            Edit Recipe — <span className="font-mono">Sunday Carbonara</span>
          </>
        }
        width="md"
      >
        <div className="space-y-5">
          <SectionCard title="Basics">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fp-title-edit">Title</Label>
                <Input id="fp-title-edit" defaultValue="Sunday Carbonara" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Cuisine</Label>
                  <Select defaultValue="italian">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fp-serves-edit">Serves</Label>
                  <Input id="fp-serves-edit" type="number" min={1} defaultValue={4} />
                </div>
                <div className="space-y-1.5">
                  <Label>Difficulty</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Details">
            <div className="space-y-1.5">
              <Label htmlFor="fp-ingredients-edit">Ingredients</Label>
              <Textarea
                id="fp-ingredients-edit"
                rows={3}
                defaultValue="Guanciale, eggs, pecorino romano, spaghetti, black pepper."
              />
            </div>
          </SectionCard>
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

// Allowed variation (form-page.md Layer 2): the classic floating
// <FormPageHeader> (with a subtitle + back link) plus a Card chrome wrapper
// around the form body, on a narrow "sm" width.
export function ClassicWithCard() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell width="sm">
        <FormPageHeader
          title="New Recipe"
          subtitle="Draft — not yet published"
          backHref="#"
          backLabel="Back to recipes"
        />
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fp-title-classic">Title</Label>
            <Input id="fp-title-classic" placeholder="Weeknight Mujadara" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fp-tag-classic">Tag</Label>
            <Input id="fp-tag-classic" placeholder="weeknight-classic" />
          </div>
          <FormPageActions
            mode="create"
            primaryLabel="Create"
            secondaryLabel="Cancel"
          />
        </div>
      </FormPageShell>
    </div>
  );
}
