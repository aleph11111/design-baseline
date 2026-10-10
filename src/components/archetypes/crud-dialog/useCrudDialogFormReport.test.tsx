import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { useCrudDialogFormReport, type CrudDialogFooterReport } from "./useCrudDialogFormReport";

afterEach(cleanup);

function Island({
  onFooterReady,
  onDirtyChange,
  onDelete,
  onValid,
}: {
  onFooterReady: (r: CrudDialogFooterReport | null) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onDelete?: () => void;
  onValid: (v: { name: string }) => void;
}) {
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } });
  // Inline callbacks on purpose: the hook must not loop or re-report on them.
  useCrudDialogFormReport(
    form,
    { submit: () => void form.handleSubmit(onValid)(), onDelete },
    { onFooterReady: (r) => onFooterReady(r), onDirtyChange: (d) => onDirtyChange?.(d) },
  );
  return <input aria-label="name" {...form.register("name")} />;
}

describe("useCrudDialogFormReport", () => {
  it("keeps one report across re-renders, submits through it, clears on unmount", async () => {
    const reports: (CrudDialogFooterReport | null)[] = [];
    const onValid = vi.fn();
    const { rerender, unmount } = render(<Island onFooterReady={(r) => reports.push(r)} onValid={onValid} />);
    expect(reports).toHaveLength(1);
    const first = reports[0]!;
    expect(first.onDelete).toBeUndefined();

    rerender(<Island onFooterReady={(r) => reports.push(r)} onValid={onValid} />);
    expect(reports).toHaveLength(1);

    fireEvent.change(screen.getByLabelText("name"), { target: { value: "Ada" } });
    await act(async () => first.submit());
    expect(onValid).toHaveBeenCalledWith({ name: "Ada" }, undefined);

    unmount();
    expect(reports.at(-1)).toBeNull();
  });

  it("re-reports when a delete action appears and routes it to the live handler", () => {
    const reports: (CrudDialogFooterReport | null)[] = [];
    const del = vi.fn();
    const { rerender } = render(<Island onFooterReady={(r) => reports.push(r)} onValid={() => {}} />);
    rerender(<Island onFooterReady={(r) => reports.push(r)} onValid={() => {}} onDelete={del} />);
    const last = reports.at(-1)!;
    expect(last).not.toBe(reports[0]);
    last.onDelete?.();
    expect(del).toHaveBeenCalledOnce();
  });

  it("feeds isDirty to onDirtyChange", () => {
    const dirty = vi.fn();
    render(<Island onFooterReady={() => {}} onDirtyChange={dirty} onValid={() => {}} />);
    expect(dirty).toHaveBeenLastCalledWith(false);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(dirty).toHaveBeenLastCalledWith(true);
  });
});
