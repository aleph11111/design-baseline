import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PageFrame } from "./PageFrame";

afterEach(cleanup);

describe("PageFrame — one page frame (ADR-0008)", () => {
  it("renders the title once, as the page h1, and no title on the surface", () => {
    const { container } = render(
      <PageFrame title="Profit & Loss" toolbar={<button>Year</button>}>
        body
      </PageFrame>,
    );
    expect(screen.getAllByText("Profit & Loss")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Profit & Loss");
    expect(container.querySelector('[data-slot="surface-header"]')).toBeNull();
  });

  it("puts toolbar, count and the view menu in one band", () => {
    render(
      <PageFrame title="T" toolbar={<span>scope</span>} count="12 results" viewOptions={<div />} viewOptionsLabel="Ansicht">
        body
      </PageFrame>,
    );
    const band = screen.getByText("scope").closest(".border-b") as HTMLElement;
    expect(band.textContent).toContain("12 results");
    expect(band.textContent).toContain("Ansicht");
  });

  it("renders no band without toolbar, count or view options", () => {
    const { container } = render(<PageFrame title="T">body</PageFrame>);
    expect(container.querySelector(".border-b")).toBeNull();
  });

  it("treats a false slot as absent", () => {
    const show = false;
    const { container } = render(
      <PageFrame title="T" toolbar={show && <span>x</span>}>body</PageFrame>,
    );
    expect(container.querySelector(".border-b")).toBeNull();
  });

  it("a nested frame titles itself h2 and opens no second surface", () => {
    const { container } = render(
      <PageFrame title="Settings">
        <PageFrame title="Members">body</PageFrame>
      </PageFrame>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Members");
    expect(container.querySelectorAll(".bg-surface-raised")).toHaveLength(1);
  });
});
