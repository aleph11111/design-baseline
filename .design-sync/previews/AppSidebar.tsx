import * as React from "react";
import {
  BarChart3,
  Box,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Settings,
  UploadCloud,
  Users,
} from "lucide-react";
import {
  AppHeader,
  AppShell,
  AppSidebar,
  type NavGroup,
  type NavItem,
} from "design-baseline";

const renderLink = (item: NavItem, children: React.ReactNode) => (
  <a href={item.path}>{children}</a>
);

// Top-level item + a single collapsible group + a pinned footer link — the
// common shape for a small app. Rendered inside a real AppShell (the sidebar
// needs the shell's SidebarProvider for width/collapse behavior).
export function TopItemsAndFooter() {
  const groups: NavGroup[] = [
    {
      label: "Workspace",
      items: [
        { title: "Orders", path: "/orders", icon: Box },
        { title: "Customers", path: "/customers", icon: Users },
        { title: "Reports", path: "/reports", icon: BarChart3 },
      ],
    },
  ];
  return (
    <AppShell
      sidebar={
        <AppSidebar
          appName="Ledger"
          brand={
            <div className="rounded-md bg-primary p-1 text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
          }
          topItems={[{ title: "Dashboard", path: "/", icon: LayoutDashboard }]}
          groups={groups}
          pathname="/customers"
          renderLink={renderLink}
          footer={
            <a href="/settings" className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </a>
          }
        />
      }
      header={<AppHeader title="Customers" />}
    >
      <p className="text-sm text-muted-foreground">Customer list goes here.</p>
    </AppShell>
  );
}

// Two collapsible groups plus a pinned bottom-items run — exercises the
// `bottomItems` slot (distinct from `footer`, which is free-form content).
export function MultipleGroupsAndBottomItems() {
  const groups: NavGroup[] = [
    {
      label: "Workspace",
      items: [
        { title: "Orders", path: "/orders", icon: Box },
        { title: "Customers", path: "/customers", icon: Users },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Reports", path: "/reports", icon: BarChart3 },
        { title: "Imports", path: "/imports", icon: UploadCloud },
      ],
    },
  ];
  return (
    <AppShell
      sidebar={
        <AppSidebar
          appName="Ledger"
          brand={
            <div className="rounded-md bg-primary p-1 text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
          }
          topItems={[{ title: "Dashboard", path: "/", icon: LayoutDashboard }]}
          groups={groups}
          bottomItems={[{ title: "Help", path: "/help", icon: HelpCircle }]}
          pathname="/reports"
          renderLink={renderLink}
        />
      }
      header={<AppHeader title="Reports" />}
    >
      <p className="text-sm text-muted-foreground">Reports content goes here.</p>
    </AppShell>
  );
}
