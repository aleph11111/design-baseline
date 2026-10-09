#!/usr/bin/env node
// design-baseline adherence lint — the mechanical half of gate 2 of the four-gate enforcement stack (docs/PACKAGE.md).
//
// Zero-dependency by design: a heuristic source scan, no ESLint or oxlint required, so a
// consumer with no linter still gets a working gate the moment this runbook's install-and-wire steps wire it.
// (oxlint cannot express `no-restricted-syntax`, which the earlier config depended on — see
// _adherence.NOTES.md and ADR-0003.)
//
// Reads `_adherence.json` (rules + target dirs) from the repo root, walks every `.ts`/`.tsx`
// file under the target dirs, and reports each hit as a warning. A rule matches either a bare
// banned tag (`"tag": "button"`) or an arbitrary regex (`"pattern": "focus:ring-1\\b"` — the
// form the ported docs/audit-signals.json conformance signals use). Tag matching is
// case-sensitive, so the design-system primitives `<Button>` / `<Table>` are never flagged.
// Warnings exit 0 (allowed during rollout); any `error`-severity hit exits 1. That is the
// ratchet: flip a rule to `"severity": "error"` in _adherence.json once its class is clean.
//
// A rule may carry an optional `include` glob (repo-root-relative, e.g.
// `"src/components/archetypes/**"` or `"src/components/archetypes/**/*Shell.tsx"`) that
// restricts it to that path set — matched against each walked file's path relative to the
// repo root by stdlib `path.matchesGlob` (Node >= 22): `**` spans any run of directory
// segments, `*` matches within one. Rules without an `include` match every walked file,
// as before. That is what lets an
// archetype-layer rule (e.g. an appearance-prop ban) scope to
// `src/components/archetypes/` without firing on `src/components/ui/` leaves, where
// `variant` / `size` props are correct shadcn practice.
//
// `include` and `targets` share that repo-root-relative namespace, so an `include` that
// omits the configured `targets` prefix (a `"src/..."` glob under
// `targets: ["frontend/src"]`) matches no walked path and its rule would be skipped
// without firing once — a ratchet silently disarmed, indistinguishable from a clean scan.
// `compileRules` therefore rejects a rule whose every `include` is unreachable under the
// configured targets with a `CompileError` (the diagnostic names the rule, the glob(s)
// and the targets). Reachability is structural — *can* any path under a target match —
// not existence (does such a file exist right now), so a rule scoped to an uninstalled
// layer still compiles; `--json` reports its live scope as `ruleScopes` (matched-file
// count per rule) so a silently-emptied scope is inspectable.
//
// A rule may also carry an optional `exclude` that removes matching files from the
// rule (in addition to `include`, when both are set). `exclude` is a glob, or an
// array of globs — the file is skipped when ANY of them matches. That is the
// per-archetype ratchet valve: once an archetype's class is closed, its folder is
// excluded from the shared `warn` drain rules, and a per-folder `error` rule (the
// engaged ratchet) is added for the closed API — so the scanner no longer counts a
// closed archetype as an open one. As more archetypes close, the drain rules
// accumulate one exclude glob per closed folder (the array form).
//
// A rule's `pattern` may carry the placeholder `{{unionAliases}}`. Before scanning a file
// the scanner harvests that file's single-line union type-alias NAMES (`type X = "a" | "b"`,
// `type X = 1 | 2`) and substitutes them as an alternation, so a rule can catch a prop typed
// against a local union alias (`size?: EntityAvatarSize`) — the shape a literal-union pattern
// misses entirely. Resolution is deliberately SAME-FILE only: `scanFile` sees one file's text
// and no module graph, which keeps the scanner the zero-dep, no-type-resolution heuristic
// ADR-0003 requires. A file declaring no union alias is skipped by such a rule.
//
// A rule may instead carry `swallowedSlots` (an array of prop names) in place of a
// `pattern`/`tag`: the file-level swallowed-slot check (`findSwallowedSlots`). It fires on a
// name destructured from a function's props that its own function never forwards — the
// shell that destructures `toolbar` beside `...rest` and forwards only `...rest` to
// `PageFrame`, which `tsc` does not flag. Only files that mention `PageFrame` are checked.
//
// A rule may carry `toolbarTabs: true` instead: the file-level check `findToolbarTabs` flags
// `Tabs` / `TabsList` / `SegmentedControl` inside a `toolbar={…}` attribute (use `viewSwitch`).
// An `// adherence-ok: page-tabs-in-toolbar — <reason>` comment on the attribute's line or the line
// above opts a body-scoping tab group out; the reason is required.
// `toolbarSwitch: true` is the same check for a bare `Switch` (use `ToggleField`), opt-out id
// `bare-switch-in-toolbar`.
//
// Usage:  node scripts/lint-design.mjs [--json] [--ci-threshold <n>]
// Config: ADHERENCE_CONFIG=path overrides the default `_adherence.json`.
//
// The module is importable: `compileGlobs`, `compileRules`, `scanFile` and
// `includeReachableUnder` are pure and exported (see scripts/lint-design.test.mjs and
// scripts/lint-design-core.test.mjs). Only `main()` touches argv, the filesystem, stdout
// and the exit code, and it runs only when the file is the entry point — importing it
// scans nothing.

