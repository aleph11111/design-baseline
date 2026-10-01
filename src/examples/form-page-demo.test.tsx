import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormPageDemo } from "./form-page-demo";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const cancel = () => screen.getByRole("button", { name: "Cancel" });

describe("FormPageDemo discard guard", () => {
  it("prompts on Cancel after an edit", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<FormPageDemo />);
    fireEvent.change(screen.getByPlaceholderText("Sunday Carbonara"), {
      target: { value: "Pasta" },
    });
    fireEvent.click(cancel());
    await waitFor(() => expect(confirm).toHaveBeenCalled());
  });

  it("does not prompt on an untouched form or when edited back", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<FormPageDemo />);
    const title = screen.getByPlaceholderText("Sunday Carbonara");
    fireEvent.change(title, { target: { value: "x" } });
    fireEvent.change(title, { target: { value: "" } });
    fireEvent.click(cancel());
    await waitFor(() => expect(screen.getByRole("button", { name: "New recipe" })).toBeTruthy());
    expect(confirm).not.toHaveBeenCalled();
  });

  it("clears a field error once fixed after a failed submit", async () => {
    render(<FormPageDemo />);
    const tag = screen.getByPlaceholderText("weeknight-classic");
    fireEvent.change(tag, { target: { value: "Bad Tag" } });
    fireEvent.change(screen.getByPlaceholderText("Sunday Carbonara"), {
      target: { value: "T" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await screen.findByText(/Lowercase letters/);
    fireEvent.change(tag, { target: { value: "ok-tag" } });
    await waitFor(() => expect(screen.queryByText(/Lowercase letters/)).toBeNull());
  });

  describe("edit mode", () => {
    async function openEdit() {
      render(<FormPageDemo />);
      fireEvent.click(cancel()); // create -> list (untouched, no prompt)
      fireEvent.click(await screen.findByText("Sunday Carbonara"));
      return await screen.findByDisplayValue("Sunday Carbonara");
    }

    it("prompts after a Title edit; staying keeps the form open", async () => {
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      const title = await openEdit();
      fireEvent.change(title, { target: { value: "Other" } });
      fireEvent.click(cancel());
      await waitFor(() => expect(confirm).toHaveBeenCalled());
      expect(screen.getByDisplayValue("Other")).toBeTruthy();
    });

    it("does not prompt untouched or when edited back to the original", async () => {
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      const title = await openEdit();
      fireEvent.change(title, { target: { value: "Other" } });
      fireEvent.change(title, { target: { value: "Sunday Carbonara" } });
      fireEvent.click(cancel());
      await screen.findByRole("button", { name: "New recipe" });
      expect(confirm).not.toHaveBeenCalled();
    });
  });
});
