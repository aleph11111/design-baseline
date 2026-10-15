type LogArgs = unknown[];

import { isDevBuild } from "../lib/env";

// The dev gate reads `process.env.NODE_ENV` (see lib/env.ts), which keeps this
// file framework-agnostic — earlier Vite-only variants using
// `import.meta.env.DEV` broke under Next builds (see hk-crm regression).

export const logger = {
  debug: (...args: LogArgs) => {
    if (isDevBuild()) {
      console.debug(...args);
    }
  },
  // `info`/`warn` carry no logic on purpose. They exist because this file ships
  // in the package as `design-baseline/utils/logger`: a consumer's call sites
  // resolve straight into it, so the donor surface must be a superset of what the
  // fleet calls or the next tag bump breaks them. See docs/STYLE.md
  // § "Donor file scope".
  info: (...args: LogArgs) => {
    console.info(...args);
  },
  warn: (...args: LogArgs) => {
    console.warn(...args);
  },
  error: (...args: LogArgs) => {
    console.error(...args);
  },
};
