import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { Home, Upload, type LucideIcon } from "lucide-react";
import { AppSidebar, type NavGroup } from "./Sidebar";
import { SidebarProvider } from "../ui/sidebar";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
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

// Radix's tooltip positions via Popper, which observes the trigger. jsdom has no
// ResizeObserver; a no-op is enough since we only assert on the rendered text.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const items = [{ title: "Home", path: "/", icon: Home as LucideIcon }];

const groups: NavGroup[] = [
  { label: "Data", items: [{ title: "Import", path: "/import", icon: Upload as LucideIcon }] },
];

type Extra = Partial<React.ComponentProps<typeof AppSidebar>>;

function renderSidebar(extra?: Extra, providerOpen = true) {
  return render(
    <SidebarProvider defaultOpen={providerOpen}>
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

describe("AppSidebar icon rail", () => {
  it("stays on the primitive's default shell when the new props are omitted", () => {
    const { container } = renderSidebar({ groups }, false);

    expect(container.querySelector('[data-sidebar="rail"]')).toBeNull();
    // `collapsible` unset → the primitive's offcanvas default, so a collapsed
    // sidebar reports no icon rail.
    expect(container.querySelector('[data-collapsible="icon"]')).toBeNull();
  });

  it("collapses to an icon rail with a <SidebarRail /> when asked to", () => {
    const { container } = renderSidebar({ groups, collapsible: "icon", rail: true }, false);

    expect(container.querySelector('[data-collapsible="icon"]')).not.toBeNull();
    expect(container.querySelector('[data-sidebar="rail"]')).not.toBeNull();
  });

  it("exposes every item's name as a tooltip once the rail is icon-collapsed", async () => {
    const { getByRole, findByRole } = renderSidebar(
      { groups, collapsible: "icon", rail: true },
      false,
    );

    // In icon mode the label span is clipped to zero width, so the tooltip is
    // the item's only readable name — dropping it is an a11y regression.
    // Focus is the keyboard path to it.
    fireEvent.focus(getByRole("link", { name: "Import" }));
    const tooltip = await findByRole("tooltip");
    expect(tooltip.textContent).toContain("Import");
  });

  it("keeps the tooltip hidden while the sidebar is expanded", async () => {
    const { getByRole, queryAllByRole } = renderSidebar({ groups, collapsible: "icon" });

    fireEvent.focus(getByRole("link", { name: "Import" }));
    // `hidden` on TooltipContent strips it from the a11y tree when expanded.
    await waitFor(() => expect(queryAllByRole("tooltip")).toHaveLength(0));
  });
});

describe("AppSidebar active state", () => {
  it("marks the active row with the primitive's data-active, not a bg-primary class", () => {
    const { getByRole } = renderSidebar({ pathname: "/" });
    const link = getByRole("link", { name: "Home" });

    expect(link.getAttribute("data-active")).toBe("true");
    expect(link.className).not.toContain("bg-primary");
  });

  it("leaves inactive rows at data-active=false", () => {
    const { getByRole } = renderSidebar({ groups, pathname: "/" });

    expect(getByRole("link", { name: "Import" }).getAttribute("data-active")).toBe("false");
  });
});

describe("AppSidebar group persistence", () => {
  it("persists collapsed groups under the default storage key", () => {
    renderSidebar({ groups });

    expect(window.localStorage.getItem("sidebar-collapsed-groups")).not.toBeNull();
  });

  it("runs groups uncontrolled and touches no storage when collapseStorageKey is null", () => {
    const { getByRole } = renderSidebar({ groups, collapseStorageKey: null });

    expect(window.localStorage.getItem("sidebar-collapsed-groups")).toBeNull();
    // `defaultOpen` — the group's items are rendered without any stored state.
    expect(getByRole("link", { name: "Import" })).not.toBeNull();
  });
});
