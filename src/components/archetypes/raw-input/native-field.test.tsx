import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NativeField } from "./native-field";
import {
  expectFieldError,
  expectFieldHintOnly,
  expectLabelAssociated,
  expectRequired,
} from "../shared/fieldFrame.test-utils";

afterEach(() => {
  cleanup();
});

describe("NativeField — labeled native field with a11y wiring", () => {
  it("associates the label with the control", () => {
    render(<NativeField label="Batch name" value="Saison" onChange={() => {}} />);
    // getByLabelText resolves only if htmlFor/id are wired.
    expectLabelAssociated("Batch name");
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
    expectFieldError(screen.getByLabelText("Batch name"), "Required.");
  });

  it("associates a hint with the control", () => {
    render(<NativeField label="Gravity" value="1.05" onChange={() => {}} hint="Pre-ferment." />);
    expectFieldHintOnly(
      screen.getByLabelText("Gravity"),
      "Pre-ferment.",
    );
  });

  it("co-renders the hint with the error — both named by aria-describedby", () => {
    render(
      <NativeField
        label="Batch name"
        value=""
        onChange={() => {}}
        hint="Shown on the fermenter tag."
        error="Required."
      />,
    );
    const input = screen.getByLabelText("Batch name");
    // The frame's contract: same coexistence rule as SelectField/TextareaField —
    // the error never suppresses the hint, and both nodes are described.
    expect(screen.getByText("Shown on the fermenter tag.")).toBeTruthy();
    expect(screen.getByText("Required.")).toBeTruthy();
    expectFieldError(input, "Required.", "Shown on the fermenter tag.");
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

  it("forwards onBlur so a field can commit on blur, not per keystroke", () => {
    const onBlur = vi.fn();
    render(<NativeField label="Threshold" value="0.9" onChange={() => {}} onBlur={onBlur} />);
    const input = screen.getByLabelText("Threshold");
    fireEvent.change(input, { target: { value: "0.8" } });
    expect(onBlur).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("forwards onKeyDown for Enter-to-submit", () => {
    const onKeyDown = vi.fn();
    render(<NativeField label="Email" value="" onChange={() => {}} onKeyDown={onKeyDown} />);
    fireEvent.keyDown(screen.getByLabelText("Email"), { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: "Enter" }));
  });

  it("sets native maxLength on the input and on the textarea", () => {
    render(<NativeField label="Code" value="" onChange={() => {}} maxLength={6} />);
    expect((screen.getByLabelText("Code") as HTMLInputElement).maxLength).toBe(6);
    render(<NativeField label="Notes" multiline value="" onChange={() => {}} maxLength={255} />);
    expect((screen.getByLabelText("Notes") as HTMLTextAreaElement).maxLength).toBe(255);
  });

  it("renders a text prefix and pads the control clear of it", () => {
    render(<NativeField label="Unit price" value="1.50" onChange={() => {}} prefix="EUR" />);
    expect(screen.getByText("EUR")).toBeTruthy();
    // Padding scales with the prefix length, so the caller never guesses a pl-* class.
    // jsdom may reorder the calc() operands, so assert on both terms, not the string.
    const padding = (screen.getByLabelText("Unit price") as HTMLInputElement).style.paddingLeft;
    expect(padding).toContain("3ch");
    expect(padding).toContain("1.25rem");
  });

  it("sets native required alongside the visual marker", () => {
    render(<NativeField label="Batch name" required value="" onChange={() => {}} />);
    // The marker is naively joined into the label's textContent (real browsers
    // honor aria-hidden), so match by substring here.
    expectLabelAssociated(/Batch name/, { required: true });
    expectRequired(screen.getByLabelText(/Batch name/), { native: true });
  });

  it("applies labelClassName and controlClassName to the label and control", () => {
    render(
      <NativeField
        label="Batch name"
        value=""
        onChange={() => {}}
        labelClassName="text-xs text-muted-foreground"
        controlClassName="h-8 text-sm"
      />,
    );
    const input = screen.getByLabelText("Batch name");
    expect(input.className).toContain("h-8 text-sm");
    expect(screen.getByText("Batch name").className).toContain("text-xs text-muted-foreground");
  });
});
