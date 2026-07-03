import * as React from "react";
import { ListWithDetailEmptyState } from "design-baseline";

// Loading plane.
export function Loading() {
  return (
    <div className="rounded-lg border bg-card">
      <ListWithDetailEmptyState mode="loading" />
    </div>
  );
}

// Error plane, with a retry affordance.
export function ErrorState() {
  return (
    <div className="rounded-lg border bg-card">
      <ListWithDetailEmptyState mode="error" error={new Error("Failed to load podcasts.")} onRetry={() => {}} />
    </div>
  );
}

// Genuinely empty — no rows exist yet.
export function Empty() {
  return (
    <div className="rounded-lg border bg-card">
      <ListWithDetailEmptyState mode="empty" message="No shows yet." />
    </div>
  );
}

// Filtered to zero rows — a search/filter combination matched nothing.
export function FilteredEmpty() {
  return (
    <div className="rounded-lg border bg-card">
      <ListWithDetailEmptyState mode="filtered-empty" />
    </div>
  );
}
