// @vitest-environment node
//
// Covers `scripts/scan-adoption-quality.mjs` in two layers. The pure core —
// exclude classification, the PCRE2→V8 anchor compat, signal compilation, the
// co-occurrence gate, backreference windows, the at most one hit per file
// counting unit, the brand-token checks and the summary — is imported and
// tested directly (importing the script runs no scan). A small CLI smoke set
// runs the real script as a subprocess: the `--json` report shape against the
// donor's own src (every signal MEASURED, hitless ones included), the walk and
// flags against a throwaway fixture tree, and the radar-not-gate exit contract
// (0 on findings, 2 on usage/config errors). The donor's own hit COUNT is
// asserted nowhere — the shipped signals and the demo surfaces they flag move
// independently (see the script header); the shape and semantics are what
// stay stable.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
  classifyExcludes,
  compileBrandSignals,
  compileSignals,
  ConfigError,
  isExcluded,
  parseArgs,
  pcreToJs,
  scanSource,
  summarize,
} from "./scan-adoption-quality.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const script = join(root, "scripts", "scan-adoption-quality.mjs");
const signalsFile = join(root, "docs", "audit-signals.json");

const signalsDoc = JSON.parse(readFileSync(signalsFile, "utf8"));

/** Run the scanner (cwd = the given dir) and return { status, stdout } without throwing on nonzero. */
function run(cwd, ...args) {
  try {
    return { status: 0, stdout: execFileSync("node", [script, ...args], { cwd, encoding: "utf8" }) };
  } catch (err) {
    return { status: err.status, stdout: err.stdout ?? "" };
  }
}

const parse = (stdout) => JSON.parse(stdout);

