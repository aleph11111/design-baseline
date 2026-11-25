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

describe("WizardPanel hideNext (footer forward action hidden on one step)", () => {
  const midHide: WizardStep[] = [
    { key: "a", label: "Upload" },
    { key: "b", label: "Map", hideNext: true },
    { key: "c", label: "Commit" },
  ];
  const lastHide: WizardStep[] = [
    { key: "a", label: "Upload" },
    { key: "b", label: "Map" },
    { key: "c", label: "Commit", hideNext: true },
  ];

  it("a middle step with hideNext renders no Next, keeps an enabled Back", () => {
    renderPanel({ steps: midHide, current: 1 });
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Commit import" })).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Back" }).disabled).toBe(false);
  });

  it("the last step with hideNext renders no Commit, keeps an enabled Back", () => {
    renderPanel({ steps: lastHide, current: 2 });
    expect(screen.queryByRole("button", { name: "Commit import" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Back" }).disabled).toBe(false);
  });

  it("hideNext on the first step coexists with onFirstBack (exit visible, no Next)", () => {
    const onFirstBack = vi.fn();
    const firstHide: WizardStep[] = [
      { key: "a", label: "Upload", hideNext: true },
      { key: "b", label: "Map" },
      { key: "c", label: "Commit" },
    ];
    renderPanel({ steps: firstHide, current: 0, onFirstBack, firstBackLabel: "Cancel" });
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Cancel" }).disabled).toBe(false);
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onFirstBack).toHaveBeenCalledTimes(1);
  });

  it("a hideNext on one step leaves the other steps' forward action intact", () => {
    // midHide sets hideNext on step 1; step 2 (last) is untouched.
    renderPanel({ steps: midHide, current: 2 });
    expect(screen.getByRole("button", { name: "Commit import" })).toBeTruthy();
  });
});
