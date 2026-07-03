import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from "design-baseline";

// Overlay component — shown open (real DialogContent, centered over its overlay)
// so the card presents the actual composition. cfg.overrides.Dialog pins
// cardMode:single + a viewport so the open state renders inside the card.
export function Open() {
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>
            Give this project a clear, human-readable name. It is visible to everyone on the team.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="project-name">Project name</Label>
          <Input id="project-name" defaultValue="Q3 Revenue Analytics" />
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
