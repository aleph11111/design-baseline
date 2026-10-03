import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DetailSection } from "./DetailSection";
import { DetailOverviewShell, UnifiedSurfaceContext } from "./DetailOverviewShell";

afterEach(() => {
  cleanup();
});

describe("DetailSection — collapsible", () => {
  it("hides the body until the title toggle is clicked", () => {
    render(
      <DetailSection title="Run history" collapsible>
        <p>body</p>
      </DetailSection>,
    );

    expect(screen.queryByText("body")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Run history" });
    expect(toggle.closest("h2")).not.toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByText("body")).toBeTruthy();
  });

  it("starts open with defaultOpen", () => {
    render(
      <DetailSection title="Run history" collapsible defaultOpen>
        <p>body</p>
      </DetailSection>,
    );
    expect(screen.getByText("body")).toBeTruthy();
  });

  it("drops card chrome inside the shell's unified surface, like a plain section", () => {
    const { container } = render(
      <UnifiedSurfaceContext.Provider value={true}>
        <DetailSection title="Run history" collapsible>
          <p>body</p>
        </DetailSection>
      </UnifiedSurfaceContext.Provider>,
    );
    expect(container.querySelector("section")?.className).not.toContain("border");
  });

  it("keeps vertical spacing around an open body in the rail, and a closed one stays title-only", () => {
    const { container } = render(
      <UnifiedSurfaceContext.Provider value={true}>
        <DetailSection title="Run history" collapsible defaultOpen>
          <p>body</p>
        </DetailSection>
        <DetailSection title="Closed" collapsible>
          <p>hidden</p>
        </DetailSection>
      </UnifiedSurfaceContext.Provider>,
    );
    const [open, closed] = Array.from(container.querySelectorAll("section")) as [HTMLElement, HTMLElement];
    // Rail spacing contract: the section's `py-4` pads above the title and
    // below the body (divider side); the title wrapper's `mb-3` separates title
    // from body. The body wrapper sits directly in the section, inside the `px-5` gutter.
    expect(open.className).toContain("py-4");
    const title = open.querySelector("div.mb-3");
    const body = screen.getByText("body").parentElement as HTMLElement;
    expect(title).toBeTruthy();
    expect(body.parentElement).toBe(open);
    expect(body.className).toContain("px-5");
    // Closed: the body wrapper is `hidden` and empty, with no vertical padding,
    // so it adds no height beyond the title bar.
    expect(screen.queryByText("hidden")).toBeNull();
    const closedBody = closed.lastElementChild as HTMLElement;
    expect(closedBody.hasAttribute("hidden")).toBe(true);
    expect(closedBody.childElementCount).toBe(0);
    expect(closedBody.className).not.toMatch(/\bp[yb]-/);
  });
});

describe("DetailOverviewShell — back link", () => {
  it("renders PageHeader's back link when backHref is passed", () => {
    render(
      <DetailOverviewShell title="Acme" backHref="/companies" backLabel="Companies" />,
    );
    expect(
      screen.getByRole("link", { name: "Companies" }).getAttribute("href"),
    ).toBe("/companies");
  });

  it("routes the back link through renderBackLink", () => {
    render(
      <DetailOverviewShell
        title="Acme"
        backHref="/companies"
        renderBackLink={(href, label) => <a data-router href={href}>{label}</a>}
      />,
    );
    expect(screen.getByText("Back").hasAttribute("data-router")).toBe(true);
  });

  it("renders no back link without backHref", () => {
    render(<DetailOverviewShell title="Acme" />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
