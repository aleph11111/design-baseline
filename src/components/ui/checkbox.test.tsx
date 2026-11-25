import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Checkbox } from "./checkbox";

afterEach(cleanup);

// jsdom does not resolve CSS: Tailwind utilities there are inert class names, so a
// test can't read "which icon is on screen". What IS readable is the mechanism the
// component uses to toggle the indicators off the root's data-state, and that is
// what a component test should pin:
//   - each icon is the one shown iff no token hidden it in this state, and
//   - `hidden` vs `group-data-[state=indeterminate]:hidden` are distinct classList
//     tokens (a standalone `hidden` hides everywhere; the variant hides only
//     while indeterminate; `...:block` re-shows the Minus in that state).
// Identifying an icon by its `path d` (below) is robust to lucide's internal
// class-naming (`lucide-minus`); the tokens themselves are the contract.
const CHECK_D = "M20 6 9 17l-5-5";
const MINUS_D = "M5 12h14";
const svgByPath = (d: string) =>
  (Array.from(document.querySelectorAll<SVGElement>("svg")).find((s) =>
    s.querySelector(`path[d="${d}"]`)
  ) ?? null);
const tokens = (el: SVGElement) => el.classList;
const checkbox = () => screen.getByRole("checkbox");

describe("Checkbox indicator icon by state", () => {
  it("shows only the check mark for checked={true}", () => {
    render(<Checkbox aria-label="Select" checked />);
    expect(checkbox().getAttribute("data-state")).toBe("checked");
    const check = svgByPath(CHECK_D);
    const minus = svgByPath(MINUS_D);
    expect(check).toBeTruthy();
    expect(minus).toBeTruthy();
    // Non-indeterminate: the Check carries no standalone `hidden`, so it shows;
    // the Minus is gated behind `hidden` and only un-hidden while indeterminate.
    expect(tokens(check!).contains("hidden")).toBe(false);
    expect(tokens(minus!).contains("hidden")).toBe(true);
  });

  it("shows the Minus icon, not the check mark, for checked='indeterminate'", () => {
    render(<Checkbox aria-label="Select" checked="indeterminate" />);
    expect(checkbox().getAttribute("data-state")).toBe("indeterminate");
    const check = svgByPath(CHECK_D);
    const minus = svgByPath(MINUS_D);
    expect(check).toBeTruthy();
    expect(minus).toBeTruthy();
    // In this state the Check is hidden and the Minus re-shown:
    expect(tokens(check!).contains("group-data-[state=indeterminate]:hidden")).toBe(true);
    expect(tokens(minus!).contains("group-data-[state=indeterminate]:block")).toBe(true);
    // and the Check must still be the one *not* re-shown:
    expect(tokens(check!).contains("group-data-[state=indeterminate]:block")).toBe(false);
    expect(tokens(minus!).contains("group-data-[state=indeterminate]:hidden")).toBe(false);
  });

  it("shows no icon for checked={false}", () => {
    render(<Checkbox aria-label="Select" checked={false} />);
    expect(checkbox().getAttribute("data-state")).toBe("unchecked");
    // The Indicator is unmounted entirely when nothing is checked.
    expect(svgByPath(CHECK_D)).toBeNull();
    expect(svgByPath(MINUS_D)).toBeNull();
  });
});
