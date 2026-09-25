import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("CrudDialogFooter", () => {
  it("renders an explicit submittingLabel verbatim instead of mangling primaryLabel", () => {
    render(
      <CrudDialogFooter
        primaryLabel="Speichern"
        isSubmitting
        submittingLabel="Speichern…"
      />,
    );

    expect(screen.getByRole("button", { name: "Speichern…" })).toBeDefined();
    expect(screen.queryByText("Speicherning…")).toBeNull();
  });

  it("falls back to the English derivation when submittingLabel is omitted", () => {
    render(<CrudDialogFooter primaryLabel="Save" isSubmitting />);

    expect(screen.getByRole("button", { name: "Saving…" })).toBeDefined();
  });
});

describe("CrudDialogFooter — button `type` attributes", () => {
  it("renders destructive and secondary as type=\"button\" and the primary as type=\"button\" when onPrimary is supplied", () => {
    render(
      <CrudDialogFooter
        primaryLabel="Save"
        onPrimary={vi.fn()}
        secondaryLabel="Cancel"
        onSecondary={vi.fn()}
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
      />,
    );

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Delete" }).type,
    ).toBe("button");
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Cancel" }).type,
    ).toBe("button");
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Save" }).type,
    ).toBe("button");
  });

  it("does not submit the surrounding <form> when the destructive button is clicked", () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) =>
      e.preventDefault(),
    );

    render(
      <form onSubmit={onSubmit}>
        <CrudDialogFooter
          primaryLabel="Save"
          onPrimary={vi.fn()}
          secondaryLabel="Cancel"
          onSecondary={vi.fn()}
          destructiveLabel="Delete"
          onDestructive={vi.fn()}
        />
      </form>,
    );

    fireEvent.click(
      screen.getByRole<HTMLButtonElement>("button", { name: "Delete" }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("CrudDialogFooter — destructiveDisabled static gate", () => {
  it("disables the destructive button without a spinner when destructiveDisabled", () => {
    render(
      <CrudDialogFooter
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
        destructiveDisabled
      />,
    );

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: "Delete",
    });
    expect(button.disabled).toBe(true);
    expect(button.querySelector("svg")).toBeNull();
  });

  it("keeps isDeleting's spinner independent of destructiveDisabled", () => {
    render(
      <CrudDialogFooter
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
        destructiveDisabled={false}
        isDeleting
      />,
    );

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: "Delete",
    });
    expect(button.disabled).toBe(true);
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("leaves the destructive button enabled when neither flag is set", () => {
    render(
      <CrudDialogFooter destructiveLabel="Delete" onDestructive={vi.fn()} />,
    );

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Delete" }).disabled,
    ).toBe(false);
  });
});
