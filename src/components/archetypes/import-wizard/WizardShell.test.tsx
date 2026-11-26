import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { WizardShell } from "./WizardShell";
import { type WizardStep } from "./WizardStepper";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../ui/dialog";

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

describe("WizardShell hideNext (footer forward action hidden on one step)", () => {
  // WizardShell forwards `steps` to WizardPanel, so the per-step flag flows through.
  const midHide: WizardStep[] = [
    { key: "upload", label: "Upload" },
    { key: "map", label: "Map fields", hideNext: true },
    { key: "commit", label: "Commit" },
  ];
  const lastHide: WizardStep[] = [
    { key: "upload", label: "Upload" },
    { key: "map", label: "Map fields" },
    { key: "commit", label: "Commit", hideNext: true },
  ];

  it("a middle step with hideNext renders no Next, keeps an enabled Back", () => {
    renderShell({ steps: midHide, current: 1 });
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(back().disabled).toBe(false);
  });

  it("the last step with hideNext renders no Commit, keeps an enabled Back", () => {
    renderShell({ steps: lastHide, current: 2 });
    expect(screen.queryByRole("button", { name: "Commit import" })).toBeNull();
    expect(back().disabled).toBe(false);
  });

  it("a hideNext on one step leaves the other steps' forward action intact", () => {
    // midHide sets hideNext on step 1; step 2 (last) is untouched.
    renderShell({ steps: midHide, current: 2 });
    expect(commit()).toBeTruthy();
  });

  it("hideNext on the first step: no Next, Back stays disabled (the shell wires no onFirstBack)", () => {
    const firstHide: WizardStep[] = [
      { key: "upload", label: "Upload", hideNext: true },
      { key: "map", label: "Map fields" },
      { key: "commit", label: "Commit" },
    ];
    renderShell({ steps: firstHide, current: 0 });
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(back().disabled).toBe(true);
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

describe("WizardShell view slots (history toggle + View menu)", () => {
  const slots = {
    viewSwitch: <div role="tablist" aria-label="Import view">New import · History</div>,
    viewOptions: <div>Show decimals</div>,
    viewOptionsLabel: "Display",
  };

  it("renders viewSwitch and the View menu in the stepper state", () => {
    renderShell({ ...slots });
    expect(screen.getByRole("tablist", { name: "Import view" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Display" })).toBeTruthy();
    expect(next()).toBeTruthy();
  });

  it("keeps viewSwitch and the View menu in the done state", () => {
    renderShell({ ...slots, done: <p>All imported</p> });
    expect(screen.getByRole("tablist", { name: "Import view" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Display" })).toBeTruthy();
    expect(screen.getByText("All imported")).toBeTruthy();
  });
});

describe("WizardShell hosted in a Dialog (ADR-0008: dialogs are not pages)", () => {
  it("leaves the DialogTitle as the one heading — no page h1, title not repeated", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Import members</DialogTitle>
          <DialogDescription>From a CSV file</DialogDescription>
          <WizardShell title="Import members" steps={steps} current={0}>
            <div>step body</div>
          </WizardShell>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByRole("heading").map((h) => h.textContent)).toEqual(["Import members", "Upload"]);
    expect(screen.getAllByText("Import members")).toHaveLength(1);
    expect(screen.getByText("step body")).toBeTruthy();
    expect(next()).toBeTruthy();
  });

  it("keeps the page heading when route-hosted", () => {
    renderShell();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Import members");
  });
});
