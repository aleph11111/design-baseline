#!/usr/bin/env node
// design-baseline page scaffolder — `design-baseline new-page <archetype> <Name>`.
//
// Writes `<Name>Page.tsx` from `templates/<archetype>.tsx`, so a new consumer
// page starts out importing its archetype's shell and wiring the shell's state
// props instead of being copied from a neighbouring page (and inheriting its
// drift). Zero-dependency, same shape as `scripts/*.mjs` (ADR-0003): pure
// functions exported next to a thin `main()` that owns argv, the filesystem and
// the exit code. `scripts/new-page.test.mjs` generates every template and runs
// `tsc` on the result.
//
// Route registration is consumer-specific (a route table, a registry test), so
// it is not done here: `--register <cmd>` runs the consumer's own command after
// the file is written, with DESIGN_BASELINE_PAGE_{ARCHETYPE,NAME,FILE} in its env.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const TEMPLATES_DIR = fileURLToPath(new URL("../templates/", import.meta.url));

const USAGE = `usage: design-baseline new-page <archetype> <Name> [--out <dir>] [--register <cmd>]

  <archetype>       one of: ${listArchetypes().join(", ")}
  <Name>            PascalCase page name; writes <dir>/<Name>Page.tsx
  --out <dir>       target directory (default: current directory)
  --register <cmd>  shell command run after the file is written, with
                    DESIGN_BASELINE_PAGE_ARCHETYPE / _NAME / _FILE set`;

export function listArchetypes() {
  return readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.slice(0, -".tsx".length))
    .sort();
}

/** Parse argv (without node + script). Returns `{ error }` or the options. */
export function parseArgs(argv) {
  const positional = [];
  const opts = { out: ".", register: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out" || arg === "--register") {
      const value = argv[++i];
      if (value === undefined) return { error: `${arg} needs a value` };
      opts[arg.slice(2)] = value;
    } else if (arg === "-h" || arg === "--help") {
      return { help: true };
    } else if (arg.startsWith("-")) {
      return { error: `unknown flag ${arg}` };
    } else {
      positional.push(arg);
    }
  }
  // Accept both `new-page <a> <N>` (the bin form) and `<a> <N>`.
  if (positional[0] === "new-page") positional.shift();
  if (positional.length !== 2) return { error: "expected <archetype> <Name>" };
  const [archetype, name] = positional;
  if (!listArchetypes().includes(archetype)) {
    return { error: `unknown archetype "${archetype}"` };
  }
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    return { error: `Name must be PascalCase (got "${name}")` };
  }
  return { archetype, name, ...opts };
}

/** The page source for `archetype`, with every `__Name__` replaced. */
export function renderPage(archetype, name) {
  const template = readFileSync(join(TEMPLATES_DIR, `${archetype}.tsx`), "utf8");
  return template.replaceAll("__Name__", name);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (args.error) {
    console.error(`new-page: ${args.error}\n\n${USAGE}`);
    return 2;
  }

  const file = resolve(args.out, `${args.name}Page.tsx`);
  if (existsSync(file)) {
    console.error(`new-page: ${file} already exists — not overwriting`);
    return 1;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderPage(args.archetype, args.name));
  console.log(`new-page: wrote ${file}`);

  if (args.register) {
    const result = spawnSync(args.register, {
      shell: true,
      stdio: "inherit",
      env: {
        ...process.env,
        DESIGN_BASELINE_PAGE_ARCHETYPE: args.archetype,
        DESIGN_BASELINE_PAGE_NAME: args.name,
        DESIGN_BASELINE_PAGE_FILE: file,
      },
    });
    if (result.status !== 0) {
      // Remove the page so the same command can simply be re-run once the
      // register script is fixed (otherwise the no-overwrite guard blocks it).
      unlinkSync(file);
      console.error(`new-page: --register command failed (exit ${result.status ?? result.signal}); removed ${file}`);
      return result.status || 1;
    }
  }
  return 0;
}

// realpath: npm links a bin into node_modules/.bin through a symlink.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
