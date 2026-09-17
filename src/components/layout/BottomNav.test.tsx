import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Home, Settings } from "lucide-react";
import { BottomNav, type BottomNavItem } from "./BottomNav";

const items: BottomNavItem[] = [{ path: "/", title: "Home", icon: Home, end: true }];
const moreItems: BottomNavItem[] = [{ path: "/settings", title: "Settings", icon: Settings }];

function renderNav(props: Partial<React.ComponentProps<typeof BottomNav>> = {}) {
  return render(
    <BottomNav
      items={items}
      moreItems={moreItems}
      pathname="/"
      renderLink={(item, children) => <a href={item.path}>{children}</a>}
      {...props}
    />,
  );
}

afterEach(() => {
  cleanup();
});

describe("BottomNav", () => {
  it("defaults every user-facing string to English", () => {
    renderNav();
    expect(screen.getByRole("navigation", { name: "Bottom navigation" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open more menu" })).toBeTruthy();
  });

  it("does not leave a residual German suffix when moreLabel is overridden", () => {
    renderNav({ moreLabel: "More" });
    const trigger = screen.getByRole("button", { name: "Open more menu" });
    expect(trigger.getAttribute("aria-label")).not.toMatch(/Menü/);
  });

  it("fully overrides every user-facing string via props", () => {
    renderNav({ navLabel: "App navigation", moreLabel: "Plus", moreMenuLabel: "Show more" });
    expect(screen.getByRole("navigation", { name: "App navigation" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show more" })).toBeTruthy();
  });
});
