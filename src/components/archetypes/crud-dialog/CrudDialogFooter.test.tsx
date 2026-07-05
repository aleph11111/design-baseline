import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CrudDialogFooter } from "./CrudDialogFooter";

afterEach(() => {
  cleanup();
});

describe("CrudDialogFooter — destructive button in-flight state", () => {
  it("disables the destructive button while isSubmitting", () => {
    render(
      <CrudDialogFooter
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
        isSubmitting
      />,
    );

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: "Delete",
    });
    expect(button.disabled).toBe(true);
  });

  it("disables the destructive button while isDeleting", () => {
    render(
      <CrudDialogFooter
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
        isDeleting
      />,
    );

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: "Delete",
    });
    expect(button.disabled).toBe(true);
  });

  it("renders a spinner on the destructive button while isDeleting", () => {
    render(
      <CrudDialogFooter
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
        isDeleting
      />,
    );

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: "Delete",
    });
    expect(button.querySelector(".animate-spin")).not.toBeNull();
  });

  it("leaves the destructive button enabled and spinner-free by default", () => {
    render(
      <CrudDialogFooter destructiveLabel="Delete" onDestructive={vi.fn()} />,
    );

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: "Delete",
    });
    expect(button.disabled).toBe(false);
    expect(button.querySelector(".animate-spin")).toBeNull();
  });
});
