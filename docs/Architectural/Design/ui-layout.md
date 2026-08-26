# UI Layout — sidebar navigation + clearer field labels

**Date:** 2026-08-26 (baseline) | **Last revised:** 2026-08-26

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-26 | Baseline layout design: left sidebar nav, distinct base surfaces, relabelled member field, labelled Manage-classes inputs | UX clarity pass on the shipped UI; builds on [ui-styling.md](ui-styling.md) / [ADR-0002](../ADR/0002-ui-styling-tailwind-daisyui.md) |
| 2026-08-26 | Implemented in the web app (`App.tsx`, `AdminPage.tsx`); nav e2e added. | This design realised as-specified |

## Problem

The app works but a few UI/UX choices make it harder to read than it should be.
This is a **presentation/clarity refinement only** — no business logic, no API,
no data-model change. The four issues:

1. **Navigation** is a pair of top-bar tabs (Timetable / Admin) crowded into the
   navbar next to the app title and the member field. It reads as a toolbar, not
   as primary navigation, and the active view is only weakly signalled.
2. **Contrast** — in the shipped `business` (dark) theme, the current layout puts
   most surfaces on `bg-base-100` / `bg-base-200`, which sit close to the
   inactive control colour. Panels and controls are hard to tell apart at a glance.
3. **Member field** is bare: a `Member [input]` with no explanation of what it is
   or why it exists. New users don't know it is a demo stand-in for sign-in.
4. **Manage-classes inputs** carry only `aria-label`s and placeholders — there is
   no *visible* label, so once a field has a value (or a `date`/`time` control
   shows its own format) it is unclear what each input means.

All four are fixed with **daisyUI surfaces, tokens, and component classes** — no
hand-written colour CSS — so the change stays inside the styling decision recorded
in [ADR-0002](../ADR/0002-ui-styling-tailwind-daisyui.md).

## 1. Left sidebar navigation

Replace the top-bar tabs with a **left sidebar menu** using daisyUI's `menu`
component; the app becomes a two-column shell (sidebar + content).

- **Structure** — a full-height left column holds, top to bottom:
  - the **app title** ("Gym Class Booking") at the top of the sidebar;
  - a vertical `menu` with one item per view: **Timetable** and **Admin**;
  - the **member field** (see §3) below the menu, clearly separated.
- **Content area** — the selected view (`TimetablePage` / `AdminPage`) fills the
  area to the right of the sidebar and is what changes when a menu item is chosen.
- **Active state** — the selected menu item is clearly highlighted using daisyUI's
  built-in active styling (`menu-active` / the `menu` item's active class), not a
  hand-rolled colour. Exactly one item is active at a time, mirroring the current
  `tab === view` selection. Hover gives the standard `menu` hover affordance.
- **Behaviour is unchanged** — this is still a single-page app with one piece of
  view state (`timetable | admin`); the sidebar just swaps how that state is set
  and displayed. No router is introduced.

```
┌──────────────┬─────────────────────────────┐
│ Gym Class    │                             │
│ Booking      │   <selected view fills       │
│              │    the content area>         │
│ ▸ Timetable  │                             │
│   Admin      │                             │
│              │                             │
│ Acting as    │                             │
│ [ member id ]│                             │
└──────────────┴─────────────────────────────┘
   base-200/300         base-100
```

## 2. Visual contrast via distinct base surfaces

Fix the low contrast by giving the two regions **different daisyUI base surfaces**
so they separate naturally, and by using the components' own active/hover states —
**not** by introducing custom colours (ADR-0002: minimize custom CSS).

- **Sidebar** sits on a deeper surface — `bg-base-200` (or `bg-base-300`) — so the
  navigation column reads as distinct chrome.
- **Content area** sits on `bg-base-100`, the lighter base surface, so the working
  area stands forward of the sidebar.
- **Cards / tables** inside the content keep their daisyUI surfaces (`card`,
  `table`, `rounded-box border border-base-300`), which now contrast against the
  `base-100` content ground.
- **Active/hover** states come from the components themselves (`menu-active`,
  `btn`, `input input-bordered`, focus rings), never from bespoke CSS.

The whole fix is **surface/token selection**, expressible in class names against
the existing theme. `styles.css` stays at the three Tailwind directives; no new
colour rules are added — consistent with ADR-0002.

## 3. Relabelled member field (demo sign-in stand-in)

Replace the bare `Member [input]` with a **properly labelled control plus helper
text** that explains what it is, using daisyUI's `label` / `form-control` (or
`fieldset` + `label`) pattern:

- **Visible label** — e.g. **"Acting as"** or **"Member ID"**, rendered as a
  visible `label` so a sighted user sees what the field is.
- **Helper text** — a short caption (daisyUI `label-text-alt`, or small muted
  text) stating it is a **demo stand-in for sign-in — there is no real
  authentication**; changing it lets you act as a different member.
- **Accessible-name constraint (hard requirement)** — the input **must keep the
  accessible name `member id`**. An existing e2e test resolves the field with
  `getByLabel('member id')`, so the visible label's association (or an explicit
  `aria-label="member id"`) must still expose `member id` as the accessible name.
  A visible "Acting as" caption is fine as long as the input's accessible name
  remains exactly `member id`.

## 4. Labelled Manage-classes inputs

Every input on the Admin ("Manage classes") page gets a **visible label** in
addition to its existing `aria-label`, so each field's purpose is obvious:

- **Create-class form** — "Class name", "Description".
- **Schedule form** — "Date", "Start time", "Finish time", "Capacity".
- **Capacity editor** (inline per session) — keeps its `aria-label`; a visible
  "Capacity" label or a clear adjacent caption makes the inline control legible.

Constraints:

- **Keep the existing `aria-label`s** (e.g. `class name`, `start time for class N`,
  `capacity for new session of class N`, `set capacity for session N`). Any
  API/test that resolves inputs by those names keeps working. A visible label may
  wrap the input or associate via `htmlFor`/`id`; where both a visible label and
  an `aria-label` are present, the `aria-label` continues to define the accessible
  name, so existing selectors are unaffected.
- Use daisyUI's `label` / `form-control` (or `fieldset legend` + `label`) — no
  custom CSS.

## Testing

Covered by manual scenario
[TF-05 — navigation and labels](../../Testing/TestScenarios/TF-05-navigation-and-labels.md)
and rows TC-16–TC-18 in
[booking-checklist.md](../../Testing/TestCases/booking-checklist.md). The existing
`getByLabel('member id')` e2e must stay green — the member field's accessible name
is unchanged.

## No ADR warranted

This is a **UX/layout refinement within the existing styling decision** — daisyUI
surfaces, tokens, and component classes only. It introduces no new technology,
no new architectural trade-off, and no deviation from
[ADR-0002](../ADR/0002-ui-styling-tailwind-daisyui.md) (it explicitly honours its
"minimize custom CSS" constraint). Accordingly, **no new ADR is created**; this
design note records the layout choices.

## Out of scope

Theme change, a light/dark toggle, routing, responsive/mobile drawer behaviour,
and any business-logic or API change. Behaviour and data are untouched.
