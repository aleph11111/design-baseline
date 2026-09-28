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
  it("lets the column shrink (min-w-0) so wide content scrolls inside <main>", () => {
    const { container } = renderShell();
    const column = container.querySelector("main")!.parentElement!;
    expect(column.className).toContain("min-w-0");
    expect(column.className).toContain("flex-1");
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
