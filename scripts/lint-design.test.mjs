// @vitest-environment node
//
// Covers the CI-facing surface of `scripts/lint-design.mjs`: the exit code it
// hands a pipeline, and that `--json` emits parseable JSON. Runs the real
// script as a subprocess against the donor's own `src/` — the assertions are
// about codes and shape, never the warning count, which moves every time a
// primitive lands.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
const script = "scripts/lint-design.mjs";

/** Run the linter and return { status, stdout } without throwing on nonzero. */
function run(...args) {
  try {
    return { status: 0, stdout: execFileSync("node", [script, ...args], { cwd: root, encoding: "utf8" }) };
  } catch (err) {
    return { status: err.status, stdout: err.stdout ?? "" };
  }
}

/**
 * Build a throwaway repo tree with two `.tsx` files that share a `surface` prop
 * declaration — one a `*Shell.tsx` under `src/components/archetypes/`, one under
 * `src/components/ui/` — plus an `_adherence.json` carrying `rules`, then run the
 * real scanner (cwd = the temp root) and return { status, stdout }. The only
 * difference between the two files is path, so any divergence in how a rule
 * treats them is the `include` filter working, not the content.
 */
function runFixture(rules, ...args) {
  const dir = mkdtempSync(join(tmpdir(), "lint-design-include-"));
  const archDir = join(dir, "src", "components", "archetypes", "foo");
  const uiDir = join(dir, "src", "components", "ui");
  try {
    mkdirSync(archDir, { recursive: true });
    mkdirSync(uiDir, { recursive: true });
    const props = 'export type P = {\n  surface?: "a" | "b";\n};\n';
    writeFileSync(join(archDir, "FooShell.tsx"), props);
    writeFileSync(join(uiDir, "button.tsx"), props);
    writeFileSync(join(dir, "_adherence.json"), JSON.stringify({ targets: ["src"], rules }));
    let r;
    try {
      // Absolute script path: cwd is the fixture root, not the donor, so a relative
      // path would not resolve (the scanner reads its config from cwd, which is
      // exactly where the fixture puts its `_adherence.json`).
      r = { status: 0, stdout: execFileSync("node", [join(root, script), ...args], { cwd: dir, encoding: "utf8" }) };
    } catch (err) {
      r = { status: err.status, stdout: err.stdout ?? "" };
    }
    return r;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("lint-design CLI", () => {
  it("emits parseable JSON with a summary under --json", () => {
    const { stdout } = run("--json");
    const report = JSON.parse(stdout);
    expect(report.summary.files).toBeGreaterThan(0);
    expect(report.violations).toHaveLength(report.summary.warnings + report.summary.errors);
  });

  it("exits 0 when findings are at or under --ci-threshold", () => {
    const { summary } = JSON.parse(run("--json").stdout);
    expect(run("--ci-threshold", String(summary.warnings + summary.errors)).status).toBe(0);
  });

  it("exits 1 when findings exceed --ci-threshold", () => {
    const { summary } = JSON.parse(run("--json").stdout);
    expect(run("--ci-threshold", String(summary.warnings + summary.errors - 1)).status).toBe(1);
  });

  it("exits 2 on a non-numeric --ci-threshold", () => {
    expect(run("--ci-threshold", "abc").status).toBe(2);
  });

  it("exits 0 on warnings alone when no threshold is set", () => {
    expect(run().status).toBe(0);
  });
});

describe("lint-design per-rule include glob", () => {
  // Fixture files share one line: `surface?: "a" | "b";` — an appearance-noun
  // prop and an inline union both on the same declaration. Only the paths differ.
  const NOUN = "src/components/archetypes/foo/FooShell.tsx";
  const UI = "src/components/ui/button.tsx";
  const filesOf = (stdout) =>
    new Set(JSON.parse(stdout).violations.map((v) => v.file));

  it("scopes a rule with `include` to the archetype shell layer only", () => {
    const rule = {
      id: "appearance-noun-prop",
      pattern: 'surface\\?\\s*:',
      severity: "warn",
      message: "m",
      include: "src/components/archetypes/**/*Shell.tsx",
    };
    const { stdout, status } = runFixture([rule], "--json");
    const files = filesOf(stdout);
    expect(files).toContain(NOUN); // scoped file matches the include glob
    expect(files).not.toContain(UI); // same content, outside the glob — untouched
    expect(status).toBe(0); // warn severity, no threshold
  });

  it("leaves a rule without `include` matching every walked file", () => {
    const rule = {
      id: "appearance-noun-prop",
      pattern: 'surface\\?\\s*:',
      severity: "warn",
      message: "m",
    };
    const { stdout, status } = runFixture([rule], "--json");
    const files = filesOf(stdout);
    expect(files).toContain(NOUN); // no include → repo-wide behaviour
    expect(files).toContain(UI);
    expect(status).toBe(0);
  });

  it("exits 1 for an `error`-severity rule with a live hit inside its include", () => {
    const rule = {
      id: "appearance-noun-prop",
      pattern: 'surface\\?\\s*:',
      severity: "error",
      message: "m",
      include: "src/components/archetypes/**/*Shell.tsx",
    };
    const { status } = runFixture([rule]);
    expect(status).toBe(1); // the ratchet: error hit exits 1
  });

  it("exits 0 for the same rule at `warn`", () => {
    const rule = {
      id: "appearance-noun-prop",
      pattern: 'surface\\?\\s*:',
      severity: "warn",
      message: "m",
      include: "src/components/archetypes/**/*Shell.tsx",
    };
    const { status } = runFixture([rule]);
    expect(status).toBe(0); // same live hit, warn severity → exit 0
  });

  describe("per-rule exclude glob (ratchet valve)", () => {
    it("an exclude narrower than its include does not over-reach", () => {
      // include scopes to the archetype shell layer; exclude targets ONLY an
      // already-closed archetype's folder (detail-overview). The fixture's
      // archetype file is `.../foo/` — inside include but NOT inside exclude —
      // so it is still flagged. The ui-layer file is outside include and never
      // is. Proves `exclude` only removes the exact closed archetype, not the
      // rest of the drain.
      const rule = {
        id: "appearance-noun-prop",
        pattern: 'surface\\?\\s*:',
        severity: "error",
        message: "m",
        include: "src/components/archetypes/**",
        exclude: "src/components/archetypes/detail-overview/**",
      };
      const { stdout, status } = runFixture([rule], "--json");
      const files = filesOf(stdout);
      expect(files).toContain(NOUN); // inside include, not inside exclude
      expect(files).not.toContain(UI); // outside include → untouched
      expect(status).toBe(1); // the non-excluded archetype still errors
    });

    it("an exclude matching an in-include file closes the valve (exit 0)", () => {
      // exclude targets the fixture's archetype folder (`.../foo/`): the file is
      // in include BUT excluded → no live hit → an error rule exits 0. This is
      // the engaged ratchet: the class is closed, so the scan stays green.
      const rule = {
        id: "appearance-noun-prop",
        pattern: 'surface\\?\\s*:',
        severity: "error",
        message: "m",
        include: "src/components/archetypes/**",
        exclude: "src/components/archetypes/foo/**",
      };
      const { stdout, status } = runFixture([rule], "--json");
      const files = filesOf(stdout);
      expect(files).not.toContain(NOUN); // in include but excluded → no violation
      expect(status).toBe(0); // no error hits remain → exit 0
    });

    describe("array-form exclude (multiple closed archetypes)", () => {
      it("closes the valve when ANY array entry matches the file", () => {
        // The drain now carries one exclude glob per closed archetype. The
        // second entry names a folder with no fixture file; the first entry
        // matches `.../foo/` → the file is excluded → the error rule exits 0.
        const rule = {
          id: "appearance-noun-prop",
          pattern: 'surface\\?\\s*:',
          severity: "error",
          message: "m",
          include: "src/components/archetypes/**",
          exclude: [
            "src/components/archetypes/detail-overview/**",
            "src/components/archetypes/foo/**",
          ],
        };
        const { stdout, status } = runFixture([rule], "--json");
        const files = filesOf(stdout);
        expect(files).not.toContain(NOUN); // matched by the second entry
        expect(status).toBe(0);
      });

      it("does not over-reach when no entry matches (the open archetype is still flagged)", () => {
        // Neither entry names `.../foo/` — the valve closes only for the two
        // listed folders. The fixture file stays live → exit 1.
        const rule = {
          id: "appearance-noun-prop",
          pattern: 'surface\\?\\s*:',
          severity: "error",
          message: "m",
          include: "src/components/archetypes/**",
          exclude: [
            "src/components/archetypes/detail-overview/**",
            "src/components/archetypes/bar/**",
          ],
        };
        const { stdout, status } = runFixture([rule], "--json");
        const files = filesOf(stdout);
        expect(files).toContain(NOUN); // no entry matches → still flagged
        expect(status).toBe(1);
      });

      it("still accepts a single-string exclude alongside new array rules", () => {
        // Backwards compatibility: the string form keeps working unchanged, so
        // a drain rule not yet extended to an array still compiles.
        const rule = {
          id: "appearance-noun-prop",
          pattern: 'surface\\?\\s*:',
          severity: "error",
          message: "m",
          include: "src/components/archetypes/**",
          exclude: "src/components/archetypes/foo/**",
        };
        const { status } = runFixture([rule]);
        expect(status).toBe(0);
      });
    });
  });
});
