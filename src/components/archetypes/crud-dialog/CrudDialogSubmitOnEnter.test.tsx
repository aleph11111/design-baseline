import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CrudDialogSubmitOnEnter } from "./CrudDialogSubmitOnEnter";

afterEach(cleanup);

it("is a hidden, untabbable submit control that disables with the in-flight flag", () => {
  const { rerender } = render(
    <form>
      <CrudDialogSubmitOnEnter />
    </form>,
  );
  const button = screen.getByRole("button", { hidden: true });
  expect(button).toHaveProperty("type", "submit");
  expect(button.getAttribute("tabindex")).toBe("-1");
  expect(button).toHaveProperty("disabled", false);
  rerender(
    <form>
      <CrudDialogSubmitOnEnter disabled />
    </form>,
  );
  expect(button).toHaveProperty("disabled", true);
});
