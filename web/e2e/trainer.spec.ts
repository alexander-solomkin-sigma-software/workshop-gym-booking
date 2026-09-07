import { expect, test } from '@playwright/test';

/**
 * Trainer view smoke: open the Trainer view, act as a seeded trainer and see
 * their assigned sessions with rosters, then act as an unknown trainer and see
 * the "no sessions assigned" empty state. Read-only — no data is changed.
 */
test('trainer view lists assigned sessions and shows the empty state', async ({ page }) => {
  await page.goto('/');

  // Open the Trainer view from the sidebar.
  await page.getByRole('button', { name: 'Trainer' }).click();

  // Act as a seeded trainer.
  await page.getByLabel('trainer id').fill('t-morgan');

  // Their sessions are listed, with the pre-booked member on the roster.
  const firstRow = page.locator('tbody tr').first();
  await expect(firstRow).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Yoga Flow' }).first()).toBeVisible();
  await expect(page.locator('tbody')).toContainText('m1');

  // Act as an unknown trainer → the empty state, no table.
  await page.getByLabel('trainer id').fill('nobody');
  await expect(page.getByText('No sessions assigned.')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(0);
});
