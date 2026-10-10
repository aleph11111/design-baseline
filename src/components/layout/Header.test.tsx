import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppHeader } from "./Header";
import { SidebarProvider } from "../ui/sidebar";

afterEach(cleanup);

window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

const LONG_EMAIL = "someone.with.a.very.long.address@a-rather-long-company-domain.example.com";
const TRAIL = ["Workspace", "Customers", "A very long customer name that would wrap", "Contracts"];

function renderHeader(props: Partial<Parameters<typeof AppHeader>[0]> = {}) {
  return render(
    <SidebarProvider>
      <AppHeader title="App" {...props} />
    </SidebarProvider>,
  );
}

// jsdom does no layout, so scrollWidth <= innerWidth would pass vacuously. The
// overflow class is closed by the shrink contract on the row and every slot.
describe("AppHeader phone overflow", () => {
  it("lets the row and every slot shrink instead of widening the page", () => {
    const { container } = renderHeader({
      breadcrumb: TRAIL,
      center: <input />,
      right: <button>x</button>,
      user: { email: LONG_EMAIL, onSignOut: () => {} },
    });
    const header = container.querySelector("header")!;
    expect(header.className).toContain("min-w-0");
    expect(header.className).toContain("overflow-hidden");
    expect(header.className).toContain("[contain:inline-size]");
    for (const slot of Array.from(header.children)) {
      expect(slot.className, slot.outerHTML.slice(0, 60)).toContain("min-w-0");
      expect(slot.className.split(/\s+/)).not.toContain("flex-shrink-0");
    }
  });

  it("below sm shows only the current segment, full path in title", () => {
    renderHeader({ breadcrumb: TRAIL });
    const phone = screen.getByTitle(TRAIL.join(" / "));
    expect(phone.textContent).toBe("Contracts");
    expect(phone.className).toContain("sm:hidden");
    expect(phone.className).toContain("truncate");
  });

  it("keeps the email and sign-out in a menu below sm, inline from sm up", () => {
    const onSignOut = vi.fn();
    renderHeader({ user: { email: LONG_EMAIL, onSignOut } });
    expect(screen.getByLabelText("Account menu").className).toContain("sm:hidden");
    const inline = screen.getByTitle(LONG_EMAIL);
    expect(inline.className.split(/\s+/)).toContain("hidden");
    expect(inline.className).toContain("truncate");
    const out = screen.getByRole("button", { name: "Sign out", hidden: true });
    expect(out.className.split(/\s+/)).toContain("hidden");
    out.click();
    expect(onSignOut).toHaveBeenCalled();
  });

  it("account menu below sm holds the email and signs out", () => {
    const onSignOut = vi.fn();
    renderHeader({ user: { email: LONG_EMAIL, onSignOut } });
    const trigger = screen.getByLabelText("Account menu");
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    expect(screen.getAllByText(LONG_EMAIL).length).toBeGreaterThan(1);
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalled();
  });

  it("with center, the left slot shares space instead of claiming its content width", () => {
    const { container } = renderHeader({ breadcrumb: TRAIL, center: <input /> });
    const left = container.querySelector("header")!.firstElementChild!;
    expect(left.className.split(/\s+/)).toContain("flex-1");
    // from sm up its width is capped so a long trail can't collapse the center
    expect(left.className).toContain("sm:max-w-[50%]");
  });

  it("with center and no breadcrumb, the left slot stays content-sized", () => {
    const { container } = renderHeader({ center: <input /> });
    const left = container.querySelector("header")!.firstElementChild!;
    expect(left.className.split(/\s+/)).not.toContain("flex-1");
  });

  it("does not clip the center slot's focus ring", () => {
    const { container } = renderHeader({ center: <input /> });
    const center = container.querySelector("input")!.parentElement!;
    expect(center.className).not.toContain("overflow-hidden");
    expect(center.className).toContain("sm:min-w-32"); // floor so a long trail can't collapse it
  });

  it("renders unchanged without the new inputs", () => {
    const { container } = renderHeader();
    expect(container.querySelector("nav")).toBeNull();
    expect(screen.queryByLabelText("Account menu")).toBeNull();
  });
});
