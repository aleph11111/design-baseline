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
  harvestUnionAliases,
  includeReachableUnder,
  scanFile,
} from "./lint-design.mjs";

describe("includeReachableUnder (structural include-vs-targets reachability)", () => {
  // The failure mode the guard closes: `targets` and `include` share the repo-root-relative
  // namespace, so an include authored without the target prefix matches no walked path and
  // the rule is skipped without firing — the ratchet silently disarmed.

  it("an include that omits the target prefix is unreachable", () => {
    // A `"src/..."` glob under `targets: ["frontend/src"]` — the exact typo this guard exists for.
    expect(includeReachableUnder("src/components/archetypes/**", ["frontend/src"])).toBe(false);
    // The corrected prefix is reachable.
    expect(
      includeReachableUnder("frontend/src/components/archetypes/**", ["frontend/src"]),
    ).toBe(true);
    // A named single-file include suffers the same prefix problem.
    expect(
      includeReachableUnder(
        "src/components/archetypes/detail-overview/DetailOverviewShell.tsx",
        ["frontend/src"],
      ),
    ).toBe(false);
    expect(
      includeReachableUnder(
        "frontend/src/components/archetypes/detail-overview/DetailOverviewShell.tsx",
        ["frontend/src"],
      ),
    ).toBe(true);
  });

  it("a glob aligned with the target is reachable — the donor's own case", () => {
    // `targets: ["src"]` with `src/components/archetypes/**` globs — the donor config.
    expect(includeReachableUnder("src/components/archetypes/**", ["src"])).toBe(true);
    // A named file under the aligned target tree.
    expect(
      includeReachableUnder("src/components/archetypes/form-page/FormPageShell.tsx", ["src"]),
    ).toBe(true);
    // A `*`-wildcard file-name part aligns too (the shell-class-name rules' include).
    expect(includeReachableUnder("src/components/archetypes/**/*Shell.tsx", ["src"])).toBe(
      true,
    );
  });

  it("a zero-prefix `**` include is reachable under any target", () => {
    // `**` alone matches any path — always reachable.
    expect(includeReachableUnder("**", ["frontend/src"])).toBe(true);
    // No configured targets means no walked paths at all — even `**` has nothing to
    // match. (The CLI never reaches the compiler with an empty list: `main()` defaults
    // a missing/empty `targets` to `["src"]`.)
    expect(includeReachableUnder("**", [])).toBe(false);
  });

  it("is structural, not an existence check — an unmatched empty layer is still reachable", () => {
    // A consumer whose archetype layer is not yet installed: the include is structurally
    // reachable even though no file under it exists. Existence is not the guard's job;
    // the live scope is reported separately by the `--json` scan.
    expect(
      includeReachableUnder("frontend/src/components/archetypes/**", ["frontend/src"]),
    ).toBe(true);
  });
});

