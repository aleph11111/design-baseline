import type { NavItem } from "./Sidebar";

/**
 * The one active-route rule every layout nav (`<AppSidebar>`, `<SectionNavShell>`,
 * `<BottomNav>`) highlights by: `/` matches only itself, an `exact` item matches
 * only itself, anything else matches itself or a `path + "/"` prefix (so
 * `/orders` does not activate for `/orders-archive`).
 *
 * `end` is the deprecated `BottomNavItem` spelling of `exact`, still honoured.
 */
export function isNavPathActive(
  pathname: string,
  item: Pick<NavItem, "path" | "exact"> & { end?: boolean },
): boolean {
  if (item.path === "/") return pathname === "/";
  if (item.exact || item.end) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(item.path + "/");
}
