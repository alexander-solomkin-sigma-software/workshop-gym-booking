import { expect, test } from '@playwright/test';

/**
 * Happy-path smoke: a member browses the timetable, books a free class in a
 * specific row, sees the booking (Book -> Cancel), then cancels it and sees
 * the place open again (Cancel -> Book).
 * Runs as member `m2` (not the pre-seeded `m1`). `m2` is also the demo user for
 * manual testing, and a reused dev server is not reseeded, so the test does not
 * assume a clean DB: it picks the first row that still offers `m2` a Book.
 */
test('browse, book, then cancel a class', async ({ page }) => {
  await page.goto('/');
  // Let the default member's timetable load before switching.
  await expect(page.locator('tbody tr').first()).toBeVisible();

  // Act as a demo member with no seeded bookings, and wait for their timetable.
  const m2Timetable = page.waitForResponse(
    (r) => r.url().includes('/api/timetable') && r.url().includes('memberId=m2') && r.ok(),
  );
  await page.getByLabel('acting as').selectOption('m2');
  await expect(page.getByLabel('acting as')).toHaveValue('m2');
  await m2Timetable;

  // Pin the first row offering an enabled Book, by session id, so the locator
  // keeps pointing at the same row after its button changes.
  const bookable = page
    .locator('tbody tr')
    .filter({ has: page.getByRole('button', { name: 'Book', disabled: false }) })
    .first();
  const sessionId = await bookable.getAttribute('data-session');
  expect(sessionId).not.toBeNull();
  const row = page.locator(`tbody tr[data-session="${sessionId}"]`);

  // Browse -> the row offers a Book action.
  await row.getByRole('button', { name: 'Book' }).click();

  // Book -> the same row now offers Cancel (booking recorded server-side).
  const cancelButton = row.getByRole('button', { name: 'Cancel' });
  await expect(cancelButton).toBeVisible();
  await cancelButton.click();

  // Cancel -> the place is freed and the row offers Book again.
  await expect(row.getByRole('button', { name: 'Book' })).toBeVisible();
});
