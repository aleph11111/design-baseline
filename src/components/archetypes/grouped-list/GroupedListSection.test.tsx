import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { GroupedListShell } from "./GroupedListShell";
import { GroupedListSection } from "./GroupedListSection";
import type { ListColumn } from "../list-with-detail";

// jsdom has no matchMedia; the list body reads it (via useIsMobile) on mount.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

type Row = { id: string; name: string };
const rows: Row[] = [{ id: "1", name: "Ada Lovelace" }];
const columns: ListColumn<Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name, isIdentifier: true },
];

describe("GroupedListSection inside the page frame", () => {
  it("each group is its own bordered, rounded card in a stack body (ADR-0015)", () => {
    const { container, getByText } = render(
      <GroupedListShell title="People">
        <GroupedListSection title="Group A" rows={rows} columns={columns} getRowId={(r) => r.id} />
        <GroupedListSection title="Group B" rows={rows} columns={columns} getRowId={(r) => r.id} />
      </GroupedListShell>,
    );
    expect(container.querySelector("[data-page-body='stack']")).not.toBeNull();
    const cards = container.querySelectorAll("[data-page-body='stack'] > section");
    expect(cards).toHaveLength(2);
    cards.forEach((c) => {
      expect(c.className).toMatch(/\bborder\b/);
      expect(c.className).toContain("rounded-lg");
    });
    expect(getByText("Group A")).toBeTruthy();
    expect(getByText("Group B")).toBeTruthy();
    // The section body is the frameless list — no page header, no second h1.
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelectorAll("table")).toHaveLength(2);
  });
});
