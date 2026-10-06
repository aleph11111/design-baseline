#!/usr/bin/env node
// One-shot: harvest the LATIN subset of the house-style Inter family
// (400/500/600/700; mono is the system stack, ADR-0009) from Google Fonts into
// .design-sync/fonts/ as committed, self-contained sync inputs, plus a local
// @font-face stylesheet. Re-runnable; skips existing woff2. So the DS ships its
// fonts instead of depending on the gallery's runtime Google-Fonts <link>.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'fonts');
mkdirSync(OUT, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();

// Split into @font-face blocks; keep only the latin subset (unicode-range with U+0000-00FF).
const blocks = css.split('@font-face').slice(1).map((b) => '@font-face' + b.slice(0, b.indexOf('}') + 1));
// Inter is served as ONE variable file for every requested weight, so key by
// file and emit a single @font-face with a weight range.
const faces = new Map(); // url -> { family, weights[] }
for (const b of blocks) {
  if (!/U\+0000-00FF/.test(b)) continue;               // latin subset only
  const family = /font-family:\s*'([^']+)'/.exec(b)[1];
  const weight = Number(/font-weight:\s*(\d+)/.exec(b)[1]);
  const url = /url\((https:[^)]+\.woff2)\)/.exec(b)[1];
  const f = faces.get(url) ?? { family, weights: [] };
  f.weights.push(weight);
  faces.set(url, f);
}
const local = [];
for (const [url, { family, weights }] of faces) {
  const lo = Math.min(...weights), hi = Math.max(...weights);
  const file = family.replace(/\s+/g, '') + (lo === hi ? `-${lo}` : '') + '.woff2'; // Inter.woff2
  if (!existsSync(join(OUT, file))) {
    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    writeFileSync(join(OUT, file), buf);
    console.error(`  ↓ ${file} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
  local.push(
    `@font-face {\n  font-family: '${family}';\n  font-style: normal;\n  font-weight: ${lo === hi ? lo : `${lo} ${hi}`};\n  font-display: swap;\n  src: url('./${file}') format('woff2');\n}`,
  );
}

writeFileSync(
  join(OUT, 'inter.css'),
  `/* House-style Inter (latin subset), harvested by .design-sync/fetch-fonts.mjs. */\n\n${local.join('\n\n')}\n`,
);
console.error(`[fetch-fonts] ${local.length} @font-face → ${join(OUT, 'inter.css')}`);
