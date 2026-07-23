import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Field } from "./Field";

afterEach(() => {
  cleanup();
});

/** Field's value-add over a raw <label>+control is the automatic wiring; test it. */
describe("Field", () => {
  it("wires label htmlFor to the control id", () => {
    const { getByText, getByRole } = render(
      <Field label="Name">{(props) => <input type="text" {...props} />}</Field>,
    );
    const control = getByRole("textbox");
    const label = getByText("Name").closest("label")!;
    expect(control.id).toBeTruthy();
    expect(label.getAttribute("for")).toBe(control.id);
  });

  it("composes aria-describedby from description + error and sets aria-invalid on error", () => {
    const { getByRole } = render(
      <Field label="Email" description="We never share it." error="Required">
        {(props) => <input type="text" {...props} />}
      </Field>,
    );
    const control = getByRole("textbox");
    const describedBy = control.getAttribute("aria-describedby")!.split(" ");
    expect(describedBy).toHaveLength(2); // description id + error id
    expect(control.getAttribute("aria-invalid")).toBe("true");
  });

  it("omits aria-invalid and error id when there is no error", () => {
    const { getByRole } = render(
      <Field label="Email" description="Optional.">
        {(props) => <input type="text" {...props} />}
      </Field>,
    );
    const control = getByRole("textbox");
    expect(control.getAttribute("aria-invalid")).toBeNull();
    expect(control.getAttribute("aria-describedby")).not.toContain("error");
  });

  it("renders a required marker when required", () => {
    const { getByText } = render(
      <Field label="Title" required>
        {(props) => <input type="text" {...props} />}
      </Field>,
    );
    expect(getByText("*")).toBeTruthy();
  });
});
