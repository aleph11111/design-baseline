import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Sheet, SheetContent } from "../../ui/sheet";
import { CrudDialogHeader, type CrudDialogHeaderProps } from "./CrudDialogHeader";

afterEach(() => {
  cleanup();
});

/** Renders the header inside a real (open) Sheet so the Radix Title /
 *  Description binding — the reason this header exists — is exercised. */
function renderHeader(props: CrudDialogHeaderProps) {
  return render(
    <Sheet open>
      <SheetContent side="right" showCloseButton={false}>
        <CrudDialogHeader {...props} />
        <div>dialog body</div>
      </SheetContent>
    </Sheet>,
  );
}

describe("CrudDialogHeader — the shared bar chrome", () => {
  it("renders the sticky band as the shared surface bar (one implementation)", () => {
    renderHeader({ title: "Workout · Run" });

    const bar = document.querySelector('[data-slot="surface-header"]');
    expect(bar).not.toBeNull();
    // the bar owns the canonical padding + the dialog's shrink-0 stickiness
    expect(bar?.className).toContain("px-5");
    expect(bar?.className).toContain("py-4");
    expect(bar?.className).toContain("shrink-0");
  });

  it("exposes the Sheet a real accessible name + description (the Radix binding)", () => {
    renderHeader({ title: "Workout · Run", subtitle: "2026-05-19" });

    const content = document.querySelector(
      "[role='dialog']",
    ) as HTMLElement;
    const labelledBy = content.getAttribute("aria-labelledby");
    const describedBy = content.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    // the live title element IS the SheetTitle (h2), the description the
    // SheetDescription (p) — Radix owns the ids, this header owns the content
    expect(
      document.getElementById(labelledBy!)?.textContent,
    ).toContain("Workout");
    expect(document.getElementById(describedBy!)?.textContent).toBe(
      "2026-05-19",
    );
  });

  it("always renders a SheetDescription so aria-describedby never dangles (no subtitle case)", () => {
    renderHeader({ title: "New Workout" });

    const content = document.querySelector(
      "[role='dialog']",
    ) as HTMLElement;
    const describedBy = content.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    // the empty screen-reader-only description keeps the reference live
    expect(
      document.getElementById(describedBy!)?.className.includes("sr-only"),
    ).toBe(true);
  });

  it("renders the subtitle through a description element the bar's _p inversion reaches", () => {
    renderHeader({ title: "Workout · Run", subtitle: "2026-05-19" });

    const sub = document.getElementById(
      (document.querySelector(
        "[role='dialog']",
      ) as HTMLElement).getAttribute("aria-describedby")!,
    );
    expect(sub?.tagName).toBe("P");
    expect(sub?.className).toContain("mt-0.5");
    expect(sub?.className).toContain("truncate");
  });

  it("keeps the explicit close button in the actions row next to the actions slot", () => {
    renderHeader({
      title: "Workout · Run",
      actions: <button type="button">Edit</button>,
      onClose: () => {},
    });

    const bar = document.querySelector(
      '[data-slot="surface-header"]',
    ) as HTMLElement;
    expect(bar.textContent).toContain("Edit");
    // the explicit close button is labeled (aria-label), not captioned
    expect(bar.querySelector('[aria-label="Close"]')).not.toBeNull();
  });

  it("omits the actions row when neither actions nor onClose is given", () => {
    renderHeader({ title: "Workout · Run" });

    const bar = document.querySelector(
      '[data-slot="surface-header"]',
    ) as HTMLElement;
    // only the title block — no empty right-side row
    expect(bar.children).toHaveLength(1);
  });
});

describe("CrudDialogHeader — the one neutral bar treatment", () => {
  it("renders the fixed neutral bar: no accent fill, no inversion", () => {
    renderHeader({
      title: "Workout · Run",
      subtitle: "2026-05-19",
    });

    const bar = document.querySelector(
      '[data-slot="surface-header"]',
    ) as HTMLElement;
    // the bar's treatment is SurfaceHeaderBar's; this header adds no classes
    expect(bar.className).toContain("bg-surface-raised");
    expect(bar.className).toContain("border-b");
    expect(bar.className).not.toContain("bg-primary");
  });
});