/**
 * Build a throwaway consumer repo: the signals file at a NON-standard path (proves
 * --signals is honored, not just the default <root>/docs/audit-signals.json layout),
 * the sources under a dir not named `src` (proves --targets), one `src/` decoy dir the
 * default targets WOULD walk if the override were ignored, and fixture pages exercising
 * the gate, the exclusion, the \A anchor, and the backreference window.
 */
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "adoption-quality-scan-"));
  const app = join(dir, "app");
  const decoy = join(dir, "src");
  mkdirSync(app, { recursive: true });
  mkdirSync(decoy, { recursive: true });

  const signals = {
    artifact: "audit-signals",
    globs: ["*.tsx", "*.ts"],
    exclude: ["node_modules", "__tests__", ".test.", ".spec.", "dist"],
    adoptionQuality: [
      // Line-scoped, shell-gated — the canonical shape (a copy of the live
      // detail-tabbed-primary-nav entry, kept in lockstep with it here on
      // purpose: a change to the live entry's shape should be felt here).
      {
        id: "detail-tabbed-primary-nav",
        coOccursWith: "DetailOverviewShell",
        regex: "<TabsList\\b",
        smell: "tab strip as PRIMARY nav inside a detail page",
        shouldBe: "always-visible sections",
        tier: "red",
      },
      // The PCRE string-anchor ABSENCE shape — the live
      // form-page-missing-errorboundary entry verbatim. Un-rewritten, a `\A`
      // compiles in V8 as a literal "A" and this check silently never fires;
      // the fixture file WITHOUT the marker must carry the line-1 hit.
      {
        id: "form-page-missing-errorboundary",
        coOccursWith: "FormPageShell",
        regex: "\\A(?!(?:.|\\n)*ErrorBoundary)",
        smell: "FormPageShell adopted without the page-level ErrorBoundary",
        shouldBe: "wrap the page in <ErrorBoundary>",
        tier: "red",
      },
      // The whole-file absence lookahead IN FRONT of a positive catch-body
      // match — the live b-form-page-swallowed-submit-error entry, read from
      // the live file so the fixture tests the shipped regex and gate.
      signalsDoc.adoptionQuality.find((s) => s.id === "b-form-page-swallowed-submit-error"),
      // The indentation-matched backreference window (the live
      // list-button-row-above-shell mechanism at miniature scale): a line
      // carrying (Button) at indent N, then a line at the SAME indent carrying
      // (Panel). The \1 is what keeps an inner element at a different indent
      // out of the window.
      {
        id: "fixture-backref-window",
        coOccursWith: "Panel",
        regex: "\\n([ \\t]+)<Button\\b[\\s\\S]{0,100}?\\n\\1<Panel\\b",
        smell: "button row as a sibling above the panel at matched indent",
        shouldBe: "actions inside the panel toolbar",
        tier: "yellow",
      },
      // A signal deliberately absent from NO file — a fixture-only entry that
      // must still appear in the output with hits: [] (measured, zero).
      {
        id: "fixture-never-fires",
        coOccursWith: "NeverAdoptedShell",
        regex: "<TabsList\\b",
        smell: "control entry — measured, never expected to fire",
        shouldBe: "n/a",
        tier: "yellow",
      },
    ],
    brandTokens: signalsDoc.brandTokens,
  };
  writeFileSync(join(dir, "signals.json"), JSON.stringify(signals, null, 2));

  // Two <TabsList> in one file: the counting unit is a candidate surface (a
  // file), not a match — at most one hit per file.
  writeFileSync(
    join(app, "detail.tsx"),
    "import { DetailOverviewShell } from '@components/DetailOverviewShell';\n" +
      "export function Detail() {\n" +
      "  return <DetailOverviewShell><TabsList>t</TabsList><TabsList>t2</TabsList></DetailOverviewShell>;\n" +
      "}\n",
  );
  // Same pattern, inside an excluded .test. file — must not be counted.
  writeFileSync(
    join(app, "detail.test.tsx"),
    "import { DetailOverviewShell } from '@components/DetailOverviewShell';\n" +
      "export function Detail() { return <DetailOverviewShell><TabsList>t</TabsList></DetailOverviewShell>; }\n",
  );
  // FormPageShell WITHOUT the marker — the \A absence must hit at line 1.
  writeFileSync(
    join(app, "form.tsx"),
    "import { FormPageShell } from '@components/FormPageShell';\n" +
      "export function Form() { return <FormPageShell>form</FormPageShell>; }\n",
  );
  // FormPageShell WITH the marker somewhere — cleared, no hit.
  writeFileSync(
    join(app, "form-errorboundary.tsx"),
    "import { FormPageShell } from '@components/FormPageShell';\n" +
      "export function Form() { return <ErrorBoundary><FormPageShell>form</FormPageShell></ErrorBoundary>; }\n",
  );
  // Toast-only catch in a B consumer — flagged at line 1 (slurp absence).
  writeFileSync(
    join(app, "form-toast.tsx"),
    "import { FormPageActions } from '@components/FormPageActions';\n" +
      "async function onSubmit() {\n" +
      "  try { await save(); } catch (err) {\n" +
      "    toast.error('Save failed');\n" +
      "  }\n" +
      "}\n",
  );
  // Same catch, but the error is also mapped via setError('root', …) — cleared.
  writeFileSync(
    join(app, "form-seterror.tsx"),
    "import { FormPageActions } from '@components/FormPageActions';\n" +
      "async function onSubmit() {\n" +
      "  try { await save(); } catch (err) {\n" +
      "    form.setError('root', { message: 'Save failed' });\n" +
      "    toast.error('Save failed');\n" +
      "  }\n" +
      "}\n",
  );
  // Extracted submit hook: no shell name, but useFormPageState's beginSubmit
  // opens the gate — flagged.
  writeFileSync(
    join(app, "useSubmission.ts"),
    "export const useSubmission = ({ beginSubmit }) => async () => {\n" +
      "  try { beginSubmit(); } catch { toast.error('Failed'); }\n" +
      "};\n",
  );
  // B page with the word "catch" only in a comment and a brace-less
  // .catch(() => null) — no catch block toasts, so neither may anchor the
  // window onto the unrelated if-block below.
  writeFileSync(
    join(app, "form-no-catch-block.tsx"),
    "import { FormPageActions } from '@components/FormPageActions';\n" +
      "// catch upload errors below\n" +
      "load().catch(() => null)\n" +
      "if (!file) { toast.error('Pick a file') }\n",
  );
  // Toast-only catch in a non-B file — the gate keeps it out.
  writeFileSync(join(app, "not-b.ts"), "try { go(); } catch { toast.error('x'); }\n");
  // Backreference window: matched indents — the button sibling sits at the
  // same 2-space indent as the panel line below it.
  writeFileSync(
    join(app, "indent-match.tsx"),
    "import { Panel } from '@components/Panel';\n" +
      "export function Page() {\n" +
      "  return (\n" +
      "    <Button>Add</Button>\n" +
      "    <Panel>p</Panel>\n" +
      "  );\n" +
      "}\n",
  );
  // Same shape, but the closing element line at a DIFFERENT indent — \1 must
  // keep this OUT of the window (a naive no-backreference read would match).
  writeFileSync(
    join(app, "indent-mismatch.tsx"),
    "import { Panel } from '@components/Panel';\n" +
      "export function Page() {\n" +
      "  return (\n" +
      "  <Button>Add</Button>\n" +
      "      <Panel>p</Panel>\n" +
      "  );\n" +
      "}\n",
  );
  // The pattern's line, but the file never adopts the gated shell — the gate
  // is what excludes it, not the regex.
  writeFileSync(join(app, "plain.tsx"), "export function Plain() { return <TabsList>no shell</TabsList>; }\n");
  // A brand file declaring a retired role is walked; the donor-owned layer
  // file declares --db-* by design and is never matched by name.
  writeFileSync(join(app, "tokens.css"), ":root {\n  --ring: 217 91% 60%;\n}\n");
  writeFileSync(join(app, "tokens.layer.css"), ":root {\n  --db-content-max: 1180px;\n}\n");
  // Decoy under the DEFAULT target dir — only reachable if --targets app was
  // silently ignored (its content would then surface in the counts).
  writeFileSync(
    join(decoy, "decoy.tsx"),
    "import { DetailOverviewShell } from '@components/DetailOverviewShell';\n" +
      "export function Decoy() { return <DetailOverviewShell><TabsList>d</TabsList></DetailOverviewShell>; }\n",
  );
  return dir;
}

