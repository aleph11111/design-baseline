import * as React from "react";
import { Label, SectionCard, Textarea } from "design-baseline";

// A description field the way a form-page uses it: label + multi-line
// textarea with real, wrapped copy and a helper line.
export function NotesField() {
  return (
    <div className="max-w-md">
      <SectionCard title="Project description">
        <div className="space-y-1.5">
          <Label htmlFor="ta-desc">Description</Label>
          <Textarea
            id="ta-desc"
            rows={4}
            defaultValue="Full gut renovation of the ground-floor kitchen and adjoining sunroom. Includes new plumbing runs, a widened doorway, and refinished oak flooring throughout."
          />
          <p className="text-sm text-muted-foreground">Visible to the client on the project summary.</p>
        </div>
      </SectionCard>
    </div>
  );
}

// Default / disabled / error stacked against the same field.
export function States() {
  return (
    <div className="max-w-md">
      <SectionCard title="Field states">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ta-default">Internal notes</Label>
            <Textarea id="ta-default" rows={3} defaultValue="Client prefers morning site visits." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ta-disabled" className="opacity-70">
              Archived summary
            </Label>
            <Textarea id="ta-disabled" rows={3} defaultValue="Locked after project close-out." disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ta-error" className="text-destructive">
              Change order notes
            </Label>
            <Textarea
              id="ta-error"
              rows={3}
              placeholder="Describe the requested change…"
              className="border-destructive focus-visible:ring-destructive"
            />
            <p className="text-sm font-medium text-destructive">A description is required.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// A comment-box composition — placeholder-driven, paired with a submit
// action, the way a reply box actually renders.
export function CommentBox() {
  return (
    <div className="max-w-md rounded-lg border bg-card p-4">
      <Label htmlFor="ta-comment" className="sr-only">
        Add a comment
      </Label>
      <Textarea id="ta-comment" rows={3} placeholder="Add a comment…" />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Markdown supported</p>
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
        >
          Post comment
        </button>
      </div>
    </div>
  );
}
