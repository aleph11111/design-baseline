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

    // Clear the filter: the prune effect dropped carbonara from the selection
    // when the query was "tikka" (its row was hidden), so it is back but
    // UNTICKED — the user never re-selected it, and the caption is back to the
    // result count (nothing selected). tikka is gone for good.
    fireEvent.change(search(), { target: { value: "" } });
    const carbonaraAfter = screen.getByRole("checkbox", { name: "Select row: Pasta Carbonara" });
    expect(carbonaraAfter.getAttribute("data-state")).not.toBe("checked");
    expect(screen.queryByRole("checkbox", { name: "Select row: Chicken Tikka Masala" })).toBeNull();
  });

  it("clearing a query unticks the rows it had hidden (selection does not outlive the filter)", () => {
    render(<SettingsTableDemo />);

    const carbonara = screen.getByRole("checkbox", { name: "Select row: Pasta Carbonara" });
    const tikka = screen.getByRole("checkbox", { name: "Select row: Chicken Tikka Masala" });
    const sushi = screen.getByRole("checkbox", { name: "Select row: Sushi Rolls" });
    fireEvent.click(carbonara);
    fireEvent.click(tikka);
    fireEvent.click(sushi);
    expect(screen.getByText("3 selected")).toBeTruthy();

    // "carbo" hides everything except Pasta Carbonara.
    fireEvent.change(search(), { target: { value: "carbo" } });
    expect(screen.getByText("1 selected")).toBeTruthy();

    // Clear the query WITHOUT touching any checkbox: the pruned selection holds
    // only Pasta Carbonara. Tikka and Sushi are ticked again in the table, but
    // they must NOT be selected — they were dropped when the filter hid them.
    fireEvent.change(search(), { target: { value: "" } });
    expect(screen.getByText("1 selected")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Select row: Pasta Carbonara" }).getAttribute("data-state")).toBe("checked");
    expect(screen.getByRole("checkbox", { name: "Select row: Chicken Tikka Masala" }).getAttribute("data-state")).not.toBe("checked");
    expect(screen.getByRole("checkbox", { name: "Select row: Sushi Rolls" }).getAttribute("data-state")).not.toBe("checked");
  });

  it("exposes a per-row accessible name containing that row's name", () => {
    render(<SettingsTableDemo />);
    expect(screen.getByRole("checkbox", { name: "Select row: Crème Brûlée" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Select row: Tacos al Pastor" })).toBeTruthy();
  });
});
