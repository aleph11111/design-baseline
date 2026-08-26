import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FileField } from "./file-field";

afterEach(() => {
  cleanup();
});

function file(name: string, size: number): File {
  const f = new File(["x"], name, { type: "text/plain" });
  Object.defineProperty(f, "size", { value: size });
  return f;
}

describe("FileField — size gate + reset", () => {
  it("emits only files within maxSizeBytes and reports the rest", () => {
    const onSelect = vi.fn();
    const onSizeError = vi.fn();
    const { container } = render(
      <FileField
        multiple
        maxSizeBytes={1000}
        onSelect={onSelect}
        onSizeError={onSizeError}
      />
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const small = file("ok.txt", 500);
    const big = file("huge.txt", 5000);
    fireEvent.change(input, { target: { files: [small, big] } });

    expect(onSelect).toHaveBeenCalledWith([small]);
    expect(onSizeError).toHaveBeenCalledWith(big);
    // Value is reset so re-picking the same file fires again.
    expect(input.value).toBe("");
  });

  it("does not fire onSelect when every file is rejected", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FileField maxSizeBytes={100} onSelect={onSelect} onSizeError={() => {}} />
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file("big.txt", 999)] } });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders a selected-file row and clears it", () => {
    const onClear = vi.fn();
    render(
      <FileField
        onSelect={() => {}}
        selected={[file("report.pdf", 2048)]}
        onClear={onClear}
      />
    );
    expect(screen.getByText("report.pdf")).toBeTruthy();
    expect(screen.getByText("2.0 KB")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Remove report.pdf"));
    expect(onClear).toHaveBeenCalled();
  });
});

describe("FileField — labeled field frame (the shared label/hint/error a11y)", () => {
  it("associates the trigger with its label (aria-labelledby, like Radix Select's trigger)", () => {
    render(
      <FileField
        label="Receipt"
        hint="CSV or XLSX."
        onSelect={() => {}}
      />,
    );
    const trigger = screen.getByLabelText("Receipt");
    expect(trigger.getAttribute("aria-describedby")).toBeTruthy();
    // The hint node the trigger describes — button variant: the frame's hint slot.
    const ids = trigger.getAttribute("aria-describedby")!.split(" ");
    expect(document.getElementById(ids[0]!)?.textContent).toBe("CSV or XLSX.");
  });

  it("given an error, marks the trigger invalid and links the error node", () => {
    render(
      <FileField label="Receipt" error="No such file." onSelect={() => {}} />,
    );
    const trigger = screen.getByLabelText("Receipt");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    const ids = trigger.getAttribute("aria-describedby")!.split(" ");
    expect(document.getElementById(ids[ids.length - 1]!)?.textContent).toBe(
      "No such file.",
    );
  });

  it("the dropzone variant keeps the hint inside the box but still describes it", () => {
    render(
      <FileField
        label="Receipt"
        variant="dropzone"
        hint="CSV or XLSX."
        onSelect={() => {}}
      />,
    );
    const dropzone = screen.getByLabelText("Receipt");
    const ids = dropzone.getAttribute("aria-describedby")!.split(" ");
    // Dropzone hint: the in-box carry node carries the frame's hint id.
    expect(document.getElementById(ids[0]!)?.textContent).toBe("CSV or XLSX.");
  });
});

describe("FileField — onFilesDrop drag-and-drop (dropzone only)", () => {
  it("delivers dropped files via onFilesDrop when opted in", () => {
    const onFilesDrop = vi.fn();
    const { container } = render(
      <FileField
        variant="dropzone"
        multiple
        triggerLabel="Drop files"
        onSelect={() => {}}
        onFilesDrop={onFilesDrop}
      />
    );
    const dropzone = container.querySelector('[role="button"]')!;
    const files = [file("a.csv", 10), file("b.csv", 20)];
    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, {
      dataTransfer: { files } as unknown as DataTransfer,
    });
    expect(onFilesDrop).toHaveBeenCalledTimes(1);
    expect(onFilesDrop).toHaveBeenLastCalledWith(files);
  });

  it("does not attach drop handlers without the onFilesDrop opt-in", () => {
    const { container } = render(
      <FileField variant="dropzone" triggerLabel="Drop files" onSelect={() => {}} />
    );
    const dropzone = container.querySelector('[role="button"]')!;
    // No onDrop wired when the prop is absent — dropping is a no-op.
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file("a.csv", 10)] } as unknown as DataTransfer,
    });
    expect(screen.getByText("Drop files")).toBeTruthy();
  });
});
