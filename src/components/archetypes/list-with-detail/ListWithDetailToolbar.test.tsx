import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ListWithDetailToolbar } from "./ListWithDetailToolbar";

afterEach(() => cleanup());

// The toolbar holds scoping controls only (ADR-0008 §2): the result count is
// the shell's `count`, the create action the shell's `actions`.
describe("ListWithDetailToolbar", () => {
  it("renders search, filters and quick filters — and nothing else", () => {
    const { container } = render(
      <ListWithDetailToolbar
        searchValue="co"
        onSearchChange={() => {}}
        searchPlaceholder="Search people…"
        filters={<button type="button">Status</button>}
        quickFilters={<button type="button">Mine</button>}
      />,
    );
    expect(screen.getByRole("searchbox", { name: "Search people" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Status" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mine" })).toBeTruthy();
    expect(container.textContent).not.toMatch(/result/);
  });
});
