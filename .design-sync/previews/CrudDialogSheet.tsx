import * as React from "react";
import {
  CrudDialogSheet,
  CrudDialogHeader,
  CrudDialogBody,
  CrudDialogFooter,
  Badge,
  Label,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "design-baseline";

// CrudDialogSheet is the outermost overlay shell for J (crud-dialog) — a
// right-side slide-in sheet. Shown OPEN with Header/Body/Footer composed
// inside, workout-log domain (ported from crud-dialog-demo.tsx). Layout axis
// ("flat" stack) here; CrudDialogBody.tsx covers the two-column/loading axis.
export function ViewMode() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader title="Workout · Bike" subtitle="2026-05-21" />
      <CrudDialogBody layout="flat">
        <div className="sm:col-span-2">
          <Badge variant="outline" className="capitalize">view</Badge>
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <p className="text-sm font-mono tabular-nums text-foreground">2026-05-21</p>
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <p className="text-sm text-foreground">Bike</p>
        </div>
        <div className="space-y-1.5">
          <Label>Duration (min)</Label>
          <p className="text-sm font-mono tabular-nums text-foreground">70</p>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Notes</Label>
          <p className="text-sm text-foreground whitespace-pre-line">
            Hill repeats on riverside trail.
          </p>
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

// Edit mode: fields become inputs, destructive is enabled, footer swaps to
// Cancel/Save.
export function EditMode() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader title="Workout · Lift" subtitle="2026-05-20" />
      <CrudDialogBody layout="flat">
        <div className="sm:col-span-2">
          <Badge variant="outline" className="capitalize">edit</Badge>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cds-edit-date">Date</Label>
          <Input id="cds-edit-date" type="date" defaultValue="2026-05-20" />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select defaultValue="lift">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="run">Run</SelectItem>
              <SelectItem value="lift">Lift</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
              <SelectItem value="swim">Swim</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cds-edit-duration">Duration (min)</Label>
          <Input id="cds-edit-duration" type="number" defaultValue={55} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cds-edit-notes">Notes</Label>
          <Textarea id="cds-edit-notes" rows={4} defaultValue="Upper body day." />
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

// Create mode: no destructive action, empty defaults, narrower "sm" width.
export function CreateMode() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="sm">
      <CrudDialogHeader title="New Workout" />
      <CrudDialogBody layout="flat">
        <div className="sm:col-span-2">
          <Badge variant="outline" className="capitalize">create</Badge>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cds-new-date">Date</Label>
          <Input id="cds-new-date" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select defaultValue="run">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="run">Run</SelectItem>
              <SelectItem value="lift">Lift</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
              <SelectItem value="swim">Swim</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cds-new-duration">Duration (min)</Label>
          <Input id="cds-new-duration" type="number" defaultValue={30} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cds-new-notes">Notes</Label>
          <Textarea id="cds-new-notes" rows={4} placeholder="How did it go?" />
        </div>
      </CrudDialogBody>
      <CrudDialogFooter
        primaryLabel="Create"
        secondaryLabel="Cancel"
        onPrimary={() => {}}
        onSecondary={() => {}}
      />
    </CrudDialogSheet>
  );
}
