"use client";
import * as React from "react";
import { StatTile, type StatTileProps } from "../../layout/StatTile";
import { DashboardWidget, type DashboardWidgetEdit } from "./DashboardWidget";

/** One period's figure in a pair: the `StatTile` label / value / hint. */
export type DashboardPeriodFigure = Pick<StatTileProps, "label" | "value" | "hint">;

export type DashboardPeriodPairProps = {
  /** The metric both figures measure ("Gross profit") — the widget heading. */
  title: React.ReactNode;
  /** Optional secondary line under the title. */
  description?: React.ReactNode;
  /** Optional right-aligned controls beside the heading. */
  actions?: React.ReactNode;
  /** The month figure — always left (or first, when stacked). */
  month: DashboardPeriodFigure;
  /** The year-to-date figure — always right (or second, when stacked). */
  ytd: DashboardPeriodFigure;
  /** Edit mode (ADR-0011), as on `DashboardWidget`. */
  edit?: DashboardWidgetEdit;
  className?: string;
};

/**
 * DashboardPeriodPair — the paired-period widget kind of the analytics-dashboard
 * (G) archetype: one metric's month and year-to-date figures in one grid cell,
 * month left, YTD right, stacked on the one-column layout. Being one cell, a
 * pair can never split across grid rows.
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
      {/* Cancel the cell's body gutter: each StatTile owns its own px-5 / py-4. */}
      <div className="-mx-5 -mt-3 -mb-4 grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <StatTile {...month} />
        <StatTile {...ytd} />
      </div>
    </DashboardWidget>
  );
}

DashboardPeriodPair.displayName = "DashboardPeriodPair";
