import { test, expect } from '@playwright/test';

test.describe('Kiosk Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?kiosk=1');
    // Wait for Alpine.js to initialize and create kiosk UI
    await page.waitForSelector('#kiosk-container', { state: 'attached', timeout: 30000 });
  });

  test('kiosk container is visible', async ({ page }) => {
    await expect(page.locator('#kiosk-container')).toBeVisible();
  });

  test('kiosk has title', async ({ page }) => {
    await expect(page.locator('.kiosk-title')).toContainText('Pivnice U Tygra');
  });

  test('kiosk has live indicator', async ({ page }) => {
    await expect(page.locator('.kiosk-live')).toBeVisible();
  });

  test('kiosk has clock', async ({ page }) => {
    const clock = page.locator('#kiosk-clock');
    await expect(clock).toBeVisible();
    const text = await clock.textContent();
    expect(text).toMatch(/^\d{1,2}:\d{2}$/);
  });

  test('kiosk has staleness indicator', async ({ page }) => {
    await expect(page.locator('#kiosk-staleness')).toBeVisible();
  });

  test('main page sections are hidden in kiosk mode', async ({ page }) => {
    // Nav, hero, sections, footer should all be hidden
    await expect(page.locator('#home')).toBeHidden();
    await expect(page.locator('#na-cepu')).toBeHidden();
  });

  test('kiosk body has kiosk-mode class', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass(/kiosk-mode/);
  });
});
