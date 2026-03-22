import { test, expect } from '@playwright/test';

// Helper: login via local fallback and wait for admin content
async function loginAndWait(page) {
  await page.locator('button').filter({ hasText: 'Přihlásit se' }).first().click();
  // Wait for tab bar to appear (auth gate opens)
  await expect(page.getByRole('tab', { name: 'Akce' })).toBeVisible({ timeout: 5000 });
}

test.describe('Admin stránka', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/');
  });

  test('admin page loads with login gate', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('Administrace');
    await expect(page.getByText('Přihlaste se pro správu')).toBeVisible();
  });

  test('has Firebase config', async ({ page }) => {
    const hasFirebase = await page.evaluate(() => !!(window as any).FIREBASE_CONFIG);
    expect(hasFirebase).toBe(true);
  });

  test('login button is visible', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: 'Přihlásit se' }).first()).toBeVisible();
  });

  test('has no navigation link from main page', async ({ page }) => {
    await page.goto('/');
    const adminLinks = page.locator('a[href*="admin"]');
    await expect(adminLinks).toHaveCount(0);
  });

  test('local auth fallback works and shows all tabs', async ({ page }) => {
    await loginAndWait(page);

    await expect(page.getByRole('tab', { name: 'Akce' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Menu' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Fotografie' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Nastavení' })).toBeVisible();
  });

  test('dashboard stats are visible after login', async ({ page }) => {
    await loginAndWait(page);
    await expect(page.getByText('Položky menu')).toBeVisible();
  });

  test('events tab — create and delete event', async ({ page }) => {
    await loginAndWait(page);

    // Click "Přidat akci"
    await page.locator('button').filter({ hasText: 'Přidat akci' }).click();

    // Fill form
    await page.fill('#event-title', 'Test akce');
    await page.fill('#event-date', '2026-12-31');
    await page.fill('#event-time', '20:00');
    await page.fill('#event-desc', 'Testovací popis akce');

    // Save (use exact match to avoid "Uložit oznámení" collision)
    await page.getByRole('button', { name: 'Uložit', exact: true }).click();

    // Verify event appears
    await expect(page.getByText('Test akce')).toBeVisible();
    await expect(page.getByText('2026-12-31')).toBeVisible();

    // Delete the event
    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[aria-label="Smazat akci"]').first().click();
  });

  test('food tab — shows category filters and items', async ({ page }) => {
    await loginAndWait(page);

    // Switch to food tab
    await page.getByRole('tab', { name: 'Menu' }).click();

    // Category filters visible
    await expect(page.locator('button').filter({ hasText: /^Studené$/ })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /^Teplé$/ })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /^Nápoje$/ })).toBeVisible();

    // Add item button
    await expect(page.locator('button').filter({ hasText: 'Přidat položku' })).toBeVisible();
  });

  test('food tab — create food item', async ({ page }) => {
    await loginAndWait(page);
    await page.getByRole('tab', { name: 'Menu' }).click();

    await page.locator('button').filter({ hasText: 'Přidat položku' }).click();
    await page.fill('#food-name', 'Testovací jídlo');
    await page.fill('#food-price', '99');
    await page.fill('#food-weight', '200 g');
    await page.fill('#food-desc', 'Popis testovacího jídla');
    await page.getByRole('button', { name: 'Uložit', exact: true }).click();

    await expect(page.getByText('Testovací jídlo')).toBeVisible();
  });

  test('settings tab — has all sections', async ({ page }) => {
    await loginAndWait(page);
    await page.getByRole('tab', { name: 'Nastavení' }).click();

    await expect(page.getByText('Oznámení na webu')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Google Sheets' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kiosk režim' })).toBeVisible();
    await expect(page.getByText('Export dat')).toBeVisible();
  });

  test('settings tab — announcement save shows toast', async ({ page }) => {
    await loginAndWait(page);
    await page.getByRole('tab', { name: 'Nastavení' }).click();

    await page.fill('input[placeholder*="Dnes hraje"]', 'Testovací oznámení');
    await page.locator('button').filter({ hasText: 'Uložit oznámení' }).click();

    await expect(page.getByText('Oznámení uloženo')).toBeVisible({ timeout: 3000 });
  });

  test('photos tab — upload button and filters exist', async ({ page }) => {
    await loginAndWait(page);
    await page.getByRole('tab', { name: 'Fotografie' }).click();

    await expect(page.getByText('Nahrát fotky')).toBeVisible();
    // Photo category filters (use panel scope to avoid collision with food filters)
    const photosPanel = page.locator('#admin-panel-photos');
    await expect(photosPanel.locator('button').filter({ hasText: /^Vše$/ })).toBeVisible();
    await expect(photosPanel.locator('button').filter({ hasText: /^Interiér$/ })).toBeVisible();
  });

  test('sign out returns to login gate', async ({ page }) => {
    await loginAndWait(page);
    await page.locator('button').filter({ hasText: 'Odhlásit' }).click();

    await expect(page.getByText('Přihlaste se pro správu')).toBeVisible();
  });
});
