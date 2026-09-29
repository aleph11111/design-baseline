import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { AppShell } from "./AppShell";

afterEach(cleanup);

// SidebarProvider's useIsMobile() reads matchMedia, which jsdom does not implement.
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

// Sonner's toaster renders its region as a <section aria-label="Notifications …">.
const TOASTER = 'section[aria-label^="Notifications"]';

function renderShell(extra?: { toaster?: boolean }) {
  return render(
    <AppShell sidebar={<nav />} header={<header />} {...extra}>
      <p>Body</p>
    </AppShell>,
  );
}

describe("AppShell content column", () => {
  it("lets the column shrink (min-w-0) so wide content can't widen the page", () => {
    const { container } = renderShell();
    const column = container.querySelector("main")!.parentElement!;
    expect(column.className).toContain("min-w-0");
    expect(column.className).toContain("flex-1");
  });

  // The layer's wide-desk steps query the `db-desk` container and restyle
  // `.db-content-column`; drop either hook and the column stays at 1180px.
  it("makes <main> the db-desk container and marks the stepped column", () => {
    const { container } = renderShell();
    const main = container.querySelector("main")!;
    expect(main.className).toContain("@container/db-desk");
    expect(main.firstElementChild!.className).toContain("db-content-column");
  });
});

// Window scroll: the document grows with the page (full-page screenshots,
// back/forward scroll restoration) and the header slot stays in view.
describe("AppShell scroll model", () => {
  it("scrolls the window, not <main>, and keeps the header sticky", () => {
    const { container } = renderShell();
    const main = container.querySelector("main")!;
    const column = main.parentElement!;
    const root = column.parentElement!;

    expect(root.className).toContain("min-h-svh");
    expect(root.className).not.toMatch(/(^|\s)h-svh(\s|$)/);
    expect(main.className).not.toMatch(/overflow-/);
    const headerSlot = column.querySelector("header")!.parentElement!;
    expect(headerSlot.className).toContain("sticky");
    expect(headerSlot.className).toContain("top-0");
  });

  it("publishes the header slot's height as --db-sticky-top for page-level sticky elements", () => {
    const observed: Element[] = [];
    const saved = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      observe(el: Element) { observed.push(el); }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    try {
      const { container } = renderShell();
      const root = container.querySelector("main")!.parentElement!.parentElement!;
      // jsdom has no layout, so the measured height is 0 — the wiring is what's under test.
      expect(root.style.getPropertyValue("--db-sticky-top")).toBe("0px");
      expect(observed[0]).toBe(container.querySelector("header")!.parentElement);
    } finally {
      globalThis.ResizeObserver = saved;
    }
  });
});

describe("AppShell toaster", () => {
  it("renders exactly one Sonner toaster by default", () => {
    const { baseElement } = renderShell();
    expect(baseElement.querySelectorAll(TOASTER)).toHaveLength(1);
  });

  it("renders no Sonner toaster with toaster={false}", () => {
    const { baseElement } = renderShell({ toaster: false });
    expect(baseElement.querySelectorAll(TOASTER)).toHaveLength(0);
  });
});
