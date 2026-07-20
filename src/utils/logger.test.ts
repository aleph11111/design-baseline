// @vitest-environment node
// Console/env behaviour only — no DOM. See resolveListState.test.ts.
import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

// The donor typechecks without `@types/node` (see logger.ts), so `process` is
// reached through a locally typed `globalThis` alias rather than the bare
// global. `logger.debug` reads `NODE_ENV` at call time, so each test can swap
// the value in place and restore it afterwards.
type ProcessLike = { env: { NODE_ENV?: string } };
const host = globalThis as { process?: ProcessLike };

const originalProcess = host.process;
const originalNodeEnv = originalProcess?.env.NODE_ENV;

afterEach(() => {
  host.process = originalProcess;
  if (host.process) host.process.env.NODE_ENV = originalNodeEnv;
  vi.restoreAllMocks();
});

describe("logger.debug", () => {
  it("forwards to console.debug outside production", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    host.process!.env.NODE_ENV = "development";
    logger.debug("hello", 1);
    expect(spy).toHaveBeenCalledWith("hello", 1);
  });

  it("is a no-op in production", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    host.process!.env.NODE_ENV = "production";
    logger.debug("hello");
    expect(spy).not.toHaveBeenCalled();
  });

  it("does not throw when `process` is undefined", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    // Simulates a runtime that exposes no `process` global (e.g. a bare
    // browser bundle where the reference was not statically replaced) — the
    // `typeof process !== "undefined"` guard is what keeps this safe.
    host.process = undefined;
    expect(() => logger.debug("hello")).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe.each(["development", "production"])(
  "always-on levels (NODE_ENV=%s)",
  (nodeEnv) => {
    const levels = ["info", "warn", "error"] as const;

    it.each(levels)("logger.%s forwards to the matching console method", (level) => {
      const spy = vi.spyOn(console, level).mockImplementation(() => {});
      host.process!.env.NODE_ENV = nodeEnv;
      logger[level]("hello", { a: 1 });
      expect(spy).toHaveBeenCalledWith("hello", { a: 1 });
    });
  },
);
