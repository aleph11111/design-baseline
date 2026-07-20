// @vitest-environment node
// Pure state resolution — no DOM. Opting out of the config-wide jsdom
// environment skips a per-file jsdom build this file never uses.
import { describe, expect, it } from "vitest";
import { resolveListState } from "./resolveListState";

describe("resolveListState", () => {
  it("loading wins over error and emptiness", () => {
    expect(
      resolveListState({ isLoading: true, error: new Error("x"), isEmpty: true }),
    ).toBe("loading");
  });

  it("error wins over emptiness when not loading", () => {
    expect(
      resolveListState({ isLoading: false, error: new Error("x"), isEmpty: true }),
    ).toBe("error");
  });

  it("resolves empty when not loading or erroring and there is no data", () => {
    expect(resolveListState({ isLoading: false, error: null, isEmpty: true })).toBe(
      "empty",
    );
  });

  it("resolves content when not loading or erroring and there is data", () => {
    expect(
      resolveListState({ isLoading: false, error: undefined, isEmpty: false }),
    ).toBe("content");
  });

  it("treats isLoading as falsy unless strictly true", () => {
    expect(
      resolveListState({ isLoading: undefined, error: undefined, isEmpty: false }),
    ).toBe("content");
  });
});
