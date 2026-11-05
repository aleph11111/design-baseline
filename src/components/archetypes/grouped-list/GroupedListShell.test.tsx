import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { GroupedListShell } from "./GroupedListShell";

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
        <div>section</div>
      </GroupedListShell>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Products")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Add product" }).closest(".bg-surface-raised")).toBeNull();
    const surface = container.querySelector(".bg-surface-raised") as HTMLElement;
    expect(surface.contains(screen.getByRole("textbox", { name: "Search" }))).toBe(true);
    expect(surface.textContent).toContain("section");
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
