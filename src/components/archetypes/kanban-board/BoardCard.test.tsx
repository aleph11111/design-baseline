import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach } from "vitest";
import { BoardCard } from "./BoardCard";

afterEach(() => {
  cleanup();
});

describe("BoardCard", () => {
  it("forwards the ref to the root element (DnD consumers attach the draggable here)", () => {
    const ref = createRef<HTMLDivElement>();
    render(<BoardCard ref={ref}>Draggable</BoardCard>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("spreads the consumer's DnD attributes onto the root", () => {
    const { container } = render(<BoardCard draggable />);
    expect((container.firstChild as HTMLElement)?.getAttribute("draggable")).toBe(
      "true",
    );
  });
});
