#!/usr/bin/env node
// Runs a command inside the pinned Playwright image (src/testing/docker.mjs),
// with the current project mounted at /work, so screenshot baselines render the
// same on every machine. Usage, from the project root:
//   npx design-baseline-playwright npx playwright test
//   npx design-baseline-playwright npx playwright test --update-snapshots
// The container gets its own Linux node_modules on a named volume (the host's
// are built for macOS), reinstalled with `npm ci` only when package-lock.json
// changes.
// ponytail: npm projects only; add a lockfile switch when a pnpm/yarn consumer adopts it.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { PLAYWRIGHT_IMAGE } from "../src/testing/docker.mjs";

const cmd = process.argv.slice(2);
if (cmd.length === 0) {
  console.error("usage: design-baseline-playwright <command> [args...]   (e.g. npx playwright test)");
  process.exit(2);
}
const cwd = process.cwd();
const id = `${path.basename(cwd).toLowerCase().replace(/[^a-z0-9_.-]/g, "-")}-${createHash("sha1").update(cwd).digest("hex").slice(0, 8)}`;
const quote = (a) => `'${a.replace(/'/g, `'\\''`)}'`;
const script = [
  `if [ "$(cat node_modules/.lock-sha 2>/dev/null)" != "$(sha1sum package-lock.json)" ]; then`,
  `  echo "design-baseline-playwright: installing Linux node_modules (npm ci)"`,
  `  npm ci --no-audit --no-fund --loglevel=error && sha1sum package-lock.json > node_modules/.lock-sha || exit 1`,
  `fi`,
  `exec ${cmd.map(quote).join(" ")}`,
].join("\n");

console.log(`design-baseline-playwright: ${PLAYWRIGHT_IMAGE} — ${cmd.join(" ")}`);
const r = spawnSync(
  "docker",
  [
    "run", "--rm", "--init", "--ipc=host",
    ...(process.stdout.isTTY ? ["-t"] : []),
    "-v", `${cwd}:/work`,
    "-v", `design-baseline-nm-${id}:/work/node_modules`,
    "-v", "design-baseline-npm-cache:/root/.npm",
    "-w", "/work",
    "-e", "CI",
    PLAYWRIGHT_IMAGE,
    "sh", "-c", script,
  ],
  { stdio: "inherit" },
);
if (r.error) {
  console.error(`design-baseline-playwright: could not run docker (${r.error.message}). Is Docker running?`);
  process.exit(1);
}
process.exit(r.status ?? 1);
