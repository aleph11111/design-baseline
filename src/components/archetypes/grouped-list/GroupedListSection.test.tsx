import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SectionCard } from "@/components/layout/SectionCard";
import { ListWithDetailShell, type ListColumn } from "../list-with-detail";
// The chrome-suppression context is exported from the shell MODULE, not the
// barrel — the composing archetype imports it directly (same as GroupedListSection).
import { ListChromeContext } from "../list-with-detail/ListWithDetailShell";

// jsdom has no matchMedia; the shell reads it (via useIsMobile) on mount.
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
// useIsMobile keys on window.innerWidth < 768; keep a stable desktop width.
window.innerWidth = 1024;

afterEach(() => {
  cleanup();
  window.innerWidth = 1024;
});

type Row = { id: string; name: string };

const rows: Row[] = [{ id: "1", name: "Ada Lovelace" }];

const columns: ListColumn<Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name, isIdentifier: true },
];

describe("GroupedListSection — chromeless composition through SurfaceFrame", () => {
  it("drops the list's outer card under ListChromeContext, keeps the body, and the section card stays bounded", () => {
    const { container } = render(
      <SectionCard title="Group" flush>
        <ListChromeContext.Provider value>
          <ListWithDetailShell
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            title="Section list"
          />
        </ListChromeContext.Provider>
      </SectionCard>,
    );

    // The section card OWNS the bounded surface — the outer card is present
    // once, on the SectionCard.
    const section = container.querySelector("section") as HTMLElement;
    expect(section).not.toBeNull();
    for (const cls of ["rounded-lg", "border", "bg-card"]) {
      expect(section.className).toContain(cls);
    }

    // The shell's root (its SurfaceFrame in chromeless mode) drops the card
    // chrome entirely — no doubled card — but the slots (header, body) keep
    // rendering inside it.
    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    const frameRoot = header!.parentElement as HTMLElement;
    expect(frameRoot.className).not.toContain("rounded-lg");
    expect(frameRoot.className).not.toContain("bg-card");
    expect(frameRoot.className).toContain("flex");
    expect(frameRoot.textContent).toContain("Ada Lovelace");

    // Exactly one bounded card in the whole composition: the section's.
    const boundedCards = Array.from(
      container.querySelectorAll<HTMLElement>("[class*='bg-card']"),
    ).filter((el) => el.className.includes("rounded-lg border"));
    expect(boundedCards).toHaveLength(1);
  });
});
