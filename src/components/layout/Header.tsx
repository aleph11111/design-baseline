import * as React from "react";
import { Menu, User } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { useLabels } from "../../lib/labels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface AppHeaderUser {
  email: string;
  onSignOut: () => void;
}

export interface AppHeaderProps {
  /** Page or app title rendered next to the mobile sidebar toggle. */
  title: string;
  /** Breadcrumb trail, root first. Below `sm` only the current (last)
   *  segment renders, with the full path in its `title` attribute; from `sm`
   *  up the whole trail renders. Replaces nothing — `title` still shows from
   *  `sm` up. */
  breadcrumb?: string[];
  /** Center slot — usually a command/search input. Hidden if omitted. */
  center?: React.ReactNode;
  /** Right slot — notification bells, quick actions, etc. */
  right?: React.ReactNode;
  /** Signed-in user. Below `sm` the email and sign-out live in an account
   *  menu; from `sm` up they render inline. Neither can overflow the row. */
  user?: AppHeaderUser;
  /** Whether to show the mobile sidebar trigger (default true). Set to
   *  false when the consumer owns mobile navigation outside the sidebar
   *  (e.g. a bottom-nav). */
  showSidebarTrigger?: boolean;
}

/** The row sets `contain: inline-size`, so it takes its width from its parent
 *  (a block or a stretched flex-column child, as in `AppShell`) and never
 *  widens it; don't place it in a shrink-to-fit context. */
export function AppHeader({
  title,
  breadcrumb,
  center,
  right,
  user,
  showSidebarTrigger = true,
}: AppHeaderProps) {
  const L = useLabels();
  const current = breadcrumb?.[breadcrumb.length - 1];
  return (
    <header className="h-16 min-w-0 overflow-hidden [contain:inline-size] border-b border-border px-2 sm:px-4 flex items-center justify-between gap-2">
      <div className={`flex min-w-0 items-center gap-2${center ? (breadcrumb ? " flex-1 sm:max-w-[50%] sm:flex-initial" : "") : " flex-1"}`}>
        {showSidebarTrigger && (
          <SidebarTrigger className="md:hidden shrink-0">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        )}
        <h1 className="text-xl font-semibold hidden sm:block truncate">{title}</h1>
        {breadcrumb && current !== undefined && (
          <>
            <span
              className="truncate text-sm text-muted-foreground sm:hidden"
              title={breadcrumb.join(" / ")}
            >
              {current}
            </span>
            <nav aria-label="Breadcrumb" className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
              {breadcrumb.join(" / ")}
            </nav>
          </>
        )}
      </div>

      {center && <div className="flex-1 min-w-0 sm:min-w-32 flex justify-center">{center}</div>}

      {right && <div className="flex min-w-0 items-center gap-2 sm:gap-4">{right}</div>}

      {user && (
        <div className="flex shrink-0 items-center gap-2 sm:ml-2 sm:min-w-0 sm:shrink sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={L.userMenu} className="sm:hidden shrink-0">
                <User />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-[calc(100vw-1rem)]">
              <DropdownMenuLabel className="truncate font-normal">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={user.onSignOut}>{L.signOut}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="hidden min-w-0 max-w-48 truncate text-sm sm:block" title={user.email}>
            {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={user.onSignOut} className="hidden shrink-0 sm:inline-flex">
            {L.signOut}
          </Button>
        </div>
      )}
    </header>
  );
}
