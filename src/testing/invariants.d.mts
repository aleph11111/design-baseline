import type { Device } from "./devices.mjs";

/** Problem codes; a `knownGaps` key downgrades that code to a reported warning. */
export type InvariantCode =
  | "overflow"
  | "clipped"
  | "column"
  | "fullBleed"
  | "toolbarRows"
  | "phoneToolbar"
  | "phoneNav"
  | "tapTargets"
  | "tapOverlap";

export interface InvariantOptions {
  /** code → ticket slug that will fix it */
  knownGaps?: Partial<Record<InvariantCode, string>>;
  /** expected `.db-content-column` width in px; skipped when absent */
  column?: number;
  /** whether the page is a full-bleed archetype; the marker check is skipped when absent */
  fullBleed?: boolean;
}

/** Any Playwright `Page` (structural, so no Playwright type dependency). */
export interface EvaluatingPage {
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
}

export declare const TAP_TARGET_MIN: number;
export declare function checkPageInvariants(
  page: EvaluatingPage,
  device: Pick<Device, "isMobile">,
  options?: InvariantOptions,
): Promise<{ failures: string[]; knownGaps: string[] }>;
export declare function assertPageInvariants(
  page: EvaluatingPage,
  device: Pick<Device, "isMobile">,
  options?: InvariantOptions,
): Promise<string[]>;
