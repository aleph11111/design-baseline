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

  it("renders the title and count in the header", () => {
    render(<BoardColumn title="To do" count={2} />);
    expect(screen.getByText("To do")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });
});
