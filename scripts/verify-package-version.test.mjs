// @vitest-environment node
//
// Runs `scripts/verify-package-version.mjs` as a subprocess against throwaway
// git repos so its exemption logic (unbumped branches pass, a missing
// merge-base fails closed) is caught by a test instead of regressing silently
// in CI. Every repo gets a real `origin` remote and `git push`, so
// `refs/remotes/origin/main` is populated exactly like a real checkout.
//
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { execFileSync } from "node:child_process";
import { describe, expect, it, afterEach } from "vitest";

const script = fileURLToPath(new URL("./verify-package-version.mjs", import.meta.url));
const dirs = [];

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function writeVersion(dir, version) {
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "fixture", version }));
}

/** A repo with an `origin` remote, one commit at `version` on `main`. */
function initRepo(version) {
  const dir = mkdtempSync(join(tmpdir(), "verify-pkg-version-"));
  dirs.push(dir);
  git(dir, "init", "-q", "-b", "main");
  git(dir, "config", "user.email", "test@example.com");
  git(dir, "config", "user.name", "Test");
  git(dir, "init", "-q", "--bare", join(dir, "origin.git"));
  git(dir, "remote", "add", "origin", join(dir, "origin.git"));
  writeVersion(dir, version);
  git(dir, "add", "package.json");
  git(dir, "commit", "-q", "-m", "init");
  git(dir, "push", "-q", "origin", "main");
  return dir;
}

function bump(dir, version, message = "bump") {
  writeVersion(dir, version);
  git(dir, "add", "package.json");
  git(dir, "commit", "-q", "-m", message);
}

/** Point `refs/remotes/origin/main` at an unrelated (no-common-ancestor) commit. */
function orphanOriginMain(dir, version) {
  const current = git(dir, "branch", "--show-current");
  git(dir, "checkout", "-q", "--orphan", "tmp-orphan");
  git(dir, "rm", "-rf", "-q", ".");
  writeVersion(dir, version);
  git(dir, "add", "package.json");
  git(dir, "commit", "-q", "-m", "orphan");
  const sha = git(dir, "rev-parse", "HEAD");
  git(dir, "checkout", "-q", current);
  git(dir, "branch", "-D", "tmp-orphan");
  git(dir, "update-ref", "refs/remotes/origin/main", sha);
}

