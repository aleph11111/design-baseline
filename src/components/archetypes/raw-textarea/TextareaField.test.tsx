import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TextareaField } from "./TextareaField";

afterEach(() => {
  cleanup();
});

describe("TextareaField", () => {
  it("associates the label and describes the field with the helper line", () => {
    render(<TextareaField label="Notes" helperText="Markdown is fine." />);
    const field = screen.getByLabelText("Notes");
    const describedBy = field.getAttribute("aria-describedby") ?? "";
    expect(describedBy).not.toBe("");
    // the helper text lives at the described-by id
    expect(
      document.getElementById(describedBy.split(" ")[0]!)?.textContent
    ).toBe("Markdown is fine.");
  });

  it("error supersedes the helper line and marks the field invalid", () => {
    render(
      <TextareaField label="Config" helperText="stored raw" error="bad JSON" />
    );
    const field = screen.getByLabelText("Config");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("bad JSON")).toBeTruthy();
    expect(screen.queryByText("stored raw")).toBeNull();
  });

  it("counter colors muted → amber → destructive by fill against maxLength", () => {
    // 9/10 = 90% → warning; controlled value drives the length.
    const { rerender } = render(
      <TextareaField label="R" showCount maxLength={10} value={"x".repeat(9)} onChange={() => {}} />
    );
    expect(screen.getByText("9/10").className).toMatch(/text-amber/);
    rerender(
      <TextareaField label="R" showCount maxLength={10} value={"x".repeat(10)} onChange={() => {}} />
    );
    expect(screen.getByText("10/10").className).toMatch(/text-destructive/);
    rerender(
      <TextareaField label="R" showCount maxLength={10} value={"x"} onChange={() => {}} />
    );
    expect(screen.getByText("1/10").className).toMatch(/text-muted-foreground/);
  });

  it("tracks its own length for the counter when uncontrolled", () => {
    render(<TextareaField label="R" showCount maxLength={5} />);
    fireEvent.change(screen.getByLabelText("R"), { target: { value: "abc" } });
    expect(screen.getByText("3/5")).toBeTruthy();
  });

  it("mono disables spellcheck", () => {
    render(<TextareaField label="Config" mono />);
    expect(screen.getByLabelText("Config").getAttribute("spellcheck")).toBe("false");
  });
});
