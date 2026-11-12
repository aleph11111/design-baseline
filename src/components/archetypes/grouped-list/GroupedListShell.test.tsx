import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { GroupedListShell } from "./GroupedListShell";
import { SectionCard } from "../../layout/SectionCard";

afterEach(() => {
  cleanup();
});

describe("GroupedListShell — page frame (ADR-0008)", () => {
  it("renders one h1, no on-surface title; actions in the header, toolbar in the band", () => {
    const { container } = render(
      <GroupedListShell
        title="Products"
        actions={<button type="button">Add product</button>}
        toolbar={<input aria-label="Search" />}
      >
        <SectionCard title="Group">section</SectionCard>
      </GroupedListShell>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Products")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Add product" }).closest(".bg-surface-raised")).toBeNull();
    // The band rides on the first card (ADR-0015), not a shared surface.
    const card = container.querySelector("[data-page-body='stack'] > section") as HTMLElement;
    expect(card.contains(screen.getByRole("textbox", { name: "Search" }))).toBe(true);
  });

  it("keeps the toolbar band when every child renders nothing", () => {
    render(
      <GroupedListShell title="Products" toolbar={<input aria-label="Search" />}>
        {[null, false]}
      </GroupedListShell>,
    );
    expect(screen.getByRole("textbox", { name: "Search" })).toBeTruthy();
  });

  it("renders the empty state inside one bordered card", () => {
    const { container } = render(<GroupedListShell title="Products" isEmpty emptyMessage="Nothing here" />);
    const cards = container.querySelectorAll("[data-page-body='stack'] > section");
    expect(cards).toHaveLength(1);
    expect(cards[0]!.className).toMatch(/\bborder\b/);
    expect(cards[0]!.textContent).toContain("Nothing here");
  });
});

describe("GroupedListShell — back link", () => {
  it("renders PageFrame's back link when backHref is passed", () => {
    render(
      <GroupedListShell
        title="Products"
        backHref="/workspace"
        backLabel="Workspace"
      />,
    );
    expect(screen.getByRole("link", { name: "Workspace" }).getAttribute("href")).toBe(
      "/workspace",
    );
  });

  it("renders no back link without backHref (unchanged)", () => {
    render(<GroupedListShell title="Products" />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("routes the back link through renderBackLink", () => {
    render(
      <GroupedListShell
        title="Products"
        backHref="/workspace"
        renderBackLink={(href, label) => <a data-router href={href}>{label}</a>}
      />,
    );
    expect(screen.getByText("Back").hasAttribute("data-router")).toBe(true);
  });
});
