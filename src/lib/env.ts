// Ambient `process` so the donor typechecks without `@types/node` — target
// projects (Next/Vite) bring their own runtime + types.
declare const process: { env: { NODE_ENV?: string } } | undefined;

/**
 * Dev-only gate shared by every donor file. Not `typeof process`: Vite replaces
 * only the literal `process.env.NODE_ENV` text and leaves the bare `process`
 * identifier undefined in the browser, so a `typeof` guard is false in every Vite
 * dev build. Where the reference is not replaced it throws; that reads as "not dev".
 */
export function isDevBuild(): boolean {
  try {
    return process!.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}
