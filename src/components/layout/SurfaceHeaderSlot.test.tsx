import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SurfaceHeaderSlot } from "./SurfaceHeaderSlot";

afterEach(() => {
  cleanup();
});

describe("SurfaceHeaderSlot", () => {
  it("renders a SurfaceHeader when title is set", () => {
    const { container, getByText } = render(
      <SurfaceHeaderSlot kicker="Orders" title="Order #1024" />,
    );

    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    expect(header?.contains(getByText("Orders"))).toBe(true);
    expect(header?.contains(getByText("Order #1024"))).toBe(true);
  });

  it("renders nothing when title is undefined", () => {
    const { container } = render(<SurfaceHeaderSlot kicker="Orders" />);

    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(container.innerHTML).toBe("");
  });
});
