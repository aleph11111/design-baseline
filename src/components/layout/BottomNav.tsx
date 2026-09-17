import * as React from "react";
import { useState } from "react";
import { type LucideIcon, MoreHorizontal } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { cn } from "../../lib/utils";
import { OVERLINE_CLASS } from "./overline";

export interface BottomNavItem {
  path: string;
  title: string;
  icon: LucideIcon;
  end?: boolean;
}

interface BottomNavProps {
  items: readonly BottomNavItem[];
  /** Current pathname — used to highlight the active link. */
  pathname: string;
  /**
   * Render-prop for the link itself — lets the consumer plug in `next/link`,
   * `react-router-dom`'s `NavLink`/`Link`, or a plain `<a>`. Mirrors the
   * `renderLink` contract on `<AppSidebar>` / `<SectionNavShell>` so a project
   * wires every nav the same way.
   */
  renderLink: (item: BottomNavItem, children: React.ReactNode) => React.ReactNode;
  /** Items rendered inside the "more" sheet. Omit to hide the more trigger. */
  moreItems?: readonly BottomNavItem[];
  moreLabel?: string;
  /** Accessible name for the nav landmark. */
  navLabel?: string;
  /** Accessible name for the more-trigger button. Independent of `moreLabel`. */
  moreMenuLabel?: string;
}

function NavCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 min-w-0 flex items-stretch justify-stretch">{children}</div>
  );
}

function isPathActive(pathname: string, item: BottomNavItem) {
  if (item.path === "/") return pathname === "/";
  if (item.end) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(item.path + "/");
}

const linkClass = (isActive: boolean) =>
  cn(
    "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium",
    "text-muted-foreground hover:text-foreground transition-colors",
    isActive && "text-primary",
  );

export function BottomNav({
  items,
  pathname,
  renderLink,
  moreItems,
  moreLabel = "More",
  navLabel = "Bottom navigation",
  moreMenuLabel = "Open more menu",
}: BottomNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label={navLabel}
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border bg-background flex"
    >
      {items.map((item) => (
        <NavCell key={item.path}>
          {renderLink(
            item,
            <span className={linkClass(isPathActive(pathname, item))}>
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-full px-1">{item.title}</span>
            </span>,
          )}
        </NavCell>
      ))}
      {moreItems && moreItems.length > 0 && (
        <NavCell>
          <Sheet open={open} onOpenChange={setOpen}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={moreMenuLabel}
              aria-expanded={open}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium",
                "text-muted-foreground hover:text-foreground transition-colors",
                open && "text-primary",
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>{moreLabel}</span>
            </button>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-0">
              <SheetHeader className="px-4 py-3 border-b border-border text-left">
                <SheetTitle className={OVERLINE_CLASS}>
                  {moreLabel}
                </SheetTitle>
              </SheetHeader>
              <ul className="py-2">
                {moreItems.map((item) => (
                  <li key={item.path}>
                    <SheetClose asChild>
                      <span>
                        {renderLink(
                          item,
                          <span
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 text-base",
                              isPathActive(pathname, item)
                                ? "text-primary bg-accent"
                                : "text-foreground hover:bg-accent",
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </span>,
                        )}
                      </span>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </NavCell>
      )}
    </nav>
  );
}
