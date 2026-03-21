import { test, expect } from '@playwright/test';

test.describe('Admin stránka', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/');
  });

  test('admin page loads', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('Administrace');
  });

  test('login gate is shown for unauthenticated users', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('Administrace');
    await expect(page.getByText('Prihlaste se')).toBeVisible();
  });

  test('has no navigation link from main page', async ({ page }) => {
    await page.goto('/');
    const adminLinks = page.locator('a[href*="admin"]');
    await expect(adminLinks).toHaveCount(0);
  });

  test('local auth fallback works', async ({ page }) => {
    const loginBtn = page.locator('button').filter({ hasText: 'Prihlasit pres Google' });
    await loginBtn.click();

    // Tab buttons are in the border-b container
    const tabBar = page.locator('.border-b.border-brew-800\\/30');
    await expect(tabBar.locator('button').filter({ hasText: 'Fotografie' })).toBeVisible({ timeout: 5000 });
    await expect(tabBar.locator('button').filter({ hasText: 'Akce' })).toBeVisible();
    await expect(tabBar.locator('button').filter({ hasText: 'Jidelni listek' })).toBeVisible();
    await expect(tabBar.locator('button').filter({ hasText: 'Nastaveni' })).toBeVisible();
  });

  test('tabs switch correctly after login', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Prihlasit pres Google' }).click();
    const tabBar = page.locator('.border-b.border-brew-800\\/30');
    await expect(tabBar.locator('button').filter({ hasText: 'Fotografie' })).toBeVisible({ timeout: 5000 });

    await tabBar.locator('button').filter({ hasText: 'Akce' }).click();
    await expect(page.getByText('Pridat akci')).toBeVisible();

    await tabBar.locator('button').filter({ hasText: 'Jidelni listek' }).click();
    await expect(page.getByText('Pridat polozku')).toBeVisible();

    await tabBar.locator('button').filter({ hasText: 'Nastaveni' }).click();
    await expect(page.getByText('Firebase konfigurace')).toBeVisible();
  });
});
