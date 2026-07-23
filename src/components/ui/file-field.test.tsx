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
