import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PageFrame } from "../../layout/PageFrame";
import { SettingsPageShell, type SettingsPageShellProps } from "./SettingsPageShell";
import {
  SettingsTableBody,
  type SettingsColumn,
} from "../settings-table";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const tabs = [
  { value: "general", label: "General", content: <p>general body</p> },
  { value: "team", label: "Team", content: <p>team body</p> },
];

// A settings-table (D2) frameless body as tab content — the v3.1
// `SettingsTableBody` export. The tab trigger owns the heading, so the body
// must not render a nested heading repeating the tab label.
type Channel = { id: string; name: string };
const CHANNEL_ROWS: Channel[] = [
  { id: "c1", name: "Apple Podcasts" },
  { id: "c2", name: "Spotify" },
];
const CHANNEL_COLUMNS: SettingsColumn<Channel>[] = [
  { key: "name", header: "Channel", isIdentifier: true, cell: (row) => row.name },
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

  it("a SettingsTableBody tab content renders its rows with no nested heading, and the create + count in the body's own flush band", () => {
    const { container } = render(
      <SettingsPageShell
        title="Workspace"
        tabs={[
          {
            value: "distribution",
            label: "Distribution",
            content: (
              <SettingsTableBody
                rows={CHANNEL_ROWS}
                columns={CHANNEL_COLUMNS}
                getRowId={(c) => c.id}
                rowLabel="channels"
                onAddNew={() => undefined}
                addNewLabel="Add channel"
              />
            ),
          },
        ]}
      />,
    );

    // The table renders its rows…
    expect(screen.getByText("Apple Podcasts")).toBeTruthy();
    expect(screen.getByText("Spotify")).toBeTruthy();
    // …and there is exactly one heading in the whole container: the page h1.
    // The frameless body contributes no nested h2 that would repeat "Distribution"
    // (the tab trigger label is not a heading; it is a tab).
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelectorAll("h2")).toHaveLength(0);
    expect(screen.queryByRole("heading", { level: 2, name: "Distribution" })).toBeNull();
    // The tab has no page header; the body's own flush band is the home for the
    // create action and the count caption.
    const band = screen.getByRole("button", { name: "Add channel" }).closest(".border-b") as HTMLElement;
    expect(band).toBeTruthy();
    expect(band.textContent).toContain("Add channel");
    expect(band.textContent).toContain("2 channels");
  });

  it("a bulk-selectable SettingsTableBody in a tab shows the selection count + delete in the band, no h2", () => {
    const { container } = render(
      <SettingsPageShell
        title="Workspace"
        tabs={[
          {
            value: "distribution",
            label: "Distribution",
            content: (
              <SettingsTableBody
                rows={CHANNEL_ROWS}
                columns={CHANNEL_COLUMNS}
                getRowId={(c) => c.id}
                rowLabel="channels"
                bulkSelectable
                selectedIds={["c1"]}
                onBulkSelectChange={() => undefined}
                onBulkDelete={() => undefined}
              />
            ),
          },
        ]}
      />,
    );
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelectorAll("h2")).toHaveLength(0);
    // While a visible row is selected and a bulk action exists, the band carries
    // the "{n} selected" caption and the convenience delete.
    expect(screen.getByText("1 selected")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete 1 selected" })).toBeTruthy();
    // Both sit in the body's flush band.
    const band = screen.getByRole("button", { name: "Delete 1 selected" }).closest(".border-b") as HTMLElement;
    expect(band.textContent).toContain("1 selected");
  });

  it("a bare SettingsTableBody tab (no band-scoped controls) renders no flush band", () => {
    render(
      <SettingsPageShell
        title="Workspace"
        tabs={[
          {
            value: "distribution",
            label: "Distribution",
            content: (
              <SettingsTableBody rows={CHANNEL_ROWS} columns={CHANNEL_COLUMNS} getRowId={(c) => c.id} />
            ),
          },
        ]}
      />,
    );
    // No toolbar, no create, no count noun, no bulk action = no band at all (not
    // an empty ruled line). Scope to the body's own root element (the band and the
    // table scroll region are its siblings/children); the `.border-b py-3` pair is
    // the band's chrome — a shadcn TableRow also carries `border-b`, so the class
    // pair, not the class alone, is the marker. The tab strip's band is the page
    // frame's, outside this element.
    const table = screen.getByRole("row", { name: /Apple Podcasts/ }).closest("table") as Element;
    const bodyRoot = (table.closest(".overflow-x-auto") as Element).parentElement;
    expect(bodyRoot?.querySelector(".border-b.py-3")).toBeNull();
    expect(table.closest(".border-b.py-3")).toBeNull();
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
