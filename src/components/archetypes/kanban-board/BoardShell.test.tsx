import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BoardShell } from "./BoardShell";
import { BoardColumn } from "./BoardColumn";

afterEach(cleanup);

describe("BoardShell — page frame (ADR-0008)", () => {
  it("renders one h1, no on-surface title, actions in the header and the toolbar in the band", () => {
    const { container } = render(
      <BoardShell
        title="Delivery board"
        actions={<button>Add card</button>}
        toolbar={<input aria-label="Search cards" />}
      >
        <BoardColumn title="To do" />
      </BoardShell>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Delivery board")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Add card" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("To do");
    // One raised surface: the lane is recessed, not a card.
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
  });
});

describe("BoardShell — viewOptions", () => {
  it("forwards viewOptions, label and count to the toolbar band", () => {
    render(
      <BoardShell title="B" count="3 cards" viewOptions={<div />} viewOptionsLabel="Ansicht">
        <BoardColumn title="To do" />
      </BoardShell>,
    );
    expect(screen.getByText("3 cards")).toBeTruthy();
    expect(screen.getByText("Ansicht")).toBeTruthy();
  });
});
