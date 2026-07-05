import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { CalendarShell } from "./CalendarShell";

afterEach(() => {
  cleanup();
});

describe("CalendarShell", () => {
  it("renders its header through the shared SurfaceHeader", () => {
    const { container, getByText } = render(
      <CalendarShell
        kicker="Schedule"
        title="June 2026 · Week 26"
        days={[{ id: "mon", dow: "Mo", date: "22", events: [] }]}
      />,
    );

    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    expect(header?.contains(getByText("Schedule"))).toBe(true);
    expect(header?.contains(getByText("June 2026 · Week 26"))).toBe(true);
  });
});
