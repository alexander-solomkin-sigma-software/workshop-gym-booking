import { expect, test } from '@playwright/test';

/**
 * Sidebar navigation: from the default Timetable view, clicking the sidebar
 * Admin item shows the "Manage classes" heading; clicking Timetable brings the
 * timetable table back. Role/text based so it is robust to styling changes.
 */
test('sidebar navigates between Timetable and Admin', async ({ page }) => {
  await page.goto('/');

  // Default view is the Timetable — its table is present.
  await expect(page.locator('tbody tr').first()).toBeVisible();

  // Navigate to Admin via the sidebar menu item.
  await page.getByRole('button', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Manage classes' })).toBeVisible();

  // Back to Timetable — the table returns.
  await page.getByRole('button', { name: 'Timetable' }).click();
  await expect(page.locator('tbody tr').first()).toBeVisible();
});
