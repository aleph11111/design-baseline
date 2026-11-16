import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WizardPanel } from "./WizardPanel";
import { type WizardStep } from "./WizardStepper";

afterEach(cleanup);

const steps: WizardStep[] = [
  { key: "a", label: "Upload" },
  { key: "b", label: "Commit" },
];

function renderPanel(props: Partial<React.ComponentProps<typeof WizardPanel>> = {}) {
  return render(
    <WizardPanel steps={steps} current={0} {...props}>
      <div>body</div>
    </WizardPanel>,
  );
}

describe("WizardPanel", () => {
  it("renders no heading", () => {
    renderPanel();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("first step: onFirstBack renders an enabled firstBackLabel button", () => {
    const onFirstBack = vi.fn();
    renderPanel({ onFirstBack, firstBackLabel: "Cancel" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onFirstBack).toHaveBeenCalledTimes(1);
  });

  it("first step without onFirstBack: Back disabled", () => {
    renderPanel();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Back" }).disabled).toBe(true);
  });

  it("busy disables the footer and shows the commit spinner label on the last step", () => {
    renderPanel({ current: 1, busy: true });
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Back" }).disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Importing…" }).disabled).toBe(true);
  });

  it("last step shows Commit, not Next", () => {
    renderPanel({ current: 1 });
    expect(screen.getByRole("button", { name: "Commit import" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });
});
