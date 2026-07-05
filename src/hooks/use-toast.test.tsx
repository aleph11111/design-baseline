import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { listeners, toast, useToast } from "./use-toast";

function TestConsumer() {
  useToast();
  return null;
}

describe("useToast", () => {
  it("registers its listener once and does not re-subscribe on toast dispatches", () => {
    const pushSpy = vi.spyOn(listeners, "push");
    const spliceSpy = vi.spyOn(listeners, "splice");

    render(<TestConsumer />);
    expect(pushSpy).toHaveBeenCalledTimes(1);

    act(() => {
      toast({ title: "first" });
      toast({ title: "second" });
      toast({ title: "third" });
    });

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(spliceSpy).not.toHaveBeenCalled();
  });
});
