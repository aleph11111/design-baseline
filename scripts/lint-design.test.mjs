// @vitest-environment node
//
// Covers the CI-facing surface of `scripts/lint-design.mjs`: the exit code it
// hands a pipeline, and that `--json` emits parseable JSON. Runs the real
// script as a subprocess against the donor's own `src/` — the assertions are
// about codes and shape, never the warning count, which moves every time a
// primitive lands.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  const layoutDir = join(dir, "src", "components", "layout");
  const uiDir = join(dir, "src", "components", "ui");
  try {
    mkdirSync(archDir, { recursive: true });
    mkdirSync(layoutDir, { recursive: true });
    mkdirSync(uiDir, { recursive: true });
    // Both a look-union `surface` prop and a top-level `className` escape hatch, so a
    // `surface`-pattern rule and a `className`-pattern rule can each be scoped off path
    // alone. Three archetype-layer files share the same two declarations — one named
    // `*Shell.tsx`, one `*Sheet.tsx` (the overlay-shell suffix that is NOT `*Shell`), and
    // one `*Panel.tsx` (a leaf, NOT a shell) — plus a shared-chrome file under
    // `src/components/layout/` (the second `include` root the archetype-layer
    // appearance rules carry) and a ui-layer control. Only paths differ.
    const props = 'export type P = {\n  surface?: "a" | "b";\n  className?: string;\n};\n';
    writeFileSync(join(archDir, "FooShell.tsx"), props);
    writeFileSync(join(archDir, "FooSheet.tsx"), props);
    writeFileSync(join(archDir, "FooPanel.tsx"), props);
    writeFileSync(join(layoutDir, "SharedChrome.tsx"), props);
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

  it("--json reports a live scope per rule so a silently-emptied include is inspectable", () => {
    // ruleScopes: one entry per rule carrying the number of WALKED files its scope
    // (include minus exclude) actually applies to. A scoped rule reporting 0 is not an
    // error (its layer may simply not be installed yet) but it must be visible, not a
    // silent skip. Unscoped rules report every file.
    const { stdout } = run("--json");
    const { summary, ruleScopes } = JSON.parse(stdout);
    expect(ruleScopes).toHaveLength(
      JSON.parse(readFileSync(join(root, "_adherence.json"), "utf8")).rules.length,
    );
    for (const scope of ruleScopes) {
      expect(typeof scope.rule).toBe("string");
      expect(scope.files).toBeGreaterThanOrEqual(0);
      // Every scoped rule's live scope can never exceed the walked file count.
      expect(scope.files).toBeLessThanOrEqual(summary.files);
    }
  });

  it("exits 2 with a `CompileError` when a rule's `include` globs are all unreachable under the targets", () => {
    // The ratchet's forbidden failure mode no longer fails open: an include that omits
    // the configured `targets` prefix (here a `src/...`-shaped glob under the fixture's
    // `app` target — the same class of typo the donor's `src` target would carry in
    // reverse shape) matches nothing and would be skipped without firing, so the
    // compiler rejects it instead of reporting a clean run.
    const dir = mkdtempSync(join(tmpdir(), "lint-design-unreachable-"));
    try {
      const srcDir = join(dir, "app");
      mkdirSync(srcDir, { recursive: true });
      writeFileSync(join(srcDir, "page.tsx"), 'export const x = 1;\n');
      // targets: ["app"] but the include is scoped to a sibling root the walk never visits.
      writeFileSync(
        join(dir, "_adherence.json"),
        JSON.stringify({
          targets: ["app"],
          rules: [
            {
              id: "bad-include",
              pattern: "x",
              severity: "error",
              include: "lib/components/**",
            },
          ],
        }),
      );
      let r;
      try {
        r = {
          status: 0,
          stdout: execFileSync("node", [join(root, script)], { cwd: dir, encoding: "utf8" }),
        };
      } catch (err) {
        r = { status: err.status, stderr: err.stderr ?? "", stdout: err.stdout ?? "" };
      }
      expect(r.status).toBe(2);
      const diagnostic = (r.stderr ?? "") + (r.stdout ?? "");
      expect(diagnostic).toContain("rule bad-include");
      expect(diagnostic).toContain("unreachable include glob");
      expect(diagnostic).toContain("lib/components/**");
      expect(diagnostic).toContain('["app"]');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
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

describe("lint-design missing target dir", () => {
  it("skips a target dir that does not exist — zero files from it, exit 0, remaining targets still scanned", () => {
    // A consumer legitimately may not have every target root (`targets`
    // defaults to `["src"]`, but a consumer can list `app` / `components`):
    // the missing dir contributes zero files instead of throwing, and the
    // scan completes over the targets that exist.
    const dir = mkdtempSync(join(tmpdir(), "lint-design-missing-target-"));
    try {
      const src = join(dir, "src");
      mkdirSync(src, { recursive: true });
      writeFileSync(join(src, "Page.tsx"), 'export function P() { return "<button>"; }\n');
      writeFileSync(
        join(dir, "_adherence.json"),
        JSON.stringify({
          targets: ["src", "components"],
          rules: [{ id: "no-bare-button", tag: "button", severity: "warn" }],
        }),
      );
      let r;
      try {
        r = { status: 0, stdout: execFileSync("node", [join(root, script), "--json"], { cwd: dir, encoding: "utf8" }) };
      } catch (err) {
        r = { status: err.status, stdout: err.stdout ?? "" };
      }
      expect(r.status).toBe(0); // missing target is skipped silently, not fatal
      const report = JSON.parse(r.stdout);
      expect(report.summary.files).toBe(1); // only the `src` file — `components` contributes zero
      expect(report.violations).toHaveLength(1);
      expect(report.violations[0].file).toBe("src/Page.tsx");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("lint-design per-rule include glob", () => {
  // Fixture files share one line: `surface?: "a" | "b";` — an appearance-noun
  // prop and an inline union both on the same declaration. Only the paths differ.
  const NOUN = "src/components/archetypes/foo/FooShell.tsx";
  const SHEET = "src/components/archetypes/foo/FooSheet.tsx";
  const PANEL = "src/components/archetypes/foo/FooPanel.tsx";
  const LAYOUT = "src/components/layout/SharedChrome.tsx";
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

  describe("array-form include (multi-suffix shell scope)", () => {
    // The shell-class-name rule's `include` is an array so it covers both the
    // `*Shell.tsx`-named and the `*Sheet.tsx`-named shell files (the gap the
    // crud-dialog shell — not named `*Shell` — exposed). These tests mirror the
    // single-glob include behaviour and the exclude block below.
    const TWO_SUFFIX_INCLUDE = [
      "src/components/archetypes/**/*Shell.tsx",
      "src/components/archetypes/**/*Sheet.tsx",
    ];

    it("matches any entry — a `*Sheet.tsx`-named shell is in scope", () => {
      // FooSheet.tsx is NOT `*Shell.tsx`; a single `*Shell.tsx` include would miss it.
      // The array-form include catches it (ANY entry matches) — the general shell
      // case, not only `*Shell`-named files.
      const rule = {
        id: "shell-class-name",
        pattern: 'className\\?\\s*:\\s*string',
        severity: "warn",
        message: "m",
        include: TWO_SUFFIX_INCLUDE,
      };
      const { stdout, status } = runFixture([rule], "--json");
      const files = filesOf(stdout);
      expect(files).toContain(NOUN); // matches the *Shell.tsx entry
      expect(files).toContain(SHEET); // matches the *Sheet.tsx entry (the widened case)
      expect(files).not.toContain(PANEL); // leaf, matches neither entry
      expect(files).not.toContain(UI); // outside include entirely
      expect(status).toBe(0); // warn severity, no threshold
    });

    it("does not over-reach to non-shell leaves (a `*Panel` is untouched)", () => {
      // With the same error-severity pattern the widened glob must NOT pull a
      // non-shell leaf into the ratchet — only the two shell suffixes are in scope.
      const rule = {
        id: "shell-class-name",
        pattern: 'surface\\?\\s*:',
        severity: "error",
        message: "m",
        include: TWO_SUFFIX_INCLUDE,
      };
      const { stdout, status } = runFixture([rule], "--json");
      const files = filesOf(stdout);
      expect(files).toContain(NOUN); // shell
      expect(files).toContain(SHEET); // sheet
      expect(files).not.toContain(PANEL); // leaf not matched → stays out of the error set
      expect(status).toBe(1); // at least one error hit (NOUN + SHEET)
    });

    it("still accepts a single-string `include` alongside array rules", () => {
      // Backwards compatibility: a rule that keeps the string-form `include`
      // (only `*Shell.tsx`) still compiles and matches only that entry.
      const rule = {
        id: "shell-class-name",
        pattern: 'surface\\?\\s*:',
        severity: "warn",
        message: "m",
        include: "src/components/archetypes/**/*Shell.tsx",
      };
      const { stdout } = runFixture([rule], "--json");
      const files = filesOf(stdout);
      expect(files).toContain(NOUN); // the single entry still matches
      expect(files).not.toContain(SHEET); // not in the single-glob scope
    });
  });

  describe("array-form include (the shared-chrome second root)", () => {
    // `archetype-appearance-noun-prop`, `archetype-look-union-prop` and
    // `archetype-numeric-union-prop` each carry `src/components/layout/**` as a
    // second root: the chrome the archetype shells compose (SectionCard,
    // SurfaceFrame) lives outside `src/components/archetypes/`, and hard rule 12
    // governs an appearance prop there on the same terms. Without the root a
    // closed archetype can forward a prop it is supposed to fully key to an
    // ungated owner one directory over (DetailSection.tone -> SectionCard.tone).
    const TWO_ROOT_INCLUDE = ["src/components/archetypes/**", "src/components/layout/**"];

    it("pins the layout root in scope for the appearance-noun rule", () => {
      const rule = {
        id: "appearance-noun-prop",
        pattern: 'surface\\?\\s*:',
        severity: "error",
        message: "m",
        include: TWO_ROOT_INCLUDE,
      };
      const { stdout, status } = runFixture([rule], "--json");
      const files = filesOf(stdout);
      expect(files).toContain(LAYOUT); // shared chrome — the widened root
      expect(files).toContain(NOUN); // the original archetype root still applies
      expect(files).not.toContain(UI); // same content, outside both roots
      expect(status).toBe(1);
    });

    it("pins the layout root in scope for the look-union rule", () => {
      const rule = {
        id: "look-union-prop",
        pattern: '^\\s*\\w+\\?:\\s*"[^"]+"\\s*\\|\\s*"[^"]+"',
        severity: "error",
        message: "m",
        include: TWO_ROOT_INCLUDE,
      };
      const { stdout, status } = runFixture([rule], "--json");
      const files = filesOf(stdout);
      expect(files).toContain(LAYOUT);
      expect(files).toContain(NOUN);
      expect(files).not.toContain(UI);
      expect(status).toBe(1);
    });

    it("misses the layout layer with the archetypes-only include (the gap this root closes)", () => {
      // The pre-widening shape: one string include scoped to the archetype
      // folder. Same file, same prop — invisible. Pins the regression.
      const rule = {
        id: "appearance-noun-prop",
        pattern: 'surface\\?\\s*:',
        severity: "error",
        message: "m",
        include: "src/components/archetypes/**",
      };
      const { stdout } = runFixture([rule], "--json");
      expect(filesOf(stdout)).not.toContain(LAYOUT);
    });

    it("takes a single-file exclude under the layout root without reaching the archetype root", () => {
      // The triaged shared-chrome props are excluded by exact file path
      // (`src/components/layout/SectionCard.tsx`), not by folder glob — the
      // layout dir is one flat folder of unrelated primitives, so a `**` there
      // would disarm the whole root.
      const rule = {
        id: "appearance-noun-prop",
        pattern: 'surface\\?\\s*:',
        severity: "error",
        message: "m",
        include: TWO_ROOT_INCLUDE,
        exclude: ["src/components/layout/SharedChrome.tsx"],
      };
      const { stdout, status } = runFixture([rule], "--json");
      const files = filesOf(stdout);
      expect(files).not.toContain(LAYOUT); // excluded by exact path
      expect(files).toContain(NOUN); // the archetype root is untouched
      expect(status).toBe(1);
    });
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

/**
 * Build a throwaway repo tree from an explicit `{ relPath: content }` map plus an
 * `_adherence.json` carrying `rules`, run the real scanner, and return
 * { status, stdout }. `runFixture` above pins a fixed two-prop file shape; the union
 * rules need per-test file bodies (a type alias in one file and not the other), so
 * these get their own writer rather than widening that one.
 */
function runFilesFixture(rules, files, ...args) {
  const dir = mkdtempSync(join(tmpdir(), "lint-design-union-"));
  try {
    for (const [rel, content] of Object.entries(files)) {
      const abs = join(dir, rel);
      mkdirSync(join(abs, ".."), { recursive: true });
      writeFileSync(abs, content);
    }
    writeFileSync(join(dir, "_adherence.json"), JSON.stringify({ targets: ["src"], rules }));
    try {
      return { status: 0, stdout: execFileSync("node", [join(root, script), ...args], { cwd: dir, encoding: "utf8" }) };
    } catch (err) {
      return { status: err.status, stdout: err.stdout ?? "" };
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const hitsOf = (stdout) =>
  JSON.parse(stdout).violations.map((v) => `${v.file}:${v.line}`);

describe("numeric-literal union props (the shape a quoted-string pattern never reaches)", () => {
  // `archetype-numeric-union-prop`'s live pattern, verbatim. The `\\?` (literal `?`,
  // the OPTIONAL marker) — not `\\??` — keeps a non-optional field of a hook RESULT
  // type out of scope by shape: a value the hook computes is not a per-call-site prop.
  const NUMERIC = "^\\s*\\w+\\?:\\s*[0-9]+\\s*\\|\\s*[0-9]+";

  it("flags a bare numeric union the string-literal rule misses", () => {
    // One file, two rules: the shipped quoted-string pattern finds nothing in it, the
    // numeric one finds the prop. That divergence IS the blind spot this rule closes.
    const files = {
      "src/components/archetypes/grid/Grid.tsx": "export type P = {\n  columns?: 2 | 3 | 4;\n};\n",
    };
    const rules = [
      { id: "look-union", pattern: '^\\s*\\w+\\?:\\s*"[^"]+"\\s*\\|\\s*"[^"]+"', severity: "warn", message: "m" },
      { id: "numeric-union", pattern: NUMERIC, severity: "warn", message: "m" },
    ];
    const { stdout } = runFilesFixture(rules, files, "--json");
    const violations = JSON.parse(stdout).violations;
    expect(violations.map((v) => v.rule)).toEqual(["numeric-union"]);
    expect(violations[0].line).toBe(2);
  });

  it("does not reach a non-optional field of a hook RESULT type — a value the hook computes, not a prop anyone passes (ADR-0004)", () => {
    // The widened walk newly exposes the `.ts` files holding hook result shapes:
    // `isSubmitting: boolean` etc. as NON-optional fields of what the hook returns
    // (useCrudDialogController.ts). A prop the caller does not supply cannot be a
    // per-call-site appearance, and the pattern keeps it out by shape: the live
    // numeric-union rule's `\\?` (literal `?`) rejects `columns: 2 | 3` while
    // `columns?: 2 | 3` still fires. Same file, both shapes — only the optional one
    // lands. (The boolean rule already required `\\?`; this pins the union rules.)
    const files = {
      "src/components/archetypes/grid/useGridState.ts":
        "export type R = {\n  columns: 2 | 3 | 4;\n  isSubmitting: boolean;\n  columnsChoice?: 2 | 3 | 4;\n};\n",
    };
    const rule = {
      id: "numeric-union",
      pattern: NUMERIC,
      severity: "error",
      message: "m",
      include: ["src/components/archetypes/**"],
    };
    const { stdout, status } = runFilesFixture([rule], files, "--json");
    expect(hitsOf(stdout)).toEqual([
      "src/components/archetypes/grid/useGridState.ts:4",
    ]); // non-optional `columns:` out of scope by shape, optional `columnsChoice?:` still lands
    expect(status).toBe(1);
  });

  it("reaches a second include root (`src/components/layout/**`) alongside the archetype root", () => {
    // `StatTileRow` lives in the shared chrome, outside `src/components/archetypes/` —
    // the reason the rule's include carries two roots. A single-root include would
    // report a clean scan over a live defect. The fixture uses an OPTIONAL numeric
    // union (`columns?:`) — the appearance-prop shape the rule targets; a
    // non-optional `columns:` is a hook-result-derived field the pattern keeps out.
    const files = {
      "src/components/layout/StatTileRow.tsx": "export type P = {\n  columns?: 2 | 3 | 4;\n};\n",
      "src/components/ui/grid.tsx": "export type P = {\n  columns?: 2 | 3 | 4;\n};\n",
    };
    const rule = {
      id: "numeric-union",
      pattern: NUMERIC,
      severity: "warn",
      message: "m",
      include: ["src/components/archetypes/**", "src/components/layout/**"],
    };
    const { stdout } = runFilesFixture([rule], files, "--json");
    expect(hitsOf(stdout)).toEqual(["src/components/layout/StatTileRow.tsx:2"]); // ui/ stays out
  });
});

describe("appearance-slot rule (`archetype-appearance-slot`) — the shared-chrome second root", () => {
  // `archetype-appearance-slot`'s live pattern, verbatim. An optional `header`/`stats`
  // typed as `ReactNode` is the appearance-bearing escape hatch; the layout widen is
  // what lets it reach the shared-chrome layer where `SectionCard` lives.
  const SLOT = "^\\s*(header|stats)\\?\\s*:\\s*(React\\.)?ReactNode";

  it("reaches the shared-chrome second include root alongside the archetype root", () => {
    // `SectionCard` lives in the shared chrome, outside `src/components/archetypes/` —
    // the reason the rule's include carries two roots (the last of the four
    // archetype-layer appearance rules to get the widen). A single-root include would
    // report a clean scan over a live defect. `ui/` is outside include and stays out.
    const files = {
      "src/components/layout/SectionCard.tsx": "export type P = {\n  header?: React.ReactNode;\n};\n",
      "src/components/archetypes/foo/FooSection.tsx": "export type P = {\n  stats?: React.ReactNode;\n};\n",
      "src/components/ui/badge.tsx": "export type P = {\n  header?: React.ReactNode;\n};\n",
    };
    const rule = {
      id: "appearance-slot",
      pattern: SLOT,
      severity: "error",
      message: "m",
      include: ["src/components/archetypes/**", "src/components/layout/**"],
    };
    const { stdout } = runFilesFixture([rule], files, "--json");
    expect(hitsOf(stdout).sort()).toEqual(
      [
        "src/components/archetypes/foo/FooSection.tsx:2",
        "src/components/layout/SectionCard.tsx:2",
      ].sort(),
    ); // ui/ stays out
  });

  it("an excluded file inside the widened root is not over-reached", () => {
    // The widen must not over-reach a file excluded by the rule's `exclude` — here the
    // archetype's own closed folder, proving the array-form include + exclude valve
    // still engages on the widened root.
    const files = {
      "src/components/archetypes/detail-overview/DetailSection.tsx":
        "export type P = {\n  header?: React.ReactNode;\n};\n",
      "src/components/layout/SectionCard.tsx": "export type P = {\n  header?: React.ReactNode;\n};\n",
    };
    const rule = {
      id: "appearance-slot",
      pattern: SLOT,
      severity: "error",
      message: "m",
      include: ["src/components/archetypes/**", "src/components/layout/**"],
      exclude: ["src/components/archetypes/detail-overview/**"],
    };
    const { stdout } = runFilesFixture([rule], files, "--json");
    expect(hitsOf(stdout)).toEqual(["src/components/layout/SectionCard.tsx:2"]); // excluded archetype folder stays out
  });
});

describe("union type-alias pre-pass (`{{unionAliases}}`)", () => {
  // `archetype-alias-union-prop`'s live pattern, verbatim — lookahead included.
  // The `\\?` (literal `?`) is the OPTIONAL-marker requirement shared by the
  // appearance rules (see the NUMERIC const's comment).
  const ALIAS =
    "^\\s*(?!(?:surface|variant|tone|density|appearance|rhythm|fill|framed|bordered|compact|padded|size)\\?\\s*:)" +
    "\\w+\\?:\\s*(?:{{unionAliases}})\\b";
  const aliasRule = (extra = {}) => ({ id: "alias-union", pattern: ALIAS, severity: "warn", message: "m", ...extra });

  it("flags a prop typed against a union alias declared in the same file", () => {
    // The EntityAvatar shape: the union is named once at the top of the file, so the
    // prop declaration itself carries no literals for a literal pattern to match. The
    // prop is named `circleSize?:` rather than `size?:` because a bare `size?:` is an
    // appearance noun the lookahead skips — see the ownership test below.
    const files = {
      "src/components/archetypes/e/EntityAvatar.tsx":
        'export type EntityAvatarSize = "xs" | "sm" | "md";\nexport type P = {\n  circleSize?: EntityAvatarSize;\n};\n',
    };
    const { stdout } = runFilesFixture([aliasRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual(["src/components/archetypes/e/EntityAvatar.tsx:3"]);
  });

  it("harvests a numeric union alias too", () => {
    const files = {
      "src/components/archetypes/g/Grid.tsx": "export type Span = 1 | 2 | 3;\nexport type P = {\n  span?: Span;\n};\n",
    };
    const { stdout } = runFilesFixture([aliasRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual(["src/components/archetypes/g/Grid.tsx:3"]);
  });

  it("resolves same-file only — an alias imported from elsewhere is out of scope", () => {
    // The scanner walks one file at a time and holds no module graph (ADR-0003). A
    // consumer file using the SAME alias name is not flagged: the ticket asks for a
    // per-file harvest, not cross-file type resolution, and pretending otherwise would
    // flag every identifier that happens to share a name with some union somewhere.
    const files = {
      "src/components/archetypes/e/EntityAvatar.tsx":
        'export type EntityAvatarSize = "xs" | "sm";\nexport type P = {\n  circleSize?: EntityAvatarSize;\n};\n',
      "src/components/archetypes/e/Consumer.tsx":
        'import type { EntityAvatarSize } from "./EntityAvatar";\nexport type Q = {\n  circleSize?: EntityAvatarSize;\n};\n',
    };
    const { stdout } = runFilesFixture([aliasRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual(["src/components/archetypes/e/EntityAvatar.tsx:3"]);
  });

  it("ignores a file whose aliases are not unions", () => {
    // No union alias in the file → the rule can match nothing and is skipped, rather
    // than compiling an empty alternation (which would match the empty string and flag
    // every prop declaration in the tree).
    const files = {
      "src/components/archetypes/x/X.tsx": "export type Id = string;\nexport type P = {\n  id?: Id;\n};\n",
    };
    const { stdout, status } = runFilesFixture([aliasRule({ severity: "error" })], files, "--json");
    expect(hitsOf(stdout)).toEqual([]);
    expect(status).toBe(0);
  });

  it("leaves an aliased appearance-noun prop to the rule that already owns it", () => {
    // `tone?:` is `archetype-appearance-noun-prop`'s, whatever it is typed as — and that
    // rule carries the per-archetype triage for it. The lookahead keeps one defect from
    // being reported twice under two different messages. `size?:` is on that owned-noun
    // list too (the noun rule triages entity-circle's contract-keyed `size` there), so
    // the lookahead's alternation must carry every name the noun rule's does — only a
    // prefixed name like `circleSize?:` is this rule's to report.
    const files = {
      "src/components/archetypes/c/CalendarShell.tsx":
        'export type Tone = "default" | "success";\nexport type P = {\n  tone?: Tone;\n  size?: Tone;\n  circleSize?: Tone;\n};\n',
    };
    const { stdout } = runFilesFixture([aliasRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual(["src/components/archetypes/c/CalendarShell.tsx:5"]); // circleSize only
  });
});

describe("boolean appearance flags (the shape a noun/union pattern never reaches)", () => {
  // `archetype-appearance-boolean-prop`'s live pattern, verbatim.
  const BOOLEAN =
    "^\\s{0,2}(accent|emphasis|flush|muted|filled|elevated|tinted|sticky\\w*|\\w*[Mm]ono\\w*" +
    "|hideCount|showHeader|showCount|avatar)\\?\\s*:\\s*boolean\\b";
  const boolRule = (extra = {}) => ({ id: "bool-flag", pattern: BOOLEAN, severity: "warn", message: "m", ...extra });

  it("flags a vocabulary name typed `boolean` that every other appearance rule misses", () => {
    // One file, three rules: the shipped noun pattern and the quoted-union pattern both
    // find nothing (`accent` is not a noun, `boolean` is not a literal union), the boolean
    // one finds the prop. That divergence IS the blind spot this rule closes.
    const files = {
      "src/components/layout/MetricList.tsx": "export type P = {\n  accent?: boolean;\n};\n",
    };
    const rules = [
      {
        id: "noun-prop",
        pattern: "^\\s*(surface|variant|tone|density|appearance|rhythm|fill|framed|bordered|compact|padded|size)\\?\\s*:",
        severity: "warn",
        message: "m",
      },
      { id: "look-union", pattern: '^\\s*\\w+\\?:\\s*"[^"]+"\\s*\\|\\s*"[^"]+"', severity: "warn", message: "m" },
      boolRule(),
    ];
    const { stdout } = runFilesFixture(rules, files, "--json");
    const violations = JSON.parse(stdout).violations;
    expect(violations.map((v) => v.rule)).toEqual(["bool-flag"]);
    expect(violations[0].line).toBe(2);
  });

  it("leaves capability booleans alone — the vocabulary is an allowlist, not an exclude list", () => {
    // The whole design of the rule: a behaviour/capability boolean is not an appearance,
    // and it is kept out at the PATTERN level so no `exclude` has to name it one by one.
    // `showDestructive` / `showSidebarTrigger` are the near-misses that a `show*` wildcard
    // would have swept in — a permission and a shell-composition fact, neither a look.
    const files = {
      "src/components/archetypes/a/Shell.tsx":
        "export type P = {\n  isLoading?: boolean;\n  bulkSelectable?: boolean;\n  sortable?: boolean;\n" +
        "  unread?: boolean;\n  canDelete?: boolean;\n  showDestructive?: boolean;\n  showSidebarTrigger?: boolean;\n};\n",
    };
    const { stdout } = runFilesFixture([boolRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual([]);
  });

  it("reaches a `*Mono`-suffixed name and a `sticky*`-prefixed one", () => {
    // The vocabulary carries two shapes, not just bare names: a name CONTAINING mono
    // (`identifierMono` — the same appearance concept under a prefixed name) and a
    // `sticky*` name (`stickyOnMobile`). A bare-`mono` alternation reaches neither.
    const files = {
      "src/components/archetypes/a/Table.tsx":
        "export type P = {\n  identifierMono?: boolean;\n  stickyOnMobile?: boolean;\n  monospace?: boolean;\n};\n",
    };
    const { stdout } = runFilesFixture([boolRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual([
      "src/components/archetypes/a/Table.tsx:2",
      "src/components/archetypes/a/Table.tsx:3",
      "src/components/archetypes/a/Table.tsx:4",
    ]);
  });

  it("omits the boolean-shaped appearance nouns the noun rule already owns", () => {
    // `framed` / `bordered` / `compact` / `padded` are on
    // `archetype-appearance-noun-prop`'s list, which matches them whatever their type.
    // One prop name gets one owner — the same discipline the alias rule's lookahead
    // enforces — so this rule must NOT re-report them under a second message.
    const files = {
      "src/components/archetypes/a/Shell.tsx":
        "export type P = {\n  framed?: boolean;\n  bordered?: boolean;\n  compact?: boolean;\n  padded?: boolean;\n  flush?: boolean;\n};\n",
    };
    const { stdout } = runFilesFixture([boolRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual(["src/components/archetypes/a/Shell.tsx:6"]); // flush only
  });

  it("reaches the second include root (`src/components/layout/**`) alongside the archetype root", () => {
    // `MetricList` and `SectionCard` live in the shared chrome, outside
    // `src/components/archetypes/` — a single-root include would report a clean scan
    // over the live `accent` defect that opened this rule.
    const files = {
      "src/components/layout/MetricList.tsx": "export type P = {\n  accent?: boolean;\n};\n",
      "src/components/ui/badge.tsx": "export type P = {\n  accent?: boolean;\n};\n",
    };
    const { stdout } = runFilesFixture(
      [boolRule({ include: ["src/components/archetypes/**", "src/components/layout/**"] })],
      files,
      "--json",
    );
    expect(hitsOf(stdout)).toEqual(["src/components/layout/MetricList.tsx:2"]); // ui/ stays out
  });

  it("stays at top-level props (indent ≤2) so a nested styling-data leaf is not flagged", () => {
    const files = {
      "src/components/archetypes/m/MatrixGridShell.tsx":
        "export type P = {\n  flush?: boolean;\n  cellStyle?: {\n    mono?: boolean;\n  };\n};\n",
    };
    const { stdout } = runFilesFixture([boolRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual(["src/components/archetypes/m/MatrixGridShell.tsx:2"]);
  });
});

describe("shell `className` typed as something other than `string`", () => {
  // `archetype-shell-class-name`'s live pattern, verbatim — type-agnostic, indent-capped.
  const CLASSNAME = "^\\s{0,2}className\\?\\s*:";
  const classRule = (extra = {}) => ({
    id: "shell-class-name",
    pattern: CLASSNAME,
    severity: "warn",
    message: "m",
    include: ["src/components/archetypes/**/*Shell.tsx", "src/components/archetypes/**/*Sheet.tsx"],
    ...extra,
  });

  it("reaches `className?: ClassValue`, which a `:\\s*string` pattern walks past", () => {
    // The escape hatch is the PROP, not its type: `ClassValue` is already idiomatic in
    // this repo (`src/components/layout/SurfaceFrame.tsx`), so a shell could have reopened
    // the deleted axis just by widening the annotation. Both rules run over one file: the
    // type-pinned one finds only the `string` shell, the type-agnostic one finds both.
    const files = {
      "src/components/archetypes/a/AShell.tsx": "export type P = {\n  className?: ClassValue;\n};\n",
      "src/components/archetypes/b/BShell.tsx": "export type P = {\n  className?: string;\n};\n",
    };
    const pinned = classRule({ id: "pinned", pattern: "^\\s{0,2}className\\?\\s*:\\s*string" });
    const { stdout } = runFilesFixture([pinned, classRule()], files, "--json");
    const byRule = (r) =>
      JSON.parse(stdout)
        .violations.filter((v) => v.rule === r)
        .map((v) => v.file);
    expect(byRule("pinned")).toEqual(["src/components/archetypes/b/BShell.tsx"]);
    expect(byRule("shell-class-name")).toEqual([
      "src/components/archetypes/a/AShell.tsx",
      "src/components/archetypes/b/BShell.tsx",
    ]);
  });

  it("still spares a nested `cellStyle.className` leaf once the type pin is gone", () => {
    // Dropping `:\s*string` leaves the indent cap as the ONLY thing separating a shell's
    // outer-wrapper prop from the matrix-grid per-cell styling-data field. If the cap were
    // lost with the pin, the widening would have traded one blind spot for a false error.
    const files = {
      "src/components/archetypes/m/MatrixGridShell.tsx":
        "export type CellStyle = {\n  align?: string;\n};\nexport type P = {\n  cellStyle?: {\n    className?: string;\n  };\n};\n",
    };
    const { stdout } = runFilesFixture([classRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual([]);
  });

  describe("container-wrapped appearance unions (the `Array<T>` spine the bare-union pattern misses)", () => {
    // The gap this ticket closes: every earlier appearance-union rule reached a union
    // only when it sat IMMEDIATELY after the `:`. Wrap the same union in a container
    // (`Array<`, `ReadonlyArray<`, `Readonly<`, a `readonly (…)`, or a bare `(` before it)
    // and the character after the `:` is now `A`/`r`/`(` — not a quote, digit, or alias
    // name — so the rule walked straight past it. The `look` rule's pattern is widened
    // with an optional container OPENERS prefix, and the same prefix is carried into
    // `numeric` and `alias`, so one rule owns one union KIND across every spelling and a
    // container is still reported once under one message. The `^\s*` anchor is what makes
    // "exactly one hit" hold (a match can start only at the line's prop name), and the
    // prefix consuming only OPENERS is what keeps a non-union element out of scope.
    const cfg = JSON.parse(readFileSync(join(root, "_adherence.json"), "utf8"));
    const ruleById = (id) => cfg.rules.find((r) => r.id === id);
    const look = ruleById("archetype-look-union-prop");
    const numeric = ruleById("archetype-numeric-union-prop");
    // `{{unionAliases}}` must be present — the alias rule is only compiled per-file
    // after the harvest; the harvest is file-local, so these fixtures declare their
    // own alias.
    expect(look.pattern).toBeTruthy();
    expect(numeric.pattern).toBeTruthy();
    expect(ruleById("archetype-alias-union-prop").pattern).toContain("{{unionAliases}}");

    const lookRule = { id: "look-union", pattern: look.pattern, severity: "warn", message: "m" };
    const numericRule = {
      id: "numeric-union",
      pattern: numeric.pattern,
      severity: "warn",
      message: "m",
    };
    const aliasRule = {
      id: "alias-union",
      pattern: ruleById("archetype-alias-union-prop").pattern,
      severity: "warn",
      message: "m",
    };
    const include = ["src/components/archetypes/**", "src/components/layout/**"];

    const hitLines = (stdout, file) =>
      JSON.parse(stdout)
        .violations.filter((v) => v.file === file)
        .map((v) => v.line)
        .sort((a, b) => a - b);
    const anyHitFile = (stdout, rule) =>
      JSON.parse(stdout)
        .violations.filter((v) => v.rule === rule)
        .map((v) => v.file);

    it("flags `Array<Readonly<\"a\" | \"b\">>` under the look rule — the spelling the bare pattern walked past", () => {
      // The LIVE triaged instance (`FigureRow.emphasis`), in minimal form. `Readonly`
      // and `Array` are both consumed as OPENERS by the prefix before the first member
      // reaches the quoted-union the rule already matches.
      const f = "src/components/archetypes/e/ArrayRule.tsx";
      const { stdout } = runFilesFixture(
        [{ ...lookRule, include }],
        { [f]: "export type P = {\n  emphasis?: Array<Readonly<\"a\" | \"b\">>;\n};\n" },
        "--json",
      );
      expect(hitLines(stdout, f)).toEqual([2]);
    });

    it("flags `readonly (\"a\" | \"b\")[]` (the postfix-array spelling) under the look rule", () => {
      // `FigureRow.cellAlign` / `FigureRow.headerAlign` in minimal form: `readonly `
      // and `(` are each one consumed OPENER; the closing `[])` follows the union the
      // rule matches and is never part of the prefix.
      const f = "src/components/archetypes/e/PostfixRule.tsx";
      const { stdout } = runFilesFixture(
        [{ ...lookRule, include }],
        { [f]: "export type P = {\n  cellAlign?: readonly (\"a\" | \"b\")[];\n};\n" },
        "--json",
      );
      expect(hitLines(stdout, f)).toEqual([2]);
    });

    it("flags `(\"a\" | \"b\")[]` (the bare tuple spelling) under the look rule", () => {
      const f = "src/components/archetypes/e/TupleRule.tsx";
      const { stdout } = runFilesFixture(
        [{ ...lookRule, include }],
        { [f]: "export type P = {\n  span?: (\"a\" | \"b\")[];\n};\n" },
        "--json",
      );
      expect(hitLines(stdout, f)).toEqual([2]);
    });

    it("still matches a bare inline union EXACTLY once (no double-report from the widening)", () => {
      // The prefix is optional, so a prop with NO container is untouched — and the
      // `^\s*` anchor means the widened pattern cannot find a SECOND start position on
      // the same line, so widening a rule that already matched a bare union cannot make
      // it report twice. One match, line 2.
      const f = "src/components/archetypes/e/BareRule.tsx";
      const { stdout } = runFilesFixture(
        [{ ...lookRule, include }],
        { [f]: "export type P = {\n  tone?: \"a\" | \"b\";\n};\n" },
        "--json",
      );
      expect(hitLines(stdout, f)).toEqual([2]);
    });

    it("does NOT match a container of a non-union element (string[] / React.ReactNode[] / Array<string>)", () => {
      // The prefix only consumes OPENERS. An element type that is not a literal union
      // (`string`, `React.ReactNode`, `Array<string>`) never reaches the quoted/numeric
      // union the rule matches, so the whole prop is left alone — the same
      // not-an-appearance-axis reasoning the bare rules apply to non-look unions, now
      // extended to the container spelling. Four non-union containers, one file: a hit
      // under either rule in this file would be a false positive the widening introduced.
      const f = "src/components/archetypes/e/NonUnionRule.tsx";
      const files = {
        [f]:
          "export type P = {\n" +
          "  ids?: string[];\n" +
          "  cells?: React.ReactNode[];\n" +
          "  names?: Array<string>;\n" +
          "  columns?: readonly React.ReactNode[];\n" +
          "};\n",
      };
      const { stdout } = runFilesFixture([lookRule, numericRule], files, "--json");
      // Either rule (look OR numeric) reporting this file is a false positive.
      expect(hitLines(stdout, f)).toEqual([]);
      expect(anyHitFile(stdout, "look-union")).not.toContain(f);
      expect(anyHitFile(stdout, "numeric-union")).not.toContain(f);
    });

    it("flags a container of a numeric union under the numeric rule — `Array<1 | 2 | 3>`", () => {
      // The same widening under the numeric rule: `columns?: Array<1 | 2 | 3>` is the
      // container spelling of `columns?: 1 | 2 | 3`, deleted from analytics-dashboard
      // and banned by-name there — a fresh one in an OPEN archetype is a live defect.
      const f = "src/components/archetypes/n/Numeric.tsx";
      const { stdout } = runFilesFixture(
        [{ ...numericRule, include }],
        { [f]: "export type P = {\n  columns?: Array<1 | 2 | 3>;\n};\n" },
        "--json",
      );
      expect(hitLines(stdout, f)).toEqual([2]);
      // And the look rule must NOT claim the same prop (kind ownership: one kind, one rule).
      const lookOnly = runFilesFixture([{ ...lookRule, include }], { [f]: "export type P = {\n  columns?: Array<1 | 2 | 3>;\n};\n" }, "--json");
      expect(hitLines(lookOnly.stdout, f)).toEqual([]);
    });

    it("reaches an aliased union wrapped in a container — `circleSize?: Array<EntityAvatarSize>`", () => {
      // The alias rule's prefix is the same OPENERS set. `Array<EntityAvatarSize>` is
      // a container of a union ALIAS — the `Array<` opener is consumed before the alias
      // name reaches `(?:{{unionAliases}})\\b`, and the alias harvest is file-local so
      // the file must declare the union the prop is typed against. One hit, line 3.
      const f = "src/components/archetypes/a/Avatar.tsx";
      const { stdout } = runFilesFixture(
        [{ ...aliasRule, include }],
        {
          [f]:
            'export type EntityAvatarSize = "xs" | "sm";\n' +
            "export type P = {\n" +
            "  circleSize?: Array<EntityAvatarSize>;\n" +
            "};\n",
        },
        "--json",
      );
      expect(hitLines(stdout, f)).toEqual([3]);
    });
  });
});

describe("walk coverage: `.ts` files are scanned like `.tsx` (the widened walk)", () => {
  // `archetype-appearance-noun-prop`'s live pattern, verbatim — it already carried the
  // literal-`?` shape the widening keeps, so this block pins the WALK, not a pattern
  // shape change.
  const NOUN = "^\\s*(surface|variant|tone|density|appearance|rhythm|fill|framed|bordered|compact|padded|size)\\?\\s*:";
  const nounRule = () => ({
    id: "appearance-noun-prop",
    pattern: NOUN,
    severity: "error",
    message: "m",
    include: ["src/components/archetypes/**"],
  });

  it("reports an appearance-shaped prop declared in a `.ts` file", () => {
    // The pre-widening walk was `**/*.tsx` — a `.ts` file shared by a table contract
    // (tableColumn.ts) was the class of live defect it hid: reachable by the rule's
    // `include`, never handed to it by the walk. A `.tsx` control with the same line
    // proves the scan of a `.ts` file is the scan of a walked file, not a bypass.
    const files = {
      "src/components/archetypes/t/tableColumn.ts": "export type C = {\n  surface?: string;\n};\n",
      "src/components/archetypes/t/Control.tsx": "export type C = {\n  surface?: string;\n};\n",
    };
    const { stdout, status } = runFilesFixture([nounRule()], files, "--json");
    expect(hitsOf(stdout)).toEqual([
      "src/components/archetypes/t/Control.tsx:2", // the `.tsx` control
      "src/components/archetypes/t/tableColumn.ts:2", // the `.ts` file — walked like any other
    ]);
    expect(status).toBe(1); // a `.ts` prop is an error-tier hit, exit 1
  });

  it("does not report a non-optional field of a `.ts` hook-result shape", () => {
    // Companion pin for the `.ts` case: the same `.ts` file holding a hook's RETURN
    // type (non-optional `columns: 2 | 3 | 4` — a derived value, ADR-0004) must stay
    // clean under every appearance rule whose live pattern requires the optional `?`.
    // `runFilesFixture` runs the real scanner over the real rule set in the fixture's
    // config, so this asserts the shipped walk + shipped patterns together.
    const files = {
      "src/components/archetypes/grid/useGridState.ts":
        "export type R = {\n  columns: 2 | 3 | 4;\n  isSubmitting: boolean;\n};\n",
      "src/components/archetypes/grid/useGridState.tsx":
        "export type R = {\n  columns: 2 | 3 | 4;\n};\n",
    };
    // The live patterns of the four rules the widening tightened, each as its own rule.
    const shippedPatterns = [
      { id: "noun", pattern: NOUN, severity: "error", message: "m" },
      { id: "look-union", pattern: "^\\s*\\w+\\?:\\s*\"[^\"]+\"\\s*\\|\\s*\"[^\"]+\"", severity: "error", message: "m" },
      { id: "numeric-union", pattern: "^\\s*\\w+\\?:\\s*[0-9]+\\s*\\|\\s*[0-9]+", severity: "error", message: "m" },
      {
        id: "alias-union",
        pattern: "^\\s*(?!(?:surface|variant|tone|density|appearance|rhythm|fill|framed|bordered|compact|padded|size)\\?\\s*:)\\w+\\?:\\s*(?:{{unionAliases}})\\b",
        severity: "error",
        message: "m",
      },
    ];
    // No `include`: the test asserts the PATTERN shapes, so file paths must not be the
    // thing that keeps them out.
    const { stdout, status } = runFilesFixture(shippedPatterns, files, "--json");
    expect(hitsOf(stdout)).toEqual([]);
    expect(status).toBe(0);
  });
});

describe("residual appearance prop in a closed archetype folder (the allowlist gap)", () => {
  // Regression against the LIVE gate, not a copy that could drift: the test pulls the
  // shipped `*-residual-appearance-prop` rules straight out of _adherence.json. Each is
  // scoped (include) to one closed folder and guards the appearance shapes with a leading
  // negative lookahead naming that folder's legal props — so a new, unkeyed appearance prop
  // added inside a closed folder (which the excluded drain rules no longer reach) is the
  // error these rules exist to catch, while the enumerated legal props are skipped.
  const residual = (id) => {
    const r = JSON.parse(readFileSync(join(root, "_adherence.json"), "utf8")).rules.find(
      (x) => x.id === id,
    );
    expect(r).toBeTruthy();
    expect(r.severity).toBe("error");
    return r;
  };

  it("flags an unkeyed string-union appearance prop in a closed folder (error, exit 1)", () => {
    // settings-table carries NO legal props, so its rule's lookahead skips nothing —
    // the strictest direction. The folder is excluded from the drain rules, so ONLY
    // this residual rule can reach `tone?: "brand" | "loud"`.
    const rule = residual("settings-table-residual-appearance-prop");
    const files = {
      "src/components/archetypes/settings-table/Foo.tsx":
        'export type P = {\n  tone?: "brand" | "loud";\n};\n',
    };
    const { status, stdout } = runFilesFixture([rule], files, "--json");
    expect(status).toBe(1);
    const vs = JSON.parse(stdout).violations;
    expect(vs).toHaveLength(1);
    expect(vs[0].rule).toBe(rule.id);
    expect(vs[0].line).toBe(2);
    expect(vs[0].severity).toBe("error");
  });

  it("reaches a numeric-literal-union appearance prop the quoted-string pattern misses", () => {
    // `density?: 1 | 2` matches only the numeric branch of the rule's alternation — the
    // same shape `archetype-numeric-union-prop` catches across the open folders.
    const rule = residual("settings-table-residual-appearance-prop");
    const files = {
      "src/components/archetypes/settings-table/Foo.tsx": "export type P = {\n  density?: 1 | 2;\n};\n",
    };
    const { status } = runFilesFixture([rule], files);
    expect(status).toBe(1);
  });

  it("leaves an enumerated legal prop unflagged while still catching an unkeyed one (the two directions at once)", () => {
    // form-page's legal prop is `width`. Line 2 (`width`) is the allowlist's, so the
    // negative lookahead skips it; line 3 (`tone`) is NOT a form-page legal prop, so it
    // is flagged. One file, both directions: the gate does not over-reach onto the legal
    // prop, and it does not under-reach past the unkeyed one.
    const rule = residual("form-page-residual-appearance-prop");
    const files = {
      "src/components/archetypes/form-page/Foo.tsx":
        'export type P = {\n  width?: "sm" | "md" | "lg" | "xl";\n  tone?: "a" | "b";\n};\n',
    };
    const { stdout } = runFilesFixture([rule], files, "--json");
    const vs = JSON.parse(stdout).violations;
    expect(vs).toHaveLength(1);
    expect(vs[0].line).toBe(3); // width (line 2) skipped, tone (line 3) flagged
  });

  it("leaves detail-overview's contract-keyed `tone` unflagged (exit 0)", () => {
    // `tone` is legal in detail-overview (data-section-vs-reference-panel grading per
    // detail-overview.md L517-519), so the file the gap already "bit" stays clean — the
    // prop is legal by the gate now saying so, not by the gate having no opinion.
    const rule = residual("detail-overview-residual-appearance-prop");
    const files = {
      "src/components/archetypes/detail-overview/DetailSection.tsx":
        'export type P = {\n  tone?: "default" | "muted";\n};\n',
    };
    const { status } = runFilesFixture([rule], files);
    expect(status).toBe(0);
  });
});
