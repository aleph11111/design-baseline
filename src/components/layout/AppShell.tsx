import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface AppShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
}

export function AppShell({ sidebar, header, children, defaultSidebarOpen = true }: AppShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <div className="h-svh flex w-full">
          {sidebar}
          <div className="flex-1 flex flex-col">
            {header}
            <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}
