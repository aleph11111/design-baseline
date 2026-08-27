// @vitest-environment node
//
// Unit tests for the PURE CORE of `scripts/lint-design.mjs` — the exported
// `compileRules` and `scanFile` seam. The include/exclude glob semantics are
// owned by stdlib `path.matchesGlob` (Node >= 22); covered here at behaviour
// level: a `.` in a glob stays a literal, a `**/*Shell.tsx` include scopes to
// real shells only, and a closed-folder `exclude` closes the ratchet valve.
// Sits alongside the CLI-surface tests in `lint-design.test.mjs` (exit codes,
// `--json` shape, fixture-tree include/exclude behaviour) and asserts the
// shapes its header comments claim, which the subprocess tests cannot reach
// without a repo tree.
import { describe, expect, it } from "vitest";
import {
  CompileError,
  compileRules,
  scanFile,
} from "./lint-design.mjs";

describe("compileRules", () => {
  it("derives a `tag` rule's source as a case-sensitive lookahead so `<Button>` is not a hit", () => {
    const [r] = compileRules([{ id: "no-bare-button", tag: "button" }]);
    expect(r.label).toBe("<button>");
    // A bare lowercase element: `<tag` immediately followed by whitespace, `/`,
    // or `>`. The source is `<button(?=[\s/]>); the lookahead never consumes the
    // lookahead chars, so a match starting at `<button` stands regardless of
    // whether the char immediately after the tag is whitespace, `/`, or `>`.
    expect(r.re.test("<button />")).toBe(true); // whitespace after tag
    r.re.lastIndex = 0;
    expect(r.re.test("<button/>")).toBe(true); // `/` after tag
    r.re.lastIndex = 0;
    expect(r.re.test("<button>")).toBe(true); // `>` closes the tag
    r.re.lastIndex = 0;
    expect(r.re.test("<Button />")).toBe(false); // case-sensitive — the DS primitive is not a hit
    expect(r.re.flags).toBe("g"); // no `i` flag
  });

  it("uses a `pattern` rule's source verbatim (with the `g` flag)", () => {
    const [r] = compileRules([
      { id: "raw", pattern: "focus:ring-1\\b", severity: "error" },
    ]);
    expect(r.label).toBe("raw");
    expect(r.re.source).toBe("focus:ring-1\\b");
    expect(r.severity).toBe("error");
    expect(r.re.flags).toContain("g");
  });

  it("defaults a missing severity to `warn`", () => {
    const [r] = compileRules([{ id: "raw", pattern: "x" }]);
    expect(r.severity).toBe("warn");
  });

  it("carries `include` / `exclude` through as plain glob strings (matched by `path.matchesGlob` at scan time)", () => {
    const [{ includes, excludes }] = compileRules([
      { id: "scoped", pattern: "x", include: "a/**", exclude: ["b/**", "c/**"] },
    ]);
    expect(includes).toEqual(["a/**"]);
    expect(excludes).toEqual(["b/**", "c/**"]);
    // Absent / null normalize to an empty scope list — every walked file.
    const { includes: inc, excludes: exc } = compileRules([{ id: "bare", pattern: "x" }])[0];
    expect(inc).toEqual([]);
    expect(exc).toEqual([]);
  });

  it("throws a `CompileError` on a bad `pattern` — the compiler never exits", () => {
    // The pre-fix code called `return process.exit(2)` from inside `.map()`,
    // making the compiler impure and the control flow only visible from the CLI.
    expect(() => compileRules([{ id: "bad", pattern: "[(unclosed" }])).toThrow(
      CompileError,
    );
    expect(() => compileRules([{ id: "bad", pattern: "[(unclosed" }])).toThrow(
      'rule bad: bad pattern /[(unclosed/',
    );
  });
});

describe("scanFile", () => {
  const rule = { id: "raw-html-control", pattern: "<input\\b" };
  const [comp] = compileRules([rule]);
  const text = 'const x = <input>\nconst y = <input type="text">\n<input />\n';

  it("returns one violation per per-line per-match hit, each carrying file, line and rule", () => {
    const v = scanFile("src/x.tsx", text, [comp]);
    // `v.rule` is the compiled label — for a `pattern` rule that is the rule id
    // (`<tag>` only for tag rules). Project the stable identity fields; `col` is
    // positional and asserted only for presence, not exact value, so the test
    // survives unrelated refactors of the scanner's internals.
    expect(v).toHaveLength(3);
    for (const x of v) {
      expect(x).toMatchObject({ file: "src/x.tsx", rule: "raw-html-control", severity: "warn" });
      expect(typeof x.line).toBe("number");
      expect(typeof x.col).toBe("number");
    }
  });

  it("honors a `**/*Shell.tsx` include — only a real `.tsx` shell is in scope", () => {
    // `path.matchesGlob` keeps a `.` literal: the path `src/AShellXtsx` must
    // NOT be admitted to a `**/*Shell.tsx` include.
    const [shellComp] = compileRules([
      { id: "shell", pattern: "<input\\b", include: ["**/*Shell.tsx", "**/*Sheet.tsx"] },
    ]);
    const notShell = scanFile("src/AShellXtsx", text, [shellComp]);
    const aShell = scanFile("src/FooShell.tsx", text, [shellComp]);
    expect(notShell).toHaveLength(0);
    expect(aShell).toHaveLength(3);
  });

  it("a zero-segment `**` still matches (`src/**/x` admits `src/x`)", () => {
    const [compX] = compileRules([
      { id: "nested", pattern: "<input\\b", include: "src/**/x" },
    ]);
    expect(scanFile("src/x", text, [compX])).toHaveLength(3);
    expect(scanFile("src/deep/nested/x", text, [compX])).toHaveLength(3);
    expect(scanFile("src/other", text, [compX])).toHaveLength(0);
  });

  it("an `exclude` narrower than an `include` removes only the exact files it names", () => {
    // The ratchet valve: a rule that scopes to all archetypes but excludes
    // each already-closed folder still flags the one unclosed archetype.
    const [comp] = compileRules([
      {
        id: "drain",
        pattern: "<input\\b",
        include: "src/components/archetypes/**",
        exclude: ["src/components/archetypes/detail-overview/**"],
      },
    ]);
    const open = scanFile("src/components/archetypes/other/Other.tsx", text, [comp]);
    const closed = scanFile("src/components/archetypes/detail-overview/Detail.tsx", text, [comp]);
    const outside = scanFile("src/components/ui/button.tsx", text, [comp]);
    expect(open).toHaveLength(3);
    expect(closed).toHaveLength(0);
    expect(outside).toHaveLength(0);
  });

  it("a rule with no `include` or `exclude` matches every walked file's text", () => {
    const v = scanFile("src/anywhere.tsx", text, [comp]);
    expect(v).toHaveLength(3);
  });
});
