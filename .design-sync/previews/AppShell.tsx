import * as React from "react";
import {
  BarChart3,
  Box,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import {
  AppHeader,
  AppShell,
  AppSidebar,
  Button,
  PageHeader,
  StatTile,
  StatTileRow,
  ThemeToggle,
  type NavGroup,
  type NavItem,
} from "design-baseline";

const TOP_ITEMS: NavItem[] = [{ title: "Dashboard", path: "/", icon: LayoutDashboard }];

const GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Orders", path: "/orders", icon: Box },
      { title: "Customers", path: "/customers", icon: Users },
      { title: "Reports", path: "/reports", icon: BarChart3 },
    ],
  },
];

const renderLink = (item: NavItem, children: React.ReactNode) => (
  <a href={item.path}>{children}</a>
);

// The full app frame — sidebar + header + main content, exactly as a project
// gets it. House Style B default: solid (accent-filled) header.
export function Default() {
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
          topItems={TOP_ITEMS}
          groups={GROUPS}
          pathname="/orders"
          renderLink={renderLink}
          footer={
            <a href="/settings" className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </a>
          }
        />
      }
      header={<AppHeader title="Orders" right={<ThemeToggle />} />}
    >
      <div className="space-y-6">
        <PageHeader
          title="Orders"
          subtitle="128 open orders"
          actions={<Button size="sm">New order</Button>}
        />
        <StatTileRow columns={3}>
          <StatTile label="Revenue" value="€58.9k" hint="vs last month" />
          <StatTile label="Orders" value="812" hint="paid + fulfilled" />
          <StatTile label="Avg order" value="€72" />
        </StatTileRow>
      </div>
    </AppShell>
  );
}

// Same frame with the "tint" header treatment — the alternate House Style B
// fill, set once per project via `headerFill`.
export function TintHeaderFill() {
  return (
    <AppShell
      headerFill="tint"
      sidebar={
        <AppSidebar
          appName="Ledger"
          brand={
            <div className="rounded-md bg-primary p-1 text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
          }
          topItems={TOP_ITEMS}
          groups={GROUPS}
          pathname="/"
          renderLink={renderLink}
        />
      }
      header={<AppHeader title="Dashboard" right={<ThemeToggle />} />}
    >
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Store performance at a glance" />
        <StatTileRow columns={2}>
          <StatTile label="Active customers" value="1,512" hint="last 30 days" />
          <StatTile label="Churn" value="2.1%" hint="month over month" />
        </StatTileRow>
      </div>
    </AppShell>
  );
}
