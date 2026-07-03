import * as React from "react";
import { Skeleton } from "design-baseline";

// A profile card mid-load — avatar circle + name/subtitle lines, the exact
// shape the real content resolves into.
export function ProfileCardSkeleton() {
  return (
    <div className="flex max-w-sm items-center gap-4 rounded-md border bg-card p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[180px]" />
        <Skeleton className="h-3 w-[140px]" />
      </div>
    </div>
  );
}

// A list of rows loading — a member list or feed before data arrives.
export function ListRowsSkeleton() {
  return (
    <div className="max-w-sm divide-y divide-border rounded-md border bg-card">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// A text block loading — a description or article paragraph before content
// streams in.
export function TextBlockSkeleton() {
  return (
    <div className="max-w-sm space-y-2 rounded-md border bg-card p-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}