import { globSync, readFileSync, realpathSync } from 'node:fs';
import { join, matchesGlob, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

// A rule failed to compile (a bad `pattern`, or a rule whose `include` globs are all
// unreachable under the configured targets). Carries the already-formatted
// diagnostic `main()` prints; it is thrown instead of exiting so the compiler
// stays a pure function — the exit lives in the CLI, not the compiler. Globs
// never fail here as globs: `node:path`'s `matchesGlob` (stdlib since v22) matches
// them at scan time, so there is nothing to compile — but an `include` set that can
// never intersect a walked path does fail, at compile time.
class CompileError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CompileError';
  }
}

// Normalize a rule's `include` / `exclude` (glob or array of globs, or absent)
// to a string array so the scope check in `scanFile` stays one
// `includes.some(...)` / `excludes.some(...)` against `path.matchesGlob`. The
// globs are matched, not compiled.
function compileGlobs(rule, key) {
  const value = rule[key];
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

// Structural reachability (compile-time guard). Can `glob` — repo-root-relative, the same
// namespace `targets` live in — match ANY path `walk` produces from `targets`: a target
// root (file or dir) named at its top level plus any run of segments beneath? Structural
// means *shape only*: the filesystem is never consulted, so a rule scoped to a
// not-yet-installed layer is reachable (and compiles); the live matched-file count is
// what `--json` reports as `ruleScopes`.
//
// `path.matchesGlob` owns the actual matching (scan time); the guard only asks whether
// a match is *possible*. A glob part is a `**` (spans zero or more whole segments — its
// shape language is every path, so it never disqualifies the glob) or a plain part,
// whose language is one real segment (a non-`*` part is one or more characters; a
// `*`-part matches only if it is non-empty — an empty part would leave a bare `/` and
// not occur in the walked form). Collapse the `**` parts away; the remainder is a
// segment prefix that has to be satisfied by the target's own named segments (then an
// arbitrary tail), and the check is pure string shape: the collapsed glob is reachable
// under a target when it equals the target or sits strictly beneath it.
function includeReachableUnder(glob, targets) {
  const collapsed = glob
    .split('/')
    .filter((part) => part !== '**' && part !== '')
    .join('/');
  if (collapsed === '') return targets.length > 0; // a pure `**` (or `//**`) spans any walked path
  return targets.some((t) => collapsed === t || collapsed.startsWith(`${t}/`));
}

// The placeholder a rule's `pattern` may carry to mean "any union type alias declared in
// THIS file" (see `harvestUnionAliases`). Substituted per scanned file in `scanFile`.
const ALIAS_TOKEN = '{{unionAliases}}';

// Harvest the union type-alias NAMES one file declares — the pre-pass that lets a rule reach
// a prop typed `size?: EntityAvatarSize` instead of an inline `"xs" | "sm"`. Two shapes, both
// recognised by "the alias's FIRST member is a string or numeric literal in union position",
// which is what makes it a union rather than an object/function/mapped type:
//   - inline:     `type X = "a" | "b"` — literal then `|`, same line.
//   - wrapped:    `type X =` alone on its line, first `| "a"` on the NEXT line (what prettier
//                 produces once the members no longer fit).
// Still line-level, not a parser (ADR-0003) — one line of lookahead, no cross-line state. The
// ceiling that remains: a first member sitting TWO or more lines below the `=` (a blank line
// or a comment in between) is not harvested; following that means tracking state across lines,
// which is the parser this scanner is not.
// Names are `\w+`, so they are safe to splice into a regex alternation unescaped.
function harvestUnionAliases(text) {
  const inlineDecl = /^\s*(?:export\s+)?type\s+(\w+)\s*=\s*(?:"[^"]*"|'[^']*'|[0-9]+)\s*\|/;
  const openDecl = /^\s*(?:export\s+)?type\s+(\w+)\s*=\s*$/;
  const firstMember = /^\s*\|\s*("[^"]*"|'[^']*'|[0-9]+)/;
  const names = new Set();
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const inline = inlineDecl.exec(lines[i]);
    if (inline) {
      names.add(inline[1]);
      continue;
    }
    const open = openDecl.exec(lines[i]);
    if (open && firstMember.test(lines[i + 1] ?? '')) names.add(open[1]);
  }
  return [...names];
}

