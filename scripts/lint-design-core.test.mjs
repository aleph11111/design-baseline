// @vitest-environment node
//
// Unit tests for the PURE CORE of `scripts/lint-design.mjs` — the exported
// `globToRegExp`, `compileGlobs`, `compileRules`, `scanFile` seam. Sits
// alongside the CLI-surface tests in `lint-design.test.mjs` (exit codes,
// `--json` shape, subprocess behaviour) and asserts the shapes its header
// comments claim, which the subprocess tests cannot reach without a repo tree.
import { describe, expect, it } from "vitest";
import {
  CompileError,
  compileGlobs,
  compileRules,
  globToRegExp,
  scanFile,
} from "./lint-design.mjs";

describe("globToRegExp", () => {
  it("`**` alone matches any path", () => {
    const re = globToRegExp("**");
    expect(re.test("a/b/c.tsx")).toBe(true);
    expect(re.test("src")).toBe(true);
  });

  it("a leading `**/x` matches `x` directly and nested", () => {
    const re = globToRegExp("**/*Shell.tsx");
    expect(re.test("SomeShell.tsx")).toBe(true);
    expect(re.test("src/components/x/SomeShell.tsx")).toBe(true);
  });

  it("`a/**/b` still matches `a/b` (zero-segment `**` keeps the separator)", () => {
    const re = globToRegExp("src/**/index.tsx");
    expect(re.test("src/index.tsx")).toBe(true);
    expect(re.test("src/deep/nested/index.tsx")).toBe(true);
    expect(re.test("src/other.tsx")).toBe(false);
  });

  it("`*` matches within one segment only — a `/` never crosses it", () => {
    const re = globToRegExp("src/*");
    expect(re.test("src/a.tsx")).toBe(true);
    expect(re.test("src/a/b.tsx")).toBe(false);
  });

  it("escapes every RegExp metacharacter the wildcard split can't leave literal", () => {
    // The pre-fix helper (`s.replace(/[.*+?^${}()[]\\]/g, ...)` — the class closed
    // at the early `]`, leaving nothing to match) left every metacharacter alone,
    // so `**/*Shell.tsx`'s `.` meant "any character". Assert the whole set escapes:
    // accepting the `.` that motivated the fix while leaving `(` / `{` / `[`
    // unescaped would pass the AShellXtsx test below and silently widen other globs.
    // `*` is absent on purpose: the caller owns it via `split('*')` (the
    // single-segment wildcard), so it must NOT be escaped.
    // Each concrete segment `x<c>` must carry a literal backslash before c in the
    // compiled source (for `c === \` that is two backslashes, so `\` + c = `\\`).
    for (const c of ".+?^${}()[]|\\") {
      expect(
        globToRegExp("x" + c).source,
        `metachar ${JSON.stringify(c)} must be escaped in the compiled pattern`,
      ).toContain("\\" + c);
    }
  });

  it("`**/*Shell.tsx` no longer matches `src/AShellXtsx` (the unescaped `.` did)", () => {
    const re = globToRegExp("**/*Shell.tsx");
    expect(re.test("src/AShellXtsx")).toBe(false);
    expect(re.test("src/XSHELLtsx.tsx")).toBe(false); // `.` is literal, not a wildcard
  });

  it("a glob with a `(` or `{` compiles to the intended pattern instead of throwing", () => {
    // A metacharacter that is not escaped can make `new RegExp` throw (the old
    // code would then take the `process.exit(2)` path from inside the compiler);
    // a glob that IS a literal must match its literal path.
    const p = globToRegExp("**/a(b).tsx");
    expect(p.test("src/a(b).tsx")).toBe(true);
    expect(p.test("src/axb.tsx")).toBe(false);
    const br = globToRegExp("**/a{b,c}.tsx");
    expect(br.test("src/a{b,c}.tsx")).toBe(true);
    expect(br.test("src/ab,c.tsx")).toBe(false);
  });
});

describe("compileGlobs", () => {
  it("returns [] for an absent or null key", () => {
    const rule = { id: "r" };
    expect(compileGlobs(rule, "include")).toEqual([]);
    expect(compileGlobs({ id: "r", exclude: null }, "exclude")).toEqual([]);
  });

  it("normalizes a single glob and an array of globs to an equal array of RegExp", () => {
    expect(compileGlobs({ id: "r", include: "src/**" }, "include")).toHaveLength(1);
    expect(
      compileGlobs({ id: "r", include: ["src/**", "out/**"] }, "include"),
    ).toHaveLength(2);
  });

  it("compiles a glob with parentheses as a literal — no throw, no exit", () => {
    // The pre-fix escape left `(` / `)` unescaped, so a glob naming a parenthesized path
    // segment could build a malformed group and take the `process.exit(2)` path from
    // inside `.map()`. With the fixed escape, every non-wildcard metacharacter is a
    // literal: the glob compiles cleanly and matches its literal path.
    expect(() =>
      compileGlobs({ id: "ok", include: "src/(arch)/x.tsx" }, "include"),
    ).not.toThrow();
    expect(
      compileGlobs({ id: "ok", include: "src/(arch)/x.tsx" }, "include")[0].test(
        "src/(arch)/x.tsx",
      ),
    ).toBe(true);
  });
});

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
    // The AShellXtsx case at scan level: a file path the pre-fix unescaped `.`
    // would have admitted to a `**/*Shell.tsx` include must NOT be.
    const [shellComp] = compileRules([
      { id: "shell", pattern: "<input\\b", include: ["**/*Shell.tsx", "**/*Sheet.tsx"] },
    ]);
    const notShell = scanFile("src/AShellXtsx", text, [shellComp]);
    const aShell = scanFile("src/FooShell.tsx", text, [shellComp]);
    expect(notShell).toHaveLength(0);
    expect(aShell).toHaveLength(3);
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
