import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SettingsTableDemo } from "./settings-table-demo";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// The seed recipes: Pasta Carbonara, Chicken Tikka Masala, Sushi Rolls,
// Tacos al Pastor, Crème Brûlée. Each row checkbox is named after the
// identifier (name) column — "Select row: {name}".
const search = () => screen.getByPlaceholderText("Search recipes…");

// #423 wires Layer 10: every destructive delete is confirmed through the
// shared ConfirmationDialog — the bulk button opens it, the dialog's
// "Delete" (confirmText) button fires the confirm callback.
const confirmBulkDelete = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Delete selected" }));
  const confirm = await screen.findByRole("button", { name: "Delete" });
  fireEvent.click(confirm);
};

describe("SettingsTableDemo filter-safe bulk selection", () => {
  it("with 3 rows ticked, typing a query matching 1 of them shows '1 selected'", () => {
    render(<SettingsTableDemo />);

    const carbonara = screen.getByRole("checkbox", { name: "Select row: Pasta Carbonara" });
    const tikka = screen.getByRole("checkbox", { name: "Select row: Chicken Tikka Masala" });
    const sushi = screen.getByRole("checkbox", { name: "Select row: Sushi Rolls" });
    fireEvent.click(carbonara);
    fireEvent.click(tikka);
    fireEvent.click(sushi);
    // All five rows are visible -> 3 selected.
    expect(screen.getByText("3 selected")).toBeTruthy();

    // "carbona" hides the other four; only Pasta Carbonara stays visible.
    fireEvent.change(search(), { target: { value: "carbona" } });
    expect(screen.getByText("1 selected")).toBeTruthy();
    // The hidden ticked rows are gone from the table.
    expect(screen.queryByRole("checkbox", { name: "Select row: Chicken Tikka Masala" })).toBeNull();
    expect(screen.queryByText("Sushi Rolls")).toBeNull();
  });

  it("delete selected after filtering removes only the visible ticked row", async () => {
    render(<SettingsTableDemo />);

    const carbonara = screen.getByRole("checkbox", { name: "Select row: Pasta Carbonara" });
    const tikka = screen.getByRole("checkbox", { name: "Select row: Chicken Tikka Masala" });
    fireEvent.click(carbonara);
    fireEvent.click(tikka);
    expect(screen.getByText("2 selected")).toBeTruthy();

    // "tikka" hides Pasta Carbonara; only Chicken Tikka Masala is visible.
    fireEvent.change(search(), { target: { value: "tikka" } });
    expect(screen.getByText("1 selected")).toBeTruthy();

    // The demo's bulk button uses the FILTERED candidate set (not raw
    // selectedIds) — even though 2 rows were ticked, only the one visible
    // row (tikka) is in the candidate set, so the dialog reads "Delete
    // Chicken Tikka Masala?".
    await confirmBulkDelete();

    // After confirm, only tikka is deleted.
    expect(screen.getByText(/Deleted: Chicken Tikka Masala/)).toBeTruthy();

    // Clear the filter: carbonara returns (hidden at delete time, its id was
    // NOT in the candidate set), tikka is gone.
    fireEvent.change(search(), { target: { value: "" } });
    expect(screen.getByRole("checkbox", { name: "Select row: Pasta Carbonara" })).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Select row: Chicken Tikka Masala" })).toBeNull();
  });

  it("exposes a per-row accessible name containing that row's name", () => {
    render(<SettingsTableDemo />);
    expect(screen.getByRole("checkbox", { name: "Select row: Crème Brûlée" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Select row: Tacos al Pastor" })).toBeTruthy();
  });
});
