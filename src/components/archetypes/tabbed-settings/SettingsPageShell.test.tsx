import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PageFrame } from "../../layout/PageFrame";
import { SettingsPageShell, type SettingsPageShellProps } from "./SettingsPageShell";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const tabs = [
  { value: "general", label: "General", content: <p>general body</p> },
  { value: "team", label: "Team", content: <p>team body</p> },
];

describe("SettingsPageShell — one page frame (ADR-0008)", () => {
  it("renders the title once, as the page h1, with no on-surface title", () => {
    const { container } = render(<SettingsPageShell title="Workspace" tabs={tabs} />);

    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Workspace");
    expect(screen.getAllByText("Workspace")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
  });

  it("renders the tab strip in the toolbar band and the selected tab as the body", () => {
    render(<SettingsPageShell title="Workspace" tabs={tabs} defaultTab="team" />);

    const strip = screen.getByRole("tablist");
    expect(strip.closest(".border-b")).not.toBeNull();
    expect(screen.getByRole("tab", { name: "Team" }).getAttribute("data-state")).toBe("active");
    expect(screen.getByText("team body")).toBeTruthy();
    expect(screen.queryByText("general body")).toBeNull();
  });

  it("defaults to the first tab and renders the persistent below-tab section", () => {
    render(<SettingsPageShell title="Workspace" tabs={tabs} belowTabs={<span>footer note</span>} />);

    expect(screen.getByText("general body")).toBeTruthy();
    expect(screen.getByText("footer note")).toBeTruthy();
  });

  it("renders a breadcrumb trail passed as the subtitle under the h1", () => {
    render(
      <SettingsPageShell
        title="Workspace"
        tabs={tabs}
        subtitle={<nav aria-label="Breadcrumb">crumbs</nav>}
      />,
    );

    const crumbs = screen.getByLabelText("Breadcrumb");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(
      heading.compareDocumentPosition(crumbs) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("nests under a parent PageFrame: an h2, no second h1, no second surface", () => {
    const { container } = render(
      <PageFrame title="Settings">
        <SettingsPageShell title="Workspace" tabs={tabs} />
      </PageFrame>,
    );

    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Workspace" })).toBeTruthy();
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
  });
});

describe("SettingsPageShell error boundary", () => {
  it("catches a throwing tab body instead of letting it escape the shell", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    function Boom(): never {
      throw new Error("child exploded");
    }

    expect(() =>
      render(
        <SettingsPageShell
          title="Integrations"
          tabs={[{ value: "a", label: "A", content: <Boom /> }]}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("child exploded")).toBeTruthy();
  });
});

// Type-level guard: the retired header homes stay out of the closed props.
type Key<T, K extends PropertyKey> = K extends keyof T ? "present" : "absent";
type _Retired = [
  Key<SettingsPageShellProps, "kicker">,
  Key<SettingsPageShellProps, "headerActions">,
  Key<SettingsPageShellProps, "actions">,
  Key<SettingsPageShellProps, "icon">,
] extends ["absent", "absent", "absent", "absent"]
  ? true
  : never;
const retiredGuard: _Retired = true;
expect(retiredGuard).toBe(true);
