import * as React from "react";
import { Bell, Box, LayoutDashboard, Users } from "lucide-react";
import {
  AppHeader,
  AppShell,
  AppSidebar,
  Button,
  SearchInput,
  ThemeToggle,
  type NavItem,
} from "design-baseline";

const renderLink = (item: NavItem, children: React.ReactNode) => (
  <a href={item.path}>{children}</a>
);

// Real usage: composed inside an AppShell, sidebar-trigger + title + right
// slot (bell + theme toggle) — the default, most common shape.
export function InAppShell() {
  return (
    <AppShell
      sidebar={
        <AppSidebar
          appName="Ledger"
          brand={
            <div className="rounded-md bg-primary p-1 text-primary-foreground">
              <Box className="h-6 w-6" />
            </div>
          }
          topItems={[{ title: "Dashboard", path: "/", icon: LayoutDashboard }]}
          groups={[{ label: "Workspace", items: [{ title: "Customers", path: "/customers", icon: Users }] }]}
          pathname="/"
          renderLink={renderLink}
        />
      }
      header={
        <AppHeader
          title="Dashboard"
          right={
            <>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </>
          }
        />
      }
    >
      <p className="text-sm text-muted-foreground">Main content area.</p>
    </AppShell>
  );
}

// Standalone, in a bordered frame — center search slot, mobile trigger
// disabled (the consumer owns mobile nav elsewhere, e.g. a bottom-nav).
export function CenterSearch() {
  return (
    <div className="rounded-lg border bg-card">
      <AppHeader
        title="Orders"
        showSidebarTrigger={false}
        center={<SearchInput placeholder="Search orders…" onChange={() => {}} />}
        right={<Button size="sm">New order</Button>}
      />
    </div>
  );
}

// Standalone, title + right actions only — no center slot.
export function TitleAndActions() {
  return (
    <div className="rounded-lg border bg-card">
      <AppHeader
        title="Settings"
        showSidebarTrigger={false}
        right={
          <>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </>
        }
      />
    </div>
  );
}
