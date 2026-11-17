import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StructureBuilderDemo } from "./structure-builder-demo";

afterEach(cleanup);

const placeButtons = () => screen.getAllByRole("button").filter((b) => b.hasAttribute("data-place-id"));

describe("StructureBuilderDemo — keyboard placement focus", () => {
  it("moves focus to the next palette place button, never body", () => {
    render(<StructureBuilderDemo />);
    const [first, second] = placeButtons();
    first!.focus();
    fireEvent.click(first!);
    expect(document.activeElement).toBe(second);
  });

  it("focuses the previous item when the last is placed, and the tree line when the palette empties", () => {
    render(<StructureBuilderDemo />);
    while (placeButtons().length > 1) {
      const b = placeButtons();
      fireEvent.click(b[b.length - 1]!);
      expect(document.activeElement).toBe(placeButtons().at(-1));
    }
    const lastId = placeButtons()[0]!.getAttribute("data-place-id")!;
    fireEvent.click(placeButtons()[0]!);
    expect(document.activeElement).toBe(document.querySelector(`[data-node-id="${lastId}"]`));
  });
});
