import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Sheet, SheetContent, SheetTitle } from "./sheet";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

afterEach(() => {
  cleanup();
});

describe("close-button label", () => {
  it("defaults SheetContent's sr-only label to Close", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Panel</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("lets a non-English consumer override SheetContent's label", () => {
    render(
      <Sheet open>
        <SheetContent closeLabel="Schließen">
          <SheetTitle>Panel</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("does the same for DialogContent", () => {
    render(
      <Dialog open>
        <DialogContent closeLabel="Schließen">
          <DialogTitle>Panel</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
  });
});
