import { act } from "react";
import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SegmentedControl } from "./segmented-control";

afterEach(() => {
  cleanup();
});

function ControlledSegmentedControl() {
  const [value, setValue] = React.useState<"day" | "week" | "month">("week");
  return (
    <SegmentedControl
      aria-label="Time range"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
      ]}
    />
  );
}

// Radix defers the actual arrow-driven focus move to a timeout so it can tell
// keyboard-driven focus apart from mouse/programmatic focus; hold the key
// down long enough for that to flush before releasing it.
async function pressArrow(key: "ArrowLeft" | "ArrowRight") {
  const active = document.activeElement as HTMLElement;
  fireEvent.keyDown(active, { key });
  await new Promise((resolve) => setTimeout(resolve, 0));
  fireEvent.keyUp(active, { key });
}

describe("SegmentedControl — radiogroup roving tabindex + arrow keys", () => {
  it("is a single tab stop: the group wraps focus, no radio starts tabbable", () => {
    render(<ControlledSegmentedControl />);
    const group = screen.getByRole<HTMLDivElement>("radiogroup");
    const day = screen.getByRole<HTMLButtonElement>("radio", { name: "Day" });
    const week = screen.getByRole<HTMLButtonElement>("radio", {
      name: "Week",
    });
    const month = screen.getByRole<HTMLButtonElement>("radio", {
      name: "Month",
    });

    expect(group.tabIndex).toBe(0);
    expect(day.tabIndex).toBe(-1);
    expect(week.tabIndex).toBe(-1);
    expect(month.tabIndex).toBe(-1);
  });

  it("moving focus onto an option makes it the roving tab stop", () => {
    render(<ControlledSegmentedControl />);
    const day = screen.getByRole<HTMLButtonElement>("radio", { name: "Day" });
    const week = screen.getByRole<HTMLButtonElement>("radio", {
      name: "Week",
    });

    act(() => {
      day.focus();
    });

    expect(day.tabIndex).toBe(0);
    expect(week.tabIndex).toBe(-1);
  });

  it("moves focus and selection with ArrowRight/ArrowLeft", async () => {
    render(<ControlledSegmentedControl />);
    const day = screen.getByRole<HTMLButtonElement>("radio", { name: "Day" });
    const week = screen.getByRole<HTMLButtonElement>("radio", {
      name: "Week",
    });
    const month = screen.getByRole<HTMLButtonElement>("radio", {
      name: "Month",
    });

    act(() => {
      week.focus();
    });

    await pressArrow("ArrowRight");
    expect(document.activeElement).toBe(month);
    expect(month.getAttribute("aria-checked")).toBe("true");

    await pressArrow("ArrowLeft");
    expect(document.activeElement).toBe(week);
    expect(week.getAttribute("aria-checked")).toBe("true");

    await pressArrow("ArrowLeft");
    expect(document.activeElement).toBe(day);
    expect(day.getAttribute("aria-checked")).toBe("true");
  });
});
