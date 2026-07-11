import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { GroupedListShell } from "./GroupedListShell";

afterEach(() => {
  cleanup();
});

describe("GroupedListShell", () => {
  it("renders its header through the shared SurfaceHeaderSlot when title is set", () => {
    const { container, getByText } = render(
      <GroupedListShell kicker="Catalog" title="Products">
        <div>section</div>
      </GroupedListShell>,
    );

    const header = container.querySelector('[data-slot="surface-header"]');
    expect(header).not.toBeNull();
    expect(header?.contains(getByText("Catalog"))).toBe(true);
    expect(header?.contains(getByText("Products"))).toBe(true);
  });

  it("omits the header when title is undefined", () => {
    const { container } = render(
      <GroupedListShell>
        <div>section</div>
      </GroupedListShell>,
    );

    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });
});
