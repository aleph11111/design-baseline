import * as React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ComboboxField, type ComboboxOption } from "./combobox-field";
import { expectFieldError, expectLabelAssociated } from "../shared/fieldFrame.test-utils";

// jsdom lacks the layout APIs Radix Popper and cmdk call.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(cleanup);

const OPTS: ComboboxOption[] = [
  { value: "oak", label: "Oak", group: "Hardwood" },
  { value: "ash", label: "Ash", group: "Hardwood" },
  { value: "pine", label: "Pine", group: "Softwood", keywords: ["conifer"] },
];

function Harness(props: Partial<React.ComponentProps<typeof ComboboxField>>) {
  const [value, setValue] = React.useState("");
  return (
    <ComboboxField label="Timber" value={value} onChange={setValue} options={OPTS} {...props} />
  );
}

const trigger = () => screen.getByRole("combobox", { name: "Timber" });
const search = () => screen.getByPlaceholderText("Search…");
const selectedItem = () =>
  document.querySelector('[cmdk-item][data-selected="true"]')?.textContent;

describe("ComboboxField — combobox/listbox wiring", () => {
  it("associates the label with the trigger", () => {
    render(<Harness />);
    expectLabelAssociated("Timber");
  });

  it("the trigger is a combobox whose aria-controls names the open listbox", () => {
    render(<Harness />);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger());
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    const listbox = screen.getByRole("listbox");
    expect(trigger().getAttribute("aria-controls")).toBe(listbox.id);
  });

  it("renders group headings", () => {
    render(<Harness />);
    fireEvent.click(trigger());
    expect(screen.getByText("Hardwood")).toBeTruthy();
    expect(screen.getByText("Softwood")).toBeTruthy();
  });

  it("marks the trigger invalid and announces the error", () => {
    render(<Harness error="Pick a timber." />);
    expectFieldError(trigger(), "Pick a timber.");
  });
});

describe("ComboboxField — keyboard and filtering", () => {
  it("typing filters the list, on label and keywords", () => {
    render(<Harness />);
    fireEvent.click(trigger());
    fireEvent.change(search(), { target: { value: "conif" } });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Pine"]);
    fireEvent.change(search(), { target: { value: "zzz" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No results.")).toBeTruthy();
  });

  it("never matches on the hidden value, only label and keywords", () => {
    const ids: ComboboxOption[] = [
      { value: "3fa85f64-5717-4562", label: "Rent" },
      { value: "9b1deb4d-3b7d-4bad", label: "Groceries" },
    ];
    render(<Harness options={ids} />);
    fireEvent.click(trigger());
    fireEvent.change(search(), { target: { value: "5" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    fireEvent.change(search(), { target: { value: "gro" } });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Groceries"]);
  });

  it("arrow keys move the highlight and Enter selects", () => {
    const onChange = vi.fn();
    render(<ComboboxField label="Timber" value="" onChange={onChange} options={OPTS} />);
    fireEvent.click(trigger());
    expect(selectedItem()).toBe("Oak");
    fireEvent.keyDown(search(), { key: "ArrowDown" });
    expect(selectedItem()).toBe("Ash");
    fireEvent.keyDown(search(), { key: "ArrowDown" });
    fireEvent.keyDown(search(), { key: "ArrowUp" });
    expect(selectedItem()).toBe("Ash");
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("ash");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("the trigger shows the chosen option's label", () => {
    render(<Harness />);
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("option", { name: "Pine" }));
    expect(trigger().textContent).toContain("Pine");
  });

  it("Escape closes the list", () => {
    render(<Harness />);
    fireEvent.click(trigger());
    fireEvent.keyDown(search(), { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });
});

describe("ComboboxField — async options", () => {
  it("hands every query to onSearch and shows the caller's options unfiltered", () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    fireEvent.click(trigger());
    fireEvent.change(search(), { target: { value: "zzz" } });
    expect(onSearch).toHaveBeenLastCalledWith("zzz");
    // Local filtering is off: the caller owns the result set.
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("highlights the first result once the caller's results arrive, so Enter selects it", () => {
    const onChange = vi.fn();
    const props = { label: "Timber", value: "", onChange, onSearch: () => {} };
    const { rerender } = render(<ComboboxField {...props} options={OPTS} />);
    fireEvent.click(trigger());
    fireEvent.change(search(), { target: { value: "pi" } });
    rerender(<ComboboxField {...props} options={OPTS.slice(2)} />);
    expect(selectedItem()).toBe("Pine");
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("pine");
  });

  it("shows a loading status while the caller fetches", () => {
    render(<Harness onSearch={() => {}} loading options={[]} />);
    fireEvent.click(trigger());
    expect(screen.getByRole("status").textContent).toBe("Loading…");
  });
});
