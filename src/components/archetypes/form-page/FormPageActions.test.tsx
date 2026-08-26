import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FormPageActions } from "./FormPageActions";

afterEach(() => {
  cleanup();
});

describe("FormPageActions — button group through the shared core", () => {
  it("renders destructive, secondary, and primary in edit mode", () => {
    render(
      <FormPageActions
        mode="edit"
        primaryLabel="Save"
        onPrimary={vi.fn()}
        secondaryLabel="Cancel"
        onSecondary={vi.fn()}
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
  });

  it("hides the destructive button in create mode", () => {
    render(
      <FormPageActions
        mode="create"
        primaryLabel="Create"
        onPrimary={vi.fn()}
        secondaryLabel="Cancel"
        onSecondary={vi.fn()}
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("hides the destructive button when canDelete is false", () => {
    render(
      <FormPageActions
        mode="edit"
        primaryLabel="Save"
        onPrimary={vi.fn()}
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
        canDelete={false}
      />,
    );

    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });
});

describe("FormPageActions — submitting label through the shared core", () => {
  it("renders an explicit submittingLabel verbatim instead of mangling primaryLabel", () => {
    render(
      <FormPageActions
        mode="edit"
        primaryLabel="Speichern"
        onPrimary={vi.fn()}
        isSubmitting
        submittingLabel="Speichern…"
      />,
    );

    expect(screen.getByRole("button", { name: "Speichern…" })).toBeDefined();
    expect(screen.queryByText("Speicherning…")).toBeNull();
  });

  it("falls back to the English derivation when submittingLabel is omitted", () => {
    render(
      <FormPageActions
        mode="create"
        primaryLabel="Create"
        onPrimary={vi.fn()}
        isSubmitting
      />,
    );

    expect(screen.getByRole("button", { name: "Creating…" })).toBeDefined();
  });
});

describe("FormPageActions — delete in-flight freezes the footer", () => {
  it("disables secondary and primary while isDeleting (form-page semantics)", () => {
    render(
      <FormPageActions
        mode="edit"
        primaryLabel="Save"
        onPrimary={vi.fn()}
        secondaryLabel="Cancel"
        onSecondary={vi.fn()}
        destructiveLabel="Delete"
        onDestructive={vi.fn()}
        isDeleting
      />,
    );

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Cancel" }).disabled,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Save" }).disabled,
    ).toBe(true);
  });
});

describe("FormPageActions — button `type` attributes", () => {
  it("renders destructive and secondary as type=\"button\" and the primary as type=\"button\" when onPrimary is supplied", () => {
    render(
      <FormPageActions
        mode="edit"
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

  it("renders the primary as type=\"submit\" and submits the surrounding <form> when onPrimary is omitted", () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) =>
      e.preventDefault(),
    );

    render(
      <form onSubmit={onSubmit}>
        <FormPageActions
          mode="create"
          primaryLabel="Create"
          secondaryLabel="Cancel"
          onSecondary={vi.fn()}
        />
      </form>,
    );

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Create" }).type,
    ).toBe("submit");
    fireEvent.click(screen.getByRole<HTMLButtonElement>("button", {
      name: "Create",
    }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
