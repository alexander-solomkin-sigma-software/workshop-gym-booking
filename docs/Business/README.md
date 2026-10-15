# Business layer — lives in Confluence

The **Business layer** (BRD, PDR, NFR) of this app is kept in **Confluence**, which is its source of truth. It is **not** stored in this repo. Everything downstream (use cases, design, ADRs, plans, feature descriptions, tests) stays here in `docs/` and cites the Business pages by name, for example "PDR F4" or "per NFR".

| Doc | Holds | Confluence page |
|---|---|---|
| **BRD** — Business Requirements | The "why": product, users, goals, scope, success criteria | [BRD — Gym Class Booking](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1736705) |
| **PDR** — Product Definition Requirements | Baseline feature list (F1–F4), core entities, rules | [PDR — Gym Class Booking](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1769473) |
| **NFR** — Non-Functional Requirements | Runtime, persistence, setup, simplicity, security, UI styling | [NFR — Gym Class Booking](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1540098) |

Parent page: [Business Requirements — Gym Class Booking](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1703937), under the [workshop space home](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1507329) on the [`vs5-ssw` Confluence site](https://vs5-ssw.atlassian.net/wiki/home).

## How to read them

- **From Claude Code:** use the Atlassian MCP connector. Ask for the page by title or id, for example *"Read the Confluence page 1769473 (PDR — Gym Class Booking)"*.
- **In the browser:** open the links above. You need read access to the Confluence space; your facilitator arranges it.
- **Offline fallback:** your facilitator can hand out a PDF export of the three pages.

## Changing them

The pages are living docs with a Revision History table, the same convention as [`docs/README.md`](../README.md#revision-history-for-evolving-docs). A new feature that changes business scope gets a new Revision History row and an inline `[Revised YYYY-MM-DD]` marker on the page, not a rewrite.
