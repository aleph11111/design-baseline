import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent, Button, Label, Input } from "design-baseline";

// Popover shown open with a small filter form composed inside — the common
// "filter/tune" affordance anchored off a trigger button.
export function Open() {
  return (
    <div className="flex justify-center pt-16">
      <Popover open>
        <PopoverTrigger asChild>
          <Button variant="outline">Filter</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-3">
            <div className="space-y-1">
              <h4 className="font-medium leading-none">Filter workouts</h4>
              <p className="text-sm text-muted-foreground">Narrow the list by date range.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="pop-from">From</Label>
                <Input id="pop-from" type="date" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="pop-to">To</Label>
                <Input id="pop-to" type="date" className="col-span-2 h-8" />
              </div>
            </div>
            <Button size="sm">Apply</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
