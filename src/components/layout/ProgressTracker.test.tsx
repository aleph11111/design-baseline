import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ProgressTracker, type ProgressStep } from "./ProgressTracker";

afterEach(() => {
  cleanup();
});

const steps: ProgressStep[] = [
  { label: "Ordered", state: "done" },
  { label: "Packed", state: "current" },
  { label: "Shipped", state: "pending" },
];

describe("ProgressTracker", () => {
  it("marks the current step with aria-current=step", () => {
    render(<ProgressTracker steps={steps} />);
    const current = screen.getByText("Packed").closest("li");
    expect(current?.getAttribute("aria-current")).toBe("step");
  });

  it("does not mark done/pending steps as aria-current", () => {
    render(<ProgressTracker steps={steps} />);
    expect(screen.getByText("Ordered").closest("li")?.getAttribute("aria-current")).toBeNull();
    expect(screen.getByText("Shipped").closest("li")?.getAttribute("aria-current")).toBeNull();
  });

  it("announces each step's state as text, independent of color", () => {
    render(<ProgressTracker steps={steps} />);
    expect(screen.getByText("Ordered").closest("li")?.textContent).toMatch(/completed/i);
    expect(screen.getByText("Packed").closest("li")?.textContent).toMatch(/current/i);
    expect(screen.getByText("Shipped").closest("li")?.textContent).toMatch(/upcoming/i);
  });
});
