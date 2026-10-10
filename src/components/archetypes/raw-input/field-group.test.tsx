import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FieldGroup } from "./field-group";

afterEach(() => {
  cleanup();
});

describe("FieldGroup — captioned group of controls", () => {
  it("names the group by its legend, not a stray <label>", () => {
    render(
      <FieldGroup label="Hops" required>
        <input type="checkbox" aria-label="Citra" />
      </FieldGroup>
    );
    const group = screen.getByRole("group", { name: /Hops/ });
    expect(group.tagName).toBe("FIELDSET");
    expect(group.querySelector("legend")?.textContent).toBe("Hops*");
    expect(document.querySelector("label")).toBeNull();
  });

  it("links hint then error via aria-describedby", () => {
    render(
      <FieldGroup label="Hops" hint="Pick any." error="Pick one.">
        <input type="checkbox" aria-label="Citra" />
      </FieldGroup>
    );
    const ids = screen.getByRole("group").getAttribute("aria-describedby")!.split(" ");
    expect(ids.map((i) => document.getElementById(i)?.textContent)).toEqual(["Pick any.", "Pick one."]);
  });

  it("disables every child natively", () => {
    render(
      <FieldGroup label="Hops" disabled>
        <input type="checkbox" aria-label="Citra" />
      </FieldGroup>
    );
    expect((screen.getByLabelText("Citra") as HTMLInputElement).matches(":disabled")).toBe(true);
  });
});
