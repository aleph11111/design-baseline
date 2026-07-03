import * as React from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Button } from "design-baseline";

// Tooltip requires a TooltipProvider ancestor or the Radix portal fails to
// mount. Shown open, anchored to an icon-only trigger button — the common
// "explain the icon" affordance.
export function Open() {
  return (
    <TooltipProvider>
      <div className="flex justify-center pt-16">
        <Tooltip open>
          <TooltipTrigger asChild>
            <Button variant="outline">Sync now</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last synced 4 minutes ago</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
