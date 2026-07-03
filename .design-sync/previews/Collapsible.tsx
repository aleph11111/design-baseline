import { ChevronsUpDown } from "lucide-react";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "design-baseline";

// Open panel — a "show more" disclosure with the trigger and its revealed
// content both visible, the common case for this primitive.
export function Open() {
  return (
    <Collapsible defaultOpen className="w-full max-w-md space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">3 starred repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 text-sm font-mono">
        design-baseline
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 text-sm font-mono">
          plex-ledger
        </div>
        <div className="rounded-md border px-4 py-2 text-sm font-mono">
          gallery-storybook
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Collapsed panel — same composition, closed by default, so the two cells
// together show the toggle's before/after.
export function Collapsed() {
  return (
    <Collapsible className="w-full max-w-md space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Advanced filters</h4>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            <ChevronsUpDown className="mr-2 h-4 w-4" />
            Show
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 text-sm">
          Date range: last 30 days
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
