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

  it("forwards subtitle and icon through to the SurfaceHeader", () => {
    function Marker({ className }: { className?: string }) {
      return <svg data-testid="hdr-icon" className={className} />;
    }

    const { container, getByText, getByTestId } = render(
      <SurfaceHeaderSlot
        kicker="Settings"
        title="Billing"
        subtitle="Updated 2 days ago"
        icon={Marker}
      />,
    );

    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header?.contains(getByText("Updated 2 days ago"))).toBe(true);
    expect(header?.contains(getByTestId("hdr-icon"))).toBe(true);
  });

  it("renders the subtitle at the text-xs metadata scale, not the text-sm prose scale", () => {
    const { getByText } = render(
      <SurfaceHeaderSlot title="Billing" subtitle="Updated 2 days ago" />,
    );

    // Guards the PageHeader-parity decision: the header subtitle is compact
    // metadata (text-xs), matching <PageHeader>; text-sm is the prose scale.
    const el = getByText("Updated 2 days ago");
    expect(el.className).toContain("text-xs");
    expect(el.className).not.toContain("text-sm");
  });

  it("omits the subtitle element entirely when no subtitle is given", () => {
    const { container } = render(<SurfaceHeaderSlot title="Billing" />);

    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header?.querySelector("p")).toBeNull();
  });

  it("renders nothing when title is undefined", () => {
    const { container } = render(<SurfaceHeaderSlot kicker="Orders" />);

    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(container.innerHTML).toBe("");
  });
});
