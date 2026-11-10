/** Payload contract + mail formatting for FeedbackButton. Pure; no transport. */

export type FeedbackPayload = {
  text: string;
  appName: string;
  /** Version or commit SHA. */
  version: string;
  /** Current URL (collected automatically). */
  route: string;
  userId: string;
  userRole: string;
  userAgent: string;
  /** Last ~10 console.error messages. */
  consoleErrors: string[];
  /** ISO 8601. */
  timestamp: string;
};

const BUFFER_SIZE = 10;
const ENTRY_MAX = 300;
const SUBJECT_LINE_MAX = 80;

const buffer: string[] = [];
let installed = false;

/**
 * Start recording the last 10 `console.error` messages (truncated per entry).
 * Idempotent; apps call it once at startup.
 */
export function installConsoleErrorBuffer(): void {
  if (installed || typeof console === "undefined") return;
  installed = true;
  const original = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const msg = args
      .map((a) => (a instanceof Error ? a.message : typeof a === "string" ? a : safeJson(a)))
      .join(" ")
      .slice(0, ENTRY_MAX);
    buffer.push(msg);
    if (buffer.length > BUFFER_SIZE) buffer.shift();
    original(...args);
  };
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
}

/** Snapshot of the buffered console errors (empty until installed). */
export function getConsoleErrors(): string[] {
  return [...buffer];
}

/** `{ subject, body }` for the app's mail transport: free text first, labelled context after. */
export function formatFeedbackMail(p: FeedbackPayload): { subject: string; body: string } {
  const first = p.text.trim().split(/\r?\n/)[0]?.trim() ?? "";
  const line = first.length > SUBJECT_LINE_MAX ? `${first.slice(0, SUBJECT_LINE_MAX - 1)}…` : first;
  const errors = p.consoleErrors.length ? p.consoleErrors.map((e) => `  - ${e}`).join("\n") : "  (none)";
  const body = [
    p.text.trim(),
    "",
    "---",
    `App: ${p.appName}`,
    `Version: ${p.version}`,
    `Route: ${p.route}`,
    `User: ${p.userId}`,
    `Role: ${p.userRole}`,
    `User agent: ${p.userAgent}`,
    `Time: ${p.timestamp}`,
    "Console errors:",
    errors,
  ].join("\n");
  return { subject: `[feedback] ${p.appName}: ${line}`, body };
}
