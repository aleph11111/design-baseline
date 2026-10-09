---
key: N
slug: native-browser-dialog
kind: component
version: 1.0
promoted_from: fleet synthesis (brickshop-manager, controlling-app, hk-crm)
promoted_at: 2026-10-10
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype N — native-browser-dialog

The **in-app replacement for the browser's native modals** — `alert`, `confirm`,
and `prompt`. A native dialog breaks the app's visual language, cannot take a
token-pure surface, blocks the JS thread, and can't be localized or styled. This
archetype gives each of the three a sanctioned app surface you can `await`, so a
migration is a near-mechanical edit at the call site rather than a redesign.

Promoted as a fleet synthesis: brickshop-manager still had ~10 native
`confirm`/`prompt` call sites, controlling-app three `prompt` create/rename
flows. Two projects had independently hand-rolled the *same* awaitable-confirm
hook (one generic, one discard-only) over the shared confirmation-dialog
primitive; hk-crm had moved every native site to the confirmation-dialog
primitive by hand. No project had a `prompt` replacement, which is why the fleet's
prompt sites were still native. This is the convergence target.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/native-browser-dialog`; the prop surface is the API and the sandbox demo (`src/examples/native-browser-dialog-demo.tsx`) is the gallery reference.

## The three replacements

| Native call | Replacement role | Resolves |
|---|---|---|
| `alert(msg)` | the app-wide **toast** (no dialog — an alert is a notice, not a question) | — |
| `confirm(msg)` | the **awaitable confirm** over the shared confirmation-dialog role | `true` on confirm; `false` on cancel / Escape / overlay dismiss |
| `prompt(msg, default)` | the **awaitable single-field prompt** — a modal wrapping one labeled field in a real form | the trimmed value on submit; `null` on cancel / Escape / overlay dismiss |

Anything needing **more than one field** is not a prompt: use the create/edit
dialog archetype (`crud-dialog`). A confirm whose action must **run inside the
open dialog** with a pending state (spinner on the confirm button, dialog held
open until the mutation settles) is out of scope for v1 — the owner drives the
shared confirmation-dialog role directly for that shape.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this
molecule carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Hook-shaped: the owning component calls the hook once and receives **an ask
function plus a dialog element**. It renders the element once in its own tree and
`await`s the ask function where the native call used to be. No app-level
provider is required.

The ask functions are deliberately **not** named `confirm` / `prompt`: the
replacement must not shadow the global, and must not re-trip the
`native-browser-dialog` audit signal at every migrated call site.

### L2 — State shape
The hook owns exactly one pending question: the options for the open dialog and
the resolver of its promise. **First settle wins** — a confirm-then-close event
pair resolves the promise once. A **second ask while one is open resolves the
earlier one negatively** (`false` / `null`) and replaces it; a question is never
left dangling. Unmounting the owner while a question is open resolves it
negatively too.

### L3 — Selection model
N/A.

### L4 — Keyboard / focus
Modal focus trap and Escape-to-dismiss come from the modal-dialog role; Escape
resolves negatively. The prompt's field takes initial focus and **Enter
submits** (the field lives in a real form); the confirm's focus lands on the
dialog's actions per the alert-dialog pattern.

### L5 — Empty / loading states
The prompt's field may be pre-filled (the current name in a rename flow). A
blank or whitespace-only value **disables submit** by default; an explicit
opt-out allows an empty answer.

### L6 — Mobile affordance
Rides the modal-dialog role's responsive sizing; no separate mobile component.

### L7 — Theming
Token-pure by construction — it *is* the app's dialog surface. The confirm
button's tone is **derived, not chosen**: it keys to whether the confirmed action
destroys data that cannot be recovered (delete, discard unsaved edits, overwrite)
→ destructive tone; anything else (a status push, a send, a publish) → default
tone. The fact defaults to *destroys* because the native confirm almost always
guards a delete. No other appearance knob.

### L8 — Render-prop surface
N/A — copy is passed as options (title, description, field label, placeholder,
button labels). Button labels default to the active label set (`cancel`,
`confirm`, `save`), so a localized app gets localized buttons without passing
them.

### L9 — Error surface
N/A — the hooks ask; they don't mutate. The caller runs the action after the
promise resolves and routes its failure to the app-wide toast, never to a
native `alert`.

### L10 — Performance contract
One dialog element per hook call, closed when idle. Negligible.

### L11 — Accessibility contract
**Required.** Confirm: an alert-dialog role with the title as its accessible
name and the description associated. Prompt: a dialog whose field has an
accessible name — the visible field label when given, otherwise the dialog title.
Both are dismissable by Escape and both return focus to the invoking control.

## Forbidden

- Any native `window.alert` / `window.confirm` / `window.prompt` (or their bare
  global forms) on a product code path.
- A per-call-site hand-rolled open/resolve state machine for a yes/no or
  single-value question where this hook fits.
- A prompt dialog grown to several fields — that is the create/edit dialog.

## Known exception

The `crud-dialog` archetype's own discard guard still defaults to the native
confirm: its controller's guard is synchronous (`() => boolean`), and moving it
onto this awaitable confirm is a breaking change to that archetype, tracked
separately. It stays the sanctioned residual hit of the `native-browser-dialog`
signal until then.

## Acceptance gate

Given a file the `native-browser-dialog` signal flags:

1. **N1** — every `confirm(` is replaced by the awaitable confirm, with a title
   naming the action and a description stating the consequence.
2. **N2** — every `prompt(` is replaced by the awaitable prompt (single field) or,
   when more than one value is gathered, by a create/edit dialog.
3. **N3** — every `alert(` is replaced by a toast (`error` tone for failures).
4. **N4** — the dialog element is rendered exactly once per owning component.
5. **N5** — remaining hits are noun collisions (the word "prompt" in prose) or a
   local function named `confirm` — read the line; clear it.
