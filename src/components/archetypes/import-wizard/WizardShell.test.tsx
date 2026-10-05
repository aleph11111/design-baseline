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
    <WizardShell title="Import members" steps={steps} current={0} {...props}>
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

describe("WizardShell page frame", () => {
  it("renders the title once, as the page h1, with no on-surface title", () => {
    const { container } = renderShell({ subtitle: "From CSV" });
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toBe("Import members");
    expect(screen.getAllByText("Import members")).toHaveLength(1);
    expect(screen.getByText("From CSV")).toBeTruthy();
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });

  it("flattens the step section inside the frame (no card-in-card)", () => {
    renderShell({ current: 1 });
    const section = screen.getByText("step body").closest("section");
    expect(section).not.toBeNull();
    expect(section?.className).not.toContain("bg-surface-raised");
  });
});

describe("WizardShell done state", () => {
  it("keeps the page h1 and drops the wizard chrome", () => {
    renderShell({ done: <p>All imported</p> });
    expect(screen.getByRole("heading", { level: 1, name: "Import members" })).toBeTruthy();
    expect(screen.getByText("All imported")).toBeTruthy();
    expect(screen.queryByText("step body")).toBeNull();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });
});
