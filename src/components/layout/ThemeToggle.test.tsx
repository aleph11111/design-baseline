import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

afterEach(() => {
  cleanup();
});

describe("ThemeToggle", () => {
  it("defaults to English strings", () => {
    render(<ThemeToggle />);
    const trigger = screen.getByRole("button", { name: "Toggle color scheme" });
    fireEvent.pointerDown(trigger, { button: 0 });
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
  });

  it("overrides every string via the labels prop", () => {
    render(
      <ThemeToggle
        labels={{
          toggle: "Switch appearance",
          light: "Day",
          dark: "Night",
          system: "Auto",
        }}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Switch appearance" });
    fireEvent.pointerDown(trigger, { button: 0 });
    expect(screen.getByText("Day")).toBeTruthy();
    expect(screen.getByText("Night")).toBeTruthy();
    expect(screen.getByText("Auto")).toBeTruthy();
  });
});
