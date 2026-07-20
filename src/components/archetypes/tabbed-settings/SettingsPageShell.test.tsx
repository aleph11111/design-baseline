import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SettingsPageShell } from "./SettingsPageShell";

// The two layouts are told apart by what renders the title: the classic branch
// goes through <SettingsPageHeader> → <PageHeader>, which emits an <h1>; the
// board form goes through <SurfaceHeaderSlot> → <SurfaceHeader>, which emits a
// `data-slot="surface-header"` bar and no heading element.
const surfaceHeader = (): Element | null =>
  document.querySelector('[data-slot="surface-header"]');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SettingsPageShell layout branch", () => {
  it("renders the classic layout when neither kicker nor headerActions is set", () => {
    render(
      <SettingsPageShell title="Integrations">
        <p>body</p>
      </SettingsPageShell>,
    );

    expect(screen.getByRole("heading", { name: "Integrations" })).toBeTruthy();
    expect(surfaceHeader()).toBeNull();
    expect(screen.getByText("body")).toBeTruthy();
  });

  it.each([
    ["kicker", { kicker: "Settings" }],
    ["headerActions", { headerActions: <button type="button">Save</button> }],
  ])("switches to the board form when %s is set", (_label, props) => {
    render(
      <SettingsPageShell title="Integrations" {...props}>
        <p>body</p>
      </SettingsPageShell>,
    );

    const header = surfaceHeader();
    expect(header).not.toBeNull();
    // SettingsPageHeader is suppressed — no <h1> from PageHeader.
    expect(screen.queryByRole("heading", { name: "Integrations" })).toBeNull();

    // The header and the children live inside one bounded card.
    const card = header!.parentElement;
    expect(card?.className).toContain("rounded-lg");
    expect(card?.className).toContain("border");
    expect(card?.contains(screen.getByText("body"))).toBe(true);
  });
});

describe("SettingsPageShell breadcrumbs", () => {
  it.each([
    ["classic", {}],
    ["board form", { kicker: "Settings" }],
  ])("renders breadcrumbs above the header in the %s layout", (_label, props) => {
    render(
      <SettingsPageShell
        title="Integrations"
        breadcrumbs={<nav aria-label="Breadcrumb">crumbs</nav>}
        {...props}
      >
        <p>body</p>
      </SettingsPageShell>,
    );

    const crumbs = screen.getByLabelText("Breadcrumb");
    const header =
      surfaceHeader() ?? screen.getByRole("heading", { name: "Integrations" });

    expect(
      crumbs.compareDocumentPosition(header) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("SettingsPageShell error boundary", () => {
  it("catches a throwing child instead of letting it escape the shell", () => {
    // React logs the caught error via console.error; silence it so the test
    // output stays readable.
    vi.spyOn(console, "error").mockImplementation(() => {});

    function Boom(): never {
      throw new Error("child exploded");
    }

    expect(() =>
      render(
        <SettingsPageShell title="Integrations">
          <Boom />
        </SettingsPageShell>,
      ),
    ).not.toThrow();

    // ErrorBoundary's default fallback, not the page body.
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("child exploded")).toBeTruthy();
  });
});
