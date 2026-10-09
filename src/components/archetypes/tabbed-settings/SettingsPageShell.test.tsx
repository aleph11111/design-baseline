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

// A settings-table (D2) frameless body as tab content — the v3.2
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

  it("keeps the tab strip in the view-switch slot, outside the filter sheet, below md", () => {
    const original = window.matchMedia;
    const originalWidth = window.innerWidth;
    window.innerWidth = 430;
    window.matchMedia = ((query: string) => ({
      // useIsMobile asks `(max-width: 767px)`; match only the narrow query.
      matches: /max-width/.test(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try {
      render(<SettingsPageShell title="Workspace" tabs={tabs} />);
      expect(
        screen.getByRole("tablist").closest("[data-view-switch]"),
      ).not.toBeNull();
      // The strip is not a filter-sheet control: no sheet exists to hold it.
      expect(screen.queryByRole("dialog")).toBeNull();
    } finally {
      window.matchMedia = original;
      window.innerWidth = originalWidth;
    }
  });

  it("renders the tab strip in the view-switch band and the selected tab as the body", () => {
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

  it("a SettingsTableBody tab content renders its rows with no nested heading, and the create + count in the body's band, bled flush out of the padded tab panel", () => {
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
    // The tab has no page header; the body's own band — bled out of the
    // panel's pad — is the home for the create action and the count caption.
    const band = container.querySelector('[data-slot="settings-table-band"]') as HTMLElement;
    expect(band?.textContent).toContain("Add channel");
    expect(band?.textContent).toContain("2 channels");
    // Flush: the band carries the explicit `-mx-5` bleed that negates the
    // tab panel's horizontal `p-5` inset, so its ruled line runs at the
    // surface edge exactly as on a standalone D2 page. Its own `px-4` is its
    // inner pad (it aligns its controls with the table cells below) — the
    // flush check is about the ANCESTORS between the band and the surface
    // edge, not the band's chrome.
    const horizontalPad = /(^|[\s-])(p|px)-\d/;
    expect(band.className).toContain("-mx-5");
    let node: Element | null = band.parentElement;
    while (node && node.getAttribute("data-slot") !== "settings-page-tab-panel") {
      if (horizontalPad.test(node.className ?? "")) throw new Error(`inset by ${node}`);
      node = node.parentElement;
    }
    // Reached the tab panel (and nothing between the band and it re-insets
    // horizontally); the panel still pads every non-bleeding tab body with
    // `p-5` — only this body bleeds out of it.
    const panel = node as Element;
    expect(panel.getAttribute("data-slot")).toBe("settings-page-tab-panel");
    expect(panel.className).toContain("p-5");
    // The bleed is on the band AND the table row wrapper (the flex row), so
    // the table's edges sit at the surface edge too.
    const rowWrapper = (
      container.querySelector('[data-slot="settings-table-region"]') as HTMLElement
    ).parentElement as HTMLElement;
    expect(rowWrapper.className).toContain("flex");
    expect(rowWrapper.className).toContain("-mx-5");
    // Flush on top too: the band is the first child of the body's outer
    // wrapper, which negates the panel's top `p-5` — so the band starts at the
    // tab strip's ruled line, not 20px below it.
    const bodyRoot = band.parentElement as HTMLElement;
    expect(bodyRoot.firstElementChild).toBe(band);
    expect(bodyRoot.className).toContain("-mt-5");
    // Between the body and the panel sits only the tab content node; it must
    // carry no top pad or border, or the negative margin would stop at it.
    const tabContent = bodyRoot.parentElement as HTMLElement;
    expect(tabContent.parentElement).toBe(panel);
    expect(tabContent.className).not.toMatch(/(^|\s)(p|pt|py)-\d|(^|\s)border/);
  });

  it("a frameless SettingsTableBody with an editPane bleeds through the row wrapper, never through the flex-1 table region", () => {
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
                editPane={
                  <form aria-label="Edit channel">
                    <input aria-label="Name" />
                  </form>
                }
              />
            ),
          },
        ]}
      />,
    );

    // The pane is present — the split-pane variation also applies to the
    // frameless body…
    const pane = screen.getByRole("form", { name: "Edit channel" }).parentElement as HTMLElement;
    expect(pane.className).toContain("md:border-l");
    // …and the bleed lands on the band and on the row wrapper (the edge
    // containers without flex siblings).
    const band = container.querySelector('[data-slot="settings-table-band"]') as HTMLElement;
    expect(band.className).toContain("-mx-5");
    const tableRegion = container.querySelector('[data-slot="settings-table-region"]') as HTMLElement;
    const rowWrapper = tableRegion.parentElement as HTMLElement;
    expect(rowWrapper.className).toContain("-mx-5");
    // …never on the table region itself: it is a `flex-1` item beside the
    // pane, and a negative margin on a flex item adds 40px of free space the
    // item absorbs — the table would grow 40px wide and paint over the pane's
    // hairline, leaving the pane's outer edge 20px short of the band's.
    expect(tableRegion.className).not.toContain("-mx-5");
    // No heading regression from the pane.
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelectorAll("h2")).toHaveLength(0);
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
    const band = container.querySelector('[data-slot="settings-table-band"]') as HTMLElement;
    expect(band.textContent).toContain("1 selected");
    expect(band.querySelectorAll("button")).toHaveLength(1);
  });

  it("a bare SettingsTableBody tab (no band-scoped controls) renders no flush band", () => {
    const { container } = render(
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
    // No toolbar, no create, no count noun, no bulk action = the body renders no
    // band node at all (not an empty ruled line). Marked by data-slot so the
    // assertion cannot be fooled: flipping `hasBandControls` to always-true would
    // render an empty band and fail here.
    expect(container.querySelector('[data-slot="settings-table-band"]')).toBeNull();
    // With no band the table row is the body's first child, and the outer
    // wrapper still bleeds through the panel's top pad.
    const rowWrapper = (container.querySelector('[data-slot="settings-table-region"]') as HTMLElement)
      .parentElement as HTMLElement;
    const bodyRoot = rowWrapper.parentElement as HTMLElement;
    expect(bodyRoot.firstElementChild).toBe(rowWrapper);
    expect(bodyRoot.className).toContain("-mt-5");
  });

  it("a falsy toolbar node (e.g. `canFilter && <Filters/>`) renders no empty band", () => {
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
                toolbar={false}
              />
            ),
          },
        ]}
      />,
    );
    expect(container.querySelector('[data-slot="settings-table-band"]')).toBeNull();
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
