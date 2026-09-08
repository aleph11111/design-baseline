"use client";
import * as React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { cn } from "../../lib/utils";
import { OVERLINE_CLASS } from "./overline";

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  /** Require exact pathname match. Useful for parent routes like `/admin`
   *  that should not stay active when a sub-route is open. */
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface AppSidebarProps {
  /** Brand mark shown in the header — usually a small colored tile with an icon. */
  brand: React.ReactNode;
  /** App name shown next to the brand mark. */
  appName: string;
  /**
   * Anything to render between the header and the nav — a workspace/tenant/asset
   * switcher is the canonical case. `footer` is the wrong slot for those: it pins
   * them to the bottom of the rail. The wrapper clips overflow so the node cannot
   * blow out a narrow rail; rendering a compact variant under
   * `collapsible="icon"` is the node's own job (it can read `useSidebar().state`).
   */
  aboveNav?: React.ReactNode;
  /** Top-level items rendered above any groups. */
  topItems?: NavItem[];
  /** Collapsible groups, rendered in order. */
  groups?: NavGroup[];
  /** Items rendered at the bottom of the scroll area (above the footer). */
  bottomItems?: NavItem[];
  /** Anything to render in the pinned footer (e.g. settings link). */
  footer?: React.ReactNode;
  /** Current pathname — used to highlight active links. */
  pathname: string;
  /**
   * Render-prop for the link itself — lets the consumer plug in
   * `next/link`, `react-router-dom`'s `Link`, or a plain `<a>`.
   */
  renderLink: (item: NavItem, children: React.ReactNode) => React.ReactNode;
  /**
   * Passed straight to the `Sidebar` primitive. `"icon"` gives the icon rail,
   * in which nav labels collapse away and the per-item tooltip becomes each
   * item's only accessible name.
   */
  collapsible?: React.ComponentProps<typeof SidebarRoot>["collapsible"];
  /** Render the primitive's `<SidebarRail />` — the thin drag/click toggle strip. */
  rail?: boolean;
  /**
   * Persist collapsed-group state under this localStorage key. Pass `null` to
   * leave the groups uncontrolled (`defaultOpen`) instead — the right choice
   * when the shell lives in the app's root layout, where open/closed already
   * survives client navigation and only a hard reload resets it.
   */
  collapseStorageKey?: string | null;
}

function isPathActive(pathname: string, item: NavItem) {
  if (item.path === "/") return pathname === "/";
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(item.path + "/");
}

function useCollapsedState(storageKey: string | null) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined" || storageKey === null) return {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  React.useEffect(() => {
    if (storageKey === null) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(collapsed));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [collapsed, storageKey]);
  return [collapsed, setCollapsed] as const;
}

function NavRow({
  item,
  isActive,
  renderLink,
}: {
  item: NavItem;
  isActive: boolean;
  renderLink: AppSidebarProps["renderLink"];
}) {
  return (
    <SidebarMenuItem>
      {/* The icon and the label are direct children of the rendered link, not
          wrapped in a positioning span: `SidebarMenuButton` already lays them
          out, and its `[&>svg]` / `[&>span:last-child]` selectors — which drive
          icon sizing and label truncation in the icon rail — only reach one
          level down. */}
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        {renderLink(
          item,
          <>
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </>,
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  brand,
  appName,
  aboveNav,
  topItems = [],
  groups = [],
  bottomItems = [],
  footer,
  pathname,
  renderLink,
  collapsible,
  rail = false,
  collapseStorageKey = "sidebar-collapsed-groups",
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useCollapsedState(collapseStorageKey);
  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  const persist = collapseStorageKey !== null;

  return (
    <SidebarRoot collapsible={collapsible} className="border-r border-border">
      <SidebarHeader className="h-16 flex justify-center border-b px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          {brand}
          <span className="truncate font-bold text-lg group-data-[collapsible=icon]:hidden">
            {appName}
          </span>
        </div>
      </SidebarHeader>

      {aboveNav && <div className="overflow-hidden border-b py-3">{aboveNav}</div>}

      <SidebarContent>
        {topItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {topItems.map((item) => (
                  <NavRow
                    key={item.path}
                    item={item}
                    isActive={isPathActive(pathname, item)}
                    renderLink={renderLink}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groups.map((group) => {
          const hasActiveChild = group.items.some((item) => isPathActive(pathname, item));
          return (
            <Collapsible
              key={group.label}
              className="group/collapsible"
              // Controlled only while persisting. With `collapseStorageKey={null}`
              // there is no stored state to drive `open` from, so the group runs
              // uncontrolled and open/closed lives in the Collapsible itself.
              {...(persist
                ? {
                    open: !collapsed[group.label],
                    onOpenChange: () => toggleGroup(group.label),
                  }
                : { defaultOpen: true })}
            >
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className={cn(OVERLINE_CLASS, "flex w-full select-none items-center justify-between transition-colors hover:text-foreground")}>
                    <span
                      className={cn(
                        hasActiveChild &&
                          "group-data-[state=closed]/collapsible:text-primary",
                      )}
                    >
                      {group.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <NavRow
                          key={item.path}
                          item={item}
                          isActive={isPathActive(pathname, item)}
                          renderLink={renderLink}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}

        {bottomItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <NavRow
                    key={item.path}
                    item={item}
                    isActive={isPathActive(pathname, item)}
                    renderLink={renderLink}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {footer && (
        <SidebarFooter className="mt-auto border-t p-4 group-data-[collapsible=icon]:hidden">
          {footer}
        </SidebarFooter>
      )}

      {rail && <SidebarRail />}
    </SidebarRoot>
  );
}
