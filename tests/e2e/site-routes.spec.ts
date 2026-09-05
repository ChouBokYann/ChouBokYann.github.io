import { expect, test } from '@playwright/test';

const configuredBase = process.env.BASE_PATH === '/portfolio-site' ? '/portfolio-site' : '';

for (const path of ['/', '/gallery/', '/resume/', '/404.html']) {
  test(`${path} renders exactly one page heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });
}

test('résumé route truthfully reports that no owner PDF is available', async ({ page }) => {
  await page.goto('/resume/');

  await expect(page.getByRole('heading', { level: 1, name: 'Résumé' })).toBeVisible();
  await expect(page.getByText('The résumé is not available in this preview.')).toBeVisible();
  await expect(page.locator('a[href$="resume.pdf"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('navigation links to the truthful résumé route instead of a missing file', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Résumé' }),
  ).toHaveAttribute('href', `${configuredBase}/resume/`);
});

test('anonymous preview has complete social metadata but remains unindexable', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'AI Engineering Portfolio',
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    `http://localhost:4321${configuredBase}/`,
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test('404 route offers base-safe recovery and is excluded from indexing', async ({ page }) => {
  await page.goto('/404.html');

  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute(
    'href',
    `${configuredBase}/`,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('robots route publishes an absolute sitemap URL', async ({ request }) => {
  const response = await request.get('/robots.txt');
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('text/plain');
  expect(body).toContain('User-agent: *\nAllow: /\n');
  expect(body).toContain(`Sitemap: http://localhost:4321${configuredBase}/sitemap-index.xml`);
});

test('every primary same-origin route responds without an HTTP error', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const hrefs = await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));

  for (const href of hrefs) {
    const url = new URL(href);
    url.hash = '';
    const response = await request.get(url.toString());
    expect(response.status(), url.toString()).toBeLessThan(400);
  }
});
