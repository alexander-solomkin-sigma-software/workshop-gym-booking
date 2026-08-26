# UI Styling — Tailwind + out-of-the-box theme

**Status:** Accepted — theme selected (**business**, dark). Decision recorded in [ADR-0002](../ADR/0002-ui-styling-tailwind-daisyui.md).

## Problem

The baseline web app currently styles everything with hand-written CSS in a single
`web/src/styles.css`. That is fine functionally but means every visual tweak is custom
CSS to maintain, and the look is ad-hoc. We want a **consistent, professional look with
minimal custom CSS**, so the app reads as a real product and students aren't distracted
by styling plumbing when they extend it.

## Requirement

- **Minimize custom CSS.** Styling comes from an **out-of-the-box theme** and utility/
  component classes; hand-written CSS is allowed only for genuinely custom needs that the
  theme/utilities cannot express.
- Use **Tailwind CSS** with **daisyUI** (a Tailwind plugin) for prebuilt, named themes and
  semantic component classes (`btn`, `card`, `table`, `navbar`, `badge`, …). A theme is a
  one-line config plus a `data-theme` attribute on `<html>` — no bespoke color CSS.
- Keep it dependency-light and buildless-friendly: Tailwind + daisyUI are dev-time only and
  compile to a single CSS file via the existing Vite build.

## Approach

1. Add `tailwindcss`, `postcss`, `autoprefixer`, `daisyui` as **web** dev dependencies.
2. Add `tailwind.config.js` (content globs + `daisyui` plugin + the selected theme) and a
   `postcss.config.js`; replace `styles.css` contents with the three Tailwind directives.
3. Restyle the existing pages (`App`, `TimetablePage`, `AdminPage`) using daisyUI component
   classes + Tailwind utilities; delete the custom class rules. Behaviour is unchanged.
4. Set the chosen theme via `data-theme` on the root element.

## Theme options (choose one)

All are daisyUI built-in themes — switching later is a one-word config change, so this is
low-risk. Descriptions are the vibe each gives the Gym Booking app:

| Theme | Look | Fit for a gym-booking app |
|---|---|---|
| **corporate** | Light, clean, muted blue/neutral, professional | Safe, business-like SaaS feel — reads as a real product |
| **emerald** | Light, fresh green accent | Fitness/wellness energy without being loud |
| **cupcake** | Soft pastel (cream/teal/pink), friendly | Approachable, consumer/boutique-studio feel |
| **business** | Dark, serious, high-contrast | Sleek "dark mode" app; good if you prefer dark |

_(daisyUI also ships light/dark/synthwave/etc.; these four are the shortlist. A dark+light
pair can be offered later via a toggle, but the baseline ships one.)_

## Alternative considered

**shadcn/ui** (Radix + Tailwind, copy-in components): higher polish and accessibility, but
you own each component and it involves more setup and custom code — the opposite of
"minimize custom CSS." Rejected for the baseline; daisyUI gives the out-of-the-box-theme
experience the requirement asks for. (A student could still adopt shadcn as an extra-feature
exercise.)

## Chosen theme

**business** (daisyUI dark theme) — selected 2026-08-26. Dark, high-contrast, sleek; set via
`data-theme="business"` on `<html>` and `daisyui.themes: ['business']` in `web/tailwind.config.js`.
Decision: [ADR-0002](../ADR/0002-ui-styling-tailwind-daisyui.md). Implemented: `styles.css` reduced
to the Tailwind directives; `App`, `TimetablePage`, `AdminPage` restyled with daisyUI classes.

**[Revised 2026-08-26]** A UX/layout clarity pass (left sidebar navigation, distinct base
surfaces for contrast, relabelled member field, and visibly labelled Manage-classes inputs)
is captured in [ui-layout.md](ui-layout.md). It stays within this styling decision — daisyUI
surfaces/tokens/component classes only, no custom colour CSS — so no new ADR is warranted.
