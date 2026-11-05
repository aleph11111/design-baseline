"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { SectionCard } from "../../layout/SectionCard";
import { Button } from "../../ui/button";
import { useLabels } from "../../../lib/labels";
import { cn } from "../../../lib/utils";

/**
 * Edit-mode behaviour for one widget (contract Layer 6, "Edit mode"; ADR-0011).
 * Its presence puts the widget in edit mode: the cell gains move earlier /
 * move later / configure / remove buttons, and becomes a native drag source
 * and drop target. Pass the same `onMove` to every widget of the grid.
 */
export type DashboardWidgetEdit = {
  /** The tile's name, used in every control's accessible name ("Move Revenue later"). */
  name: string;
  /** This widget's position in the grid order (0-based). */
  index: number;
  /** How many widgets the grid holds — disables "move later" on the last one. */
  count: number;
  /** Move the widget at `from` to position `to` (buttons and drag-and-drop both call this). */
  onMove: (from: number, to: number) => void;
  /** Open the consumer's tile config dialog for this widget. */
  onConfigure: () => void;
  /** Remove the widget (the consumer confirms, if it wants to). */
  onRemove: () => void;
};

const DRAG_TYPE = "application/x-dashboard-widget";

function EditControls({ edit }: { edit: DashboardWidgetEdit }): React.ReactElement {
  const t = useLabels();
  const { name, index, count, onMove } = edit;
  const earlier = React.useRef<HTMLButtonElement>(null);
  const later = React.useRef<HTMLButtonElement>(null);
  const pressed = React.useRef<"earlier" | "later" | null>(null);
  // A move re-orders the DOM node holding the focused button, which drops
  // focus to <body>. Put it back on the pressed move button — or its sibling
  // when the move landed on an end and disabled it — so a keyboard user can
  // keep moving the tile.
  React.useEffect(() => {
    const which = pressed.current;
    if (!which) return;
    pressed.current = null;
    const [own, other] = which === "earlier" ? [earlier, later] : [later, earlier];
    (own.current && !own.current.disabled ? own.current : other.current)?.focus();
  }, [index]);
  const move = (which: "earlier" | "later") => {
    pressed.current = which;
    onMove(index, which === "earlier" ? index - 1 : index + 1);
  };
  return (
    <div className="-my-1.5 flex items-center gap-0.5">
      <Button ref={earlier} type="button" variant="ghost" size="icon-sm" aria-label={t.moveEarlier(name)} disabled={index === 0} onClick={() => move("earlier")}>
        <ChevronLeft />
      </Button>
      <Button ref={later} type="button" variant="ghost" size="icon-sm" aria-label={t.moveLater(name)} disabled={index === count - 1} onClick={() => move("later")}>
        <ChevronRight />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={t.configureNamed(name)} onClick={edit.onConfigure}>
        <Pencil />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={t.removeNamed(name)} onClick={edit.onRemove}>
        <Trash2 />
      </Button>
    </div>
  );
}

const SPAN_MAP: Record<1 | 2 | 3, string> = {
  1: "",
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
};

export type DashboardWidgetProps = {
  /** Widget heading, rendered as the cell's overline (via SectionCard). */
  title: React.ReactNode;
  /** Optional right-aligned controls beside the heading (a small range toggle, a menu). */
  actions?: React.ReactNode;
  /** Optional secondary line under the title (rendered by SectionCard). */
  description?: React.ReactNode;
  /**
   * How many grid columns this widget spans. Required and derived, never a
   * default: the contract's widget-span keying rule
   * (`docs/archetypes/analytics-dashboard.md`, Layer 6) determines it
   * exhaustively from what the widget *is* —
   *
   * - `3` — the page's single **primary trend** widget (the time-series the
   *   whole dashboard is read against). At most one per page.
   * - `2` — a **comparison/breakdown** widget whose body is multi-series or
   *   multi-category and unreadable at one column (a funnel, a stacked
   *   breakdown, a ranked bar list).
   * - `1` — every other widget: a single figure, a short ranked list, a small
   *   table, a sparkline.
   *
   * The grid collapses responsively, so spans only apply at `sm`+.
   */
  span: 1 | 2 | 3;
  /**
   * The widget body — a chart (consumer brings the chart library; the baseline
   * ships none), a number, a small table. Padded by the cell.
   */
  children: React.ReactNode;
  /**
   * Edit mode (ADR-0011). Omit on a read-only dashboard. With it, the widget
   * carries its edit controls and can be dragged onto another widget; reorder
   * stays keyboard-operable through the move buttons.
   */
  edit?: DashboardWidgetEdit;
  className?: string;
};

/**
 * DashboardWidget — one cell in a `<DashboardGrid>`: a chromeless
 * `<SectionCard>` (overline heading + padded body, no card — the dashboard
 * frame is the page's one surface, ADR-0008 §3) ruled by hairlines on its
 * right and bottom edge, plus a grid column `span`. The body is chart-agnostic:
 * the archetype owns the frame, not the chart.
 *
 * `span` carries no default — a backwards-compatible default is what disqualified
 * it under RULES.md hard rule 10 (ADR-0004); it stays a per-call-site prop only
 * because the contract keys it exhaustively to the widget's kind.
 */
export function DashboardWidget({
  title,
  actions,
  description,
  span,
  children,
  edit,
  className,
}: DashboardWidgetProps): React.ReactElement {
  const [dropTarget, setDropTarget] = React.useState(false);
  const cell = (
    <SectionCard
      title={title}
      description={description}
      actions={
        edit ? (
          <div className="flex items-center gap-2">
            {actions}
            <EditControls edit={edit} />
          </div>
        ) : (
          actions
        )
      }
      chrome={false}
      className={
        edit ? "h-full" : cn("border-r border-b border-border", SPAN_MAP[span], className)
      }
    >
      {children}
    </SectionCard>
  );
  if (!edit) return cell;
  // Edit mode: a wrapper owns the grid cell so native drag-and-drop can mark
  // the drop target; pointer drag is an addition to the move buttons, never
  // the only way to reorder.
  return (
    <div
      data-slot="dashboard-widget-edit"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_TYPE, String(edit.index));
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        setDropTarget(true);
      }}
      onDragLeave={() => setDropTarget(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropTarget(false);
        const from = Number(e.dataTransfer.getData(DRAG_TYPE));
        if (Number.isInteger(from) && from !== edit.index) edit.onMove(from, edit.index);
      }}
      className={cn(
        "cursor-grab border-r border-b border-border",
        dropTarget && "bg-muted/40",
        SPAN_MAP[span],
        className,
      )}
    >
      {cell}
    </div>
  );
}

DashboardWidget.displayName = "DashboardWidget";
