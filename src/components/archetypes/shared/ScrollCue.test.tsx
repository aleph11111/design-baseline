import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { ScrollCue } from "./ScrollCue";

const size = (el: HTMLElement, client: number, scroll: number) => {
  Object.defineProperty(el, "clientWidth", { configurable: true, value: client });
  Object.defineProperty(el, "scrollWidth", { configurable: true, value: scroll });
};

describe("ScrollCue", () => {
  it("shows the right-edge cue while content is clipped, none at the end or when it fits", () => {
    const { container } = render(
      <ScrollCue data-slot="probe">
        <div>wide</div>
      </ScrollCue>,
    );
    const scroller = container.querySelector<HTMLElement>('[data-slot="probe"]')!;
    const cue = () => container.querySelector('[data-slot="scroll-cue"]');
    expect(scroller.className).toContain("overflow-x-auto");
    expect(cue()).toBeNull(); // jsdom: no layout, fits

    size(scroller, 300, 600);
    fireEvent.scroll(scroller);
    expect(cue()).not.toBeNull();
    expect(cue()!.getAttribute("aria-hidden")).toBe("true");

    scroller.scrollLeft = 300;
    fireEvent.scroll(scroller);
    expect(cue()).toBeNull();

    scroller.scrollLeft = 0;
    size(scroller, 600, 600);
    fireEvent.scroll(scroller);
    expect(cue()).toBeNull();
  });
});
