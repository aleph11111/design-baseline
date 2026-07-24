import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { EntityAvatar, entityInitials } from "./EntityAvatar";

afterEach(() => {
  cleanup();
});

describe("entityInitials", () => {
  it("takes first+last initial for a multi-word name", () => {
    expect(entityInitials("John Smith")).toBe("JS");
    expect(entityInitials("Ada Beatrice Lovelace")).toBe("AL");
  });

  it("takes the first two characters of a single-token name", () => {
    expect(entityInitials("Prince")).toBe("PR");
    expect(entityInitials("bjork")).toBe("BJ");
  });

  it("splits on underscores as well as whitespace", () => {
    expect(entityInitials("speaker_two")).toBe("ST");
  });

  it("falls back to '?' for an empty or whitespace name", () => {
    expect(entityInitials("")).toBe("?");
    expect(entityInitials("   ")).toBe("?");
  });
});

describe("EntityAvatar", () => {
  it("exposes the name as the accessible label on the initials fallback", () => {
    render(<EntityAvatar name="Miles Davis" />);
    const el = screen.getByRole("img", { name: "Miles Davis" });
    expect(el.textContent).toBe("MD");
  });

  it("keeps the name as the accessible label even when a src is supplied", () => {
    // Radix AvatarImage stays unmounted in jsdom until the image reports "loaded",
    // so the initials fallback (labelled with the name) remains the a11y surface.
    render(<EntityAvatar name="Nina Simone" src="https://example.test/nina.jpg" />);
    expect(screen.getByRole("img", { name: "Nina Simone" })).toBeTruthy();
  });

  it("applies the primary tone fill when requested", () => {
    render(<EntityAvatar name="John Coltrane" tone="primary" />);
    const el = screen.getByRole("img", { name: "John Coltrane" });
    expect(el.className).toContain("bg-primary");
  });
});
