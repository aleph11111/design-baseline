import { useState } from "react";
import { NavLink } from "react-router-dom";
import { type LucideIcon, MoreHorizontal } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { OVERLINE_CLASS } from "./overline";

export interface BottomNavItem {
  path: string;
  title: string;
  icon: LucideIcon;
  end?: boolean;
}

interface BottomNavProps {
  items: readonly BottomNavItem[];
  /** Items rendered inside the "Mehr" sheet. Omit to hide the Mehr trigger. */
  moreItems?: readonly BottomNavItem[];
  moreLabel?: string;
}

function NavCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 min-w-0 flex items-stretch justify-stretch">{children}</div>
  );
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium",
    "text-muted-foreground hover:text-foreground transition-colors",
    isActive && "text-primary",
  );

export function BottomNav({ items, moreItems, moreLabel = "Mehr" }: BottomNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Mobile-Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border bg-background flex"
    >
      {items.map((item) => (
        <NavCell key={item.path}>
          <NavLink to={item.path} end={item.end} className={linkClass}>
            <item.icon className="h-5 w-5" />
            <span className="truncate max-w-full px-1">{item.title}</span>
          </NavLink>
        </NavCell>
      ))}
      {moreItems && moreItems.length > 0 && (
        <NavCell>
          <Sheet open={open} onOpenChange={setOpen}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`${moreLabel}-Menü öffnen`}
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
                      <NavLink
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-4 py-3 text-base",
                            isActive
                              ? "text-primary bg-accent"
                              : "text-foreground hover:bg-accent",
                          )
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
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
