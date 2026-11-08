"use client";
import * as React from "react";
import { Button } from "../ui/button";
import {
  RowActionsMenu,
  RowActionsTriggerContext,
  type RowActionLabel,
  type RowActionSeparator,
} from "../archetypes/shared/RowActionsMenu";

/**
 * One page-header action. Behaviour, not appearance (ADR-0004): where it
 * renders — inline button or `⋯` menu item — follows from its slot and
 * `destructive`, never from a look prop.
 */
export type HeaderAction = {
  label: string;
  /** Fires on click / select. An action carries `onSelect`, `href`, or both. */
  onSelect?: () => void;
  /** Navigate — rendered as a link through `renderLink`. */
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  /** Destructive (delete, cancel order): renders only inside the `⋯` menu. */
  destructive?: boolean;
};

/** A `⋯` menu entry: an action, a `{ separator: true }` rule, or a `{ label, heading: true }` section label. */
export type HeaderActionItem = HeaderAction | RowActionSeparator | RowActionLabel;

/**
 * The typed page-header actions. The renderer enforces the hierarchy
 * (PLACEMENT.md, page-frame slot table): at most one `primary` and
 * `MAX_SECONDARY_ACTIONS` `secondary` buttons inline; further secondaries
 * spill into the `⋯` menu ahead of `menu`; a `destructive` action renders
 * only in the menu, wherever it was passed.
 */
export type HeaderActions = {
  primary?: HeaderAction;
  secondary?: HeaderAction[];
  menu?: HeaderActionItem[];
  /**
   * Renders an `href` action's link, to wire a framework router's `<Link>`
   * (the `renderBackLink` pattern). Must return one element that forwards
   * props and ref. Defaults to a plain `<a>`.
   */
  renderLink?: (href: string, children: React.ReactNode) => React.ReactElement;
};

/** Most secondary buttons a page header renders inline. */
export const MAX_SECONDARY_ACTIONS = 2;

/** True for the typed form; false for the deprecated rendered-node form. */
export function isHeaderActions(value: unknown): value is HeaderActions {
  return (
    typeof value === "object" &&
    value !== null &&
    !React.isValidElement(value) &&
    !(Symbol.iterator in value)
  );
}

/** Applies the hierarchy: what renders inline, what goes into the menu. */
export function splitHeaderActions({ primary, secondary = [], menu = [] }: HeaderActions): {
  primary?: HeaderAction;
  secondary: HeaderAction[];
  menu: HeaderActionItem[];
} {
  const destructive: HeaderAction[] = [];
  const keepInline = (action: HeaderAction) => {
    if (action.destructive) destructive.push(action);
    return !action.destructive;
  };
  const inlinePrimary = primary && keepInline(primary) ? primary : undefined;
  const inlineSecondary = secondary.filter(keepInline);
  const overflow: HeaderActionItem[] = [...inlineSecondary.slice(MAX_SECONDARY_ACTIONS), ...menu];
  if (destructive.length > 0) {
    if (overflow.length > 0) overflow.push({ separator: true });
    overflow.push(...destructive);
  }
  return {
    primary: inlinePrimary,
    secondary: inlineSecondary.slice(0, MAX_SECONDARY_ACTIONS),
    menu: overflow,
  };
}

const defaultRenderLink = (href: string, children: React.ReactNode) => (
  <a href={href}>{children}</a>
);

function ActionButton({
  action,
  primary,
  renderLink,
}: {
  action: HeaderAction;
  primary?: boolean;
  renderLink: NonNullable<HeaderActions["renderLink"]>;
}): React.ReactElement {
  const Icon = action.icon;
  const content = (
    <>
      {Icon && <Icon className="h-4 w-4" />}
      {action.label}
    </>
  );
  const variant = primary ? "default" : "outline";
  if (action.href != null && !action.disabled) {
    return (
      <Button asChild variant={variant} onClick={action.onSelect}>
        {renderLink(action.href, content)}
      </Button>
    );
  }
  return (
    <Button type="button" variant={variant} disabled={action.disabled} onClick={action.onSelect}>
      {content}
    </Button>
  );
}

/**
 * Renders typed header actions — secondary buttons, the primary rightmost,
 * then the `⋯` menu (`RowActionsMenu`, header trigger). The one renderer
 * behind every `PageFrame` path (default, nested, host-titled). Returns
 * `null` when nothing would render.
 */
export function renderHeaderActions(actions: HeaderActions): React.ReactNode {
  const { primary, secondary, menu } = splitHeaderActions(actions);
  if (!primary && secondary.length === 0 && menu.length === 0) return null;
  const renderLink = actions.renderLink ?? defaultRenderLink;
  return (
    <>
      {secondary.map((action, i) => (
        <ActionButton key={`secondary-${i}`} action={action} renderLink={renderLink} />
      ))}
      {primary && <ActionButton action={primary} primary renderLink={renderLink} />}
      {menu.length > 0 && (
        <RowActionsTriggerContext.Provider value="header">
          <RowActionsMenu<void> actions={menu} renderLink={renderLink} />
        </RowActionsTriggerContext.Provider>
      )}
    </>
  );
}
