import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WizardShell } from "./WizardShell";
import { type WizardStep } from "./WizardStepper";

afterEach(() => {
  cleanup();
});

const steps: WizardStep[] = [
  { key: "upload", label: "Upload" },
  { key: "map", label: "Map fields" },
  { key: "commit", label: "Commit" },
];

function renderShell(props: Partial<React.ComponentProps<typeof WizardShell>> = {}) {
  return render(
    <WizardShell steps={steps} current={0} {...props}>
      <div>step body</div>
    </WizardShell>,
  );
}

const back = () => screen.getByRole<HTMLButtonElement>("button", { name: "Back" });
const next = () => screen.getByRole<HTMLButtonElement>("button", { name: "Next" });
const commit = () => screen.getByRole<HTMLButtonElement>("button", { name: "Commit import" });

describe("WizardShell navigation boundaries", () => {
  it("disables Back on the first step", () => {
    renderShell({ current: 0 });
    expect(back().disabled).toBe(true);
  });

  it("enables Back past the first step and calls onBack", () => {
    const onBack = vi.fn();
    renderShell({ current: 1, onBack });
    expect(back().disabled).toBe(false);
    fireEvent.click(back());
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders Next (not Commit) on an intermediate step and calls onNext", () => {
    const onNext = vi.fn();
    renderShell({ current: 1, onNext });
    expect(screen.queryByRole("button", { name: "Commit import" })).toBeNull();
    fireEvent.click(next());
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("renders Commit (not Next) on the last step and calls onCommit", () => {
    const onCommit = vi.fn();
    renderShell({ current: steps.length - 1, onCommit });
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    fireEvent.click(commit());
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});

describe("WizardShell footer state", () => {
  it("disables both footer buttons and relabels Commit while busy", () => {
    renderShell({ current: steps.length - 1, busy: true });
    expect(back().disabled).toBe(true);
    const forward = screen.getByRole<HTMLButtonElement>("button", { name: "Importing…" });
    expect(forward.disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Commit import" })).toBeNull();
  });

  it("disables Next while busy on an intermediate step", () => {
    renderShell({ current: 1, busy: true });
    expect(back().disabled).toBe(true);
    expect(next().disabled).toBe(true);
  });

  it("disables the forward action when canProceed=false, with busy=false", () => {
    renderShell({ current: 1, canProceed: false });
    expect(next().disabled).toBe(true);
    expect(back().disabled).toBe(false);
  });

  it("disables Commit when canProceed=false, keeping the Commit label", () => {
    renderShell({ current: steps.length - 1, canProceed: false });
    expect(commit().disabled).toBe(true);
  });
});

describe("WizardShell surface wrapper", () => {
  it("renders the board-form wrapper with an on-surface header when title is set", () => {
    const { container } = renderShell({ title: "Import members", kicker: "Members" });
    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    expect(header?.textContent).toContain("Import members");
    expect(header?.textContent).toContain("Members");
  });

  it("renders the plain wrapper when title is omitted", () => {
    const { container } = renderShell();
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });
});
