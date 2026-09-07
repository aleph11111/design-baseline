import * as React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";
import { OVERLINE_CLASS } from "./overline";
import type { NavItem } from "./Sidebar";

/**
 * A run of section-nav items, optionally headed by a group label. Omit `label`
 * for an ungrouped run (e.g. a single standalone entry that sits apart from the
 * titled groups).
 */
export interface SectionNavGroup {
  /** Optional uppercase group heading rendered above the items. */
  label?: string;
  /** Links in this group, in render order. Reuses the baseline `NavItem` shape. */
  items: NavItem[];
}

export interface SectionNavShellProps {
  /** Grouped secondary-nav links, rendered in order inside a scroll area. */
  groups: SectionNavGroup[];
  /** Current pathname — used to highlight the active link. */
  pathname: string;
  /**
   * Render-prop for the link itself — lets the consumer plug in `next/link`,
   * `react-router-dom`'s `NavLink`/`Link`, or a plain `<a>`. Mirrors the
   * `renderLink` contract on `<AppSidebar>` so a project wires both navs the
   * same way.
   */
  renderLink: (item: NavItem, children: React.ReactNode) => React.ReactNode;
  /**
   * The active section page. A router-based consumer passes its `<Outlet />`
   * here; the baseline stays router-agnostic by taking the page as a slot.
   */
  children: React.ReactNode;
  /** Accessible label for the section-nav landmark. Default: "Section". */
  ariaLabel?: string;
  /** Extra classes for the outer flex container. */
  className?: string;
}

function isPathActive(pathname: string, item: NavItem) {
  if (item.path === "/") return pathname === "/";
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(item.path + "/");
}

/**
 * SectionNavShell — a secondary "section" layout: a grouped vertical nav in a
 * scroll area beside a content slot. It is a layout sibling of `<AppShell>` /
 * `<AppSidebar>`, not a page archetype: it renders *inside* the app shell's
 * `<main>` on a parent route, and its content slot hosts the child page (a
 * router's `<Outlet />`, typically a `<SettingsPageShell>` from the
 * tabbed-settings archetype).
 *
 * Two-level structure: app nav (`<AppSidebar>`) → section nav
 * (`<SectionNavShell>`) → page (`children`). The nav-group *content* (routes,
 * labels, icons) is consumer config; this primitive ships none.
 *
 * Responsive: stacks the nav above the content on narrow viewports and sits it
 * to the left from `md` up.
 */
export function SectionNavShell({
  groups,
  pathname,
  renderLink,
  children,
  ariaLabel = "Section",
  className,
}: SectionNavShellProps): React.ReactElement {
  return (
    <div className={cn("flex h-full flex-col md:flex-row", className)}>
      <aside className="border-b md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <ScrollArea className="h-full">
          <nav aria-label={ariaLabel} className="flex flex-col gap-1 p-4">
            {groups.map((group, groupIndex) => (
              <div key={group.label ?? `group-${groupIndex}`} className={cn(groupIndex > 0 && "mt-4")}>
                {group.label && (
                  <h4 className={cn(OVERLINE_CLASS, "mb-1 px-3")}>
                    {group.label}
                  </h4>
                )}
                {group.items.map((item) => {
                  const active = isPathActive(pathname, item);
                  return (
                    <React.Fragment key={item.path}>
                      {renderLink(
                        item,
                        <span
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.title}
                        </span>,
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

SectionNavShell.displayName = "SectionNavShell";
