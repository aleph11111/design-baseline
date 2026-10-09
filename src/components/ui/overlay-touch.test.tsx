import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./sheet";
import { PaginationLink } from "./pagination";
import { ControlDensityProvider } from "./toolbar-band";

afterEach(cleanup);

const closeBtn = () => screen.getByRole("button", { name: /close/i });

describe("overlay close under touch density", () => {
  it("DialogContent close is 44pt under touch, small otherwise", () => {
    const ui = (
      <Dialog open>
        <DialogContent><DialogTitle>t</DialogTitle><DialogDescription>d</DialogDescription></DialogContent>
      </Dialog>
    );
    render(<ControlDensityProvider density="touch">{ui}</ControlDensityProvider>);
    expect(closeBtn().className).toContain("h-11 w-11");
    cleanup();
    render(ui);
    expect(closeBtn().className).not.toContain("h-11");
  });

  it("SheetContent close is 44pt under touch", () => {
    render(
      <ControlDensityProvider density="touch">
        <Sheet open>
          <SheetContent><SheetTitle>t</SheetTitle><SheetDescription>d</SheetDescription></SheetContent>
        </Sheet>
      </ControlDensityProvider>
    );
    expect(closeBtn().className).toContain("h-11 w-11");
  });

  it("PaginationLink icon is 44pt under touch, h-9 w-9 otherwise", () => {
    const { getByText, rerender } = render(
      <ControlDensityProvider density="touch"><PaginationLink href="#">1</PaginationLink></ControlDensityProvider>
    );
    expect(getByText("1").className).toContain("h-11 w-11");
    rerender(<PaginationLink href="#">1</PaginationLink>);
    expect(getByText("1").className).toContain("h-9 w-9");
  });
});
