import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIsMobile } from "./use-mobile";

// jsdom has neither matchMedia nor a resizable innerWidth listener wired to it.
// The stub lets a test drive both halves of the hook's input: the width it
// reads and the `change` event it reacts to.
let addEventListener: ReturnType<typeof vi.fn>;
let removeEventListener: ReturnType<typeof vi.fn>;
let mediaQuery: string | undefined;

function fireChange() {
  const handler = addEventListener.mock.calls[0]![1];
  act(() => {
    handler();
  });
}

function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

let observed: boolean | undefined;

function TestConsumer() {
  observed = useIsMobile();
  return null;
}

beforeEach(() => {
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  mediaQuery = undefined;
  observed = undefined;
  window.matchMedia = ((query: string) => {
    mediaQuery = query;
    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  }) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
});

describe("useIsMobile", () => {
  it("reports true on mount when the viewport is narrower than the breakpoint", () => {
    setInnerWidth(767);
    render(<TestConsumer />);
    expect(observed).toBe(true);
  });

  it("reports false on mount at and above the breakpoint", () => {
    setInnerWidth(768);
    render(<TestConsumer />);
    expect(observed).toBe(false);

    cleanup();
    setInnerWidth(1024);
    render(<TestConsumer />);
    expect(observed).toBe(false);
  });

  it("queries the max-width one pixel below the breakpoint", () => {
    setInnerWidth(1024);
    render(<TestConsumer />);
    expect(mediaQuery).toBe("(max-width: 767px)");
  });

  it("recomputes when the media query fires a change event", () => {
    setInnerWidth(1024);
    render(<TestConsumer />);
    expect(observed).toBe(false);

    setInnerWidth(500);
    fireChange();
    expect(observed).toBe(true);

    setInnerWidth(900);
    fireChange();
    expect(observed).toBe(false);
  });

  it("removes the same change listener it registered on unmount", () => {
    setInnerWidth(1024);
    const { unmount } = render(<TestConsumer />);

    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(removeEventListener).not.toHaveBeenCalled();

    const [event, handler] = addEventListener.mock.calls[0]!;
    unmount();

    expect(removeEventListener).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledWith(event, handler);
  });
});
