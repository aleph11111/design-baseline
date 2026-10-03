import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FormPageShell, type FormPageShellProps } from "./FormPageShell";

afterEach(() => {
  cleanup();
});

describe("FormPageShell — one page frame (ADR-0008)", () => {
  it("renders the title once, as the page h1, with no on-surface title", () => {
    const { container } = render(
      <FormPageShell title="New order" subtitle="Draft" backHref="/orders" backLabel="Orders">
        <p>form body</p>
      </FormPageShell>,
    );

    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("New order");
    expect(screen.getAllByText("New order")).toHaveLength(1);
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
    expect(screen.getByRole("link", { name: "Orders" }).getAttribute("href")).toBe("/orders");
    expect(screen.getByText("Draft")).toBeTruthy();
  });

  it("puts the children in a padded body on the page's one raised surface", () => {
    const { container } = render(
      <FormPageShell title="New order">
        <p>form body</p>
      </FormPageShell>,
    );

    const frames = container.querySelectorAll(".bg-surface-raised");
    expect(frames).toHaveLength(1);
    const body = screen.getByText("form body").parentElement as HTMLElement;
    expect(frames[0]!.contains(body)).toBe(true);
    expect(body.className).toContain("p-[var(--form-inset)]");
    expect(body.className).toContain("[--form-inset:1.25rem]");
    expect(body.className).toContain("space-y-5");
    // the title stays above the surface, never on it
    expect(frames[0]!.textContent).not.toContain("New order");
  });
});

describe("FormPageShell — width", () => {
  it.each([
    ["sm", "max-w-md"],
    ["md", "max-w-xl"],
    ["lg", "max-w-2xl"],
    ["xl", "max-w-4xl"],
  ] as const)("width=%s → %s", (width, expected) => {
    const { container } = render(
      <FormPageShell title="Order #1024" width={width}>
        <p>form body</p>
      </FormPageShell>,
    );

    expect((container.firstElementChild as HTMLElement).className).toContain(expected);
  });

  it("defaults to md when width is omitted", () => {
    const { container } = render(
      <FormPageShell title="Order #1024">
        <p>form body</p>
      </FormPageShell>,
    );

    expect((container.firstElementChild as HTMLElement).className).toContain("max-w-xl");
  });
});

// Type-level guard: the retired header homes stay out of the closed props.
type Key<T, K extends PropertyKey> = K extends keyof T ? "present" : "absent";
type _Retired = [
  Key<FormPageShellProps, "kicker">,
  Key<FormPageShellProps, "headerActions">,
  Key<FormPageShellProps, "actions">,
] extends ["absent", "absent", "absent"]
  ? true
  : never;
const retiredGuard: _Retired = true;
expect(retiredGuard).toBe(true);
