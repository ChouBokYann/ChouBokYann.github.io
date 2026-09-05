import { expect, test } from '@playwright/test';

test('local hero layout lab drags and resizes layers in relative units', async ({ page }) => {
  await page.goto('./');

  const toggle = page.getByRole('button', { name: 'Open hero layout lab' });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const lab = page.getByRole('region', { name: 'Hero layout lab' });
  await expect(lab).toBeVisible();
  await expect(page.locator('[data-layout-handle]')).toHaveCount(13);

  const sun = page.locator('[data-layout-handle="sun"]');
  const sunBefore = await sun.boundingBox();
  if (!sunBefore) throw new Error('Sun layout handle is not measurable.');

  await page.mouse.move(sunBefore.x + sunBefore.width / 2, sunBefore.y + sunBefore.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    sunBefore.x + sunBefore.width / 2 + 48,
    sunBefore.y + sunBefore.height / 2 + 24,
  );
  await page.mouse.up();

  await expect(lab.getByLabel('Layer', { exact: true })).toHaveValue('sun');
  await expect(lab.getByLabel('Horizontal position')).not.toHaveValue('');
  await expect(page.locator('[data-layer="sun"]')).toHaveAttribute('style', /%/);

  const widthBefore = Number(await lab.getByLabel('Width').inputValue());
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    const resizeHandle = sun.locator('[data-layout-resize]');
    const resizeBox = await resizeHandle.boundingBox();
    if (!resizeBox) throw new Error('Sun resize handle is not measurable.');

    await page.mouse.move(resizeBox.x + resizeBox.width / 2, resizeBox.y + resizeBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      resizeBox.x + resizeBox.width / 2 + 36,
      resizeBox.y + resizeBox.height / 2,
    );
    await page.mouse.up();
  } else {
    await lab.getByLabel('Width').fill(String(widthBefore + 5));
    await lab.getByLabel('Width').blur();
  }
  expect(Number(await lab.getByLabel('Width').inputValue())).toBeGreaterThan(widthBefore);

  await expect(lab.getByLabel('Responsive layout export')).not.toHaveValue(/px/);
});

test('hero layout percentages remain stable when the viewport resizes', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Open hero layout lab' }).click();
  const lab = page.getByRole('region', { name: 'Hero layout lab' });
  await lab.getByLabel('Layer', { exact: true }).selectOption('title');
  await lab.getByLabel('Horizontal position').fill('12.5');
  await lab.getByLabel('Horizontal position').blur();

  await page.setViewportSize({ width: 1000, height: 720 });

  await expect(lab.getByLabel('Horizontal position')).toHaveValue('12.5');
  await expect(page.locator('[data-layer="title"]')).toHaveCSS('left', '125px');
});