// The swallowed-slot check. Line-level scanning cannot see it (the destructure and the missing
// reference sit lines apart), so it works on the whole file text: find each destructuring
// pattern — `({ a, b }: P)`, `({ a }) =>`, `function X({ a }, ref)`, `const { a } = x` — then
// report every listed slot name whose local binding is not forwarded in the destructuring
// function's own scope (from the destructure to the close of its body). A "reference" is an
// identifier occurrence outside comments, string literals, JSX text (`>name<`), `.name` member
// access, and `name:` / `name?:` / `name=` (type member, object key, JSX attribute name), AND
// either at/after the function's first JSX tag, or before it as an object-literal member (a
// `frameProps = { ...header, toolbar }` forward). A pre-JSX `Boolean(toolbar)` forwards nothing.
// Ceiling (ADR-0003, no parser): a destructure with nested braces (`{ a = {}, toolbar }`) is
// not matched; a `: ReturnType<{…}>` annotation ends the body scope early; the first JSX tag anywhere
// in the function (even a pre-return `.map(i => <Row />)`) opens the "any use counts" region; any use inside the
// JSX (even `dense={Boolean(toolbar)}`) counts as a reference; a slot-named destructure in a
// non-shell callback (`items.map(({ title }) => …)`) in a PageFrame file is checked the same way.
function findSwallowedSlots(text, slots) {
  if (!text.includes('PageFrame')) return [];
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  // Comments and string literals blanked in one pass (strings first, so a `//` inside
  // `"https://…"` is not read as a comment). Offsets and newlines are preserved.
  // A template literal keeps its `${…}` expressions (a slot forwarded as `${title} (${count})` is
  // a reference); a `'` right after a word character is a JSX-text apostrophe, not a string.
  const code = text
    .replace(
      /"(?:\\.|[^"\\\n])*"|(?<!\w)'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,
      (m) =>
        m[0] === '`' ? m.replace(/(\$\{(?:[^{}]|\{[^{}]*\})*\})|[^\n]/g, (x, expr) => expr ?? ' ') : blank(m),
    )
    // JSX prose (`<EmptyState>No actions yet</EmptyState>`, `{x} and toolbar <b>`) is not a reference:
    // the run after a tag's `>` (not an arrow's `=>`) or an expression's `}`, up to the next `<` / `{`.
    .replace(/(?<=[^=-]>|\})(?!\s*[:,])[^<>{};=()]+(?=[<{])/g, blank);
  const decl =
    /(\(|\b(?:const|let)\s+)\{([^{}]*)\}(?=\s*(?::|=(?!=)|\)\s*(?:=>|\{)|,\s*\w+\??\s*(?::[^,)]*)?\)\s*(?:=>|\{)))/g;
  const hits = [];
  for (const m of code.matchAll(decl)) {
    // The `const { … } =` form is a props destructure only when it reads `props`; a hook result
    // (`const { count } = useSelection()`) is a local value, not a swallowed prop.
    if (m[1] !== '(' && !/^\s*=\s*props\b/.test(code.slice(m.index + m[0].length))) continue;
    const lineStart = code.lastIndexOf('\n', m.index) + 1;
    if (/^\s*(?:export\s+)?(?:type|interface)\b/.test(code.slice(lineStart, m.index))) continue; // a type, not a function
    const members = [];
    let offset = m.index + m[1].length + 1;
    for (const member of m[2].split(',')) {
      const name = /^\s*(\w+)\s*(?::\s*(\w+))?/.exec(member);
      if (name && !member.trim().startsWith('...') && slots.includes(name[1])) {
        members.push({ slot: name[1], local: name[2] ?? name[1], index: offset + member.indexOf(name[1]) });
      }
      offset += member.length + 1;
    }
    if (!members.length) continue;
    // Scope: the rest of the function — past the parameter list, then its body block.
    const isParams = m[1] === '(';
    let i = m.index + m[0].length;
    let depth = isParams ? 1 : 0; // parens still open (params) / brackets of the enclosing block
    let bodyDepth = 0;
    let inBody = !isParams;
    let exprBody = false; // `=> <PageFrame …/>` — no body block, scope runs to the statement end
    let end = code.length;
    for (; i < code.length; i++) {
      const c = code[i];
      if (c === '>' && code[i - 1] === '=' && (!isParams || depth === 0) && !inBody && code.slice(i + 1).search(/\S/) >= 0 && !/^\s*\{/.test(code.slice(i + 1, i + 40))) exprBody = true;
      if ('([{'.includes(c)) {
        depth++;
        if (c === '{' && !inBody && !exprBody && depth === 1) { inBody = true; bodyDepth = depth; }
      } else if (')]}'.includes(c)) {
        depth--;
        if (isParams && depth === 0 && !inBody) continue;
        if (depth < 0 || (inBody && isParams && depth < bodyDepth)) { end = i; break; }
      } else if (c === ';' && isParams && depth === 0) { end = i; break; }
    }
    const scope = code.slice(m.index + m[0].length, end);
    const jsxAt = scope.search(/(?<![\w)\]>])<[A-Za-z]/); // first JSX tag; -1 → no JSX, nothing counts after it
    for (const h of members) {
      const ref = new RegExp(`(?<![\\w.>])${h.local}(?![\\w<]|\\??:|=[^=])`, 'g');
      const used = [...scope.matchAll(ref)].some((r) => {
        if (jsxAt >= 0 && r.index >= jsxAt) return true;
        // Before the JSX: only an object-literal member (`{ toolbar }`, `, toolbar,`, `key: toolbar`) is a
        // forward (matrix-grid builds `frameProps` that way); `Boolean(toolbar)` is a use that forwards nothing.
        const prev = scope.slice(0, r.index).trimEnd().slice(-1);
        const next = scope.slice(r.index + h.local.length).trimStart()[0];
        return prev === ':' || ((prev === '{' || prev === ',') && (next === ',' || next === '}'));
      });
      if (!used) hits.push(h);
    }
  }
  return hits.map((h) => {
    const before = text.slice(0, h.index).split('\n');
    return { slot: h.slot, line: before.length, col: before.at(-1).length + 1 };
  });
}

