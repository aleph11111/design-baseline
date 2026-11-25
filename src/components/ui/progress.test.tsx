import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Progress } from "./progress";

afterEach(cleanup);

// The wrapper must forward `value` to the Radix Root, not only to the
// Indicator transform. With the value on the Root, the progressbar announces
// its value to assistive tech (aria-valuenow) and leaves indeterminate mode
// (data-state=loading). Dropping value again silently resurrects the
// data-state=indeterminate, valueless progressbar this ticket pins.
const bar = () => screen.getByRole("progressbar");

describe("Progress forwards value to the Radix Root", () => {
  it("announces the value and leaves indeterminate mode", () => {
    render(<Progress aria-label="Progress" value={40} />);
    const el = bar();
    expect(el.getAttribute("data-state")).toBe("loading");
    expect(el.getAttribute("aria-valuenow")).toBe("40");
  });

  it("still renders indeterminate when no value is given", () => {
    render(<Progress aria-label="Progress" />);
    const el = bar();
    expect(el.getAttribute("data-state")).toBe("indeterminate");
    expect(el.hasAttribute("aria-valuenow")).toBe(false);
  });
});
