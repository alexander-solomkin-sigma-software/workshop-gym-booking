# TF-01 — Book and cancel a class

**Feature:** [booking.md](../../FunctionalRequirement/Feature/booking.md) · Covers UC-01 (F2/F3)

## Goal

Confirm a member can browse the timetable, book a free session, and cancel to
free the place again — the end-to-end happy path exercised by the Playwright smoke.

## Preconditions

- App running via `npm run dev` with the seeded database.
- Acting as member `zoe` (no seeded bookings, so the first row starts free).

## Steps

1. Open the web app; the **Timetable** view is shown (selected in the left sidebar).
2. Set the **member id** field (labelled "Acting as", in the sidebar) to `zoe`.
3. In the first session row, click **Book**.
4. Observe the row's action and spot count.
5. Click **Cancel** in the same row.

## Expect

- After step 3: the row shows **Cancel**; `spots left` has decreased by one; a
  booking exists server-side (`GET /api/timetable?memberId=zoe` shows a non-null
  `myBookingId` for that session).
- After step 5: the row shows **Book** again; `spots left` is restored; the
  booking no longer exists.

---

# TF-02 — Full session refuses booking

## Goal

Confirm a full session cannot be booked, from the UI and the API.

## Preconditions

- Seeded app; the small Spin session is pre-filled to capacity (0 / 3, **Full**).

## Steps

1. On the Timetable, locate the Spin session marked **Full**.
2. Confirm its **Book** button is disabled.
3. Call `POST /api/bookings { sessionId, memberId: "newcomer" }` for that session.

## Expect

- The UI never offers a live Book action for the full session.
- The API responds `409` with an error message; no booking is created.
