# ADR-0002: UI styling via Tailwind + daisyUI (business theme)

- **Status**: Accepted
- **Date**: 2026-08-26
- **Decision makers**: Course maintainer

## Context

The baseline web app styled everything with hand-written CSS in a single
`web/src/styles.css`. Every visual change was custom CSS to maintain, and the
look was ad-hoc. The [UI-styling requirement](../Design/ui-styling.md) (NFR) asks
for a consistent, professional look with **minimal custom CSS**, so the app reads
as a real product and students aren't distracted by styling plumbing when they
extend it.

## Decision

Use **Tailwind CSS** with the **daisyUI** plugin and ship the built-in
**`business`** (dark) theme.

- `styles.css` is reduced to the three Tailwind directives; components use daisyUI
  semantic classes (`navbar`, `tabs`, `table`, `card`, `btn`, `badge`, `alert`,
  `input`, `join`) plus a few Tailwind utilities for layout.
- The theme is selected in `web/tailwind.config.js` (`daisyui.themes: ['business']`)
  and applied via `data-theme="business"` on `<html>`. Switching themes later is a
  one-word config change.
- Tailwind/daisyUI are dev-time only and compile to one CSS file via the existing
  Vite build — no runtime dependency added.

## Consequences

- Almost no bespoke CSS to maintain; the look is consistent and switchable.
- A small dev-dependency and build surface added (tailwindcss, postcss,
  autoprefixer, daisyui).
- Students extend the UI with the same class vocabulary; visual/brand design and
  deep accessibility work remain out of scope.

## Alternatives considered

- **shadcn/ui** (Radix + Tailwind, copy-in components): higher polish and
  accessibility, but you own each component and it means more setup and custom
  code — the opposite of "minimize custom CSS". A student could adopt it as an
  extra-feature exercise.
- **Keep hand-written CSS**: rejected — it was the problem this ADR addresses.
