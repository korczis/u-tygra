import { test, expect } from '@playwright/test';

test.describe('PWA', () => {
  test('webmanifest is accessible', async ({ page }) => {
    const response = await page.goto('/site.webmanifest');
    expect(response?.status()).toBe(200);
    const content = await response?.json();
    expect(content.name).toBe('Pivnice U Tygra');
    expect(content.lang).toBe('cs');
    expect(content.display).toBe('standalone');
  });

  test('service worker script is accessible', async ({ page }) => {
    const response = await page.goto('/js/sw.js');
    expect(response?.status()).toBe(200);
  });

  test('offline page is accessible', async ({ page }) => {
    const response = await page.goto('/offline.html');
    expect(response?.status()).toBe(200);
  });

  test('favicon-96x96 exists for PWA shortcuts', async ({ page }) => {
    const response = await page.goto('/img/favicon-96x96.png');
    expect(response?.status()).toBe(200);
  });

  test('offline placeholder SVG exists', async ({ page }) => {
    const response = await page.goto('/img/offline-placeholder.svg');
    expect(response?.status()).toBe(200);
  });

  test('manifest link is in HTML', async ({ page }) => {
    await page.goto('/');
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
  });
});
