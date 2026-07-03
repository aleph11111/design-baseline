import * as React from "react";
import {
  CrudDialogSheet,
  CrudDialogHeader,
  CrudDialogBody,
  CrudDialogFooter,
  Label,
  Badge,
} from "design-baseline";

// CrudDialogFooter is the mode-aware action bar — composed inside an open
// CrudDialogSheet for real context. Covers the three CRUD modes plus the
// isSubmitting state, workout-log domain.
export function ViewMode() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader title="Workout · Run" subtitle="2026-05-19" />
      <CrudDialogBody layout="flat">
        <Badge variant="outline" className="capitalize">view</Badge>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <p className="text-sm text-foreground">Easy 5k in the park.</p>
        </div>
      </CrudDialogBody>
      <CrudDialogFooter
        primaryLabel="Edit"
        secondaryLabel="Close"
        destructiveLabel="Delete"
        onPrimary={() => {}}
        onSecondary={() => {}}
        onDestructive={() => {}}
      />
    </CrudDialogSheet>
  );
}

export function EditMode() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader title="Workout · Lift" subtitle="2026-05-20" />
      <CrudDialogBody layout="flat">
        <Badge variant="outline" className="capitalize">edit</Badge>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <p className="text-sm text-foreground">Upper body day.</p>
        </div>
      </CrudDialogBody>
      <CrudDialogFooter
        primaryLabel="Save"
        secondaryLabel="Cancel"
        destructiveLabel="Delete"
        onPrimary={() => {}}
        onSecondary={() => {}}
        onDestructive={() => {}}
      />
    </CrudDialogSheet>
  );
}

// Create mode: no destructive slot; submitting state on the primary action
// (spinner + "Creating…", derived from primaryLabel).
export function CreateModeSubmitting() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="sm">
      <CrudDialogHeader title="New Workout" />
      <CrudDialogBody layout="flat">
        <Badge variant="outline" className="capitalize">create</Badge>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <p className="text-sm text-muted-foreground">Hill repeats on riverside trail.</p>
        </div>
      </CrudDialogBody>
      <CrudDialogFooter
        primaryLabel="Create"
        secondaryLabel="Cancel"
        isSubmitting
        onPrimary={() => {}}
        onSecondary={() => {}}
      />
    </CrudDialogSheet>
  );
}
