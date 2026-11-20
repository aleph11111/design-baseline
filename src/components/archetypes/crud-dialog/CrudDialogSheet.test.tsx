import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { CrudDialogSheet } from "./CrudDialogSheet";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function sheetStyle(width?: "sm" | "md" | "lg" | "xl"): CSSStyleDeclaration {
  render(
    <CrudDialogSheet open onOpenChange={() => {}} width={width}>
      <div>body</div>
    </CrudDialogSheet>,
  );
  return (document.querySelector("[role='dialog']") as HTMLElement).style;
}

describe("CrudDialogSheet — desktop width steps", () => {
  it.each([
    ["sm", "22rem"],
    ["md", "30rem"],
    ["lg", "40rem"],
    ["xl", "54rem"],
  ] as const)("width=%s renders at %s", (width, rem) => {
    const style = sheetStyle(width);
    expect(style.width).toBe(rem);
    expect(style.maxWidth).toBe("100vw");
  });

  it("defaults to md", () => {
    expect(sheetStyle().width).toBe("30rem");
  });
});

describe("CrudDialogSheet — mobile", () => {
  it("is full-viewport at xl (no inline width)", () => {
    vi.stubGlobal("innerWidth", 500);
    vi.stubGlobal("matchMedia", () => ({
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    expect(sheetStyle("xl").width).toBe("");
  });
});
