import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SectionCard } from "../../layout/SectionCard";
import { FormPageActions } from "./FormPageActions";
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

  it("renders a stack body: one bordered, rounded card per field group, actions outside every card", () => {
    const { container } = render(
      <FormPageShell title="New order">
        <form>
          <SectionCard title="Basics"><p>basics</p></SectionCard>
          <SectionCard title="Details"><p>details</p></SectionCard>
          <FormPageActions mode="create" primaryLabel="Create" />
        </form>
      </FormPageShell>,
    );

    const stack = container.querySelector('[data-page-body="stack"]') as HTMLElement;
    expect(stack).toBeTruthy();
    const cards = Array.from(stack.querySelectorAll("section"));
    expect(cards).toHaveLength(2);
    for (const c of cards) {
      expect(c.className).toMatch(/(^|\s)border(\s|$)/);
      expect(c.className).toContain("rounded-lg");
    }
    // the shell owns the gap: the form is `display: contents` in a gapped column
    const column = stack.firstElementChild as HTMLElement;
    expect(column.className).toContain("gap-4");
    expect(column.className).toContain("md:gap-5");
    expect(column.className).toContain("[&>form]:contents");
    const create = screen.getByRole("button", { name: "Create" });
    expect(cards.some((c) => c.contains(create))).toBe(false);
    expect(stack.contains(create)).toBe(true);
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