describe("compileRules (no targets context)", () => {
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

describe("compileRules — include reachability guard", () => {
  const unreachableRule = {
    id: "detail-overview-surface-prop",
    pattern: "surface\\?",
    severity: "error",
    include: "src/components/archetypes/detail-overview/**",
  };

  it("throws a `CompileError` naming the rule, glob and targets when every include is unreachable", () => {
    // The diagnostic names the rule id, the unreachable glob, and the targets — the fix is
    // a one-line prefix, so the error message carries everything the author needs.
    let caught = null;
    try {
      compileRules([unreachableRule], ["frontend/src"]);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(CompileError);
    expect(caught.message).toContain("rule detail-overview-surface-prop");
    expect(caught.message).toContain("unreachable include glob");
    expect(caught.message).toContain("src/components/archetypes/detail-overview/**");
    expect(caught.message).toContain('["frontend/src"]');
  });

  it("the same rule compiles once re-prefixed to the target root", () => {
    expect(() =>
      compileRules(
        [
          {
            id: "detail-overview-surface-prop",
            pattern: "surface\\?",
            severity: "error",
            include: "frontend/src/components/archetypes/detail-overview/**",
          },
        ],
        ["frontend/src"],
      ),
    ).not.toThrow();
  });

  it("a partially reachable include array still compiles (ANY entry is a live path)", () => {
    // `scanFile` applies the rule when ANY include matches — one dead glob among live ones
    // is not an unscoped rule, and flagging it would reject reachable rules.
    expect(() =>
      compileRules(
        [
          {
            id: "shell-class-name",
            pattern: "className\\?",
            include: [
              "src/components/archetypes/**/*Shell.tsx", // dead under this target
              "frontend/src/components/archetypes/**/*Shell.tsx", // live
            ],
          },
        ],
        ["frontend/src"],
      ),
    ).not.toThrow();
  });

  it("without a `targets` context the guard is skipped — pure compile semantics", () => {
    // The CLI always passes the config's `targets`; core callers testing raw glob
    // semantics must not require a target context.
    expect(() =>
      compileRules([{ id: "r", pattern: "x", include: "src/components/archetypes/**" }]),
    ).not.toThrow();
  });

  it("an `exclude` outside the reached set is not guarded — only `include` can disarm", () => {
    // `exclude` narrows a rule; a no-match `exclude` just removes nothing. Only `include`
    // gates whether the rule applies at all, so the guard scopes to `include`.
    expect(() =>
      compileRules(
        [
          {
            id: "r",
            pattern: "x",
            include: "frontend/src/components/archetypes/**",
            exclude: "src/elsewhere/**",
          },
        ],
        ["frontend/src"],
      ),
    ).not.toThrow();
  });

  it("a rule with no `include` is unscoped and never trips the guard", () => {
    expect(() => compileRules([{ id: "r", tag: "button" }], ["frontend/src"])).not.toThrow();
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

  it("keeps an `exclude`'s `.` literal — a one-character near-miss is not excluded", () => {
    // The exclude is the ratchet's precision valve and names exact files. The
    // hand-rolled glob compiler it replaced never escaped its literal parts,
    // so the `.` in an exact-file exclude was an any-character wildcard and a
    // near-miss filename (the `X` for `.` in `table.tsx`) was silently
    // excluded with no signal. `path.matchesGlob` keeps the `.` literal:
    // only the named file is removed.
    const [tableComp] = compileRules([
      {
        id: "no-raw-table",
        tag: "table",
        severity: "error",
        exclude: ["frontend/src/components/ui/table.tsx"],
      },
    ]);
    const tableMarkup = "<table />\n";
    const named = scanFile("frontend/src/components/ui/table.tsx", tableMarkup, [tableComp]);
    const nearMissX = scanFile("frontend/src/components/ui/tableXtsx", tableMarkup, [tableComp]);
    const nearMiss_ = scanFile("frontend/src/components/ui/table_tsx", tableMarkup, [tableComp]);
    expect(named).toHaveLength(0);
    expect(nearMissX).toHaveLength(1);
    expect(nearMiss_).toHaveLength(1);
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

describe("harvestUnionAliases (the same-file union-alias pre-pass)", () => {
  it("harvests string and numeric union aliases, exported or not", () => {
    const text = [
      'export type EntityAvatarSize = "xs" | "sm" | "md";',
      "type Span = 1 | 2 | 3;",
      "  export type Indented = 'a' | 'b';",
    ].join("\n");
    expect(harvestUnionAliases(text)).toEqual(["EntityAvatarSize", "Span", "Indented"]);
  });

  it("ignores an alias that is not a literal union", () => {
    // A union is recognised by "first member is a literal AND a `|` follows on the same
    // line". An object/function/single-type alias has no such shape, so it never arms a
    // `{{unionAliases}}` rule — which would otherwise flag every prop typed against it.
    const text = [
      "export type Id = string;",
      "export type Row = { label: string };",
      "export type Fn = (a: number) => void;",
      "export type Either = Row | Fn;",
    ].join("\n");
    expect(harvestUnionAliases(text)).toEqual([]);
  });

  it("follows a union whose first member wraps onto the next line", () => {
    // What prettier produces once the members no longer fit on the declaration line — the
    // shape `src/components/archetypes/raw-input/native-field.tsx` carries. One line of
    // lookahead, no cross-line state, so it stays inside ADR-0003.
    const text = [
      "export type NativeFieldType =",
      '  | "text"',
      '  | "number"',
      '  | "range";',
    ].join("\n");
    expect(harvestUnionAliases(text)).toEqual(["NativeFieldType"]);
  });

  it("does not follow a first member more than one line below the `=`", () => {
    // The ceiling that remains (ADR-0003): reaching past one line of lookahead means
    // carrying state across lines, which is the parser this scanner is not.
    const text = 'export type X =\n  // the members\n  | "a"\n  | "b";';
    expect(harvestUnionAliases(text)).toEqual([]);
  });

  it("a rule keeps the placeholder as `aliasSource` instead of a compiled regex", () => {
    // The per-file alternation cannot be compiled once, so `compileRules` carries the
    // source and `scanFile` compiles it per file — but a bad pattern must still fail at
    // compile time like any other rule, which the stand-in substitution preserves.
    const [rule] = compileRules([{ id: "a", pattern: "x(?:{{unionAliases}})" }]);
    expect(rule.aliasSource).toBe("x(?:{{unionAliases}})");
    expect(() => compileRules([{ id: "b", pattern: "x(?:{{unionAliases}}" }])).toThrow(CompileError);
  });

  it("scanFile substitutes only the aliases of the file it is scanning", () => {
    const compiled = compileRules([
      { id: "alias-union", pattern: "^\\s*\\w+\\??:\\s*(?:{{unionAliases}})\\b", message: "m" },
    ]);
    const declaring = 'export type Size = "xs" | "sm";\nexport type P = {\n  size?: Size;\n};\n';
    const importing = 'import type { Size } from "./a";\nexport type Q = {\n  size?: Size;\n};\n';
    expect(scanFile("a.tsx", declaring, compiled).map((v) => v.line)).toEqual([3]);
    expect(scanFile("b.tsx", importing, compiled)).toEqual([]);
  });
});
