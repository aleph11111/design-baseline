---
slug: adoption-quality
kind: methodology
version: 1.0
status: locked
---

# Adoption quality — the third audit axis (Axis C)

> **Integration points.** This axis is wired into the fleet machinery, not standalone:
> the deterministic tripwires live in [`audit-signals.json`](audit-signals.json) (the
> `adoptionQuality` block); the scan mechanics, per-route output schema, and 🔴
> wrapper-adoption triage tier live in this doc; the other two axes (A — molecule
> drift, B — conformance) have their rubrics in [`STYLE.md`](STYLE.md) ("Shared
> content molecules" + "The baseline is a design language"), and the
> per-archetype checklists Axis C scores against are the **`## Acceptance gate`**
> section in each [`archetypes/*.md`](archetypes/); and the remediation ritual is
> [`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](DETAIL-PAGE-TEARDOWN-PLAYBOOK.md). This
> institutionalizes "audit → roll out" so the teardown is a baseline ritual, not a
> one-off handoff.

## The blind spot

The fleet audit measures two axes today:

- **Axis A — molecule drift**: a page hand-rolls a molecule the donor owns (`<ul>` rows
  instead of `<Table>`, raw `<select>`, …).
- **Axis B — conformance**: an element is off the visual substrate (literal colors, raw
  HTML, off-token focus/spacing).

Both assume the failure is *not using* the primitive. They miss the opposite failure:
a page that **does** import the archetype primitive — so it scores `adopted: true`,
`fit: 1.0` — but kept the legacy content the archetype was meant to replace. The shell
is new; the furniture is old. We hit this on `brickshop-manager`'s order detail: it set
`layout="rail"` and filled the slots, yet still rendered a floating badge stack, a
full-width status band, an un-condensed 6-button toolbar, and a tab-as-primary-nav body.
The binary `adopted` flag is blind to it because adoption is measured as *"imports the
primitive"*, not *"completed the subtraction the primitive implies."*

**Axis C — adoption quality**: *given* a page adopts an archetype, did it also remove the
content the archetype subsumes, or did it wrap the old page? This is the "wrapper
adoption" detector.

## Why it happens (root cause, for the doc record)

Adopting by wrapping is the path of least resistance: passing existing JSX into
`summary=`/`content=` is a tiny diff that compiles and roughly matches a mockup.
Actually conforming means *deleting working code* (the status band, the toolbar, the tab
bar) — and a target-state mockup is silent on deletions. So the hard, scary part
(subtraction) gets skipped while the contract's *letter* (slots filled) is satisfied.
Axis C is the check that makes the skipped subtraction visible.

## How it scans

A two-stage check, matching the audit's existing "deterministic grep + periodic LLM
audit" split:

1. **Deterministic tripwires** (`audit-signals.json → adoptionQuality`): cheap PCRE
   heuristics that only fire when a file *also* imports an archetype shell
   (`coOccursWith`). Examples: `<TabsList>` inside a `DetailOverviewShell` file
   (tab-as-primary-nav); a `*Status` selector band in a detail page; 5+ sibling
   `<Button>`s; page-level `p-6 space-y-*` (double inset); a loose multi-`<Badge>`
   cluster. These are candidates, never verdicts — they flag a route for stage 2.
   The recurring machine half of this stage — the per-signal hit count over any
   connected repo — is the donor's zero-dep `scripts/scan-adoption-quality.mjs`
   (`npm run scan:adoption-quality`, [ADR-0005](adr/0005-adoption-quality-scan-zero-dep-donor-script.md));
   it measures every entry in the array, hitless ones included, and — like the
   tripwires themselves — it never gates: a red hit still exits clean, and the
   stage-2 walk below remains the decision layer.

2. **Per-page conformance pass** (LLM audit): for each flagged route — and every route
   the page-level pass marks `adopted` for a shell archetype — run the archetype's
   **Acceptance gate** (the `## Acceptance gate` section in `docs/archetypes/<slug>.md`).
   For detail-overview that is: status appears in exactly one place; the content column
   leads with the lifecycle tracker / primary records, not a status band or a log
   table; primary records are visible without a tab click; actions = 1 primary + ⋯;
   headline figures at a glance; figures mono/tabular; brand primary; negatives in
   `destructive`; no page-level inset. Each unchecked box is an Axis-C finding.

## The conformance spine (S1–S6)

Every archetype's `## Acceptance gate` restates Axis A/B at the acceptance point through
a shared **conformance spine**. Each gate references it as **[spine]** (sometimes a
subset, e.g. "[spine] S1, S2, S4, S5, S6" when a criterion doesn't apply). Defined once,
here:

- **S1 Single inset** — the page adds no outer `p-*`/`px-*`/`py-*`; only `space-y-*`
  (+ optional `max-w-*`). `AppShell`'s `<main>` is the sole inset owner.
- **S2 Shell, not hand-rolled** — the page composes the archetype's shell primitive;
  no copy-pasted card/border/shadow chrome reproducing it.
- **S3 Canonical states** — loading / empty / error go through the shell's state slots
  (text-only loading, query-dependent empty copy, destructive `Alert` + retry on error).
  No bespoke spinners or ad-hoc error text.
- **S4 Atoms + tokens** — no literal palette colors, no raw `<button>/<input>/<select>`
  where an atom exists, standard focus ring, semantic state via `destructive`/brand not
  literal red/green.
- **S5 Aligned figures** — money, IDs, quantities, dates use `tabular-nums` for
  column alignment, in the **baseline's own font** (do not impose a mono face unless
  the baseline adopts mono figures at the house-style level).
- **S6 Brand primary** — primary actions/active states read the brand `--primary` (the
  target's token override is applied), not donor slate.

## Output (per-route schema)

Add the `adoptionQuality` field to the per-route record of any fleet-scan
report — only on routes that adopt a shell archetype:

```jsonc
{
  "route": "/orders/:id", "archetype": "C", "fit": 1.0, "adopted": true,
  "adoptionQuality": {
    "score": 0.4,                       // fraction of the archetype's acceptance gate passed
    "wrapper": true,                    // adopted the shell, kept legacy content
    "findings": [
      { "signal": "status-band-in-detail", "tier": "red",
        "fix": "delete band; status→header, meta→rail facts" },
      { "signal": "archetype-tabbed-primary-nav", "tier": "red",
        "fix": "stack primary sections; tabs only for secondary" }
    ]
  }
}
```

A page can now be **adopted AND red** — the state the old schema couldn't express.

## Triage tier

The triage rubric fleet-wide (green / yellow / red per finding, human-confirmed,
defaulting ambiguous cases to yellow) is
[STYLE.md](STYLE.md#triage-rubric-greenyellowred); the fleet's green/yellow/red
placement grid lives in [PLACEMENT.md](PLACEMENT.md#enforcement--how-this-stays-true).
Axis C adds one tier:

- 🔴 **wrapper adoption (Axis C)** — an `adopted: true` page that fails its archetype's `## Acceptance gate`: it imports the shell but kept the content the archetype subsumes (status band, equal-weight toolbar, tab-as-primary-nav). Action: run the **teardown ritual** (`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`) on the route — DELETE-first, then re-map slots; the filled inventory table + checked gate are required PR deliverables. Distinct from molecule drift (didn't use a primitive) and conformance (off-token) — here the primitive *is* used, but the subtraction wasn't done. Re-audit flips it green at `score → 1.0`.

## The rollout half ("audit → ausrollen")

Axis C closes the loop the fleet machinery already implies:

1. **Audit** (read-only): the fan-out scanner runs Axis A/B/C; synthesis tiers each
   adopted page green/yellow/red and emits an `adoptionQuality` score per route.
2. **Schedule**: every 🔴 wrapper-adoption route becomes a ticket whose body is the
   filled **inventory table** + the failed **acceptance gate** for that page.
3. **Remediate**: the assignee (dev or agent) runs the teardown playbook — the inventory
   + DELETE commit + gate-in-PR are *required deliverables*, which is what stops the next
   pass from wrapping again.
4. **Re-audit**: the same Axis-C scan confirms the gate now passes (score → 1.0); the
   route flips green. Fleet-wide adoption-quality score is the durable metric the
   dashboard hub renders alongside coverage + drift.

Net: the donor stops shipping *only* the destination (primitives + mockups) and starts
shipping the **teardown** as a first-class, audited ritual — the thing that was missing
every time an adoption came back as a wrapper.
