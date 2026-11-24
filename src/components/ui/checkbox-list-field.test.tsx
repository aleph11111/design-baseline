import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CheckboxListField } from "./checkbox-list-field";

afterEach(cleanup);

const OPTIONS = [
  { value: "a", label: "Alpha", badge: "3" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

describe("CheckboxListField", () => {
  it("ticking adds and unticking removes, keeping options order", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CheckboxListField label="Members" options={OPTIONS} value={["c"]} onChange={onChange} />
    );
    fireEvent.click(screen.getByLabelText("Alpha"));
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"]);
    rerender(
      <CheckboxListField label="Members" options={OPTIONS} value={["a", "c"]} onChange={onChange} />
    );
    fireEvent.click(screen.getByLabelText("Gamma"));
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
  });

  it("renders the badge in its row and names the group by its label", () => {
    render(<CheckboxListField label="Members" options={OPTIONS} value={[]} onChange={() => {}} />);
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByRole("group", { name: "Members" })).toBeTruthy();
  });

  it("is uncapped by default and capped only with `scroll`", () => {
    const { rerender } = render(
      <CheckboxListField label="M" options={OPTIONS} value={[]} onChange={() => {}} />
    );
    expect(screen.getByRole("group").className).not.toContain("overflow-y-auto");
    rerender(<CheckboxListField label="M" options={OPTIONS} value={[]} onChange={() => {}} scroll />);
    expect(screen.getByRole("group").className).toContain("overflow-y-auto");
  });

  it("links hint/error and flags the group invalid", () => {
    render(
      <CheckboxListField label="M" options={OPTIONS} value={[]} onChange={() => {}} error="Pick one" hint="Any" />
    );
    const g = screen.getByRole("group");
    expect(g.getAttribute("aria-invalid")).toBe("true");
    expect(g.getAttribute("aria-describedby")).toContain("-error");
    expect(screen.getByText("Pick one")).toBeTruthy();
  });

  it("keeps selected values that have no option when toggling", () => {
    const onChange = vi.fn();
    render(<CheckboxListField label="M" options={OPTIONS} value={["gone", "a"]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Beta"));
    expect(onChange).toHaveBeenLastCalledWith(["a", "b", "gone"]);
  });

  it("puts the id on the group", () => {
    render(<CheckboxListField id="members" label="M" options={OPTIONS} value={[]} onChange={() => {}} />);
    expect(screen.getByRole("group").id).toBe("members");
  });
});