// Report every `toolbar={…}` JSX attribute whose braced expression holds a `<Tabs` / `<TabsList` /
// `<SegmentedControl` element. Those are one-of-N page-switching controls: in the toolbar band they
// land in the mobile filter sheet clipped — they belong in `viewSwitch` (PLACEMENT.md). Comments and
// strings are blanked first so a brace in either cannot unbalance the match.
// Ceiling (ADR-0003, no parser): a toolbar built outside the attribute (`const bar = <Tabs/>` then
// `toolbar={bar}`) is not seen; a tab group that genuinely scopes the body is flagged the same way.
function findToolbarTabs(text, tags = 'Tabs|TabsList|SegmentedControl', ruleId = 'page-tabs-in-toolbar') {
  const code = text.replace(
    /"(?:\\.|[^"\\\n])*"|(?<!\w)'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,
    (m) => m.replace(/[^\n]/g, ' '),
  );
  const hits = [];
  for (const m of code.matchAll(/\btoolbar=\{/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < code.length && depth; i++) depth += code[i] === '{' ? 1 : code[i] === '}' ? -1 : 0;
    if (depth) continue; // unbalanced braces — never scan to EOF
    const tab = new RegExp(`<(${tags})(?=[\\s/>])`).exec(code.slice(m.index, i));
    if (!tab) continue;
    // Opt-out: `adherence-ok: page-tabs-in-toolbar — <reason>` on the `toolbar=` line or the line
    // above, for a tab group that genuinely scopes the body. The reason is mandatory.
    const attrLine = text.slice(0, m.index).split('\n').length;
    const lines = text.split('\n');
    if (lines.slice(Math.max(0, attrLine - 2), attrLine).some((l) => new RegExp(`adherence-ok:\\s*${ruleId}\\s*[—–:-]+\\s*\\S`).test(l))) continue;
    const before = text.slice(0, m.index + tab.index).split('\n');
    hits.push({ tag: tab[1], line: before.length, col: before.at(-1).length + 1 });
  }
  return hits;
}

