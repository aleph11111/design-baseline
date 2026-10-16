// @vitest-environment node
// Console/env behaviour only — no DOM. See resolveListState.test.ts.
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
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
    // try/catch in `isDevBuild` is what keeps this safe.
    host.process = undefined;
    expect(() => logger.debug("hello")).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

});

// Vite shape: the bundler substitutes only the literal `process.env.NODE_ENV`
// text and the browser has no `process` global. Bundle the real logger with that
// `define` (esbuild is what Vite uses) and run it in a context without `process`.
describe("logger.debug in a Vite browser bundle", () => {
  function runLoggerBundle(nodeEnv: "development" | "production") {
    const { outputFiles } = buildSync({
      entryPoints: [fileURLToPath(new URL("./logger.ts", import.meta.url))],
      bundle: true,
      write: false,
      format: "cjs",
      define: { "process.env.NODE_ENV": JSON.stringify(nodeEnv) },
    });
    const module = { exports: {} as { logger: typeof logger } };
    const debug = vi.fn();
    runInNewContext(outputFiles[0]!.text, { module, exports: module.exports, console: { debug } });
    module.exports.logger.debug("x");
    return debug;
  }

  it("emits console.debug in a development build", () => {
    expect(runLoggerBundle("development")).toHaveBeenCalledWith("x");
  });

  it("stays silent in a production build", () => {
    expect(runLoggerBundle("production")).not.toHaveBeenCalled();
  });
});
