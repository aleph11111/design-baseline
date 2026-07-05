import { describe, expect, it, vi } from "vitest";
import { getInteractiveRowProps } from "./interactiveRow";

function keyEvent(key: string) {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe("getInteractiveRowProps", () => {
  it("returns no props when there is no activate handler", () => {
    expect(getInteractiveRowProps(undefined)).toEqual({});
  });

  it("makes the row a focusable, ARIA button when an activate handler is given", () => {
    const props = getInteractiveRowProps(() => {});
    expect(props.role).toBe("button");
    expect(props.tabIndex).toBe(0);
  });

  it("fires the handler on Enter", () => {
    const onActivate = vi.fn();
    const props = getInteractiveRowProps(onActivate);
    props.onKeyDown!(keyEvent("Enter"));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("fires the handler on Space and prevents the page scroll", () => {
    const onActivate = vi.fn();
    const props = getInteractiveRowProps(onActivate);
    const event = keyEvent(" ");
    props.onKeyDown!(event);
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", () => {
    const onActivate = vi.fn();
    const props = getInteractiveRowProps(onActivate);
    props.onKeyDown!(keyEvent("a"));
    expect(onActivate).not.toHaveBeenCalled();
  });
});
