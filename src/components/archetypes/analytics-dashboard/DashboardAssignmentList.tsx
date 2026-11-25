"use client";
import * as React from "react";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { SectionCard } from "../../layout/SectionCard";
import { useLabels } from "../../../lib/labels";

export type DashboardAssignmentTarget = {
  id: string;
  /** The target's name (an asset, a team, a site). */
  label: string;
  /** Whether this dashboard layout applies to the target. */
  assigned: boolean;
  /** The toggle is saving: the row is disabled and shows a saving hint. */
  pending?: boolean;
};

export type DashboardAssignmentListProps = {
  /** Section heading ("Assigned shops"). */
  title: React.ReactNode;
  targets: DashboardAssignmentTarget[];
  /** Toggle one target; each toggle saves on its own. */
  onToggle: (id: string) => void;
  /** Shown when there are no targets to assign. */
  empty?: React.ReactNode;
};

/**
 * DashboardAssignmentList — who an analytics-dashboard layout applies to, in
 * edit mode (ADR-0011): a titled card after the widget grid, one checkbox per
 * target, each saving on its own with a per-row pending state. Render it as a
 * direct child of `DashboardShell`, after the `DashboardGrid`.
 *
 * The column count is keyed to the column's container, not the viewport, in
 * the same steps as the `DashboardGrid` it sits on top of (1, 2 at `@4xl`,
 * 3 at `@5xl`): the card's real width is the page column's, and inside
 * `AppShell` that column is narrower than the window — `DashboardGrid` is the
 * container that queries, so the list's grid steps with the widget grid.
 */
export function DashboardAssignmentList({
  title,
  targets,
  onToggle,
  empty,
}: DashboardAssignmentListProps): React.ReactElement {
  const t = useLabels();
  return (
    <SectionCard title={title}>
      {targets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty ?? t.empty}</p>
      ) : (
        // `@container` is what the grid's `@4xl` / `@5xl` steps query — the
        // list's own box, so the column count follows the column's real width
        // (inside `AppShell`, the page column's), not the viewport.
        <div className="@container">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 @4xl:grid-cols-2 @5xl:grid-cols-3">
            {targets.map((target) => (
              <li key={target.id}>
                <Label className="flex min-h-9 cursor-pointer items-center gap-3 font-normal">
                  <Checkbox
                    checked={target.assigned}
                    disabled={target.pending}
                    onCheckedChange={() => onToggle(target.id)}
                  />
                  <span>{target.label}</span>
                  {target.pending && <span className="text-xs text-muted-foreground">{t.saving}</span>}
                </Label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

DashboardAssignmentList.displayName = "DashboardAssignmentList";
