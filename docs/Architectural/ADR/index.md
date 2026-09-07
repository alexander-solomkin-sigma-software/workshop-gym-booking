# Architecture Decision Records

This folder contains Architecture Decision Records (ADRs) for the Gym Class
Booking app. Each ADR captures one significant decision, its context, and its
consequences.

## Format

Each ADR follows the naming convention `NNNN-<short-title>.md` (e.g.
`0001-sqlite-local-db-file.md`) and uses the template below:

```
# ADR-NNNN: <Title>

- **Status**: Proposed | Accepted | Deprecated | Superseded by ADR-NNNN
- **Date**: YYYY-MM-DD
- **Decision makers**: <names/roles>

## Context

<What is the issue? Why do we need to make this decision?>

## Decision

<What did we decide?>

## Consequences

<What are the trade-offs, risks, and follow-up actions?>
```

When you write a design, check whether it holds a decision worth an ADR; if so,
add it here and append a row to the index.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-sqlite-local-db-file.md) | SQLite as a seeded local DB file | Accepted | 2026-08-21 |
| [0002](0002-ui-styling-tailwind-daisyui.md) | UI styling via Tailwind + daisyUI (business theme) | Accepted | 2026-08-26 |
| [0003](0003-trainer-role-minimal-auth.md) | Trainer as an id with no real authentication | Accepted | 2026-08-26 |
