import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NativeField } from "./native-field";

afterEach(() => {
  cleanup();
});

describe("NativeField — labeled native field with a11y wiring", () => {
  it("associates the label with the control", () => {
    render(<NativeField label="Batch name" value="Saison" onChange={() => {}} />);
    // getByLabelText resolves only if htmlFor/id are wired.
    const input = screen.getByLabelText("Batch name") as HTMLInputElement;
    expect(input.value).toBe("Saison");
  });

  it("emits the control's raw string value", () => {
    const onChange = vi.fn();
    render(<NativeField label="Batch name" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Batch name"), { target: { value: "IPA" } });
    expect(onChange).toHaveBeenCalledWith("IPA");
  });

  it("marks the control invalid and announces the error via aria-describedby", () => {
    render(
      <NativeField label="Batch name" value="" onChange={() => {}} error="Required." />,
    );
    const input = screen.getByLabelText("Batch name");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy!.split(" ").pop()!);
    expect(errorEl?.textContent).toBe("Required.");
  });

  it("associates a hint with the control", () => {
    render(<NativeField label="Gravity" value="1.05" onChange={() => {}} hint="Pre-ferment." />);
    const input = screen.getByLabelText("Gravity");
    const describedBy = input.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)?.textContent).toBe("Pre-ferment.");
  });

  it("renders a textarea when multiline is set", () => {
    render(<NativeField label="Notes" multiline value="hazy" onChange={() => {}} />);
    const control = screen.getByLabelText("Notes");
    expect(control.tagName).toBe("TEXTAREA");
  });

  it("renders a range slider with a live value readout", () => {
    render(
      <NativeField label="Temp" type="range" min={0} max={30} value={20} onChange={() => {}} />,
    );
    const input = screen.getByLabelText("Temp") as HTMLInputElement;
    expect(input.type).toBe("range");
    expect(screen.getByText("20")).toBeTruthy();
  });

  it("sets native required alongside the visual marker", () => {
    render(<NativeField label="Batch name" required value="" onChange={() => {}} />);
    // Required renders a "*" marker, so the label textContent is "Batch name*".
    expect(
      (screen.getByLabelText("Batch name", { exact: false }) as HTMLInputElement).required,
    ).toBe(true);
  });
});
