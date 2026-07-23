import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ColorField } from "./color-field";

afterEach(() => {
  cleanup();
});

describe("ColorField — swatch + hex share one value", () => {
  it("shows the hex value verbatim but falls back to #000000 for the native swatch when invalid", () => {
    render(<ColorField label="Brand" value="#ab" onChange={() => {}} />);
    const swatch = screen.getByLabelText("Brand") as HTMLInputElement;
    const hex = screen.getByLabelText("Brand hex value") as HTMLInputElement;
    // Mid-edit value stays in the hex field…
    expect(hex.value).toBe("#ab");
    // …but the color input never receives a non-#rrggbb string (would warn).
    expect(swatch.value).toBe("#000000");
  });

  it("emits raw text from the hex field and a valid hex from the swatch", () => {
    const onChange = vi.fn();
    render(<ColorField label="Brand" value="#ffffff" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Brand hex value"), {
      target: { value: "#abc123" },
    });
    fireEvent.change(screen.getByLabelText("Brand"), {
      target: { value: "#112233" },
    });
    expect(onChange).toHaveBeenNthCalledWith(1, "#abc123");
    expect(onChange).toHaveBeenNthCalledWith(2, "#112233");
  });

  it("hideHex drops the text input", () => {
    render(<ColorField label="Brand" value="#ffffff" onChange={() => {}} hideHex />);
    expect(screen.queryByLabelText("Brand hex value")).toBeNull();
  });
});
