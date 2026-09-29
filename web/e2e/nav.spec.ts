import { expect, test } from '@playwright/test';

/**
 * Sidebar navigation is role-gated: the "Acting as" user's role decides which
 * menu items exist, and switching to a role that cannot see the current page
 * falls back to that role's first page (and stays there when switching back).
 * Role/text based so it is robust to styling changes.
 */
test('sidebar shows only the acting role pages and navigates between them', async ({ page }) => {
  await page.goto('/');

  // Default user is a member — Timetable only, no Admin or Trainer item.
  await expect(page.locator('tbody tr').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Admin' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Trainer' })).toHaveCount(0);

  // Act as the admin — all three items appear and Admin opens Manage classes.
  await page.getByLabel('acting as').selectOption('a1');
  await expect(page.getByRole('button', { name: 'Trainer' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Manage classes' })).toBeVisible();

  // Act as a trainer while on Admin — Admin disappears and the view falls back
  // to the Timetable rather than leaving a page the role may not see.
  await page.getByLabel('acting as').selectOption('t-morgan');
  await expect(page.getByRole('button', { name: 'Admin' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Trainer' })).toHaveCount(1);
  await expect(page.locator('tbody tr').first()).toBeVisible();

  // Back to the admin — the fallback stuck: still on the Timetable, not a
  // silently reopened Admin page.
  await page.getByLabel('acting as').selectOption('a1');
  await expect(page.getByRole('button', { name: 'Timetable' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('heading', { name: 'Manage classes' })).toHaveCount(0);
});
