import * as React from "react";
import {
  CrudDialogSheet,
  CrudDialogHeader,
  CrudDialogBody,
  CrudDialogFooter,
  Button,
  Badge,
} from "design-baseline";
import { History } from "lucide-react";

// CrudDialogHeader is the sub-part sticky top band of a J (crud-dialog)
// sheet — composed here inside an open CrudDialogSheet so it renders in its
// real context (Radix SheetTitle/Description need the Sheet root). Workout-log
// domain, view mode: entity title + a subtitle date line.
export function WithSubtitle() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader title="Workout · Run" subtitle="2026-05-19" />
      <CrudDialogBody layout="flat">
        <Badge variant="outline" className="capitalize">view</Badge>
      </CrudDialogBody>
      <CrudDialogFooter primaryLabel="Edit" secondaryLabel="Close" onPrimary={() => {}} onSecondary={() => {}} />
    </CrudDialogSheet>
  );
}

// Create mode: title only, no subtitle line (a "New Workout" entity has no
// created date yet).
export function TitleOnly() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader title="New Workout" />
      <CrudDialogBody layout="flat">
        <Badge variant="outline" className="capitalize">create</Badge>
      </CrudDialogBody>
      <CrudDialogFooter primaryLabel="Create" secondaryLabel="Cancel" onPrimary={() => {}} onSecondary={() => {}} />
    </CrudDialogSheet>
  );
}

// Header actions slot in use — a secondary icon button (view history) beside
// the built-in close affordance, plus an explicit labeled close button.
export function WithActionsAndClose() {
  return (
    <CrudDialogSheet open onOpenChange={() => {}} width="md">
      <CrudDialogHeader
        title="Workout · Swim"
        subtitle="2026-05-24"
        actions={
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View history">
            <History className="h-4 w-4" />
          </Button>
        }
        onClose={() => {}}
      />
      <CrudDialogBody layout="flat">
        <Badge variant="outline" className="capitalize">view</Badge>
      </CrudDialogBody>
      <CrudDialogFooter primaryLabel="Edit" secondaryLabel="Close" onPrimary={() => {}} onSecondary={() => {}} />
    </CrudDialogSheet>
  );
}
