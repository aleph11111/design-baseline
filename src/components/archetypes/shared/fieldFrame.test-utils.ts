// Shared assertion set for the labeled-field archetypes (NativeField,
// SelectField, TextareaField — plus ColorField and FileField, which compose
// the same frame). Donor-dev test harness only — not part of the baseline
// broadcast (`build-pkg.mjs` only barrels module `index.ts` files, and this
// file's vitest-import types keep the test globals out of any emitted .d.ts).
//
// The contract under test: one frame, so one a11y behavior — label
// association, `aria-invalid` on error, and `aria-describedby` naming BOTH
// the hint and the error node when both are present.

import { screen } from "@testing-library/react";
import { expect } from "vitest";

/**
 * The frame's label contract: `getByLabelText` — which resolves through either
 * association mode (htmlFor/id or aria-labelledby) — finds the control by its
 * caption, and the caption renders in the field's `Label`.
 */
export function expectLabelAssociated(
  labelText: string | RegExp,
  opts?: { required?: boolean }
): void {
  const control = screen.getByLabelText(labelText);
  expect(control).toBeTruthy();
  expect(document.querySelector("label")).toBeTruthy();
  if (opts?.required) {
    expect(document.querySelector("label")?.textContent).toContain("*");
  }
}

/**
 * The field is not in an error state: no `aria-invalid`, and — when a hint is
 * the only description — `aria-describedby` names exactly the hint id.
 */
export function expectFieldHintOnly(
  control: Element,
  hintText: string | undefined
): void {
  expect(control.hasAttribute("aria-invalid")).toBe(false);
  const describedBy = control.getAttribute("aria-describedby");
  if (hintText == null) {
    expect(describedBy).toBeNull();
    return;
  }
  // Last id described is the hint node itself.
  const hintId = describedBy!.split(" ").filter(Boolean).pop()!;
  expect(document.getElementById(hintId)?.textContent).toBe(hintText);
}

/**
 * The frame's error contract: `aria-invalid` set; `aria-describedby` names the
 * error node, which renders the error text; and — the field-frame assertion the
 * diverged copies got wrong — also the hint node, when a hint is present, so
 * both are announced with the field. Frame order is hint first, error last.
 */
export function expectFieldError(
  control: Element,
  errorText: string,
  hintText?: string
): void {
  expect(control.getAttribute("aria-invalid")).toBe("true");
  const ids = control.getAttribute("aria-describedby")!.split(" ").filter(Boolean);
  const errorId = ids[ids.length - 1]!;
  expect(document.getElementById(errorId)?.textContent).toBe(errorText);
  if (hintText != null) {
    const hintId = ids.slice(0, -1).at(-1)!;
    expect(hintId).toBeTruthy();
    expect(document.getElementById(hintId)?.textContent).toBe(hintText);
  }
}

/** The required affordance both ways: the marker span and the native/native-semantics `required`. */
export function expectRequired(
  control: Element,
  opts?: { native?: boolean }
): void {
  expect(document.querySelector("label")?.textContent).toContain("*");
  if (opts?.native) {
    // jsdom keeps native `required` on form controls.
    expect((control as HTMLInputElement).required).toBe(true);
  }
}
