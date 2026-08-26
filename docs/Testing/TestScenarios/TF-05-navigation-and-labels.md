# TF-05 — Sidebar navigation and clear field labels

**Feature:** [ui-layout.md](../../Architectural/Design/ui-layout.md) · UX/layout clarity
pass within [ui-styling.md](../../Architectural/Design/ui-styling.md) / [ADR-0002](../../Architectural/ADR/0002-ui-styling-tailwind-daisyui.md)

## Goal

Confirm the app is navigated from a **left sidebar** (not top-bar tabs), that the
**active view is clearly highlighted**, that the two regions visibly contrast
(sidebar vs content), that **every form field shows a visible label**, and that
the **member field explains itself** as a demo sign-in stand-in — all with no
change to booking/admin behaviour.

## Preconditions

- App running via `npm run dev` with the seeded database, in the `business` (dark) theme.
- Browser open on the app; the Timetable view is shown by default.

## Steps

1. Observe the app shell: a **left sidebar** holds the app title "Gym Class
   Booking" at the top, a menu with **Timetable** and **Admin**, and the member
   field below. The selected view fills the area to the right.
2. Note which sidebar item is highlighted and which view is shown.
3. Click **Admin** in the sidebar.
4. Observe the highlighted item and the content area.
5. Click **Timetable** in the sidebar.
6. Compare the sidebar surface against the content surface for contrast.
7. Inspect the **member field**: read its visible label and helper text; confirm
   an accessibility check (or `getByLabel('member id')`) still resolves the input.
8. Go to **Admin**. Inspect the **create-class** form and the **schedule** form.
9. Verify each input carries a visible label; check that existing `aria-label`s
   are still present (DOM inspection or a `getByLabel` by the old aria name).

## Expect

- **Navigation is a sidebar** — the app title sits at the top of the sidebar, the
  menu lists Timetable and Admin, and the chosen view renders in the content area
  to the right. There are no top-bar navigation tabs.
- **Active highlight** — after step 3 the **Admin** item is clearly highlighted and
  the Admin view is shown; after step 5 the **Timetable** item is highlighted and
  the Timetable view is shown. Exactly one item is active at a time.
- **Contrast** — the sidebar sits on a deeper base surface (`bg-base-200` /
  `bg-base-300`) and the content on `bg-base-100`; the two regions are clearly
  distinguishable, and cards/tables stand out from the content ground. No
  hand-written colours are used (surfaces/tokens only).
- **Member field explains itself** — it shows a visible label (e.g. "Acting as" /
  "Member ID") and helper text stating it is a **demo stand-in for sign-in, with
  no real authentication**. Its accessible name is still exactly `member id`, so
  `getByLabel('member id')` resolves it and the existing e2e stays green.
- **All Admin inputs are labelled** — the create-class form shows visible "Class
  name" and "Description" labels; the schedule form shows "Date", "Start time",
  "Finish time", and "Capacity". The prior `aria-label`s remain in place, so any
  test resolving by them keeps working.
- **Behaviour unchanged** — booking, cancelling, class creation, scheduling, and
  capacity edits work exactly as before; only presentation changed.
