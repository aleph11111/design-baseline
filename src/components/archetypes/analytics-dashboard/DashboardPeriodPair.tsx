"use client";
import * as React from "react";
import { StatTile, type StatTileProps } from "../../layout/StatTile";
import { DashboardWidget, type DashboardWidgetEdit } from "./DashboardWidget";

/** One period's figure in a pair: the `StatTile` label / value / hint. */
export type DashboardPeriodFigure = Pick<StatTileProps, "label" | "value" | "hint">;

/**
 * One period's free-form body (a chart, say): a sub-heading `label`, the `body`
 * beneath it, and an optional `actions` node (an edit button) beside the label.
 */
export type DashboardPeriodBody = {
  label: React.ReactNode;
  body: React.ReactNode;
  actions?: React.ReactNode;
};

/** One half of a pair: the `StatTile` figure form or the `{ label, body }` form. */
export type DashboardPeriodHalf = DashboardPeriodFigure | DashboardPeriodBody;

export type DashboardPeriodPairProps = {
  /** The metric both figures measure ("Gross profit") — the widget heading. */
  title: React.ReactNode;
  /** Optional secondary line under the title. */
  description?: React.ReactNode;
  /** Optional right-aligned controls beside the heading. */
  actions?: React.ReactNode;
  /** The month figure — always left (or first, when stacked). */
  month: DashboardPeriodHalf;
  /** The year-to-date figure — always right (or second, when stacked). */
  ytd: DashboardPeriodHalf;
  /**
   * The widget's non-loaded state plane (contract Layer 7): a loading skeleton,
   * the empty message or the error message with retry. Given, it replaces both
   * figures inside the same cell; omit it once the figures are loaded.
   */
  state?: React.ReactNode;
  /** Edit mode (ADR-0011), as on `DashboardWidget`. */
  edit?: DashboardWidgetEdit;
  className?: string;
};

function Half({ half }: { half: DashboardPeriodHalf }): React.ReactElement {
  if (!("body" in half)) return <StatTile {...half} />;
  return (
    <div className="min-w-0 px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">{half.label}</h3>
        {half.actions}
      </div>
      {half.body}
    </div>
  );
}

/**
 * DashboardPeriodPair — the paired-period widget kind of the analytics-dashboard
 * (G) archetype: one metric's month and year-to-date figures in one grid cell,
 * month left, YTD right, stacked on the one-column layout. Being one cell, a
 * pair can never split across grid rows.
 *
 * Each half is either the figure form or `{ label, body, actions? }` for a chart
 * body with its own sub-heading and edit button.
 *
 * It takes no `span`: the contract's Layer 6 keying rule fixes this kind at full
 * width (derived from what the widget is, ADR-0004), so two pairs are two rows.
 */
export function DashboardPeriodPair({
  title,
  description,
  actions,
  month,
  ytd,
  state,
  edit,
  className,
}: DashboardPeriodPairProps): React.ReactElement {
  return (
    <DashboardWidget
      title={title}
      description={description}
      actions={actions}
      span={3}
      edit={edit}
      className={className}
    >
      {state ?? (
        // Cancel the cell's body gutter (SectionCard chromeless: px-5, title
        // mb-3, section py-4): each StatTile owns its own px-5 / py-4.
        <div className="-mx-5 -mt-3 -mb-4 grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <Half half={month} />
          <Half half={ytd} />
        </div>
      )}
    </DashboardWidget>
  );
}

DashboardPeriodPair.displayName = "DashboardPeriodPair";
