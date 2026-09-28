"use client";
import * as React from "react";
import { SidebarProvider } from "../ui/sidebar";
import { TooltipProvider } from "../ui/tooltip";
import { Toaster as Sonner } from "../ui/sonner";
import { HeaderFillContext, type HeaderFill } from "./headerFill";

export interface AppShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
  /**
   * The house header treatment for every framed surface below (House Style B).
   * Set once per project; defaults to "solid" (accent-filled headers). See
   * `headerFill.ts`.
   */
  headerFill?: HeaderFill;
  /**
   * Render the bundled Sonner toaster. Defaults to `true`. A consumer that
   * already mounts one toaster at its root layout passes `false`, so each toast
   * renders once.
   */
  toaster?: boolean;
}

export function AppShell({
  sidebar,
  header,
  children,
  defaultSidebarOpen = true,
  headerFill = "solid",
  toaster = true,
}: AppShellProps) {
  return (
    <TooltipProvider>
      <HeaderFillContext.Provider value={headerFill}>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <div className="h-svh flex w-full">
          {sidebar}
          <div className="flex-1 flex flex-col">
            {header}
            {/* `<main>` is the CANONICAL owner of the page inset (p-4 md:p-12
                xl:p-14) and of the centred content column (--db-content-max).
                Pages and archetype shells render content WITHOUT their own outer
                px-6/py-6 — adding it double-insets. One owner = no per-page drift.
                A full-bleed archetype shell carries FULL_BLEED_CLASS (layout/
                surface.ts), which lifts the column's max width (ADR-0007 §1).
                See docs/STYLE.md "Spacing & rhythm". */}
            <main className="flex-1 bg-surface-canvas p-4 md:p-12 xl:p-14 overflow-auto">
              <div className="mx-auto w-full max-w-(--db-content-max) has-[.db-full-bleed]:max-w-none">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
      </HeaderFillContext.Provider>
      {toaster && <Sonner />}
    </TooltipProvider>
  );
}
