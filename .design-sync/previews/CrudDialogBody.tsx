import * as React from "react";
import {
  CrudDialogSheet,
  CrudDialogHeader,
  CrudDialogBody,
  CrudDialogFooter,
  Label,
  Input,
  Textarea,
  Badge,
} from "design-baseline";

// CrudDialogBody is the scrollable content region — the dialog's "richness"
// axis (flat stack / two-column grid / loading skeleton). Composed inside an
// open CrudDialogSheet with header+footer for real context. Workout-log
// domain (ported from crud-dialog-demo.tsx).
export function FlatLayout() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader title="Workout · Run" subtitle="2026-05-19" />
      <CrudDialogBody layout="flat">
        <Badge variant="outline" className="capitalize">view</Badge>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <p className="text-sm font-mono tabular-nums text-foreground">2026-05-19</p>
        </div>
        <div className="space-y-1.5">
          <Label>Duration (min)</Label>
          <p className="text-sm font-mono tabular-nums text-foreground">35</p>
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <p className="text-sm text-foreground whitespace-pre-line">Easy 5k in the park.</p>
        </div>
      </CrudDialogBody>
      <CrudDialogFooter primaryLabel="Edit" secondaryLabel="Close" onPrimary={() => {}} onSecondary={() => {}} />
    </CrudDialogSheet>
  );
}

// Two-column grid: paired fields side by side, collapsing to one column on
// mobile.
export function TwoColumnLayout() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="lg">
      <CrudDialogHeader title="Workout · Lift" subtitle="2026-05-20" />
      <CrudDialogBody layout="two-column">
        <div className="sm:col-span-2">
          <Badge variant="outline" className="capitalize">edit</Badge>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cdb-2col-date">Date</Label>
          <Input id="cdb-2col-date" type="date" defaultValue="2026-05-20" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cdb-2col-duration">Duration (min)</Label>
          <Input id="cdb-2col-duration" type="number" defaultValue={55} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cdb-2col-notes">Notes</Label>
          <Textarea id="cdb-2col-notes" rows={3} defaultValue="Upper body day." />
        </div>
      </CrudDialogBody>
      <CrudDialogFooter primaryLabel="Save" secondaryLabel="Cancel" onPrimary={() => {}} onSecondary={() => {}} />
    </CrudDialogSheet>
  );
}

// Loading skeleton — rendered while the entity fetch is in-flight, replacing
// the field body entirely.
export function Loading() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader title="Workout · Bike" subtitle="2026-05-21" />
      <CrudDialogBody isLoading>
        <div />
      </CrudDialogBody>
      <CrudDialogFooter primaryLabel="Edit" secondaryLabel="Close" onPrimary={() => {}} onSecondary={() => {}} />
    </CrudDialogSheet>
  );
}
