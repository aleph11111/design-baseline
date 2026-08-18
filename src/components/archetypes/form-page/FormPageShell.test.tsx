import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FormPageShell } from "./FormPageShell";
import { HeaderFillContext } from "@/components/layout/headerFill";

afterEach(() => {
  cleanup();
});

const HEADER = '[data-slot="surface-header"]';

describe("FormPageShell — classic layout (no title)", () => {
  it("renders children in a space-y-5 column with no on-surface header", () => {
    const { container, getByText } = render(
      <FormPageShell>
        <p>form body</p>
      </FormPageShell>,
    );

    expect(container.querySelector(HEADER)).toBeNull();

    const shell = container.firstElementChild as HTMLElement;
    expect(shell.className).toContain("space-y-5");
    expect(shell.className).not.toContain("rounded-lg");
    expect(shell.contains(getByText("form body"))).toBe(true);
  });

  it("ignores kicker / headerActions when title is absent", () => {
    const { container, queryByText } = render(
      <FormPageShell kicker="Orders" headerActions={<span>Save</span>}>
        <p>form body</p>
      </FormPageShell>,
    );

    expect(container.querySelector(HEADER)).toBeNull();
    expect(queryByText("Orders")).toBeNull();
    expect(queryByText("Save")).toBeNull();
  });
});

describe("FormPageShell — board form layout (title set)", () => {
  it("wraps a SurfaceHeaderSlot and a padded body in a bounded card", () => {
    const { container, getByText } = render(
      <FormPageShell title="New order">
        <p>form body</p>
      </FormPageShell>,
    );

    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("rounded-lg");
    expect(card.className).toContain("border");
    expect(card.className).toContain("bg-card");

    const header = container.querySelector(HEADER);
    expect(header).not.toBeNull();
    expect(header?.contains(getByText("New order"))).toBe(true);

    // Children live in the padded body BELOW the header, not inside it.
    const body = card.lastElementChild as HTMLElement;
    expect(body.className).toContain("p-5");
    expect(body.className).toContain("space-y-5");
    expect(body.contains(getByText("form body"))).toBe(true);
    expect(header?.contains(getByText("form body"))).toBe(false);
  });

  it("forwards kicker, title, and headerActions into the header", () => {
    const { container, getByText } = render(
      <FormPageShell
        kicker="Orders"
        title="Order #1024"
        headerActions={<span>Save</span>}
      >
        <p>form body</p>
      </FormPageShell>,
    );

    const header = container.querySelector(HEADER);
    expect(header?.contains(getByText("Orders"))).toBe(true);
    expect(header?.contains(getByText("Order #1024"))).toBe(true);
    expect(header?.contains(getByText("Save"))).toBe(true);
  });

  it("reads the header treatment from HeaderFillContext (no per-shell override)", () => {
    const { container } = render(
      <HeaderFillContext.Provider value="tint">
        <FormPageShell title="Order #1024">
          <p>form body</p>
        </FormPageShell>
      </HeaderFillContext.Provider>,
    );

    const header = container.querySelector(HEADER) as HTMLElement;
    expect(header.className).toContain("bg-muted");
    expect(header.className).not.toContain("bg-primary");
  });
});

describe("FormPageShell — width", () => {
  const cases = [
    ["sm", "max-w-md"],
    ["md", "max-w-xl"],
    ["lg", "max-w-2xl"],
    ["xl", "max-w-4xl"],
  ] as const;

  it.each(cases)("classic layout: width=%s → %s", (width, expected) => {
    const { container } = render(
      <FormPageShell width={width}>
        <p>form body</p>
      </FormPageShell>,
    );

    expect((container.firstElementChild as HTMLElement).className).toContain(
      expected,
    );
  });

  it.each(cases)("board form layout: width=%s → %s", (width, expected) => {
    const { container } = render(
      <FormPageShell title="Order #1024" width={width}>
        <p>form body</p>
      </FormPageShell>,
    );

    expect((container.firstElementChild as HTMLElement).className).toContain(
      expected,
    );
  });

  it("defaults to md when width is omitted", () => {
    const { container } = render(
      <FormPageShell>
        <p>form body</p>
      </FormPageShell>,
    );

    expect((container.firstElementChild as HTMLElement).className).toContain(
      "max-w-xl",
    );
  });
});
