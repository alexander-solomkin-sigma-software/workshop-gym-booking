# Documentation

Project documentation lives **in the repo, next to the code** — Git is the source of truth, and every doc renders directly on the default branch (Markdown + Mermaid). The one exception is the **Business layer** (BRD, PDR, NFR), which lives in **Confluence**; see [`Business/README.md`](Business/README.md) for the page links. The repo docs cite those pages by name.

## Workshop tools

| Tool | Link | Use it for |
|---|---|---|
| GitHub | [workshop-gym-booking](https://github.com/alexander-solomkin-sigma-software/workshop-gym-booking) | The upstream template repo: app code and every doc downstream of the Business layer. Your fork or copy is where you work. |
| Confluence (site `vs5-ssw`) | [Site home](https://vs5-ssw.atlassian.net/wiki/home) · [Workshop space home](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1507329) | The Business layer (BRD, PDR, NFR); see [`Business/README.md`](Business/README.md) |
| Jira | [Site home](https://vs5-ssw.atlassian.net/jira) · [KAN board](https://vs5-ssw.atlassian.net/jira/software/projects/KAN/boards/34) | Work items; their keys (for example `KAN-12`) go in commit messages |

From Claude Code, read GitHub through the GitHub MCP connector and Confluence and Jira through the Atlassian MCP connector. In the browser you need access to the Atlassian site; your facilitator arranges it.

## Why the docs live here (persistent memory for AI)

This project is built with an **AI-assisted delivery workflow**. An AI agent (and a human returning weeks later) loses context between sessions — it does not remember last week's decisions. **Structured documents act as persistent memory:** they carry the requirements, design rationale, and constraints across sessions, so when the agent reads a spec it understands not just *what* to build but *why* and *within what limits*. Without this, every session starts from zero and drifts.

That is why specs are written and reviewed **before** code is touched, and why documentation is organised by artifact type following the delivery workflow:

**Requirements → Design (+ ADR) → Execution plan → Feature description → Dev testing scenarios.**

## Taxonomy — where each artifact lives

| Folder | Holds | Produced at step |
|---|---|---|
| Confluence: [BRD](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1736705) | Business Requirements Document — the "why", users, goals, scope | Requirements |
| Confluence: [PDR](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1769473) | Product Definition Requirements — the baseline feature list | Requirements |
| Confluence: [NFR](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1540098) | Non-Functional Requirements — performance, simplicity, data, constraints | Requirements |
| `FunctionalRequirement/Usecase` | Use cases — actor, preconditions, main/alternate flows, postconditions | Requirements |
| `FunctionalRequirement/Feature` | Living feature descriptions — behaviour of a shipped feature | Feature description |
| `Architectural/Design` | Design specs + coding conventions — problem, data model, API/UI surface, edge cases | Design |
| `Architectural/ADR` | Architecture Decision Records — one decision each (Context/Decision/Consequences) | Design |
| `Testing/Strategy` | Test strategy — what we unit- vs end-to-end test, tools, coverage intent | Dev testing |
| `Testing/TestCases` | Manual test checklists (TC-table, sign-off oriented) | Dev testing |
| `Testing/TestScenarios` | Narrative dev-testing scenarios (`TF-N`: Goal/Preconditions/Steps/Expect) | Dev testing |
| `Infrastructure` | Environment / setup docs | — |
| `Implementation/Plans` | Execution plans — `Task N` blocks with test-first steps + gated commits | Execution plan |
| `Implementation/DevData` | Dev/test fixtures & seed-data notes | — |
| `Implementation/DevScripts` | Helper/dev-script notes | — |
| `Releases/PlanDoc` | Release plans — scope cut, what ships, work-item list (planning only) | — |
| `DeliveryReports` | Progress / delivery / status reports (git-derived) | — |

## Seed data & the local database

The app persists to a local SQLite database at `api/data/gym.sqlite`. That file
is **git-ignored** and rebuilt from `api/src/seed.ts` (`npm run seed`, wired into
`npm run setup`) — the **seed script is the source of truth**, not the binary DB.
Committing the script rather than the `.sqlite` keeps every checkout on identical,
deterministic data while avoiding Windows line-ending/checksum churn on a binary
file. Rationale: [ADR-0001](Architectural/ADR/0001-sqlite-local-db-file.md);
contents: [sample-seed-data](Implementation/DevData/sample-seed-data.md).

## Two tiers of docs (and the cycle between them)

- **Tactical, point-in-time** artifacts (`Implementation/Plans`, dated design/analysis notes) capture a decision or a piece of work *at a moment*. They are consumed during development and not rewritten afterwards.
- **Living, current-state** artifacts (`FunctionalRequirement/Feature`, `Architectural/ADR`, `Architectural/Design`) describe *how things are now* and are kept up to date.

They feed each other in a loop: **a tactical plan drives a code change → the code change updates the living docs → the living docs inform the next plan.** Skip the loop and the living docs go stale, which then poisons the next round of specs.

## Key principles

- **Specs before code.** Requirements, design, and task breakdown happen first, where changes are cheapest; implementation follows an approved blueprint.
- **Implementation updates the living docs.** After finishing work driven by a plan, update the affected feature descriptions / ADRs / design. This is not optional — stale docs mislead the next session.
- **One topic per document.** Each file covers one feature, one decision, one question. Small files fit an AI context window and can be updated atomically.
- **Separation of concerns.** Feature descriptions stay free of implementation detail (behaviour, not code); technical design lives in `Architectural/`. Keeps knowledge easy to navigate.

## Naming conventions

- **Feature descriptions:** one file per feature in `FunctionalRequirement/Feature/` (e.g. `booking.md`).
- **ADRs:** numbered sequentially in `Architectural/ADR/` (`NNNN-short-title.md`), listed in `Architectural/ADR/index.md`.
- **Execution plans / dated notes:** date-prefixed in `Implementation/Plans/` (`YYYY-MM-DD-topic.md`).
- **Use cases:** `UC-NN-short-title.md`; **test scenarios:** `TF-NN-short-title.md`; **test checklists:** `<feature>-checklist.md`.
- **No blank templates** — start a new artifact by **copying the closest existing filled document** and adapting it. The shipped baseline docs are your patterns.
- **Commit convention:** `type(scope): reason #<issue>` (a GitHub issue number or a Jira key, for example `#KAN-12`).

## Revision History for evolving docs

Living docs carry a short revision table right after the title/date:

```markdown
**Date:** YYYY-MM-DD (baseline) | **Last revised:** YYYY-MM-DD

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
```

Mark inline changes with a `[Revised YYYY-MM-DD]` note. **The body always reflects current state** — do not leave stale text in place "for history"; rewrite the affected section and record the change in the table. Git captures exact diffs for archaeology; the table exists for human comprehension at a glance. Truly point-in-time artifacts (one-shot analyses, session notes) stay immutable and need no revision table.

## Adding a new feature

When you extend this app, you **add new files** for that increment into these same folders (a use case, a design + ADR, a plan, a feature description, test cases/scenarios). You do **not** rewrite the baseline docs — you add alongside them. When you write a design, check whether it contains a decision worth capturing as an ADR.
