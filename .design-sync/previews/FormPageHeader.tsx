import * as React from "react";
import { ChefHat } from "lucide-react";
import {
  FormPageShell,
  FormPageHeader,
  FormPageActions,
  Label,
  Input,
} from "design-baseline";

// FormPageHeader only renders meaningfully as the first child of a classic
// (title-less) <FormPageShell> — the on-surface board form uses
// <SurfaceHeader> instead. Every cell below wraps it that way.

// Subtitle + back link — the classic header's full slot set.
export function WithSubtitleAndBackLink() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell width="sm">
        <FormPageHeader
          title="Edit Recipe — Sunday Carbonara"
          subtitle="Last saved 3 days ago"
          backHref="#"
          backLabel="Back to recipes"
        />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fph-title">Title</Label>
            <Input id="fph-title" defaultValue="Sunday Carbonara" />
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

// Decorative icon, no subtitle — a plain create-mode header.
export function WithIcon() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell width="sm">
        <FormPageHeader title="New Recipe" icon={ChefHat} />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fph-title-icon">Title</Label>
            <Input id="fph-title-icon" placeholder="Weeknight Mujadara" />
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

// Title only — the minimal classic header, no subtitle/icon/back link.
export function TitleOnly() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FormPageShell width="sm">
        <FormPageHeader title="New Recipe" />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fph-title-only">Title</Label>
            <Input id="fph-title-only" placeholder="Mole Negro" />
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
