# Story contract

Operator user stories live in this folder — flat, one file per story, one folder per
repo. The path is `docs/stories` (repo-relative, hardcoded). It is deliberately **not**
a `## Doc Paths` key: those keys are a hard shell/TS parity invariant
(`server/lib/docPaths.ts` ↔ `fleet/lib/resolve-spec-plan-dirs.sh`), and no repo has
asked to override this one. Add the key the first time one does.

## Identity is the path, not the frontmatter

A story's identity is its file — one file, one story. This is the **deliberate inverse
of ADR-0009**. A roadmap needs `kind: roadmap` because it sits *among* tickets and must
be told apart from them; a story sits among nothing, so the folder is the classifier and
there is no `kind:` field to disagree with. A file under `docs/stories/` that is not
`README.md` and carries parseable frontmatter is a story. (Consequently `git grep
'kind: story'` should return nothing in `server/` or `client/` — the folder, not a
frontmatter kind, is what identifies a story.)

## Frontmatter

| field | meaning |
| --- | --- |
| `persona` | free text; one or two words ("operator", "operator + brain") |
| `status` | see the status lifecycle below |
| `origin` | `operator` (written by hand) or `harvested` (drafted from code, unconfirmed) |
| `opened` | ISO date (`YYYY-MM-DD`) |
| `roadmaps: []` | parent links; written atomically with the roadmap's `stories:` (phase 7) |
| `surfaces: []` | inventory ids from `readSurfaces` (`endpoint:…`, `page:…`, `dialog:…`, `command:/…`); written by enrich (and harvest), hand-editable via PR. Never an id outside the inventory |

Convention: keep one umbrella `plumbing` story per repo that justifies the auth / health /
config surfaces no user-facing want names, so they do not read as orphans.

There is **no `gate` field in the frontmatter** — the grade is **computed on read,
never stamped**: `readStories` (`server/stories.ts`) grades every story it returns with
`runStoryGate` (`server/gate.ts`), so the four-criterion score is always the score of the
bytes just read, and a story that is re-landed is re-graded on its next read with no
re-grade trigger. A story therefore never carries a `gate` block and a status is never
graded then re-graded; the only frontmatter `status` value the grade does not overrule is
`retired` — see the status lifecycle below. (`journeys:` arrives in phase 8.)

## Body sections

- **`## Situation`** — where the user is and what triggers the want. Must name one real
  surface (route, panel, dialog, command).
- **`## Outcome`** — the observable end state in user words, as bullets. At least one
  bullet is testable in the `isTestableBullet` sense (`server/gate.ts`).
- **`## Not`** — what this story does not promise. Optional; graded only for
  contradictions with other stories (phase 4).
- **`## Open questions`** — written by enrich (phase 4). A non-empty unanswered set
  implies `status: unclear`. The operator answers in place; re-enrich clears answered
  ones.
- **`## Related`** — links to roadmaps, tickets, ADRs, or sibling stories.

The H1 sentence is the journey test's title, verbatim. Everything the chain "want → proof"
rests on is that single rule; copy the story's H1 as a journey test's `test("…")` title
exactly.

## Status lifecycle

The full table is documented here so the contract is written once. In this phase only
**`draft`** and **`retired`** are writable — the rest are not reachable until their
producers land (the phase column names the one that makes each state reachable). Status is
**derived on read** (`deriveStoryStatus`, `server/gate.ts`): a story that is not
hand-retired and grades 4/4 reads `ready`, one with an unanswered `## Open questions`
bullet reads `unclear`, and everything else reads `draft`. **A frontmatter `status:` other
than `retired` is advisory — derivation wins**, so a story hand-marked `ready` that
grades 3/4 reads `draft`; `retired` is the one hand-set value that survives, an operator
withdrawal a gate cannot overrule. `covered` / `broken` are not reachable until phase 8
layers them on top of `ready` from recorded journey runs.

| status | rule | reachable from |
| --- | --- | --- |
| `draft` | authored, not yet graded | **phase 1** — the only state a new story is written in |
| `unclear` | `## Open questions` has an unanswered bullet | phase 4 |
| `ready` | a 4/4 story gate, no open questions, no journeys | phase 2 |
| `covered` | `ready` and ≥1 journey whose last recorded run passed | phase 8 |
| `broken` | ≥1 journey whose last recorded run failed | phase 8 |
| `retired` | an operator decision; a retired story whose `surfaces:` is non-empty is a delete-candidate signal | **phase 1** (hand-set, in this phase) + phase 9 |

Only `draft` (a story being written) and `retired` (a story being withdrawn by the
operator) are writable by hand in this phase; a story's *displayed* status is derived on
read, so setting any of the other states by hand is advisory and the derivation shown
instead (a hand `ready` that grades 3/4 reads `draft`). `covered` / `broken` become
reachable only when phase 8 ships the writer that layers them on top of `ready`.

## How a story is born

By hand, from this template:

```markdown
---
persona: operator
status: draft
origin: operator
opened: 'YYYY-MM-DD'
roadmaps: []
---

# As a <persona>, I <action a real surface lets me do> and <the observable result>

## Situation
Where the user is and what triggers the want (name one real surface).

## Outcome
The observable end state in user words, as bullets.

## Not
What this story does not promise.

## Open questions

## Related
- (links)
```

`enforce-file-tickets.sh` guards `docs/backlog/<slug>.md` only, so `docs/stories/` needs
no command to be writable — a story is exactly the artifact that should be the
operator's own words. Phase 2 grades it, phase 3 adds dashboard capture, phase 10
harvests drafts from existing code. This phase ships no `/story` command and no
`POST /api/stories/create`.
