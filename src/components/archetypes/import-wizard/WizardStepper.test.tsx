import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { WizardStepper, type WizardStep } from "./WizardStepper";

afterEach(() => {
  cleanup();
});

const steps: WizardStep[] = [
  { key: "upload", label: "Upload" },
  { key: "map", label: "Map fields" },
  { key: "review", label: "Review" },
];

describe("WizardStepper", () => {
  it("marks the current step with aria-current=step", () => {
    render(<WizardStepper steps={steps} current={1} />);
    const current = screen.getByText("Map fields").closest("li");
    expect(current?.getAttribute("aria-current")).toBe("step");
  });

  it("does not mark done/upcoming steps as aria-current", () => {
    render(<WizardStepper steps={steps} current={1} />);
    expect(screen.getByText("Upload").closest("li")?.getAttribute("aria-current")).toBeNull();
    expect(screen.getByText("Review").closest("li")?.getAttribute("aria-current")).toBeNull();
  });

  it("announces each step's state as text, independent of color", () => {
    render(<WizardStepper steps={steps} current={1} />);
    expect(screen.getByText("Upload").closest("li")?.textContent).toMatch(/completed/i);
    expect(screen.getByText("Map fields").closest("li")?.textContent).toMatch(/current/i);
    expect(screen.getByText("Review").closest("li")?.textContent).toMatch(/upcoming/i);
  });
});
