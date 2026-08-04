import * as React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
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
  /** Persist collapsed-group state under this localStorage key. */
  collapseStorageKey?: string;
}

function isPathActive(pathname: string, item: NavItem) {
  if (item.path === "/") return pathname === "/";
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(item.path + "/");
}

function useCollapsedState(storageKey: string) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  React.useEffect(() => {
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
      <SidebarMenuButton
        asChild
        className={cn(isActive && "bg-primary text-primary-foreground")}
      >
        {renderLink(
          item,
          <span className="flex items-center gap-2">
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </span>,
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
  collapseStorageKey = "sidebar-collapsed-groups",
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useCollapsedState(collapseStorageKey);
  const toggleGroup = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <SidebarRoot className="border-r border-border">
      <SidebarHeader className="h-16 flex items-center px-4">
        <div className="flex items-center gap-2">
          {brand}
          <span className="font-bold text-lg">{appName}</span>
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
          const isOpen = !collapsed[group.label];
          const hasActiveChild = group.items.some((item) => isPathActive(pathname, item));
          return (
            <Collapsible
              key={group.label}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.label)}
            >
              <SidebarGroup>
                <CollapsibleTrigger className={cn(OVERLINE_CLASS, "flex w-full select-none items-center justify-between px-3 py-1.5 transition-colors hover:text-foreground")}>
                  <span className={cn(hasActiveChild && !isOpen && "text-primary")}>
                    {group.label}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isOpen && "rotate-90",
                    )}
                  />
                </CollapsibleTrigger>
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

      {footer && <SidebarFooter className="mt-auto p-4">{footer}</SidebarFooter>}
    </SidebarRoot>
  );
}
