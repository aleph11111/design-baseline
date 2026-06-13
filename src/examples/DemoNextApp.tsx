/*
 * Demo for Next.js 16 App Router.
 *
 * Drop into `app/(app)/layout.tsx` or similar. Showcases the full shell
 * with a sidebar + header + content slot. Replace `navTopItems` / `navGroups`
 * with your own routes.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, LayoutDashboard, Settings, Users, FileText, BarChart3 } from "lucide-react";
import { AppShell, AppSidebar, AppHeader, type NavItem, type NavGroup } from "@/components/layout";
import { Button } from "@/components/ui/button";

const navTopItems: NavItem[] = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
];

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Customers", path: "/customers", icon: Users },
      { title: "Documents", path: "/documents", icon: FileText },
      { title: "Reports", path: "/reports", icon: BarChart3 },
    ],
  },
];

export function DemoNextApp({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  return (
    <AppShell
      sidebar={
        <AppSidebar
          appName="My App"
          brand={
            <div className="rounded-md bg-primary p-1 text-primary-foreground">
              <Box className="h-6 w-6" />
            </div>
          }
          topItems={navTopItems}
          groups={navGroups}
          pathname={pathname}
          renderLink={(item, children) => <Link href={item.path}>{children}</Link>}
          footer={
            <Link
              href="/settings"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          }
        />
      }
      header={
        <AppHeader
          title="My App"
          right={
            <Button variant="ghost" size="sm">
              Sign out
            </Button>
          }
        />
      }
    >
      {children}
    </AppShell>
  );
}
