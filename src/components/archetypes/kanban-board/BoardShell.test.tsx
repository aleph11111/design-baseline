import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
      <BoardShell title="B" count="3 cards" viewOptions={<div data-testid="vo" />} viewOptionsLabel="Ansicht">
        <BoardColumn title="To do" />
      </BoardShell>,
    );
    expect(screen.getByText("3 cards")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("button", { name: "Ansicht" }), { key: "Enter" });
    expect(screen.getByTestId("vo")).toBeTruthy();
  });
});

describe("BoardShell — back link", () => {
  it("renders PageFrame's back link when backHref is passed", () => {
    render(
      <BoardShell
        title="Delivery board"
        backHref="/workspace"
        backLabel="Workspace"
      >
        {null}
      </BoardShell>,
    );
    expect(screen.getByRole("link", { name: "Workspace" }).getAttribute("href")).toBe(
      "/workspace",
    );
  });

  it("renders no back link without backHref (unchanged)", () => {
    render(
      <BoardShell title="Delivery board">
        {null}
      </BoardShell>,
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("routes the back link through renderBackLink", () => {
    render(
      <BoardShell
        title="Delivery board"
        backHref="/workspace"
        renderBackLink={(href, label) => <a data-router href={href}>{label}</a>}
      >
        {null}
      </BoardShell>,
    );
    expect(screen.getByText("Back").hasAttribute("data-router")).toBe(true);
  });
});
