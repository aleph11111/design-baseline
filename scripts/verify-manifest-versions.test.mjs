// @vitest-environment node
//
// Runs `scripts/verify-manifest-versions.mjs` as a subprocess with `cwd` set to
// a throwaway tree holding a minimal MANIFEST + spec docs, so each of its four
// guards (and the authored-entry skip) is pinned by a test instead of silently
// ceasing to fire. Never touches the real docs/archetypes/MANIFEST.json.
//
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { execFileSync } from "node:child_process";
import { describe, expect, it, afterEach } from "vitest";

const script = fileURLToPath(new URL("./verify-manifest-versions.mjs", import.meta.url));
const dirs = [];

/** Build a tree: `manifest` object, plus `docs` = { "<slug>.md": "<text>" } under docs/archetypes. */
function fixture(manifest, docs = {}) {
  const dir = mkdtempSync(join(tmpdir(), "verify-manifest-"));
  dirs.push(dir);
  const archDir = join(dir, "docs/archetypes");
  mkdirSync(archDir, { recursive: true });
  writeFileSync(join(archDir, "MANIFEST.json"), JSON.stringify(manifest));
  for (const [name, text] of Object.entries(docs)) writeFileSync(join(archDir, name), text);
  return dir;
}

const promoted = (extra = {}) => ({
  slug: "alpha",
  promoted_from: "some-project",
  source_spec_version: "1.0",
  ...extra,
});
const spec = (line) => `---\n${line}\n---\n# Alpha\n`;

function run(dir) {
  try {
    const stdout = execFileSync("node", [script], { cwd: dir, encoding: "utf8", stdio: "pipe" });
    return { status: 0, stdout, stderr: "" };
  } catch (err) {
    return { status: err.status ?? 1, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}

afterEach(() => {
  while (dirs.length) rmSync(dirs.pop(), { recursive: true, force: true });
});

describe("verify-manifest-versions", () => {
  it("pass: matching source_spec_version, exit 0", () => {
    const dir = fixture({ archetypes: [promoted()] }, { "alpha.md": spec("source_spec_version: 1.0") });
    const { status, stdout } = run(dir);
    expect(status).toBe(0);
    expect(stdout).toContain("all source_spec_version fields match");
  });

  it("quoted frontmatter \"1.0\" matches MANIFEST \"1.0\" (no number coercion)", () => {
    const dir = fixture({ archetypes: [promoted()] }, { "alpha.md": spec('source_spec_version: "1.0"') });
    expect(run(dir).status).toBe(0);
  });

  it("skip: entry without promoted_from needs no frontmatter field (doc may be absent)", () => {
    const dir = fixture({ archetypes: [{ slug: "report" }] });
    expect(run(dir).status).toBe(0);
  });

  it("guard 1: source_spec_version mismatch fails", () => {
    const dir = fixture({ archetypes: [promoted()] }, { "alpha.md": spec('source_spec_version: "2.0"') });
    const { status, stdout, stderr } = run(dir);
    expect(status).toBe(1);
    expect(stdout).toContain("alpha: doc=2.0 manifest=1.0");
    expect(stderr).toContain("1 source_spec_version mismatch(es)");
  });

  it("guard 1: missing frontmatter field fails", () => {
    const dir = fixture({ archetypes: [promoted()] }, { "alpha.md": spec("title: Alpha") });
    const { status, stdout } = run(dir);
    expect(status).toBe(1);
    expect(stdout).toContain("alpha: doc=undefined manifest=1.0");
  });

  it("guard 2: version field on a methodology entry fails", () => {
    const dir = fixture({ archetypes: [], methodology: [{ slug: "style", version: "1.0" }] });
    const { status, stderr } = run(dir);
    expect(status).toBe(1);
    expect(stderr).toContain('methodology doc "style" carries a "version" field');
  });

  it("guard 3: reference_impl key on an archetype entry fails", () => {
    const dir = fixture(
      { archetypes: [promoted({ reference_impl: "x.baseline.md" })] },
      { "alpha.md": spec("source_spec_version: 1.0") },
    );
    const { status, stderr } = run(dir);
    expect(status).toBe(1);
    expect(stderr).toContain('archetype "alpha" carries a "reference_impl" key');
  });

  it("guard 4: stray *.baseline.md sibling fails", () => {
    const dir = fixture(
      { archetypes: [promoted()] },
      { "alpha.md": spec("source_spec_version: 1.0"), "alpha.baseline.md": "x" },
    );
    const { status, stderr } = run(dir);
    expect(status).toBe(1);
    expect(stderr).toContain("docs/archetypes/alpha.baseline.md exists");
  });
});
