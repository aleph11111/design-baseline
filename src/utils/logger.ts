type LogArgs = unknown[];

// `process.env.NODE_ENV` is set by both Vite and Next.js at build time (Vite
// statically replaces the reference; Next.js exposes it natively). Using it
// keeps this file framework-agnostic — earlier Vite-only variants using
// `import.meta.env.DEV` broke under Next builds (see hk-crm regression).
// Ambient `process` declaration so the donor typechecks without `@types/node`;
// target projects (Next/Vite) bring their own runtime + types.
declare const process: { env: { NODE_ENV?: string } } | undefined;

export const logger = {
  debug: (...args: LogArgs) => {
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
      console.debug(...args);
    }
  },
  // `info`/`warn` carry no logic on purpose. They exist because this file is
  // copy-source: `/style-baseline` overwrites a target's `src/utils/logger.ts`
  // unconditionally, so the donor surface must be a superset of what the fleet
  // calls or the next re-apply breaks those call sites. See docs/STYLE.md
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
