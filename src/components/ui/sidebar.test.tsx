import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SidebarMenuSkeleton } from "./sidebar";

afterEach(() => {
  cleanup();
});

function widths(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-sidebar="menu-skeleton-text"]'),
  ).map((el) => el.style.getPropertyValue("--skeleton-width"));
}

describe("SidebarMenuSkeleton width", () => {
  it("is deterministic across re-renders (render-pure under React 19)", () => {
    const { container, rerender } = render(<SidebarMenuSkeleton />);
    const first = widths(container);

    rerender(<SidebarMenuSkeleton />);

    expect(widths(container)).toEqual(first);
  });

  it("stays inside 50–90% and varies across sibling skeletons", () => {
    const { container } = render(
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <SidebarMenuSkeleton key={i} />
        ))}
      </>,
    );

    const values = widths(container).map((w) => Number.parseInt(w, 10));
    expect(values).toHaveLength(8);
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(50);
      expect(v).toBeLessThanOrEqual(90);
    }
    expect(new Set(values).size).toBeGreaterThan(1);
  });
});
