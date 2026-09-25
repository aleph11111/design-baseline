import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DetailOverviewHeader } from "./DetailOverviewHeader";
import { DetailSection } from "./DetailSection";
import { UnifiedSurfaceContext } from "./DetailOverviewShell";

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
});

describe("DetailOverviewHeader — back link", () => {
  it("renders PageHeader's back link when backHref is passed", () => {
    render(
      <DetailOverviewHeader title="Acme" backHref="/companies" backLabel="Companies" />,
    );
    expect(
      screen.getByRole("link", { name: "Companies" }).getAttribute("href"),
    ).toBe("/companies");
  });

  it("routes the back link through renderBackLink", () => {
    render(
      <DetailOverviewHeader
        title="Acme"
        backHref="/companies"
        renderBackLink={(href, label) => <a data-router href={href}>{label}</a>}
      />,
    );
    expect(screen.getByText("Back").hasAttribute("data-router")).toBe(true);
  });

  it("renders no back link without backHref", () => {
    render(<DetailOverviewHeader title="Acme" />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
