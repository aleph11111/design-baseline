import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Button,
  Label,
  Input,
  Textarea,
} from "design-baseline";

// Sheet is the raw right-side slide-in primitive (CrudDialogSheet builds on
// top of it) — shown open with a compact form composed inside, so the card
// presents the real slide-in panel rather than the shell alone.
export function Open() {
  return (
    <Sheet open>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit workout</SheetTitle>
          <SheetDescription>Update the details for this training session.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="sheet-date">Date</Label>
            <Input id="sheet-date" type="date" defaultValue="2026-05-21" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sheet-notes">Notes</Label>
            <Textarea id="sheet-notes" rows={4} defaultValue="Hill repeats on riverside trail." />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
