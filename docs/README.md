# Documentation

This repository keeps **all project documentation in the repo, next to the code** — Git is the single source of truth, and every doc renders directly on the default branch (Markdown + Mermaid). Documentation is organised by the kind of artifact it holds, following the delivery workflow:

**Requirements → Design (+ ADR) → Execution plan → Feature description → Dev testing scenarios.**

## Taxonomy — where each artifact lives

| Folder | Holds | Produced at step |
|---|---|---|
| `Business/BRD` | Business Requirements Document — the "why", users, goals, scope | Requirements |
| `Business/PDR` | Product Definition Requirements — the baseline feature list | Requirements |
| `Business/NFR` | Non-Functional Requirements — performance, simplicity, data, constraints | Requirements |
| `FunctionalRequirement/Usecase` | Use cases — actor, preconditions, main/alternate flows, postconditions | Requirements |
| `FunctionalRequirement/Feature` | Living feature descriptions — behaviour of a shipped feature | Feature description |
| `Architectural/Design` | Design specs — problem, data model, API/UI surface, edge cases | Design |
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

## Two tiers of docs

- **Tactical, point-in-time** artifacts (`Implementation/Plans`, dated design/analysis notes) capture a decision or a piece of work *at a moment*. They are not rewritten as the product evolves.
- **Living, current-state** artifacts (`FunctionalRequirement/Feature`, `Architectural/ADR`, `Architectural/Design`) describe *how things are now* and are kept up to date.

## Conventions

- **No blank templates.** To start a new artifact, **copy the closest existing filled document** and adapt it. The shipped baseline docs are your patterns.
- **Revision History for evolving docs.** Living docs carry a short revision table at the top:

  | Date | Change | Rationale / source |
  |---|---|---|

  and mark inline updates with a `[Revised YYYY-MM-DD]` note rather than silently editing.
- **One decision per ADR.** New records are numbered sequentially (`NNNN-short-title.md`) and listed in `Architectural/ADR/index.md`.
- **Commit convention:** `type(scope): reason #<issue>` (a GitHub issue number or work-item key).

## Adding a new feature

When you extend this app with a new feature, you **add new files** for that increment into these same folders (a use case, a design + ADR, a plan, a feature description, test cases/scenarios). You do **not** rewrite the baseline docs — you add alongside them.