function run(dir) {
  try {
    const stdout = execFileSync("node", [script], { cwd: dir, encoding: "utf8" });
    return { status: 0, stdout, stderr: "" };
  } catch (err) {
    return { status: err.status ?? 1, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}

afterEach(() => {
  while (dirs.length) rmSync(dirs.pop(), { recursive: true, force: true });
});

describe("verify-package-version", () => {
  it("missing origin/main: skips with exit 0", () => {
    const dir = initRepo("1.0.0");
    // Drop the remote-tracking ref a real fresh clone (with no fetch yet) would lack.
    git(dir, "update-ref", "-d", "refs/remotes/origin/main");
    const { status, stdout } = run(dir);
    expect(status).toBe(0);
    expect(stdout).toContain("no origin/main to compare against");
  });

  it("unbumped: local version equals the merge-base's, passes even though origin/main moved ahead", () => {
    const dir = initRepo("1.0.0");
    const base = git(dir, "rev-parse", "HEAD");
    // origin/main advances on a separate branch (simulating a merged bump elsewhere).
    git(dir, "checkout", "-q", "-b", "other", base);
    bump(dir, "1.0.1");
    git(dir, "push", "-q", "origin", "HEAD:main");
    git(dir, "checkout", "-q", "main");
    // Local main only gained a docs commit — version untouched.
    writeFileSync(join(dir, "readme.txt"), "docs\n");
    git(dir, "add", "readme.txt");
    git(dir, "commit", "-q", "-m", "docs");
    const { status, stdout } = run(dir);
    expect(status).toBe(0);
    expect(stdout).toContain("not bumped on this branch");
  });

  it("greater: local version exceeds origin/main's, passes", () => {
    const dir = initRepo("1.0.0");
    bump(dir, "1.0.2");
    const { status, stdout } = run(dir);
    expect(status).toBe(0);
    expect(stdout).toContain("1.0.2 > origin/main's 1.0.0");
  });

  it("equal: two branches bump to the same version (the #309/#310 collision), fails", () => {
    const dir = initRepo("1.0.0");
    const base = git(dir, "rev-parse", "HEAD");
    bump(dir, "1.0.1"); // local branch's bump, still on "main"
    git(dir, "checkout", "-q", "-b", "other", base);
    // Distinct message: an identical tree + parent + author date + message
    // would hash to the SAME commit as the one above (git has 1s timestamp
    // resolution), collapsing this into a fast-forward instead of a collision.
    bump(dir, "1.0.1", "bump (other, already merged)");
    git(dir, "push", "-q", "origin", "HEAD:main");
    git(dir, "checkout", "-q", "main");
    const { status, stderr } = run(dir);
    expect(status).toBe(1);
    expect(stderr).toContain("not greater than origin/main's 1.0.1");
    expect(stderr).toContain("a parallel branch already shipped this bump");
  });

  it("lower: local version is behind origin/main's, fails", () => {
    const dir = initRepo("1.0.0");
    const base = git(dir, "rev-parse", "HEAD");
    bump(dir, "1.0.1"); // local branch's bump, still on "main"
    git(dir, "checkout", "-q", "-b", "other", base);
    bump(dir, "1.0.2"); // the parallel branch shipped further ahead
    git(dir, "push", "-q", "origin", "HEAD:main");
    git(dir, "checkout", "-q", "main");
    const { status, stderr } = run(dir);
    expect(status).toBe(1);
    expect(stderr).toContain("not greater than origin/main's 1.0.2");
  });

  it("no merge-base (orphan history): fails closed with its own message, not the collision message", () => {
    const dir = initRepo("1.0.0");
    orphanOriginMain(dir, "9.9.9");
    const { status, stderr } = run(dir);
    expect(status).toBe(1);
    expect(stderr).toContain("no merge-base with origin/main");
    expect(stderr).not.toContain("a parallel branch already shipped this bump");
  });

  it("every non-skip line includes origin/main's short SHA and commit date", () => {
    const dir = initRepo("1.0.0");
    bump(dir, "1.0.2");
    const mainSha = git(dir, "rev-parse", "--short", "origin/main");
    const { stdout } = run(dir);
    expect(stdout).toContain(`origin/main@${mainSha}`);
    // ISO date, e.g. 2026-09-28.
    expect(stdout).toMatch(/\(\d{4}-\d{2}-\d{2}\)/);
  });

  describe("shipped-path bump requirement", () => {
    function commitFile(dir, path, content = "x\n") {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), content);
      git(dir, "add", path);
      git(dir, "commit", "-q", "-m", `edit ${path}`);
    }

    it("shipped change + no bump fails, naming the path", () => {
      const dir = initRepo("1.0.0");
      commitFile(dir, "src/components/ui/button.tsx");
      const { status, stderr } = run(dir);
      expect(status).toBe(1);
      expect(stderr).toContain("src/components/ui/button.tsx");
      expect(stderr).toContain("rule 11");
    });

    it("MANIFEST.json change + no bump fails", () => {
      const dir = initRepo("1.0.0");
      commitFile(dir, "docs/archetypes/MANIFEST.json", "{}\n");
      expect(run(dir).status).toBe(1);
    });

    it("shipped change + bump passes", () => {
      const dir = initRepo("1.0.0");
      commitFile(dir, "src/components/ui/button.tsx");
      bump(dir, "1.0.1");
      expect(run(dir).status).toBe(0);
    });

    it.each([
      "docs/note.md",
      "docs/backlog/x.md",
      "scripts/tool.mjs",
      ".github/workflows/x.yml",
      "src/examples/foo-demo.tsx",
      "src/components/ui/button.test.tsx",
    ])("exempt path %s + no bump passes", (path) => {
      const dir = initRepo("1.0.0");
      commitFile(dir, path);
      expect(run(dir).status).toBe(0);
    });
  });
});
