import { expect, test } from '@playwright/test';

/**
 * Happy-path smoke: a member browses the timetable, books a free class in a
 * specific row, sees the booking (Book -> Cancel), then cancels it and sees
 * the place open again (Cancel -> Book).
 * Runs as member `m2` (not the pre-seeded `m1`) so the first row starts free.
 */
test('browse, book, then cancel a class', async ({ page }) => {
  await page.goto('/');

  // Act as a demo member with no seeded bookings.
  await page.getByLabel('acting as').selectOption('m2');

  // Work within a single, stable row (ordered by start time, so it does not move).
  const firstRow = page.locator('tbody tr').first();
  await expect(firstRow).toBeVisible();

  // Browse -> the row offers a Book action.
  const bookButton = firstRow.getByRole('button', { name: 'Book' });
  await expect(bookButton).toBeVisible();
  await bookButton.click();

  // Book -> the same row now offers Cancel (booking recorded server-side).
  const cancelButton = firstRow.getByRole('button', { name: 'Cancel' });
  await expect(cancelButton).toBeVisible();
  await cancelButton.click();

  // Cancel -> the place is freed and the row offers Book again.
  await expect(firstRow.getByRole('button', { name: 'Book' })).toBeVisible();
});
