import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFormPageState } from "./useFormPageState";

describe("useFormPageState", () => {
  it("requestDiscard returns true without invoking onConfirmDiscard when isDirty is false", async () => {
    const onConfirmDiscard = vi.fn(() => false);
    const { result } = renderHook(() =>
      useFormPageState({ mode: "edit", isDirty: false, onConfirmDiscard }),
    );
    await expect(result.current.requestDiscard()).resolves.toBe(true);
    expect(onConfirmDiscard).not.toHaveBeenCalled();
  });

  it("requestDiscard returns true when dirty and no onConfirmDiscard is given", async () => {
    const { result } = renderHook(() => useFormPageState({ mode: "edit", isDirty: true }));
    await expect(result.current.requestDiscard()).resolves.toBe(true);
  });

  it.each([
    ["sync true", () => true, true],
    ["sync false", () => false, false],
    ["async true", () => Promise.resolve(true), true],
    ["async false", () => Promise.resolve(false), false],
  ])("requestDiscard resolves with the callback result when dirty (%s)", async (_n, cb, expected) => {
    const onConfirmDiscard = vi.fn(cb);
    const { result } = renderHook(() =>
      useFormPageState({ mode: "edit", isDirty: true, onConfirmDiscard }),
    );
    await expect(result.current.requestDiscard()).resolves.toBe(expected);
    expect(onConfirmDiscard).toHaveBeenCalledTimes(1);
  });

  it("isSubmitting is true after beginSubmit and false again after endSubmit", () => {
    const { result } = renderHook(() => useFormPageState({ mode: "create" }));
    expect(result.current.isSubmitting).toBe(false);
    act(() => result.current.beginSubmit());
    expect(result.current.isSubmitting).toBe(true);
    act(() => result.current.endSubmit());
    expect(result.current.isSubmitting).toBe(false);
  });

  it("isCreate/isEdit match mode and isDirty mirrors the input", () => {
    const create = renderHook(() => useFormPageState({ mode: "create" })).result.current;
    expect([create.isCreate, create.isEdit, create.isDirty]).toEqual([true, false, false]);
    const edit = renderHook(() => useFormPageState({ mode: "edit", isDirty: true })).result.current;
    expect([edit.isCreate, edit.isEdit, edit.isDirty]).toEqual([false, true, true]);
  });
});
