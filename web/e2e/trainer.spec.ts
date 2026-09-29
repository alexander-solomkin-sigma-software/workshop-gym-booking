import { expect, test } from '@playwright/test';

/**
 * Trainer view smoke: act as a seeded trainer and see their assigned sessions
 * with rosters, then act as the admin and inspect another trainer's roster via
 * the "Viewing trainer" picker. Read-only — no data is changed.
 */
test('trainer view lists assigned sessions and rosters', async ({ page }) => {
  await page.goto('/');

  // Act as a seeded trainer, then open the Trainer view from the sidebar.
  await page.getByLabel('acting as').selectOption('t-morgan');
  await page.getByRole('button', { name: 'Trainer' }).click();

  // Their sessions are listed, with the pre-booked member on the roster.
  const firstRow = page.locator('tbody tr').first();
  await expect(firstRow).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Yoga Flow' }).first()).toBeVisible();
  await expect(page.locator('tbody')).toContainText('m1');

  // An admin may see the Trainer view too, but is not a trainer: they pick
  // whose roster to read. The view stays on Trainer across the switch.
  await page.getByLabel('acting as').selectOption('a1');
  await page.getByLabel('viewing trainer').selectOption('t-lee');

  // Lee's full Spin session, with its three booked members.
  await expect(page.getByRole('cell', { name: 'Spin' }).first()).toBeVisible();
  await expect(page.locator('tbody')).toContainText('other-1');
});
