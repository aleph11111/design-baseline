import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SelectField, type SelectOption } from "./select-field";

afterEach(() => {
  cleanup();
});

const OPTS: SelectOption[] = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];

describe("SelectField — labeled enum field with a11y wiring", () => {
  it("associates the label with the control (aria-labelledby, not visual proximity)", () => {
    render(
      <SelectField label="Complexity" value="" onChange={() => {}} options={OPTS} />,
    );
    // getByLabelText resolves the trigger only if aria-labelledby is wired.
    const trigger = screen.getByLabelText("Complexity");
    expect(trigger).toBeTruthy();
  });

  it("marks the control invalid and announces the error via aria-describedby", () => {
    render(
      <SelectField
        label="Complexity"
        value=""
        onChange={() => {}}
        options={OPTS}
        error="Pick one."
      />,
    );
    const trigger = screen.getByLabelText("Complexity");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    const describedBy = trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy!.split(" ").pop()!);
    expect(errorEl?.textContent).toBe("Pick one.");
  });

  it("associates a hint with the control", () => {
    render(
      <SelectField
        label="Complexity"
        value=""
        onChange={() => {}}
        options={OPTS}
        hint="Roughly how long a game runs."
      />,
    );
    const describedBy = screen.getByLabelText("Complexity").getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)?.textContent).toBe("Roughly how long a game runs.");
  });

  it("renders a required marker and marks the control required", () => {
    render(
      <SelectField label="Complexity" value="" onChange={() => {}} options={OPTS} required />,
    );
    expect(screen.getByText("*")).toBeTruthy();
    // The aria-hidden "*" marker is naively joined into the accessible name by
    // testing-library's textContent-based query (real browsers honor aria-hidden),
    // so match by regex here.
    expect(screen.getByLabelText(/Complexity/).getAttribute("aria-required")).toBe("true");
  });
});
