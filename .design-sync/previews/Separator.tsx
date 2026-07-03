import * as React from "react";
import { Separator } from "design-baseline";

// Horizontal — dividing a profile block's identity from its metadata, the
// way a settings page separates a heading from its body.
export function HorizontalInProfile() {
  return (
    <div className="max-w-sm rounded-md border bg-card p-4">
      <div>
        <h4 className="text-sm font-medium leading-none">Ada Reyes</h4>
        <p className="text-sm text-muted-foreground">Product design lead</p>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Joined</span>
        <span>March 2022</span>
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-muted-foreground">Team</span>
        <span>Growth pod</span>
      </div>
    </div>
  );
}

// Vertical — separating labeled stats in a compact toolbar strip.
export function VerticalInStats() {
  return (
    <div className="flex h-8 max-w-sm items-center gap-4 rounded-md border bg-card px-4 text-sm">
      <span>12 open</span>
      <Separator orientation="vertical" />
      <span>4 in review</span>
      <Separator orientation="vertical" />
      <span>27 closed</span>
    </div>
  );
}

// Both together — a card footer combining a vertical rule between two
// labels above a horizontal rule that closes the section off.
export function CombinedInCardFooter() {
  return (
    <div className="max-w-sm rounded-md border bg-card">
      <div className="p-4 text-sm">
        <p className="font-medium">Growth plan</p>
        <p className="text-muted-foreground">Billed monthly</p>
      </div>
      <Separator />
      <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
        <span>Next invoice: Nov 1</span>
        <Separator orientation="vertical" className="h-4" />
        <span>$49.00</span>
      </div>
    </div>
  );
}
