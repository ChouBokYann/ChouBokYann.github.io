import { expect, test } from '@playwright/test';

const projectBase = process.env.BASE_PATH === '/portfolio-site' ? '/portfolio-site' : '';

test('homepage shell navigation preserves the configured base', async ({ page }) => {
  await page.goto('./');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
    'href',
    `${projectBase}/`,
  );
  await expect(
    page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Projects', exact: true }),
  ).toHaveAttribute('href', `${projectBase}/#projects`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `http://localhost:4321${projectBase}/`,
  );
});

test('skip link moves keyboard focus to main content', async ({ page }) => {
  await page.goto('./');

  const skipLink = page.getByRole('link', { name: 'Skip to content' });
  const main = page.getByRole('main');

  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');

  await expect(page).toHaveURL(`http://127.0.0.1:4321${projectBase}/#main-content`);
  await expect(main).toBeFocused();
});
