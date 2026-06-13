import * as React from "react";
import { cn } from "@/lib/utils";

const WIDTH_MAP: Record<"none" | "md" | "lg" | "xl", string> = {
  none: "",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

const RHYTHM_MAP: Record<"compact" | "default", string> = {
  compact: "space-y-4",
  default: "space-y-5",
};

export type DetailOverviewShellProps = {
  /**
   * Slot 1 — page header (Mode A — standalone). Pass a
   * `<DetailOverviewHeader>`. Omit in Mode B (nested) when a parent layout
   * already renders the entity title and tab nav.
   */
  header?: React.ReactNode;
  /**
   * Slot 2 — master data. A `<DetailSection>` (typically titled "Details")
   * wrapping a `<KeyValueList>` of the entity's core fields, including
   * categorical chip attributes. Omit only when the page is purely
   * metric/tabular.
   */
  summary?: React.ReactNode;
  /**
   * Slot 3 — aggregates over transactional data. Pass a `<StatTileRow>` with
   * 2–4 `<StatTile>` children. Omit when the entity has no headline metrics.
   */
  stats?: React.ReactNode;
  /**
   * Slot 4 — transactional data: embedded read-only lists/tables and
   * read-write islands, each wrapped in its own `<DetailSection>`.
   */
  content?: React.ReactNode;
  /**
   * Slot 5 — reference panels: cross-entity links, related-records lists,
   * external resources. Always last on the page.
   */
  references?: React.ReactNode;
  /**
   * Vertical rhythm between sections.
   * - "compact" (`space-y-4`): short pages with few sections.
   * - "default" (`space-y-5`): the standard record-page rhythm.
   * Defaults to "default".
   */
  rhythm?: "compact" | "default";
  /**
   * Optional max-width preset.
   * - "none" (default): fill the layout's content column. Use when the page
   *   carries wide embedded tables.
   * - "md" (`max-w-3xl`): the record-page default — ruled rows and stat
   *   strips read best in a contained column.
   * - "lg" / "xl": wider single-column layouts.
   */
  width?: "none" | "md" | "lg" | "xl";
  className?: string;
};

/**
 * DetailOverviewShell — the outermost container for every C (detail-overview)
 * archetype instance.
 *
 * v2.0: the shell owns the page layout via named slots rendered in the
 * canonical order — header → summary → stats → content → references
 * (master data, then aggregates, then transactional data). Consumers
 * fill the slots that apply and omit the rest; they cannot reorder them. This
 * is what makes a detail view recognizable across applications: the eye finds
 * the same information in the same place everywhere. The layout lives HERE,
 * in one file — iterating it baseline-wide is a change to this component, not
 * to every consuming page. (See the spec's "Canonical slot order" and the
 * blueprint: docs/archetypes/detail-overview-blueprint.svg.)
 *
 * Renders a vertical stack with one of two rhythm presets and an optional
 * max-width clamp.
 *
 * The shell is **vertical only**. No horizontal columns, no sidebars. If a
 * sidebar is genuinely needed, the page is mis-classified (consider archetype
 * A — list-with-detail).
 */
export function DetailOverviewShell({
  header,
  summary,
  stats,
  content,
  references,
  rhythm = "default",
  width = "none",
  className,
}: DetailOverviewShellProps): React.ReactElement {
  return (
    <div
      className={cn(
        RHYTHM_MAP[rhythm],
        WIDTH_MAP[width],
        className,
      )}
    >
      {header}
      {summary}
      {stats}
      {content}
      {references}
    </div>
  );
}

DetailOverviewShell.displayName = "DetailOverviewShell";
