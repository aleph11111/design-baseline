# Detail-Page Teardown-First Adoption Playbook (stack- & entity-agnostic)

> Drop this into any target (hk-crm, BrickShop, …) for any record detail page
> (deal, lead, offer, order, invoice, contact). It is the **stack-agnostic contract**
> for adopting the detail-overview archetype *without leaving the old page underneath*
> — the reference-implementation appendix (concrete component names, Tailwind classes)
> lives per-app, e.g. `TEARDOWN-FIRST-ORDER-ADOPTION.md` for BrickShop orders.
>
> **Why it reads as DELETE-first.** A target-state mockup says what a page should
> *become*; it is silent on what to **remove**. The #1 adoption failure is wrapping a
> new shell around the old content (`layout="rail"` set, legacy blocks poured into the
> slots) — you get new structure + old furniture. This playbook makes the *subtraction*
> the first, explicit, separately-committed step. If a deletion feels scary because the
> code "works", that is the signal you are doing the real adoption and not a wrapper.

---

## 0 — Parametrize (fill this in for your entity, 2 minutes)

Everything below references these roles by name, never a concrete noun, so the same
playbook fits every entity:

```yaml
ENTITY:            # e.g. "Deal" / "Lead" / "Order" / "Angebot"
PARTNER:          # the related party shown in the rail: "Kunde" / "Lieferant" / "Firma"
STATUSES:         # the 1–3 status dimensions: e.g. [Phase, Forecast]  /  [Order, Payment, Shipping]
HEADLINE_FIGURES: # the 2 numbers that must be visible at a glance: e.g. [Gesamtwert, ARR] / [Revenue, Gross profit]
SECONDARY_FIGURES:# the rest, hidden behind a disclosure: e.g. [GuV dJ, GuV nJ] / [COGS, Fees]
LIFECYCLE:        # the ordered stages for the tracker: e.g. [Neu, Qualifiziert, Angebot, Verhandlung, Abschluss]
PRIMARY_RECORDS:  # the main line collection: "Positionen" / "Line items" / "—" (none → skip that section)
BREAKDOWN:        # the money breakdown section, if any: "GuV-Wirkung" / "Financial breakdown"
SECONDARY_TABS:   # surfaces that stay behind a small tab group: [Aktivität, Verlauf, Verknüpft, …]
PRIMARY_ACTION:   # the single filled CTA: "Nächste Phase →" / "Zu Kunde umwandeln" / "Mark as shipped"
DENSITY:          # rail | vertical  — rail for money-dense entities (deal/order), vertical for light (lead/inquiry)
```

If `DENSITY: vertical`, you still do every DELETE/REBUILD step — you just pass
`layout="vertical"` and the rail blocks stack instead of pinning.

---

## 1 — INVENTORY (the step that replaces component names)

You don't know this codebase's class names; that's fine. **Enumerate every visible
block on the current page** and classify each. Do not write any new code until this
table is filled — it is what forces the deletions into the open.

| # | Block currently on the page | Role it plays | Disposition | Target |
|---|------------------------------|---------------|-------------|--------|
| 1 | _(e.g. floating status badges)_ | status | **DELETE** → re-add in header | header.badges |
| 2 | _(e.g. full-width status + meta band)_ | status + master-data | **DELETE** (status) / **MOVE** (facts) | header + rail facts |
| 3 | _(e.g. row of 6 toolbar buttons)_ | actions | **CONDENSE** | 1 primary + `⋯` |
| 4 | _(e.g. Items/…/History tab bar)_ | navigation | **DISSOLVE** | stacked sections + 1 small tab group |
| 5 | _(e.g. KPI/financial card)_ | headline figures | **REBUILD** as primitive | rail `MetricList` |
| 6 | _(e.g. hand-rolled timeline/steps)_ | lifecycle | **REBUILD** as primitive | content `ProgressTracker` |
| 7 | _(e.g. line/position table)_ | primary records | **KEEP** + un-hide | content `DetailSection` |
| 8 | _(e.g. docs / linked records)_ | references | **MOVE** | rail `references` |
| … | | | | |

**Disposition vocabulary** (every block gets exactly one):
- **KEEP** — conforms already; only its *placement* (slot) may change.
- **MOVE** — content is fine, belongs in a different slot.
- **CONDENSE** — too heavy; collapse to a primary + overflow / a disclosure.
- **DISSOLVE** — a container whose job the archetype now does (tab bar, ad-hoc grid).
- **DELETE** — duplicate or obsolete; nothing survives.
- **REBUILD** — same information, but must be re-expressed through a shared primitive.

---

## 2 — DELETE first (one commit, no replacements yet)

Apply these **role-based deletion rules**. Each maps to rows you marked
DELETE/CONDENSE/DISSOLVE above. The page will look *emptier* after this commit — correct.

