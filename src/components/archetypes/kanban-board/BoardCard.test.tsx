import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach } from "vitest";
import { BoardCard } from "./BoardCard";
import { BoardColumn } from "./BoardColumn";
import { BoardShell } from "./BoardShell";
import { SectionCard } from "../../layout/SectionCard";
import { PageFrame } from "../../layout/PageFrame";

afterEach(() => {
  cleanup();
});

describe("BoardCard", () => {
  it("forwards the ref to the root element (DnD consumers attach the draggable here)", () => {
    const ref = createRef<HTMLDivElement>();
    render(<BoardCard ref={ref}>Draggable</BoardCard>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is a raised card on the canvas: border, raised fill, rounded-lg", () => {
    const { container } = render(<BoardCard>Card</BoardCard>);
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).toMatch(/\bborder\b/);
    expect(cls).toContain("bg-surface-raised");
    expect(cls).toContain("rounded-lg");
  });

  it("spreads the consumer's DnD attributes onto the root", () => {
    const { container } = render(<BoardCard draggable />);
    expect((container.firstChild as HTMLElement)?.getAttribute("draggable")).toBe(
      "true",
    );
  });

  // ADR-0015 rule 2: a sunken lane starts a fresh surface, so a card on it
  // keeps its raised chrome even when the whole board is nested in another
  // raised surface — that is not card-in-card.
  it.each([
    ["an untitled SectionCard", (b: React.ReactNode) => <SectionCard>{b}</SectionCard>],
    ["a titled SectionCard (host-titled)", (b: React.ReactNode) => <SectionCard title="Host">{b}</SectionCard>],
    ["a parent PageFrame (nested)", (b: React.ReactNode) => <PageFrame title="Parent">{b}</PageFrame>],
  ])("keeps border + raised fill inside %s", (_, wrap) => {
    const { getByText } = render(
      wrap(
        <BoardShell title="Board">
          <BoardColumn title="Lane">
            <BoardCard>Nested card</BoardCard>
          </BoardColumn>
        </BoardShell>,
      ),
    );
    const cls = getByText("Nested card").className;
    expect(cls).toMatch(/\bborder\b/);
    expect(cls).toContain("bg-surface-raised");
  });
});
