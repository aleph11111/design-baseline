import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Home, type LucideIcon } from "lucide-react";
import { AppSidebar } from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

afterEach(() => {
  cleanup();
});

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

const items = [{ title: "Home", path: "/", icon: Home as LucideIcon }];

function renderSidebar(extra?: { aboveNav?: React.ReactNode }) {
  return render(
    <SidebarProvider>
      <AppSidebar
        brand={<span>B</span>}
        appName="App"
        topItems={items}
        pathname="/"
        renderLink={(item, children) => <a href={item.path}>{children}</a>}
        {...extra}
      />
    </SidebarProvider>,
  );
}

describe("AppSidebar aboveNav", () => {
  it("renders the slot between the header and the nav", () => {
    const { container, getByTestId } = renderSidebar({
      aboveNav: <div data-testid="switcher">Switcher</div>,
    });

    const header = container.querySelector('[data-sidebar="header"]');
    const content = container.querySelector('[data-sidebar="content"]');
    const slot = getByTestId("switcher").parentElement!;

    expect(header).not.toBeNull();
    expect(content).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING === 4
    expect(header!.compareDocumentPosition(slot) & 4).toBeTruthy();
    expect(slot.compareDocumentPosition(content!) & 4).toBeTruthy();
  });

  it("renders no wrapper at all when omitted, leaving existing consumers' DOM unchanged", () => {
    const withSlot = renderSidebar({ aboveNav: <div>x</div> }).container.innerHTML;
    cleanup();
    const without = renderSidebar().container.innerHTML;

    expect(without).not.toContain("border-b py-3");
    expect(withSlot).toContain("border-b py-3");
  });
});
