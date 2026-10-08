import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Input } from "./input";

afterEach(() => {
  cleanup();
});

function renderInput(props: React.ComponentProps<typeof Input> = {}) {
  render(<Input aria-label="Field" {...props} />);
  return screen.getByRole("textbox", { name: "Field" });
}

function classSet(el: HTMLElement) {
  return new Set(el.className.split(/\s+/).filter(Boolean));
}

describe("Input size ladder", () => {
  it("renders the h-9 base text at the default size", () => {
    const classes = classSet(renderInput());
    expect(classes).toContain("h-9");
    expect(classes).toContain("text-base");
    expect(classes).toContain("md:text-sm");
  });

  it("renders the compact h-8 / text-xs step at sm", () => {
    const classes = classSet(renderInput({ size: "sm" }));
    expect(classes).toContain("h-8");
    expect(classes).toContain("text-xs");
    expect(classes).toContain("md:text-xs");
  });

  it("pairs the h-8 height with 14px text at sm14", () => {
    const classes = classSet(renderInput({ size: "sm14" }));
    expect(classes).toContain("h-8");
    expect(classes).toContain("text-sm");
    expect(classes).toContain("md:text-sm");
    expect(classes).not.toContain("text-base");
    expect(classes).not.toContain("text-xs");
  });

  it("pairs the h-11 touch height with 16px text at lg", () => {
    const classes = classSet(renderInput({ size: "lg" }));
    expect(classes).toContain("h-11");
    expect(classes).toContain("text-base");
    expect(classes).toContain("md:text-base");
  });

  it("pairs the h-11 touch height with 18px text at lg18", () => {
    const classes = classSet(renderInput({ size: "lg18" }));
    expect(classes).toContain("h-11");
    expect(classes).toContain("text-lg");
    expect(classes).toContain("md:text-lg");
    expect(classes).not.toContain("text-base");
  });

  it("lets a caller className win over the step height", () => {
    const classes = classSet(renderInput({ size: "lg18", className: "h-7" }));
    expect(classes).toContain("h-7");
    expect(classes).not.toContain("h-11");
  });
});
