import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ToggleField } from "./toggle-field";

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

  it("names the switch by its joined label", () => {
    render(<ToggleField label="Status">Active only</ToggleField>);
    expect(screen.getByRole("switch", { name: "Status" })).toBeTruthy();
  });
});
