import { test, expect } from '@playwright/test';

test.describe('Privacy Policy stránka', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ochrana-udaju/');
  });

  test('page loads with correct heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ochrany osobnich udaju');
  });

  test('contains company info', async ({ page }) => {
    await expect(page.locator('main')).toContainText('KONOVO s.r.o.');
    await expect(page.locator('main')).toContainText('17846927');
  });

  test('contains GDPR sections', async ({ page }) => {
    // Check key sections exist
    await expect(page.locator('main')).toContainText('Spravce osobnich udaju');
    await expect(page.locator('main')).toContainText('Ucely zpracovani');
    await expect(page.locator('main')).toContainText('Vase prava');
    await expect(page.locator('main')).toContainText('Kontakt');
  });

  test('back link exists', async ({ page }) => {
    const backLink = page.locator('a').filter({ hasText: 'Zpet' });
    await expect(backLink).toBeVisible();
  });

  test('mentions Google Analytics', async ({ page }) => {
    await expect(page.locator('main')).toContainText('Google Analytics');
  });
});
