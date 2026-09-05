import { expect, test } from '@playwright/test';

test('reduced-motion visitors get the complete static first frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-reveal]').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-reveal][data-motion-state]')).toHaveCount(0);
  await expect(page.locator('.hero-artwork')).toBeVisible();
  await expect(page.locator('.hero-artwork [data-motion-state]')).toHaveCount(0);
  await expect(page.locator('img[src=""], img:not([src])')).toHaveCount(0);
});

test('homepage remains readable when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#projects')).toBeVisible();
  await expect(page.locator('[data-reveal]').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.hero-artwork')).toBeVisible();

  await context.close();
});
