import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ToggleField } from "@/components/ui/toggle-field";
import { ToolbarBandContext } from "@/components/ui/toolbar-band";

afterEach(cleanup);

describe("ToggleField", () => {
  it("toggles and sits on the ladder step, not h-6", () => {
    function T({ size }: { size?: "sm" | "lg" }) {
      const [on, setOn] = React.useState(false);
      return (
        <ToggleField size={size} checked={on} onCheckedChange={setOn}>
          Show inactive
        </ToggleField>
      );
    }
    const { rerender } = render(<T />);
    const box = screen.getByRole("switch");
    expect(box.className).toContain("h-9");
    expect(box.className).not.toContain("h-6");
    expect(box.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(box);
    expect(box.getAttribute("aria-checked")).toBe("true");
    rerender(<T size="lg" />);
    expect(screen.getByRole("switch").className).toContain("h-11");
  });

  it("joins the label in a band, stacks it outside", () => {
    const { container, rerender } = render(
      <ToolbarBandContext.Provider value>
        <ToggleField label="Status">Active only</ToggleField>
      </ToolbarBandContext.Provider>,
    );
    expect(screen.getByRole("switch", { name: "Status Active only" })).toBeTruthy();
    expect(container.querySelector("[data-joined-label]")).not.toBeNull();
    rerender(<ToggleField label="Status">Active only</ToggleField>);
    expect(screen.getByRole("switch", { name: "Status Active only" })).toBeTruthy();
    expect(container.querySelector("[data-joined-label]")).toBeNull();
  });
});
