import * as React from "react";
import { SegmentedControl } from "design-baseline";

// A view-mode toggle sitting in a toolbar-like row, the way it appears above
// a list.
export function ViewMode() {
  const [value, setValue] = React.useState<"table" | "cards" | "list">("cards");
  return (
    <div className="flex w-full max-w-md items-center justify-between rounded-md border bg-card p-3">
      <span className="text-sm font-medium">Orders</span>
      <SegmentedControl
        aria-label="View mode"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "table", label: "Table" },
          { value: "cards", label: "Cards" },
          { value: "list", label: "List" },
        ]}
      />
    </div>
  );
}

// A time-range filter, a second real axis of use, with a non-first segment
// active.
export function TimeRange() {
  const [value, setValue] = React.useState<"day" | "week" | "month" | "year">("week");
  return (
    <div className="flex w-full max-w-md items-center justify-between rounded-md border bg-card p-3">
      <span className="text-sm font-medium">Revenue</span>
      <SegmentedControl
        aria-label="Time range"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
          { value: "year", label: "Year" },
        ]}
      />
    </div>
  );
}
