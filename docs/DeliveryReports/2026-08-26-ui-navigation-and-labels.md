# Delivery Status — 2026-08-26

**Milestone:** UI/UX polish — left sidebar navigation, contrast via distinct base surfaces, self-explaining member field, and labelled Manage-classes inputs (TF-05 / TC-16..18) · **Report style:** git-derived (done / verification / traceability)

## Summary

The web app's navigation moved from a pair of top-bar tabs to a **left daisyUI
`menu` sidebar** (app title on top, Timetable/Admin items, member field below),
with the **active item highlighted** via `menu-active`. The two regions now
**contrast by base surface** — sidebar on `base-200`, content on `base-100` —
using component classes only, honouring ADR-0002 (no custom colour CSS). The
member field gained a **visible "Acting as" label plus helper text** noting it is
a demo stand-in for sign-in, while keeping its accessible name exactly
`member id`. Every **Manage-classes input** (create-class and schedule forms plus
the inline capacity editor) gained a **visible label**, with the prior
`aria-label`s retained. The increment shipped as a docs commit followed by a
code+tests commit, and was independently re-verified here: `npm run build` and
`npm test` are green under Node 22, including the new `nav.spec`.

## Done

| Change | Area | Commit |
|---|---|---|
| Capture the UX/layout clarity pass: `ui-layout.md` (four improvements), `ui-styling.md` link, TF-05 scenario, TC-16..18 checklist rows (docs only, within ADR-0002 — no new ADR) | docs | `docs(ui): sidebar navigation + clearer field labels (UX) #` (`367eaee`) |
| Two-column shell with daisyUI `menu` sidebar + `menu-active` highlight; sidebar `base-200` / content `base-100`; "Acting as" member field with visible label + helper text (accessible name still `member id`); visible labels on all Admin inputs with existing `aria-label`s retained; new `nav.spec.ts` e2e | web | `feat(web): sidebar nav, base surfaces, labelled fields #2` (`314d258`) |

## Verification

Run independently under the app's target runtime (bash PATH pinned to the Node 22 install). **Do NOT run `npm install`** — it was not run.

| Check | Result |
|---|---|
| Node version | **v22.3.0** |
| `npm run build` | OK — api `tsc` clean; web `tsc --noEmit` + `vite build` (34 modules, built in 2.70s) |
| `npm test` (api, Vitest) | **28 passed** (3 files: booking-service 6, class-service 15, app 7) |
| `npm test` (web, Playwright) | **2 passed** — `nav.spec.ts` (sidebar Timetable↔Admin switching) + `smoke.spec.ts` (browse, book, cancel) |

A scan of tracked files for prohibited external/product references found no
genuine occurrences; the only case-insensitive regex hit was a coincidental
substring inside a base64 `integrity` hash in `package-lock.json` — not a real
reference.

## Requirement traceability

TF-05 (and TC-16..18) mixes behaviour that is **automated** with visual/appearance
points that remain **manual**. The table below is honest about which is which.

| Acceptance point (TF-05 / TC) | Coverage | Covered by |
|---|---|---|
| Sidebar navigation switches views: Timetable → Admin → Timetable (TC-16) | **Automated** | `nav.spec.ts` › "sidebar navigates between Timetable and Admin" (clicks the sidebar Admin/Timetable items; asserts the Manage-classes heading and the timetable table appear) |
| Member field's accessible name stays `member id` (TC-17) | **Automated** | `smoke.spec.ts` › "browse, book, then cancel a class" resolves the input via `getByLabel('member id')` — passing proves the accessible name is intact |
| Active-item highlight *appearance* (exactly one item visibly highlighted) (TC-16) | **Manual / visual** | TF-05 steps 2–5 — inspected visually; `nav.spec` proves the switch, not the highlight styling |
| Contrast between sidebar and content surfaces, no custom colours (TC-17) | **Manual / visual** | TF-05 step 6 — compare `base-200` sidebar vs `base-100` content in the dark theme |
| Member field visible label + helper text present (TC-17) | **Manual / visual** | TF-05 step 7 — read the visible "Acting as" label and the demo-sign-in helper caption |
| Every Manage-classes input shows a visible label (Class name, Description, Date, Start time, Finish time, Capacity); `aria-label`s retained (TC-18) | **Manual / visual** | TF-05 steps 8–9 — inspect the create-class and schedule forms |

Behaviour is unchanged — the api Vitest suite (28 passing, incl. booking, class,
and app-level scheduling tests) and the Playwright smoke flow confirm booking,
cancelling, class creation, and scheduling still work; this increment changed
presentation only.

## Status

**Done / Verified** — both commits landed, build and all tests green under
Node 22 (api 28, web 2 incl. the new `nav.spec`). The two behavioural acceptance
points (sidebar view switching and the `member id` accessible name) are covered
by passing automated e2e; the appearance points (active-highlight look, surface
contrast, visible labels, member helper text) are **manual-verified** per TF-05,
as intended for a visual/layout change.

## Notes / risks

- Visual acceptance is inherently manual: the automated tests are role/text-based
  and deliberately robust to styling, so they prove navigation and the accessible
  name but not the *look* of the highlight or the surface contrast.
- The change is styling-only within ADR-0002 (daisyUI surfaces/tokens and
  component classes, no hand-written colour CSS); `styles.css` remains at the
  three Tailwind directives.
- No router was introduced — the sidebar still drives a single `timetable | admin`
  view-state value; behaviour and data are untouched.
