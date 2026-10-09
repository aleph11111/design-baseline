import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useConfirm } from "./useConfirm";
import { usePrompt } from "./usePrompt";

afterEach(() => {
  cleanup();
});

type Ask<T> = (o: { title: string; description: string; defaultValue?: string }) => Promise<T>;

/** Mounts a hook's dialog and hands the test its `ask` function. */
function mount<T>(useHook: () => { ask: Ask<T>; dialog: React.ReactNode }) {
  const ref: { ask?: Ask<T> } = {};
  function Host() {
    const { ask, dialog } = useHook();
    ref.ask = ask;
    return <>{dialog}</>;
  }
  render(<Host />);
  return (o: Parameters<Ask<T>>[0]) => {
    let p!: Promise<T>;
    act(() => {
      p = ref.ask!(o);
    });
    return p;
  };
}

const useConfirmHook = () => {
  const { askConfirm, dialog } = useConfirm();
  return { ask: askConfirm as Ask<boolean>, dialog };
};
const usePromptHook = () => {
  const { askPrompt, dialog } = usePrompt();
  return { ask: askPrompt as Ask<string | null>, dialog };
};

describe("useConfirm — promise-based window.confirm replacement", () => {
  it("resolves true on confirm and closes", async () => {
    const ask = mount(useConfirmHook);
    const p = ask({ title: "Delete recipe?", description: "Gone for good." });
    expect(screen.getByText("Delete recipe?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await expect(p).resolves.toBe(true);
    expect(screen.queryByText("Delete recipe?")).toBeNull();
  });

  it("resolves false on cancel", async () => {
    const ask = mount(useConfirmHook);
    const p = ask({ title: "Delete recipe?", description: "Gone for good." });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(p).resolves.toBe(false);
  });

  it("a second ask resolves the first false", async () => {
    const ask = mount(useConfirmHook);
    const first = ask({ title: "First?", description: "" });
    const second = ask({ title: "Second?", description: "" });
    await expect(first).resolves.toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await expect(second).resolves.toBe(true);
  });
});

describe("usePrompt — promise-based window.prompt replacement", () => {
  it("prefills defaultValue and resolves the trimmed value on submit", async () => {
    const ask = mount(usePromptHook);
    const p = ask({ title: "Rename recipe", description: "", defaultValue: "Soup" });
    const field = screen.getByRole("textbox", { name: "Rename recipe" }) as HTMLInputElement;
    expect(field.value).toBe("Soup");
    fireEvent.change(field, { target: { value: "  Tomato soup  " } });
    fireEvent.submit(field.closest("form")!);
    await expect(p).resolves.toBe("Tomato soup");
  });

  it("resolves null on cancel", async () => {
    const ask = mount(usePromptHook);
    const p = ask({ title: "Rename recipe", description: "" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(p).resolves.toBeNull();
  });

  it("blocks submit on a blank value", () => {
    const ask = mount(usePromptHook);
    void ask({ title: "New recipe", description: "" });
    expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
