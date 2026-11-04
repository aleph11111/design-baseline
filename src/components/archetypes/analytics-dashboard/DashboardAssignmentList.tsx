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
 * edit mode (ADR-0011): a titled cell after the widget grid, one checkbox per
 * target, each saving on its own with a per-row pending state. Render it as a
 * direct child of `DashboardShell`, after the `DashboardGrid`.
 */
export function DashboardAssignmentList({
  title,
  targets,
  onToggle,
  empty,
}: DashboardAssignmentListProps): React.ReactElement {
  const t = useLabels();
  return (
    <SectionCard title={title} chrome={false}>
      {targets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty ?? t.empty}</p>
      ) : (
        <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </SectionCard>
  );
}

DashboardAssignmentList.displayName = "DashboardAssignmentList";