1. **One home for status.** If a status value appears in more than one place, delete
   every copy except the header badge row. (Floating badge stacks, status bands, and
   per-section status labels are the usual duplicates.)
2. **No full-width status/meta band in the content area.** Delete it. Status *editing*
   becomes inline controls in the header; its meta fields are master-data → they live
   in the rail's key-facts list.
3. **No toolbar of equal-weight buttons.** Reduce to **one primary action + an overflow
   `⋯` menu**. Everything else (sync, recalc, toggles, secondary exports) goes in the menu.
4. **Tabs are not primary navigation.** Dissolve the tab bar that fronts the main
   record content. Primary records + breakdown become always-visible stacked sections;
   only genuinely secondary surfaces keep a *small* tab group.
5. **No hand-rolled molecule where a shared one exists.** Delete bespoke status chips,
   steppers, KPI cards, empty/loading states, search boxes — they get rebuilt from the
   baseline primitives in Phase 3–4.
6. **No page-level outer padding.** The app shell's `<main>` is the single inset owner;
   remove any `px-*/py-*` the page adds around itself.
7. **No duplicated facts.** A field shown in two cards keeps one owner (the rail facts).

> Commit this as "teardown: order detail" on its own. A reviewer should see mostly
> red. That diff *is* the proof the adoption isn't a wrapper.

---

## 3 — REBUILD the header (one row)

`‹ back · breadcrumb · {ENTITY} title · STATUSES as inline badges · [inline status edit] · PRIMARY_ACTION · ⋯`

- Status badges inline, one row, via the shared chip/`Badge` primitive — never a stack,
  never absolute positioning.
- Status **editing** = small inline selects here (not a band).
- Exactly one filled `PRIMARY_ACTION`; everything else in the `⋯` menu.

## 4 — REBUILD the content column (stacked, in this order)

1. **Lifecycle** → `ProgressTracker` with `LIFECYCLE` (omit if the entity has no stages).
2. **`PRIMARY_RECORDS`** → a `DetailSection` with the shared table (thumbnails if the
   records have images; figures in mono, right-aligned; subtotal footer). Always visible.
3. **`BREAKDOWN`** → a `DetailSection` ruled money list (omit if none).
4. **`SECONDARY_TABS`** → one `DetailSection "Mehr/More"` hosting a *small* tab group.
   The long logs/tracking tables live here, never at the top.

## 5 — REBUILD the rail (`summary` + `references`)

- **summary**: `PARTNER` identity card + **`MetricList`** (`HEADLINE_FIGURES` emphasized
  and always visible; `SECONDARY_FIGURES` behind the disclosure) + key-facts list.
- **references**: documents / linked records.
- `DENSITY: rail` pins this aside; `vertical` stacks it — same blocks either way.

## 6 — FINISH (fleet-level, easy to forget)

- **Brand tokens** applied to `tokens.css` (`--primary` = the brand, e.g. hk-crm teal
  `187 100% 25%`). Without it every primary reads as default slate.
- **Mono figures** — all money / IDs / dates through `font-mono tabular-nums`.
- **Semantic state** — negative/at-risk values in `destructive`, not brand color.

---

## 7 — Acceptance gate (run before calling it done — the conformance pass)

- [ ] Each status value appears in **exactly one** place (header).
- [ ] Content column starts with the lifecycle tracker (or `PRIMARY_RECORDS` if no
      lifecycle) — **not** a status band or a log table.
- [ ] `PRIMARY_RECORDS` are visible without clicking a tab.
- [ ] Actions = 1 primary + `⋯`.
- [ ] `HEADLINE_FIGURES` are visible at a glance in the rail; the rest are behind a disclosure.
- [ ] All figures render mono/tabular; primary color is the brand; negatives read `destructive`.
- [ ] No page-level padding outside the shell's `<main>`.
- [ ] Every Phase-1 inventory row marked DELETE/DISSOLVE is actually gone from the DOM.

Any unchecked box ⇒ still a wrapper; return to the phase that owns it.

---

## 8 — How to make an agent execute this (not just read it)

When you hand this to Claude Code / a dev, frame the task as **subtraction with a gate**:

> "Adopt the detail-overview archetype on `<page>` using
> `DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`. **Phase 1 first: produce the INVENTORY table for
> this page and the DELETE commit before writing any new layout.** Do not proceed to
> REBUILD until the teardown is committed. Finish only when every box in the Acceptance
> gate is checked; paste the checked gate in the PR description."

The two things that make it land: (a) the **inventory table is a required deliverable**,
so deletions can't be skipped silently; (b) the **gate is pasted into the PR**, so
"wrapper" adoptions can't pass review. That is the Axis-B conformance step the first
pass skipped.
