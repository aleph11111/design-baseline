import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AuthCard, type AuthCardPurpose } from "./AuthCard";

afterEach(() => {
  cleanup();
});

function Icon({ className }: { className?: string }) {
  return <svg data-testid="icon" className={className} />;
}

const CIRCLE: Record<AuthCardPurpose, string[]> = {
  "sign-in": ["bg-primary/10", "text-primary"],
  denied: ["bg-destructive/10", "text-status-danger-fg"],
  error: ["bg-muted", "text-muted-foreground"],
};

describe("AuthCard", () => {
  for (const [purpose, classes] of Object.entries(CIRCLE) as [AuthCardPurpose, string[]][]) {
    it(`purpose="${purpose}" tints the icon circle ${classes.join(" ")}`, () => {
      render(<AuthCard purpose={purpose} title="T" icon={Icon} />);
      const circle = screen.getByTestId("icon").parentElement!;
      expect(circle.classList.contains("rounded-full")).toBe(true);
      expect(circle.classList.contains("h-14")).toBe(true);
      for (const c of classes) expect(circle.classList.contains(c)).toBe(true);
    });
  }

  it("renders the title as a text-lg h1 in a centered header", () => {
    render(<AuthCard purpose="sign-in" title="Anmelden" description="D" icon={Icon} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Anmelden" });
    expect(h1.classList.contains("text-lg")).toBe(true);
    const header = h1.parentElement!;
    expect(header.classList.contains("items-center")).toBe(true);
    expect(header.classList.contains("text-center")).toBe(true);
    expect(header.contains(screen.getByText("D"))).toBe(true);
    expect(header.contains(screen.getByTestId("icon"))).toBe(true);
  });

  it("renders no circle without an icon", () => {
    const { container } = render(<AuthCard purpose="denied" title="T" />);
    expect(container.querySelector(".rounded-full")).toBeNull();
  });
});
