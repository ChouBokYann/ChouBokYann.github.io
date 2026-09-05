import { expect, test } from '@playwright/test';

test('gallery route remains useful before photographs are published', async ({ page }) => {
  await page.goto('/gallery/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Photography');
  await expect(
    page.getByText('The gallery will open after the first curated set is ready.'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to interests' })).toHaveAttribute(
    'href',
    /#interests$/,
  );
});
