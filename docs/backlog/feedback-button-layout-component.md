---
area: layout
opened: 2026-11-10
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-10T00:00:00Z
---

# Shared FeedbackButton and mail formatter in layout chrome

## Context

Every consumer app (controlling-app, hk-sales-agent, gebo-stock-kiosk) needs in-app user feedback that ends up as a backlog ticket in the coding-dashboard. The chain is: app backend sends a mail to the intake mailbox → the dashboard's `server/emailIntake.ts` polls it via Graph, routes by recipient address (`intake.email.repoByAddress`) and holds it in the `triage` inbox state until the operator promotes it → a cold `/ticket` enrichment run reads the mail. design-baseline owns only the UI, the payload contract and the mail formatting; the app owns transport (the component never sends mail). No LLM, no chatbot, no voice (Web Speech API sends audio to Google: GDPR). It is shared chrome, not a page, so it lives in `src/components/layout/` (exported via `design-baseline/layout`, `src/components/layout/index.ts`) and needs no MANIFEST archetype entry (`docs/ARCHITECTURE.md` §3: layout layer; archetypes only via promotion).

## What to do

- [ ] Add `FeedbackButton` in `src/components/layout/`: a floating button opening the existing `src/components/ui/dialog.tsx` with a textarea and submit/cancel; fully keyboard-operable (focus into the textarea on open, Escape closes, focus returns to the button, Ctrl/Cmd+Enter submits, labelled controls).
- [ ] Define and export a typed `FeedbackPayload`: `text`, `appName`, `version` (version or commit SHA), `route` (URL), `userId`, `userRole`, `userAgent`, `consoleErrors` (last ~10) and `timestamp` (ISO). App-specific fields (`appName`, `version`, `userId`, `userRole`) are props; `route`, `userAgent`, `timestamp` and console errors are collected automatically. The component hands the payload to an app-supplied `onSubmit(payload)` (async; the dialog shows pending and error states, and closes only on success).
- [ ] Export `installConsoleErrorBuffer()` (idempotent, ring buffer of the last 10 `console.error` messages, truncated per entry) that the component reads on submit; document that apps call it once at startup.
- [ ] Add a pure `formatFeedbackMail(payload)` returning `{ subject, body }`: subject `[feedback] <appName>: <first line of text>` (first line trimmed and length-capped), body = the free text first, then a labelled context block (App, Version, Route, User, Role, User agent, Time, Console errors). Export it from `src/components/layout/index.ts` alongside the component and `FeedbackPayload`.
- [ ] Decision: no screenshot in v1 and no `html2canvas` dependency. The payload type carries no screenshot field. Reason: an extra dependency for an optional attachment, whose bytes the app's mail transport would also have to carry (`docs/STACK.md` pins the stack). Add later only if feedback tickets prove text insufficient.
- [ ] Unit-test `formatFeedbackMail` (vitest, next to the component, same pattern as `src/components/layout/Header.test.tsx`): subject format, first-line extraction and length cap, text-before-context ordering, labelled block, empty console-error list, multi-line text.
- [ ] Add a gallery entry (`gallery/layout-demos.tsx`, registered in `gallery/registry.ts`) showing the button with a fake `onSubmit` that renders the formatted subject and body, so the mail shape is visible without a backend.
- [ ] Document the contract and the intake chain in `docs/ARCHITECTURE.md` §3 (one row) and bump the package version per `docs/RULES.md`.

## Acceptance

- `FeedbackButton` and `formatFeedbackMail` are exported from `design-baseline/layout` and typecheck in a consumer.
- `formatFeedbackMail` returns subject `[feedback] <app>: <first line>` and a body whose free text precedes the labelled context block; the unit test passes.
- The dialog opens on click, Escape closes it and returns focus to the button, and it shows the pending state while `onSubmit` is in flight; on a rejected `onSubmit` it shows an error and stays open with the text unchanged.
- The component never calls `fetch` or any mail transport itself; the only outbound path is the app-supplied `onSubmit(payload)`.
- The gallery demo shows the button and displays the formatted mail after submit.

## Related

- [ARCHITECTURE §3 component map](/docs/ARCHITECTURE.md) — layout layer and leaf-util rules
- [STACK](/docs/STACK.md) — pinned dependency contract (screenshot decision)
- [[over-engineering-second-toast-system-shadcn-stack]] — precedent for not adding a parallel system beside the shadcn stack
