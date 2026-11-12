import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { BoardColumn } from "./BoardColumn";

afterEach(() => {
  cleanup();
});

describe("BoardColumn", () => {
  it("forwards the ref to the root element (DnD consumers attach the droppable here)", () => {
    const ref = createRef<HTMLDivElement>();
    render(<BoardColumn ref={ref} title="To do" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is an unbordered sunken grouping region, not a raised card", () => {
    const { container } = render(<BoardColumn title="To do" />);
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).toContain("bg-surface-sunken");
    expect(cls).not.toMatch(/\bborder\b|bg-surface-raised/);
  });

  it("keeps the dashed empty drop zone", () => {
    render(<BoardColumn title="To do" empty emptyContent="Drop here" />);
    expect(screen.getByTestId("board-column-empty").className).toContain("border-dashed");
  });

  it("renders the title and count in the header", () => {
    render(<BoardColumn title="To do" count={2} />);
    expect(screen.getByText("To do")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });
});
