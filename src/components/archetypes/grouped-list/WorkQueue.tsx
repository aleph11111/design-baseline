"use client";
import * as React from "react";
import { SegmentedControl } from "../../ui/segmented-control";
import { useTouchTarget } from "../../ui/toolbar-band";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { SectionCard } from "../../layout/SectionCard";
import { ToolbarLeadContext } from "../../layout/ToolbarBand";
import { useLabels } from "../../../lib/labels";
import { cn } from "../../../lib/utils";
import type { WorkflowStep, WorkflowTone } from "../shared/workflowStep";
import { GroupedListSection, type GroupedListSectionProps } from "./GroupedListSection";

/** The work queue's three views — a closed set, so no status tab is ever always empty. */
export type WorkQueueView = "open" | "completed" | "all";

export type WorkQueueViewSwitchProps = {
  value: WorkQueueView;
  onValueChange: (view: WorkQueueView) => void;
  /** Row count per view, shown in each option. */
  counts: Record<WorkQueueView, number>;
};

/**
 * The work queue's view switch — Open · Completed · All, each with its count.
 * Pass it to the shell's `viewSwitch` slot. Per-status tabs are not offered:
 * the steps are the groups, not tabs.
 */
export function WorkQueueViewSwitch({ value, onValueChange, counts }: WorkQueueViewSwitchProps): React.ReactElement {
  const L = useLabels();
  const option = (view: WorkQueueView, label: string) => ({
    value: view,
    label: (
      <>
        {label} <span className="tabular-nums opacity-80">{counts[view]}</span>
      </>
    ),
  });
  return (
    <SegmentedControl<WorkQueueView>
      value={value}
      onValueChange={onValueChange}
      aria-label={L.workQueueView}
      options={[option("open", L.workQueueOpen), option("completed", L.workQueueCompleted), option("all", L.workQueueAll)]}
    />
  );
}
WorkQueueViewSwitch.displayName = "WorkQueueViewSwitch";

/** One step-keyed group: the step, its rows (partitioned upstream), and at most one bulk action. */
export type WorkQueueGroup<Row> = {
  step: WorkflowStep;
  rows: Row[];
  /** One line under the title ("Oldest 34 days"). */
  description?: React.ReactNode;
  /** The group's one bulk action ("Refresh tracking for 6"). */
  bulkAction?: { label: string; onSelect: () => void };
};

export type WorkQueueGroupsProps<Row> = Pick<
  GroupedListSectionProps<Row>,
  "columns" | "getRowId" | "onRowSelect" | "selectedRowId" | "rowActions"
> & {
  /** Every step of the view, in step order — empty ones included (they collapse into the pipeline line). */
  groups: WorkQueueGroup<Row>[];
  /** Row height: `open` 44px (the work), `archive` 38px (Completed / All). Single-line rows either way. */
  density: "open" | "archive";
};

const BADGE: Record<WorkflowTone, "secondary" | "warning" | "destructive" | "success"> = {
  default: "secondary",
  warning: "warning",
  danger: "destructive",
  success: "success",
};

// Bounded density: fixed single-line row heights (44px open, 38px archive).
const DENSITY = {
  open: "[&_tbody_tr]:h-11",
  archive: "[&_tbody_tr]:h-9.5",
} as const;
const ROW = "[&_tbody_td]:py-0 [&_tbody_td]:whitespace-nowrap";

const anchor = (step: WorkflowStep) => `work-queue-${step.key}`;

/**
 * The work-queue body of a grouped-list page: one card per non-empty step
 * (title, tone-coloured count, one bulk action), and — when the view has more
 * than one step — one pipeline line listing every step in order with its
 * count. Empty steps live only in that line, never as empty sections.
 * Render it as the `GroupedListShell`'s only child.
 */
export function WorkQueueGroups<Row>({ groups, density, ...table }: WorkQueueGroupsProps<Row>): React.ReactElement {
  const L = useLabels();
  const touchTarget = useTouchTarget();
  const filled = groups.filter((g) => g.rows.length > 0);
  const cards = filled.map((g) => {
    const tone = g.step.tone ?? "default";
    return (
      <div key={g.step.key} id={anchor(g.step)} data-slot="work-queue-group" data-tone={tone} className="scroll-mt-4">
        <GroupedListSection<Row>
          {...table}
          title={g.step.label}
          description={g.description}
          rows={g.rows}
          className={cn(DENSITY[density], ROW)}
          actions={
            <span className="flex items-center gap-2">
              <Badge variant={BADGE[tone]} className="tabular-nums">{g.rows.length}</Badge>
              {g.bulkAction ? (
                <Button size="sm" variant="outline" className="-my-1.5 h-7 text-xs" onClick={g.bulkAction.onSelect}>
                  {g.bulkAction.label}
                </Button>
              ) : null}
            </span>
          }
        />
      </div>
    );
  });
  const pipeline =
    groups.length > 1 ? (
      <SectionCard flush data-slot="work-queue-pipeline">
        <nav aria-label={L.workQueuePipeline} className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-5 py-2.5 text-sm">
          {groups.map((g, i) => (
            <React.Fragment key={g.step.key}>
              {i > 0 ? <span aria-hidden="true" className="text-muted-foreground">›</span> : null}
              {g.rows.length > 0 ? (
                <a href={`#${anchor(g.step)}`} className={cn("font-medium text-foreground hover:underline", touchTarget)}>
                  {g.step.label} <span className="tabular-nums">{g.rows.length}</span>
                </a>
              ) : (
                <span data-empty="" className="text-muted-foreground">
                  {g.step.label} <span className="tabular-nums">0</span>
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </SectionCard>
    ) : null;
  // The stack hands the toolbar band to its first child (this component), so
  // only the first card here may consume it.
  const [first, ...rest] = pipeline ? [pipeline, ...cards] : cards;
  return (
    <>
      {first}
      <ToolbarLeadContext.Provider value={null}>{rest}</ToolbarLeadContext.Provider>
    </>
  );
}
WorkQueueGroups.displayName = "WorkQueueGroups";

export type WaitingAgeCellProps = {
  /** Whole days the row has waited in its step. */
  days: number;
  /** Day counts at which the tone escalates: at or past `warning` → warning, at or past `danger` → danger. */
  thresholds: { warning: number; danger: number };
  /** Optional quiet context after the age ("since 04.10."). */
  since?: React.ReactNode;
};

/** How long a row has waited in its step, toned by the declared thresholds. */
export function WaitingAgeCell({ days, thresholds, since }: WaitingAgeCellProps): React.ReactElement {
  const L = useLabels();
  const tone: WorkflowTone = days >= thresholds.danger ? "danger" : days >= thresholds.warning ? "warning" : "default";
  return (
    <span className="inline-flex items-center gap-1.5" data-slot="waiting-age" data-tone={tone}>
      <Badge variant={BADGE[tone]} className="tabular-nums">{L.waitingDays(days)}</Badge>
      {since ? <span className="text-xs text-muted-foreground">{since}</span> : null}
    </span>
  );
}
WaitingAgeCell.displayName = "WaitingAgeCell";
