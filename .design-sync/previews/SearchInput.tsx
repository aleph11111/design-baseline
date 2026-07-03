import * as React from "react";
import { SearchInput } from "design-baseline";

// The default toolbar search box, in its toolbar context (not floating bare).
export function Default() {
  return (
    <div className="flex w-full max-w-md items-center rounded-md border bg-card p-2">
      <SearchInput placeholder="Search projects…" />
    </div>
  );
}

// sm / default / lg density, stacked so the geometry axis is comparable.
export function Sizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-md border bg-card p-3">
      <SearchInput inputSize="sm" placeholder="Search (sm)…" />
      <SearchInput inputSize="default" placeholder="Search (default)…" />
      <SearchInput inputSize="lg" placeholder="Search (lg)…" />
    </div>
  );
}

// Clearable, with a value present (so the trailing X renders) and a match
// counter — the fully-loaded toolbar shape.
export function ClearableWithCount() {
  return (
    <div className="flex w-full max-w-md items-center rounded-md border bg-card p-2">
      <SearchInput
        value="quarterly report"
        onChange={() => {}}
        clearable
        count="12 results"
      />
    </div>
  );
}
