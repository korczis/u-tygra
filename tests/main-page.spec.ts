import { test, expect } from '@playwright/test';

test.describe('Hlavní stránka', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Alpine.js to initialize
    await page.waitForFunction(() => !!document.querySelector('[x-data]'));
  });

  test('has correct title and meta', async ({ page }) => {
    await expect(page).toHaveTitle(/Pivnice U Tygra/);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('cs');
  });

  test('navigation has all sections', async ({ page }) => {
    // Check all section IDs exist in the page
    for (const id of ['home', 'na-cepu', 'jidlo', 'salonek', 'galerie', 'kontakt']) {
      await expect(page.locator(`[href="#${id}"]`).first()).toBeAttached();
    }
  });

  test('hero section is visible', async ({ page }) => {
    const hero = page.locator('#home');
    await expect(hero).toBeVisible();
    await expect(page.locator('h1')).toContainText('Pivnice');
  });

  test('all sections exist', async ({ page }) => {
    for (const id of ['home', 'na-cepu', 'jidlo', 'salonek', 'galerie', 'kontakt']) {
      const section = page.locator(`#${id}`);
      await expect(section).toBeAttached();
    }
  });

  test('footer has privacy policy link', async ({ page }) => {
    const privacyLink = page.locator('footer a[href*="ochrana-udaju"]');
    await expect(privacyLink).toBeVisible();
  });

  test('footer has company info', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('KONOVO s.r.o.');
    await expect(footer).toContainText('17846927');
  });

  test('phone links are functional', async ({ page }) => {
    const barPhone = page.locator('a[href*="776"]').first();
    await expect(barPhone).toBeAttached();
  });

  test('Google Maps iframe is present', async ({ page }) => {
    const map = page.locator('iframe[src*="google.com/maps"]');
    await expect(map).toBeAttached();
  });
});

test.describe('Na čepu sekce', () => {
  test('beer section loads', async ({ page }) => {
    await page.goto('/#na-cepu');
    const section = page.locator('#na-cepu');
    await expect(section).toBeVisible();
  });

  test('beer styles section exists', async ({ page }) => {
    await page.goto('/#na-cepu');
    await expect(page.getByText('Pivní styly')).toBeVisible();
  });

  test('glossary section exists', async ({ page }) => {
    await page.goto('/#na-cepu');
    await expect(page.getByText('Glosář pivních pojmů')).toBeVisible();
  });

  test('glossary search input works', async ({ page }) => {
    await page.goto('/#na-cepu');
    const searchInput = page.locator('input[placeholder*="glosáři"]');
    await expect(searchInput).toBeVisible();
  });
});

test.describe('Jídlo sekce', () => {
  test('food section is visible', async ({ page }) => {
    await page.goto('/#jidlo');
    await expect(page.locator('#jidlo')).toBeVisible();
  });
});

test.describe('Galerie sekce', () => {
  test('gallery has images', async ({ page }) => {
    await page.goto('/#galerie');
    const images = page.locator('#galerie img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('gallery images have alt text', async ({ page }) => {
    await page.goto('/#galerie');
    const images = page.locator('#galerie img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});

test.describe('Kontakt sekce', () => {
  test('contact info is present', async ({ page }) => {
    await page.goto('/#kontakt');
    const section = page.locator('#kontakt');
    await expect(section).toContainText('Vrchlického sad');
  });

  test('opening hours are displayed', async ({ page }) => {
    await page.goto('/#kontakt');
    await expect(page.getByText('Otevírací doba')).toBeVisible();
  });
});
