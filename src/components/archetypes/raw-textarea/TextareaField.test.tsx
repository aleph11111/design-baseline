import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TextareaField } from "./TextareaField";
import {
  expectFieldError,
  expectFieldHintOnly,
  expectLabelAssociated,
  expectRequired,
} from "../shared/fieldFrame.test-utils";

afterEach(() => {
  cleanup();
});

describe("TextareaField", () => {
  it("associates the label and describes the field with the hint", () => {
    render(<TextareaField label="Notes" hint="Markdown is fine." />);
    expectLabelAssociated("Notes");
    expectFieldHintOnly(screen.getByLabelText("Notes"), "Markdown is fine.");
  });

  it("accepts the deprecated helperText alias for hint", () => {
    render(
      <TextareaField label="Notes" helperText="Markdown is fine." />,
    );
    expectFieldHintOnly(
      screen.getByLabelText("Notes"),
      "Markdown is fine.",
    );
  });

  it("co-renders the hint with the error — both named by aria-describedby, and marks the field invalid", () => {
    render(
      <TextareaField
        label="Config"
        hint="stored raw"
        error="bad JSON"
      />
    );
    const field = screen.getByLabelText("Config");
    // Same coexistence rule as every other field: the error no longer
    // suppresses the hint, and both nodes are described.
    expect(screen.getByText("stored raw")).toBeTruthy();
    expectFieldError(field, "bad JSON", "stored raw");
  });

  it("counter colors muted → amber → destructive by fill against maxLength", () => {
    // 9/10 = 90% → warning; controlled value drives the length.
    const { rerender } = render(
      <TextareaField label="R" maxLength={10} value={"x".repeat(9)} onChange={() => {}} />
    );
    expect(screen.getByText("9/10").className).toMatch(/text-amber/);
    rerender(
      <TextareaField label="R" maxLength={10} value={"x".repeat(10)} onChange={() => {}} />
    );
    expect(screen.getByText("10/10").className).toMatch(/text-destructive/);
    rerender(
      <TextareaField label="R" maxLength={10} value={"x"} onChange={() => {}} />
    );
    expect(screen.getByText("1/10").className).toMatch(/text-muted-foreground/);
  });

  it("tracks its own length for the counter when uncontrolled", () => {
    render(<TextareaField label="R" maxLength={5} />);
    fireEvent.change(screen.getByLabelText("R"), { target: { value: "abc" } });
    expect(screen.getByText("3/5")).toBeTruthy();
  });

  it("mono disables spellcheck", () => {
    render(<TextareaField label="Config" mono />);
    expect(screen.getByLabelText("Config").getAttribute("spellcheck")).toBe("false");
  });

  it("renders the required marker (frame affordance) and the native attribute", () => {
    render(<TextareaField label="Notes" required />);
    // TextareaField previously had no required affordance — the frame provides it.
    // The marker is naively joined into the label's textContent (real browsers
    // honor aria-hidden), so match by substring + the "*" here.
    expectLabelAssociated(/Notes/, { required: true });
    expectRequired(screen.getByLabelText(/Notes/), { native: true });
  });

  it("forwards the ref to the underlying textarea element", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextareaField label="Notes" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