describe("scan-adoption-quality CLI smoke", () => {
  it("--json on the donor's own src reports every live signal (measured, zero) and clean brand tokens", () => {
    const { stdout, status } = run(root, "--json");
    expect(status).toBe(0);
    const report = parse(stdout);
    expect(report.artifact).toBe("adoption-quality-scan");
    expect(report.signals).toHaveLength(signalsDoc.adoptionQuality.length);
    // The radar's core promise: the array is MEASURED end to end, so a
    // consumer's vendored snapshot and the live file share an entry per id.
    const ids = new Set(report.signals.map((s) => s.id));
    for (const entry of signalsDoc.adoptionQuality) expect(ids.has(entry.id)).toBe(true);
    expect(report.signals.every((s) => Array.isArray(s.hits) && typeof s.hitCount === "number")).toBe(true);
    expect(report.summary.totalHits).toBe(report.signals.reduce((n, s) => n + s.hitCount, 0));
    expect(report.summary.files).toBeGreaterThan(0);
    expect(report.summary.uncompiled).toBe(0); // every shipped signal compiles under V8
    expect(report.summary.brandTokenFiles).toBe(1);
    expect(report.brandTokens.map((s) => s.id).sort()).toEqual(signalsDoc.brandTokens.map((s) => s.id).sort());
    expect(report.brandTokens.every((s) => !s.error && s.hitCount === 0)).toBe(true);
  });

  it("still runs main() when invoked through a symlink (Node resolves import.meta.url to the realpath)", () => {
    const dir = mkdtempSync(join(tmpdir(), "adoption-quality-symlink-"));
    const link = join(dir, "scan-via-link.mjs");
    symlinkSync(script, link);
    try {
      const viaLink = execFileSync("node", [link, "--json"], { cwd: root, encoding: "utf8" });
      expect(parse(viaLink).artifact).toBe("adoption-quality-scan");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  describe("fixture tree", () => {
    const dir = fixture();
    afterAll(() => rmSync(dir, { recursive: true, force: true }));

    it("honors --signals/--targets, the exclude list and a missing target end to end", () => {
      const { stdout, status } = run(dir, "--json", "--signals", join(dir, "signals.json"), "--targets", "app,ghost");
      expect(status).toBe(0); // the missing ghost/ target is skipped silently, not fatal
      const report = parse(stdout);
      const byId = Object.fromEntries(report.signals.map((s) => [s.id, s]));

      // --targets app: the decoy under the default src/ is invisible.
      const allFiles = new Set(report.signals.flatMap((s) => s.hits.map((h) => h.file)));
      expect([...allFiles].every((f) => f.startsWith("app/"))).toBe(true);
      // The .test. sibling is excluded by the walk; plain.tsx's gate is closed.
      expect(byId["detail-tabbed-primary-nav"].hits).toEqual([{ file: "app/detail.tsx", line: 3 }]);
      expect(byId["form-page-missing-errorboundary"].hits).toEqual([{ file: "app/form.tsx", line: 1 }]);
      expect(byId["fixture-backref-window"].hits).toEqual([{ file: "app/indent-match.tsx", line: 3 }]);
      expect(byId["fixture-never-fires"].hits).toEqual([]); // present, not absent
      expect(report.summary.signals).toBe(5); // every fixture entry measured

      // Only tokens.css is a brand file — tokens.layer.css is never walked.
      expect(report.summary.brandTokenFiles).toBe(1);
      const brand = Object.fromEntries(report.brandTokens.map((s) => [s.id, s]));
      expect(brand["brand-tokens-retired-role"].hits).toEqual([{ file: "app/tokens.css", line: 2 }]);
    });

    it("walks the default src/ target in text mode and exits 0 on red hits — a radar, not a ratchet", () => {
      // No --targets: only the src/ decoy is walked, never app/.
      const { stdout, status } = run(dir, "--signals", join(dir, "signals.json"));
      expect(status).toBe(0); // red findings present; a scan is still a clean hand-off
      expect(stdout).toMatch(/^scan:adoption-quality — .*: 1 file\(s\) scanned, 5 signal\(s\), 1 with 1 hit\(s\)\n/);
      expect(stdout).toContain(`  red    ${"detail-tabbed-primary-nav".padEnd(40)}  1   src/decoy.tsx:2\n`);
      expect(stdout).not.toContain("app/");
    });

    it("exits 2 on an unresolvable signals file", () => {
      expect(run(dir, "--signals", join(dir, "does-not-exist.json"), "--targets", "app").status).toBe(2);
    });

    it("exits 2 on an unknown argument", () => {
      expect(run(dir, "--bogus").status).toBe(2);
    });
  });
});

describe("parseArgs", () => {
  it("defaults to cwd, <root>/docs/audit-signals.json and the src target", () => {
    const opts = parseArgs([], "/repo");
    expect(opts).toEqual({ jsonMode: false, rootResolved: "/repo", signalsPath: join("/repo", "docs", "audit-signals.json"), targets: ["src"] });
  });

  it("reads --json/--root/--targets", () => {
    const opts = parseArgs(["--json", "--root", "/r", "--targets", "a, b,"], "/cwd");
    expect(opts).toMatchObject({ jsonMode: true, rootResolved: "/r", targets: ["a", "b"] });
  });

  it("throws ConfigError on an unknown argument or empty --targets", () => {
    expect(() => parseArgs(["--bogus"], "/r")).toThrow(ConfigError);
    expect(() => parseArgs(["--targets", ","], "/r")).toThrow(ConfigError);
  });
});

describe("classifyExcludes / isExcluded", () => {
  const classified = classifyExcludes(["node_modules", ".test.", "dist", "**/generated/**"]);

  it("splits bare names from wildcard globs", () => {
    expect(classified).toEqual({ names: ["node_modules", ".test.", "dist"], globs: ["**/generated/**"] });
  });

  it("matches a bare name only as a whole segment", () => {
    expect(isExcluded("src/dist/a.tsx", classified)).toBe(true);
    expect(isExcluded("src/distance/a.tsx", classified)).toBe(false);
    expect(isExcluded("src/a-dist.tsx", classified)).toBe(false);
  });

  it("matches a dotted fragment inside a segment", () => {
    expect(isExcluded("src/detail.test.tsx", classified)).toBe(true);
    expect(isExcluded("src/detail.tsx", classified)).toBe(false);
  });

  it("matches wildcard globs against the whole path", () => {
    expect(isExcluded("src/generated/x.ts", classified)).toBe(true);
    expect(isExcluded("src/gen/x.ts", classified)).toBe(false);
  });
});

describe("pcreToJs", () => {
  it("rewrites the PCRE string anchors \\A and \\Z to ^ and $", () => {
    expect(pcreToJs("\\A(?!x)foo\\Z")).toBe("^(?!x)foo$");
  });

  it("leaves every other construct alone", () => {
    const src = "\\n([ \\t]+)<Button\\b[\\s\\S]{0,100}?\\n\\1<Panel\\b";
    expect(pcreToJs(src)).toBe(src);
  });
});

describe("compileSignals", () => {
  it("compiles every live signal under V8", () => {
    expect(compileSignals(signalsDoc.adoptionQuality).filter((c) => c.error)).toEqual([]);
  });

  it("carries a bad pattern as an error instead of throwing", () => {
    const [c] = compileSignals([{ id: "bad", coOccursWith: "X", regex: "(" }]);
    expect(c.error).toMatch(/^bad: /);
    expect(c.re).toBeUndefined();
  });
});

describe("scanSource", () => {
  const sig = (id, coOccursWith, regex) => ({ id, coOccursWith, regex, tier: "red" });

  it("fires only when the coOccursWith gate matches the file", () => {
    const compiled = compileSignals([sig("tabs", "DetailOverviewShell", "<TabsList\\b")]);
    expect(scanSource("a.tsx", "<TabsList>no shell</TabsList>", compiled)).toEqual([null]);
    expect(scanSource("a.tsx", "import { DetailOverviewShell } from 'x';\n<TabsList>", compiled)).toEqual([
      { file: "a.tsx", line: 2 },
    ]);
  });

  it("records one hit per file, at the first match's line", () => {
    const compiled = compileSignals([sig("tabs", "Shell", "<TabsList\\b")]);
    const src = "Shell\n<TabsList>a</TabsList>\n<TabsList>b</TabsList>\n";
    expect(scanSource("a.tsx", src, compiled)).toEqual([{ file: "a.tsx", line: 2 }]);
  });

  it("fires the \\A whole-file absence check at line 1 and clears a file carrying the marker", () => {
    const compiled = compileSignals([sig("eb", "FormPageShell", "\\A(?!(?:.|\\n)*ErrorBoundary)")]);
    expect(scanSource("f.tsx", "FormPageShell\nform\n", compiled)).toEqual([{ file: "f.tsx", line: 1 }]);
    expect(scanSource("f.tsx", "FormPageShell\n<ErrorBoundary>\n", compiled)).toEqual([null]);
  });

  it("keeps a mismatched indent out of a \\1 backreference window", () => {
    const compiled = compileSignals([sig("bw", "Panel", "\\n([ \\t]+)<Button\\b[\\s\\S]{0,100}?\\n\\1<Panel\\b")]);
    expect(scanSource("m.tsx", "Panel\n    <Button/>\n    <Panel/>\n", compiled)).toEqual([{ file: "m.tsx", line: 1 }]);
    expect(scanSource("m.tsx", "Panel\n  <Button/>\n      <Panel/>\n", compiled)).toEqual([null]);
  });

  it("applies the live swallowed-submit-error signal: toast-only catch hits, setError clears", () => {
    const compiled = compileSignals([signalsDoc.adoptionQuality.find((s) => s.id === "b-form-page-swallowed-submit-error")]);
    const page = (body) =>
      "import { FormPageActions } from '@components/FormPageActions';\n" +
      `async function onSubmit() {\n  try { await save(); } catch (err) {\n${body}  }\n}\n`;
    expect(scanSource("t.tsx", page("    toast.error('Save failed');\n"), compiled)).toEqual([{ file: "t.tsx", line: 1 }]);
    expect(
      scanSource("t.tsx", page("    form.setError('root', { message: 'x' });\n    toast.error('x');\n"), compiled),
    ).toEqual([null]);
    expect(scanSource("t.ts", "try { go(); } catch { toast.error('x'); }\n", compiled)).toEqual([null]); // gate closed
  });

  it("does not carry regex state from one file into the next (live chart-hex-colour-prop)", () => {
    const compiled = compileSignals(signalsDoc.adoptionQuality.filter((s) => s.id === "chart-hex-colour-prop"));
    const late = 'import { Bar } from "recharts";\n' + "// pad\n".repeat(40) + '<Bar dataKey="v" fill="#3b82f6" />\n';
    const early = 'const s = { color: "#ef4444" };\nimport { Pie } from "recharts";\n';
    expect(scanSource("a.tsx", late, compiled)).toEqual([{ file: "a.tsx", line: 42 }]);
    expect(scanSource("b.tsx", early, compiled)).toEqual([{ file: "b.tsx", line: 1 }]);
    expect(scanSource("c.tsx", 'import { Bar } from "recharts";\n<Bar fill="var(--color-chart-2)" />\n', compiled)).toEqual([null]);
    expect(scanSource("d.tsx", '<div style={{ color: "#ffffff" }} />\n', compiled)).toEqual([null]);
    expect(scanSource("e.tsx", 'import { ResponsiveBar } from "@nivo/bar";\n<ResponsiveBar colors={["#111111"]} />\n', compiled)).toEqual([
      { file: "e.tsx", line: 2 },
    ]);
  });

  it("skips an uncompiled signal", () => {
    const compiled = compileSignals([sig("bad", "", "(")]);
    expect(scanSource("a.tsx", "anything", compiled)).toEqual([null]);
  });
});

describe("compileBrandSignals (ADR-0007)", () => {
  const byId = Object.fromEntries(compileBrandSignals(signalsDoc.brandTokens).map((b) => [b.signal.id, b]));
  const lineAt = (src, index) => (index === null ? null : src.slice(0, index).split("\n").length);
  const TEAL_LIGHT = "@layer base {\n  :root {\n    --primary: 174 72% 35%;\n    --primary-foreground: 0 0% 100%;\n  }\n";

  it("flags a retired role or a --db-* variable, never a comment or a look-alike name", () => {
    const { test } = byId["brand-tokens-retired-role"];
    const at = (src) => lineAt(src, test(src));
    expect(at(":root {\n  --primary: 174 72% 35%;\n  --ring: 217 91% 60%;\n}\n")).toBe(3);
    expect(at(":root {\n  --db-surface-raised: white;\n}\n")).toBe(2);
    expect(at(":root {\n  --primary: 174 72% 35%;\n  --chart-2: 43 74% 49%;\n}\n")).toBe(3);
    expect(at("/* --ring: retired */\n:root {\n  --ring-offset: 2px;\n  --sidebar-foreground: 0 0% 10%;\n}\n")).toBe(null);
  });

  it("flags a dark --primary off the light hue or desaturated, passes a same-hue chromatic one", () => {
    const { test } = byId["brand-tokens-dark-primary-off-hue"];
    const at = (src) => lineAt(src, test(src));
    expect(at(TEAL_LIGHT + "  .dark {\n    --primary: 210 40% 98%;\n  }\n}\n")).toBe(7); // hue 36° off
    expect(at(TEAL_LIGHT + "  .dark {\n    --primary: 174 12% 70%;\n  }\n}\n")).toBe(7); // grey
    expect(
      at(TEAL_LIGHT + "  .dark {\n    --sidebar-primary: 0 0% 98%;\n    --primary: 166 60% 55%;\n    --primary-foreground: 0 0% 5%;\n  }\n}\n"),
    ).toBe(null);
    expect(at(":root { --primary: 355 80% 45%; }\n.dark { --primary: 3 70% 60%; }\n")).toBe(null); // wraps 360
    expect(at(TEAL_LIGHT + "}\n")).toBe(null); // no dark override
  });

  it("carries an unknown check as an error", () => {
    const [b] = compileBrandSignals([{ id: "x", tier: "red", check: "nope" }]);
    expect(b).toMatchObject({ test: null, error: 'x: unknown check "nope"' });
  });
});

describe("summarize", () => {
  it("totals hits by tier and counts uncompiled and brand entries", () => {
    const entries = [
      { id: "a", tier: "red", hits: [{}, {}], hitCount: 2 },
      { id: "b", tier: "yellow", hits: [{}], hitCount: 1 },
      { id: "c", tier: "red", error: "c: bad", hits: [], hitCount: 0 },
    ];
    const brandResults = [{ id: "x", tier: "red", hits: [{}], hitCount: 1 }];
    expect(summarize({ entries, brandResults, files: 7, brandFiles: 2 })).toEqual({
      files: 7,
      signals: 3,
      uncompiled: 1,
      signalsWithHits: 2,
      totalHits: 3,
      redHits: 2,
      yellowHits: 1,
      brandTokenFiles: 2,
      brandTokenHits: 1,
    });
  });
});
