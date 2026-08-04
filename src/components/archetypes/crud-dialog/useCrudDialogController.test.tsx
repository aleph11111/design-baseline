import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { useCrudDialogMode } from "./useCrudDialogMode";
import { useCrudDialogController, type CrudDialogMutation } from "./useCrudDialogController";

type FormValues = { name: string };

const noopMutation: CrudDialogMutation<FormValues> = {
  mutateAsync: async () => {},
  isPending: false,
};

/**
 * Harness exposing handleClose (X/Esc/backdrop) and handleSecondary
 * (edit -> view cancel, since it's mounted in edit mode) as buttons, plus an
 * input wired to the form so a test can dirty it before exercising either
 * exit path.
 */
function Harness({ onConfirmDiscard }: { onConfirmDiscard: () => Promise<boolean> }) {
  const form = useForm<FormValues>({ defaultValues: { name: "" } });
  const mode = useCrudDialogMode({
    initialMode: "edit",
    isDirty: form.formState.isDirty,
    onConfirmDiscard,
  });
  const controller = useCrudDialogController<FormValues>({
    form,
    mode,
    defaultValues: { name: "" },
    createMutation: noopMutation,
    updateMutation: noopMutation,
    onClose: () => {},
  });

  return (
    <div>
      <input aria-label="name" {...form.register("name")} />
      <button onClick={() => void controller.handleClose()}>close</button>
      <button onClick={() => void controller.handleSecondary()}>cancel</button>
    </div>
  );
}

describe("useCrudDialogController discard guard", () => {
  afterEach(cleanup);

  it("routes the close (X/Esc/backdrop) path through the injected onConfirmDiscard, not window.confirm", async () => {
    const onConfirmDiscard = vi.fn().mockResolvedValue(true);
    const confirmSpy = vi.spyOn(window, "confirm");
    render(<Harness onConfirmDiscard={onConfirmDiscard} />);

    fireEvent.change(screen.getByLabelText("name"), { target: { value: "dirty" } });
    await act(async () => {
      fireEvent.click(screen.getByText("close"));
    });

    expect(onConfirmDiscard).toHaveBeenCalledTimes(1);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("routes the edit-cancel path through the same injected onConfirmDiscard", async () => {
    const onConfirmDiscard = vi.fn().mockResolvedValue(true);
    const confirmSpy = vi.spyOn(window, "confirm");
    render(<Harness onConfirmDiscard={onConfirmDiscard} />);

    fireEvent.change(screen.getByLabelText("name"), { target: { value: "dirty" } });
    await act(async () => {
      fireEvent.click(screen.getByText("cancel"));
    });

    expect(onConfirmDiscard).toHaveBeenCalledTimes(1);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("aborts the close when the injected onConfirmDiscard resolves false — same as the cancel path", async () => {
    const onConfirmDiscardClose = vi.fn().mockResolvedValue(false);
    const onConfirmDiscardCancel = vi.fn().mockResolvedValue(false);

    const { unmount } = render(<Harness onConfirmDiscard={onConfirmDiscardClose} />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "dirty" } });
    await act(async () => {
      fireEvent.click(screen.getByText("close"));
    });
    expect(onConfirmDiscardClose).toHaveBeenCalledTimes(1);
    unmount();

    render(<Harness onConfirmDiscard={onConfirmDiscardCancel} />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "dirty" } });
    await act(async () => {
      fireEvent.click(screen.getByText("cancel"));
    });
    expect(onConfirmDiscardCancel).toHaveBeenCalledTimes(1);
  });
});

/**
 * Edit-only dialog (Layer 13 allowed variation): the entity is created outside
 * the UI, so no createMutation is supplied. Mounted in create mode on purpose —
 * that is the wiring bug the guard exists to catch.
 */
function EditOnlyHarness({ updateMutation }: { updateMutation: CrudDialogMutation<FormValues> }) {
  const form = useForm<FormValues>({ defaultValues: { name: "" } });
  const mode = useCrudDialogMode({
    initialMode: "create",
    isDirty: form.formState.isDirty,
    onConfirmDiscard: async () => true,
  });
  const controller = useCrudDialogController<FormValues>({
    form,
    mode,
    defaultValues: { name: "" },
    // No createMutation — this must type-check.
    updateMutation,
    onClose: () => {},
  });

  return <button onClick={() => void controller.handlePrimary()}>primary</button>;
}

describe("useCrudDialogController optional mutations", () => {
  afterEach(cleanup);

  it("refuses to submit in create mode with no createMutation instead of running the update", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<EditOnlyHarness updateMutation={{ mutateAsync, isPending: false }} />);
    await act(async () => {
      fireEvent.click(screen.getByText("primary"));
    });

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain("no createMutation");
    errorSpy.mockRestore();
  });
});