// Compile every rule once. `pattern` is used verbatim; a `tag` rule matches a bare lowercase
// element — `<tag` immediately followed by whitespace, `/`, or `>` — case-sensitive (no `i`
// flag) so the capitalized DS primitive `<Button>` is not a hit.
// `include` / `exclude` are carried through as plain glob strings (`matchesGlob` owns
// matching at scan time). Throws `CompileError` on a bad pattern.
//
// `targets` (the config's `targets` list, repo-root-relative path roots) enables the
// reachability guard: every `include` glob must be structurally reachable under at least
// one configured target, or the rule can match nothing and the ratchet is silently
// disarmed. `scanFile` applies the rule when ANY include matches, so one reachable entry
// is enough and a partially reachable array still compiles. `exclude` is never guarded —
// a no-match `exclude` just removes nothing. When `targets` is omitted the guard is
// skipped — core-level tests of the compile/scan semantics carry no target context; the
// CLI always passes the config's `targets`.
function compileRules(rules, targets) {
  return rules.map((rule) => {
    const source = rule.swallowedSlots || rule.toolbarTabs || rule.toolbarSwitch ? '(?!)' : (rule.pattern ?? `<${rule.tag}(?=[\\s/>])`);
    // A `{{unionAliases}}` pattern cannot be compiled once — its alternation is per-file — so
    // it is carried as `aliasSource` and compiled in `scanFile`. Validate it here anyway (with
    // a stand-in name) so a bad pattern still fails at compile time, like every other rule.
    const aliasSource = source.includes(ALIAS_TOKEN) ? source : null;
    let re;
    try {
      re = new RegExp(aliasSource ? aliasSource.replaceAll(ALIAS_TOKEN, 'A') : source, 'g');
    } catch (err) {
      throw new CompileError(`lint:design — rule ${rule.id}: bad pattern /${source}/: ${err.message}`);
    }
    const includes = compileGlobs(rule, 'include');
    if (targets && includes.length && !includes.some((glob) => includeReachableUnder(glob, targets))) {
      throw new CompileError(
        `lint:design — rule ${rule.id}: unreachable include glob(s) ${includes.join(', ')} — ` +
          `no path under targets ${JSON.stringify(targets)} can match; the rule would be skipped ` +
          `without firing, reading as a clean scan. Prefix the glob with the target root ` +
          `(e.g. a "src/..." glob under targets: ["frontend/src"]) or scope it to a ` +
          `configured target.`,
      );
    }
    return {
      re,
      aliasSource,
      label: rule.tag ? `<${rule.tag}>` : rule.id,
      severity: rule.severity === 'error' ? 'error' : 'warn',
      message: rule.message,
      slots: rule.swallowedSlots ?? null,
      toolbarTabs: Boolean(rule.toolbarTabs),
      toolbarSwitch: Boolean(rule.toolbarSwitch),
      includes,
      excludes: compileGlobs(rule, 'exclude'),
    };
  });
}

