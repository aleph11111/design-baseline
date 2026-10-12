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
const LONG_TITLE = "A very long page title that would otherwise push the header past the viewport";

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
      title: LONG_TITLE,
      center: <input />,
      right: <button>x</button>,
      user: { email: LONG_EMAIL, onSignOut: () => {} },
    });
    const header = container.querySelector("header")!;
    const tokens = (el: Element) => el.className.split(/\s+/);
    expect(tokens(header)).toEqual(expect.arrayContaining(["min-w-0", "overflow-hidden", "[contain:inline-size]"]));
    expect(header.children).toHaveLength(4);
    const [left, center, right, user] = Array.from(header.children) as [Element, Element, Element, Element];
    // title, center and right shrink at every width (unprefixed tokens, not sm: variants)
    for (const slot of [left, center, right]) {
      expect(tokens(slot), slot.outerHTML.slice(0, 60)).toContain("min-w-0");
      expect(tokens(slot)).not.toContain("shrink-0");
      expect(tokens(slot)).not.toContain("flex-shrink-0");
    }
    // the user slot is the one exception below sm: a 36px icon that must stay
    // visible; from sm up, where the email renders inline, it shrinks too
    expect(tokens(user)).toEqual(expect.arrayContaining(["shrink-0", "sm:min-w-0", "sm:shrink"]));
    expect(screen.getByRole("heading", { name: LONG_TITLE, hidden: true }).className.split(/\s+/)).toContain("truncate");
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

  it("with center, the left slot stays content-sized and truncates its title", () => {
    const { container } = renderHeader({ title: LONG_TITLE, center: <input /> });
    const left = container.querySelector("header")!.firstElementChild!;
    expect(left.className.split(/\s+/)).not.toContain("flex-1");
    expect(screen.getByRole("heading", { name: LONG_TITLE }).className).toContain("truncate");
  });

  it("does not clip the center slot's focus ring", () => {
    const { container } = renderHeader({ center: <input /> });
    const center = container.querySelector("input")!.parentElement!;
    expect(center.className).not.toContain("overflow-hidden");
    expect(center.className).toContain("sm:min-w-32"); // floor so a long title can't collapse it
  });

  it("renders unchanged without the new inputs", () => {
    renderHeader();
    expect(screen.queryByLabelText("Account menu")).toBeNull();
  });
});
