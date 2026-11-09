"use client";
import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { useLabels } from "../../../lib/labels";

/**
 * One menu action. `label` and `disabled` accept either a value or a function of
 * the row: the actions list is shared by every row, so a per-row toggle label
 * ("Pin" / "Unpin") or a per-row permission gate needs the row to resolve.
 * Behaviour, not appearance — the menu resolves the function form at render.
 */
export type RowAction<Row> = {
  label: string | ((row: Row) => string);
  /** Fires on select. An item carries `onSelect`, `href`, or both. */
  onSelect?: (row: Row) => void;
  /** Navigate on select — rendered as a link through `renderLink`. */
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  /** Disable the item (e.g. no permission, not applicable to this row). */
  disabled?: boolean | ((row: Row) => boolean);
};

/** A horizontal rule grouping the items around it. */
export type RowActionSeparator = { separator: true };

/** A non-interactive section heading inside the menu. */
export type RowActionLabel = { label: string; heading: true };

/**
 * One entry in a RowActionsMenu: an action, a separator, or a section label.
 * A plain `RowAction<Row>[]` is still a valid `RowActionItem<Row>[]`, so existing
 * flat-list callers need no change.
 */
export type RowActionItem<Row> =
  | RowAction<Row>
  | RowActionSeparator
  | RowActionLabel;

export type RowActionsMenuProps<Row> = {
  actions: RowActionItem<Row>[];
  /** Accessible label for the trigger. */
  triggerLabel?: string;
  /**
   * Disable the trigger itself — for an in-flight row mutation (a delete the
   * consumer is awaiting), where re-opening the menu could double-fire the
   * action. A capability boolean, not an appearance: it reports whether the
   * row can currently accept an action at all.
   */
  triggerDisabled?: boolean;
  /**
   * Renders an `href` item's link, to wire a framework router's `<Link>`
   * without leaking the dependency into the baseline (the `renderBackLink`
   * pattern). Must return one element that forwards props and ref (the menu
   * item merges onto it). Defaults to a plain `<a>`.
   */
  renderLink?: (href: string, children: React.ReactNode) => React.ReactElement;
} & ([Row] extends [void] ? { row?: Row } : { row: Row });

/**
 * Where the menu renders: a table row (the default) or a page header, which
 * gets an outline trigger at header-button height. Derived from location —
 * the header renderer sets it — never a call-site prop (ADR-0004).
 */
export const RowActionsTriggerContext = React.createContext<"row" | "header">("row");

const defaultRenderLink = (href: string, children: React.ReactNode) => (
  <a href={href}>{children}</a>
);

function isSeparator<Row>(item: RowActionItem<Row>): item is RowActionSeparator {
  return "separator" in item;
}

function isHeading<Row>(item: RowActionItem<Row>): item is RowActionLabel {
  return "heading" in item;
}

/**
 * RowActionsMenu — the single owner of the per-row overflow menu (the trailing
 * `⋯` dropdown in every table row). Previously duplicated byte-for-byte as
 * private components inside the list-with-detail and settings-table shells;
 * promoted here so the trigger, alignment, and destructive-item treatment can
 * only be changed in one place.
 *
 * Entries may be actions, `{ separator: true }` rules, or `{ label, heading: true }`
 * section labels — so a grouped menu (the common "edit actions … / destructive")
 * shape is representable without hand-rolling the `DropdownMenu`. A flat
 * `RowAction<Row>[]` still works unchanged.
 */
export function RowActionsMenu<Row>(props: RowActionsMenuProps<Row>): React.ReactElement {
  const {
    actions,
    triggerLabel: triggerLabelProp,
    triggerDisabled,
    renderLink = defaultRenderLink,
  } = props;
  const row = (props as { row: Row }).row;
  const L = useLabels();
  const header = React.useContext(RowActionsTriggerContext) === "header";
  const triggerLabel = triggerLabelProp ?? (header ? L.headerActions : L.rowActions);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={header ? "outline" : "ghost"}
          size="icon"
          className={header ? undefined : "h-8 w-8"}
          disabled={triggerDisabled}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{triggerLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((item, i) => {
          if (isSeparator(item)) {
            return <DropdownMenuSeparator key={`sep-${i}`} />;
          }
          if (isHeading(item)) {
            return <DropdownMenuLabel key={`head-${i}`}>{item.label}</DropdownMenuLabel>;
          }
          const Icon = item.icon;
          const content = (
            <>
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {typeof item.label === "function" ? item.label(row) : item.label}
            </>
          );
          const disabled =
            typeof item.disabled === "function" ? item.disabled(row) : item.disabled;
          return (
            <DropdownMenuItem
              key={`act-${i}`}
              disabled={disabled}
              asChild={item.href != null && !disabled}
              onSelect={() => item.onSelect?.(row)}
              className={
                item.destructive
                  ? "text-status-danger-fg focus:text-status-danger-fg"
                  : undefined
              }
            >
              {item.href != null && !disabled ? renderLink(item.href, content) : content}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

RowActionsMenu.displayName = "RowActionsMenu";