// Run the compiled rules against one file's text and return its violations (an empty list
// when every rule is out of scope or finds nothing). `fileRel` must be repo-root-relative,
// as the include/exclude globs are. One violation per per-line per-match hit:
// `{ file, line, col, rule, severity, message }`. The scan lives here so the CLI stays a
// thin caller and the core is unit-testable without a repo tree.
function scanFile(fileRel, text, compiled) {
  const violations = [];
  const lines = text.split('\n');
  // The union-type-alias pre-pass: harvested once per file, and only when some rule asks for
  // it (`{{unionAliases}}`), so a config without such a rule pays nothing.
  const aliases = compiled.some((c) => c.aliasSource) ? harvestUnionAliases(text) : [];
  for (const { re: compiledRe, aliasSource, label, severity, message, slots, toolbarTabs, toolbarSwitch, includes, excludes } of compiled) {
    // No `include` (or a rule whose `include` list is empty) matches every walked file;
    // with one or more `include` globs the rule applies only when ANY of them matches.
    // The scope globs are matched by `path.matchesGlob` (stdlib since v22) — `**` spans
    // any run of segments (including none), `*` matches within one, and a `.` is
    // a literal.
    if (includes.length && !includes.some((inc) => matchesGlob(fileRel, inc))) continue;
    if (excludes.some((ex) => matchesGlob(fileRel, ex))) continue; // excluded closed archetype
    if (slots) {
      for (const { slot, line, col } of findSwallowedSlots(text, slots)) {
        violations.push({ file: fileRel, line, col, rule: label, severity, message: `\`${slot}\` is destructured but never forwarded to PageFrame. ${message}` });
      }
      continue;
    }
    if (toolbarTabs) {
      for (const { tag, line, col } of findToolbarTabs(text)) {
        violations.push({ file: fileRel, line, col, rule: label, severity, message: `\`<${tag}>\` inside \`toolbar\`. ${message}` });
      }
      continue;
    }
    if (toolbarSwitch) {
      for (const { tag, line, col } of findToolbarTabs(text, 'Switch', 'bare-switch-in-toolbar')) {
        violations.push({ file: fileRel, line, col, rule: label, severity, message: `\`<${tag}>\` inside \`toolbar\`. ${message}` });
      }
      continue;
    }
    // A `{{unionAliases}}` rule is compiled here, against THIS file's harvested alias names.
    // No union alias in the file means the rule can match nothing — skip it.
    if (aliasSource && !aliases.length) continue;
    const re = aliasSource ? new RegExp(aliasSource.replaceAll(ALIAS_TOKEN, aliases.join('|')), 'g') : compiledRe;
    re.lastIndex = 0; // the `g` flag makes `matchAll` index-sensitive — don't leak state
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        violations.push({
          file: fileRel,
          line: i + 1,
          col: m.index + 1,
          rule: label,
          severity,
          message,
        });
      }
    });
  }
  return violations;
}

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json') || args.includes('--json-output');
  const ciThresholdIdx = args.indexOf('--ci-threshold');
  let ciThreshold = null;
  if (ciThresholdIdx !== -1 && ciThresholdIdx + 1 < args.length) {
    ciThreshold = parseInt(args[ciThresholdIdx + 1], 10);
    if (isNaN(ciThreshold)) {
      console.error('lint:design — --ci-threshold requires a number');
      process.exit(2);
    }
  }

  const root = process.cwd();
  const CONFIG = process.env.ADHERENCE_CONFIG || '_adherence.json';

  let config;
  try {
    config = JSON.parse(readFileSync(join(root, CONFIG), 'utf8'));
  } catch (err) {
    console.error(`lint:design — cannot read ${CONFIG}: ${err.message}`);
    process.exit(2);
  }

  const targets = config.targets?.length ? config.targets : ['src'];
  const rules = config.rules ?? [];

  let compiled;
  try {
    compiled = compileRules(rules, targets);
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }

  // One globSync per target: `**` descends, the excludes replace the walk's
  // `node_modules`/dotfile skips. globSync returns target-dir-relative paths —
  // joined absolute under root, the form `walk` produced; the `relative(root,
  // file)` below renders each the root-relative form `scanFile`'s include/
  // exclude globs expect. A target naming a missing dir yields [] rather than
  // throwing (globSync skips non-matching patterns), so a consumer missing any
  // target root is skipped silently; the sort keeps the file list (and the
  // per-file scan order below) deterministic across filesystems — the walk's
  // order was an accident of readdir(3) on each tree.
  const files = targets
    .flatMap((t) =>
      globSync(
        '**/*.{ts,tsx}',
        { cwd: join(root, t), exclude: ['**/node_modules/**', '**/.*/**'] },
      ).map((rel) => join(root, t, rel)),
    )
    .sort((a, b) => a.localeCompare(b));

  const allViolations = files.map((file) => ({
    fileRel: relative(root, file),
    violations: scanFile(relative(root, file), readFileSync(file, 'utf8'), compiled),
  }));
  const violations = allViolations.flatMap(({ violations }) => violations);
  const warnings = violations.filter((v) => v.severity === 'warn').length;
  const errors = violations.filter((v) => v.severity === 'error').length;

  // Per-rule live scope: how many walked files each rule actually applies to (include
  // matched, excluding `exclude`-matched files; an unscoped rule's scope is every file).
  // A scoped rule reporting 0 sits at a layer that is not installed right now — the
  // reachability guard keeps the config honest at compile time; this keeps the live tree
  // honest at scan time.
  const fileRels = [...new Set(allViolations.map(({ fileRel }) => fileRel))];
  const ruleScopes = compiled.map(({ label, includes, excludes }) => ({
    rule: label,
    files: fileRels.filter(
      (r) =>
        (!includes.length || includes.some((inc) => matchesGlob(r, inc))) &&
        !excludes.some((ex) => matchesGlob(r, ex)),
    ).length,
  }));

  if (jsonMode) {
    const result = {
      violations,
      summary: { files: files.length, warnings, errors },
      ruleScopes,
    };
    process.stdout.write(JSON.stringify(result) + '\n');
  } else {
    for (const { fileRel, violations: fileViolations } of allViolations) {
      for (const v of fileViolations) {
        console.log(`${fileRel}:${v.line}:${v.col}  ${v.severity}  ${v.rule}  ${v.message}`);
      }
    }
    const summary = `lint:design — ${files.length} file(s) scanned, ${warnings} warning(s), ${errors} error(s)`;
    if (errors) {
      console.error(`\n${summary}`);
    } else {
      console.log(`\n${summary}`);
    }
  }

  if (ciThreshold !== null && (warnings + errors) > ciThreshold) {
    process.exit(1);
  }
  if (errors) {
    process.exit(1);
  }
  process.exit(0);
}

// Node resolves the main module (import.meta.url) to its realpath, so a
// symlinked invocation must resolve process.argv[1] the same way or this
// guard silently never fires (ADR-0005 consumers vendor the runner via a
// symlink).
if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  main();
}

export { compileGlobs, compileRules, scanFile, findSwallowedSlots, findToolbarTabs, harvestUnionAliases, includeReachableUnder, CompileError };
