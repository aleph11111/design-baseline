// @vitest-environment node
//
// Covers the CI-facing surface of `scripts/scan-adoption-quality.mjs`: the
// `--json` report shape (every signal MEASURED, hitless ones included), the
// co-occurrence gate, the exclude list, the PCRE2→V8 anchor compat, backreference
// windows, the at most one hit per file counting unit, and the radar-not-gate
// exit contract (0 on findings, 2 on usage/config errors). Runs the real
// script as a subprocess — against the donor's own src like `lint-design.test.mjs`,
// and against a throwaway fixture tree for assertions that need controlled
// content. The donor's own hit COUNT is asserted nowhere — the shipped signals
// and the demo surfaces they flag move independently (see the script header);
// the shape and semantics are what stay stable.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

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
  // Decoy under the DEFAULT target dir — only reachable if --targets app was
  // silently ignored (its content would then surface in the counts).
  writeFileSync(
    join(decoy, "decoy.tsx"),
    "import { DetailOverviewShell } from '@components/DetailOverviewShell';\n" +
      "export function Decoy() { return <DetailOverviewShell><TabsList>d</TabsList></DetailOverviewShell>; }\n",
  );
  return dir;
}

describe("scan-adoption-quality CLI (donor's own src)", () => {
  it("--json reports every live signal — hitless ones included (measured, zero)", () => {
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
    // Summary internal consistency.
    expect(report.summary.totalHits).toBe(report.signals.reduce((n, s) => n + s.hitCount, 0));
    expect(report.summary.signalsWithHits).toBe(report.signals.filter((s) => s.hitCount > 0).length);
    expect(report.summary.files).toBeGreaterThan(0);
    expect(report.summary.uncompiled).toBe(0); // every shipped signal compiles under V8
  });

  it("--json is stable across runs (no wall-clock-dependent fields beyond scannedAt)", () => {
    const stable = (r) =>
      JSON.stringify({ ...r, scannedAt: "_", summary: r.summary, signals: r.signals });
    const a = parse(run(root, "--json").stdout);
    const b = parse(run(root, "--json").stdout);
    expect(stable(a)).toBe(stable(b));
  });
});

describe("scan-adoption-quality fixture (controlled content)", () => {
  const dir = fixture();
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("honors --signals/--targets and the gate, exclusion, and anchor semantics", () => {
    const { stdout, status } = run(dir, "--json", "--signals", join(dir, "signals.json"), "--targets", "app");
    expect(status).toBe(0);
    const report = parse(stdout);
    const byId = Object.fromEntries(report.signals.map((s) => [s.id, s]));

    // --targets app: the decoy under the default src/ is invisible.
    const allFiles = new Set(report.signals.flatMap((s) => s.hits.map((h) => h.file)));
    expect([...allFiles].every((f) => f.startsWith("app/"))).toBe(true);

    // The shell-gated line signal: the detail page carries the hit (its two
    // <TabsList>s count ONCE — file-level unit), the .test. sibling is
    // excluded, and plain.tsx (pattern present, gate closed) is untouched.
    expect(byId["detail-tabbed-primary-nav"].hits).toEqual([{ file: "app/detail.tsx", line: 3 }]);

    // The \A absence: form.tsx (no marker) hits at line 1; the file that
    // carries the marker somewhere is cleared.
    expect(byId["form-page-missing-errorboundary"].hits).toEqual([{ file: "app/form.tsx", line: 1 }]);

    // The toast-only catch: the B page and the beginSubmit hook hit; the file
    // that maps the error via setError and the non-B file are cleared.
    expect(byId["b-form-page-swallowed-submit-error"].hits).toEqual([
      { file: "app/form-toast.tsx", line: 1 },
      { file: "app/useSubmission.ts", line: 1 },
    ]);

    // The backreference window: matched indents hit, mismatched do not. The
    // reported line is the match's START (the window's opening newline — here,
    // the line above the <Button>), because the counting unit is the candidate
    // surface (the file); the line is a read-me hint, not a verdict.
    expect(byId["fixture-backref-window"].hits).toEqual([{ file: "app/indent-match.tsx", line: 3 }]);
    expect(byId["fixture-never-fires"].hitCount).toBe(0); // measured, zero
    expect(byId["fixture-never-fires"].hits).toEqual([]); // present, not absent
    expect(report.summary.signals).toBe(5); // every fixture entry measured
  });

  it("exits 0 on red hits — a radar, not a ratchet (no threshold flag exists to gate it)", () => {
    const { status } = run(dir, "--signals", join(dir, "signals.json"), "--targets", "app");
    expect(status).toBe(0); // red findings present; a scan is still a clean hand-off
  });

  it("walks the default src/ target when --targets is omitted", () => {
    // A root whose ONLY sources live under src/ — the no-override default is
    // what a consumer with the standard layout gets for free.
    const def = mkdtempSync(join(tmpdir(), "adoption-quality-scan-default-"));
    try {
      const src = join(def, "src");
      mkdirSync(src, { recursive: true });
      writeFileSync(
        join(src, "detail.tsx"),
        "import { DetailOverviewShell } from '@components/DetailOverviewShell';\n" +
          "export function Detail() { return <DetailOverviewShell><TabsList>t</TabsList></DetailOverviewShell>; }\n",
      );
      const { stdout, status } = run(def, "--json", "--signals", join(dir, "signals.json"));
      expect(status).toBe(0);
      const byId = Object.fromEntries(parse(stdout).signals.map((s) => [s.id, s]));
      expect(byId["detail-tabbed-primary-nav"].hits).toEqual([{ file: "src/detail.tsx", line: 2 }]);
    } finally {
      rmSync(def, { recursive: true, force: true });
    }
  });

  it("skips a target dir that does not exist — exit 0, only the existing target's files scanned", () => {
    // A consumer legitimately may not have every target root: a missing
    // `--targets` entry contributes zero files instead of breaking the scan.
    const { stdout, status } = run(dir, "--json", "--signals", join(dir, "signals.json"), "--targets", "app,ghost");
    expect(status).toBe(0); // missing dir is skipped silently, not fatal
    const byId = Object.fromEntries(parse(stdout).signals.map((s) => [s.id, s]));
    // The existing target is still walked — the gate + exclusion behaviour is intact.
    expect(byId["detail-tabbed-primary-nav"].hits).toEqual([{ file: "app/detail.tsx", line: 3 }]);
    const allFiles = new Set(byId["detail-tabbed-primary-nav"].hits.map((h) => h.file));
    expect([...allFiles].every((f) => f.startsWith("app/"))).toBe(true); // nothing from the missing dir
  });

  it("exits 2 on an unresolvable signals file", () => {
    expect(run(dir, "--signals", join(dir, "does-not-exist.json"), "--targets", "app").status).toBe(2);
  });

  it("exits 2 on an unknown argument", () => {
    expect(run(dir, "--bogus").status).toBe(2);
  });
});
