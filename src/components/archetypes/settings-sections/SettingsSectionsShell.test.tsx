import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SettingsSection, SettingsSectionsShell, type SettingsSectionsShellProps } from "./index";
import { Button } from "../../ui/button";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SettingsSectionsShell — section-card stack (ADR-0008, ADR-0015)", () => {
  it("renders one page title, the page verbs in the header, and each section title once", () => {
    const onSave = vi.fn();
    const { container } = render(
      <SettingsSectionsShell title="Studio" actions={<Button>Refresh</Button>}>
        <SettingsSection title="Recording" onSave={onSave}>
          <p>recording body</p>
        </SettingsSection>
        <SettingsSection title="Publishing">
          <p>publishing body</p>
        </SettingsSection>
      </SettingsSectionsShell>,
    );

    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getAllByText("Studio")).toHaveLength(1);
    expect(screen.getAllByText("Recording")).toHaveLength(1);
    expect(screen.getAllByText("Publishing")).toHaveLength(1);

    // The page verb sits in the page header, not in the surface.
    const refresh = screen.getByRole("button", { name: "Refresh" });
    expect(container.querySelector('[data-page-body="stack"]')!.contains(refresh)).toBe(false);

    // Section-card stack: one bordered, rounded card per section, no hairline wrapper.
    const stack = container.querySelector('[data-page-body="stack"]') as HTMLElement;
    expect(stack).not.toBeNull();
    expect(stack.children).toHaveLength(2);
    for (const card of Array.from(stack.children)) {
      expect(card.className).toMatch(/(^|\s)border(\s|$)/);
      expect(card.className).toContain("rounded-lg");
    }
    expect(container.innerHTML).not.toContain("divide-y");

    // Save is per section: only the section that saves has a button, and it saves that section.
    expect(screen.getAllByRole("button", { name: "Save" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("shows the saving label and disables the save while a section saves", () => {
    render(
      <SettingsSectionsShell title="Studio">
        <SettingsSection title="Recording" onSave={() => {}} isSaving savingLabel="Saving recording…">
          <p>body</p>
        </SettingsSection>
      </SettingsSectionsShell>,
    );
    const button = screen.getByRole("button", { name: /Saving recording/ });
    expect(button).toHaveProperty("disabled", true);
  });

  it("catches a throwing section instead of letting it escape the shell", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Boom(): never {
      throw new Error("section exploded");
    }
    expect(() =>
      render(
        <SettingsSectionsShell title="Studio">
          <SettingsSection title="Broken">
            <Boom />
          </SettingsSection>
        </SettingsSectionsShell>,
      ),
    ).not.toThrow();
    expect(screen.getByText("section exploded")).toBeTruthy();
  });
});

// Type-level guard: the page header is closed — no second home for a title or icon.
type Key<T, K extends PropertyKey> = K extends keyof T ? "present" : "absent";
type _Closed = [
  Key<SettingsSectionsShellProps, "icon">,
  Key<SettingsSectionsShellProps, "toolbar">,
  Key<SettingsSectionsShellProps, "headerActions">,
] extends ["absent", "absent", "absent"]
  ? true
  : never;
const closedGuard: _Closed = true;
expect(closedGuard).toBe(true);
