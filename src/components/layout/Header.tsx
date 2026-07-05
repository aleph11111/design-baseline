import * as React from "react";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export interface AppHeaderProps {
  /** Page or app title rendered next to the mobile sidebar toggle. */
  title: string;
  /** Center slot — usually a command/search input. Hidden if omitted. */
  center?: React.ReactNode;
  /** Right slot — notification bells, quick actions, user menu, etc. */
  right?: React.ReactNode;
  /** Whether to show the mobile sidebar trigger (default true). Set to
   *  false when the consumer owns mobile navigation outside the sidebar
   *  (e.g. a bottom-nav). */
  showSidebarTrigger?: boolean;
}

export function AppHeader({ title, center, right, showSidebarTrigger = true }: AppHeaderProps) {
  return (
    <header className="h-16 border-b border-border px-2 sm:px-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-shrink-0">
        {showSidebarTrigger && (
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        )}
        <h1 className="text-xl font-semibold hidden sm:block">{title}</h1>
      </div>

      {center && <div className="flex-1 flex justify-center">{center}</div>}

      {right && <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">{right}</div>}
    </header>
  );
}
