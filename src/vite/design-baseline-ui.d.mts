// Types for the sibling `design-baseline-ui.mjs`. TypeScript picks this file
// up for `design-baseline/vite/design-baseline-ui` by extension substitution
// (`.mjs` → `.d.mts`), so the `exports` entry needs no `types` condition and
// consumers need no ambient `declare module`. Keep in step with the `.mjs`.
import type { Plugin } from 'vite';

/** Project-first resolver for `@/components/ui/*` (consumer copy, then package copy). */
export function designBaselineUi(root: string): Plugin;

/** Project-first resolver for `@/components/layout/*` (consumer copy, then package copy). */
export function designBaselineLayout(root: string): Plugin;

/** The package's runtime deps as `design-baseline > <dep>` for `optimizeDeps.include`. */
export function designBaselineDeps(): string[];
