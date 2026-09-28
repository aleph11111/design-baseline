import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Home, ShieldCheck } from "lucide-react";
import { isNavPathActive } from "./navMatch";
import { BottomNav } from "./BottomNav";
import type { NavItem } from "./Sidebar";

afterEach(() => {
  cleanup();
});

describe("isNavPathActive", () => {
  it("matches root only on itself", () => {
    expect(isNavPathActive("/", { path: "/" })).toBe(true);
    expect(isNavPathActive("/orders", { path: "/" })).toBe(false);
  });

  it("matches an exact item only on itself", () => {
    expect(isNavPathActive("/admin", { path: "/admin", exact: true })).toBe(true);
    expect(isNavPathActive("/admin/users", { path: "/admin", exact: true })).toBe(false);
  });

  it("still honours the deprecated end flag", () => {
    expect(isNavPathActive("/admin/users", { path: "/admin", end: true })).toBe(false);
  });

  it("matches itself and sub-routes by prefix", () => {
    expect(isNavPathActive("/orders", { path: "/orders" })).toBe(true);
    expect(isNavPathActive("/orders/42", { path: "/orders" })).toBe(true);
  });

  it("does not match a sibling that shares a prefix", () => {
    expect(isNavPathActive("/orders-archive", { path: "/orders" })).toBe(false);
  });
});

describe("one NavItem[] route list", () => {
  it("feeds BottomNav with no field renaming and honours exact", () => {
    const routes: NavItem[] = [
      { path: "/", title: "Home", icon: Home },
      { path: "/admin", title: "Admin", icon: ShieldCheck, exact: true },
    ];
    render(
      <BottomNav
        items={routes}
        pathname="/admin/users"
        renderLink={(item: NavItem, children) => <a href={item.path}>{children}</a>}
      />,
    );
    expect(screen.getByText("Admin").parentElement!.className).not.toContain("text-primary");
  });
});
