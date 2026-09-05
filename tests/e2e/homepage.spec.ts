import { expect, test } from '@playwright/test';

test('homepage tells the portfolio story in one scroll', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Bok Yann’s\s*Portfolio/);

  for (const id of ['about', 'experience', 'projects', 'interests', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Projects' })
    .click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('#projects')).toBeInViewport();
});

test('hero composes the approved v2 depth layers', async ({ page }) => {
  await page.goto('./');

  const stage = page.locator('.hero-stage');
  const artwork = page.getByRole('figure', {
    name: 'Pixel-art view of the sun rising behind Mount Fuji.',
  });
  await expect(artwork).toBeVisible();
  await expect(artwork).toHaveAttribute('data-time-resolved', 'true');
  await expect(stage.locator('.hero-content')).toBeVisible();

  const sceneBase = artwork.locator('[data-scene-base] img');
  await expect(sceneBase).toHaveAttribute('src', /\/art\/hero-v2\/scene-clean\.png$/);
  await expect(sceneBase).toHaveCSS('object-fit', 'cover');
  await expect(artwork.locator('[data-scene-base] source')).toHaveAttribute(
    'srcset',
    /\/art\/hero-v2\/scene-clean-portrait\.png$/,
  );

  const stageBox = await stage.boundingBox();
  const viewport = page.viewportSize();
  expect(stageBox?.width).toBeGreaterThanOrEqual((viewport?.width ?? 0) - 1);
  expect(stageBox?.height).toBeGreaterThanOrEqual((viewport?.height ?? 0) - 80);

  await expect(artwork.locator('img')).toHaveCount(13);
  await expect(
    artwork
      .locator('img')
      .evaluateAll((images) =>
        images.every((image) => image instanceof HTMLImageElement && image.alt === ''),
      ),
  ).resolves.toBe(true);
  await expect(artwork.locator('[data-layer]')).toHaveCount(13);
  await expect(
    artwork
      .locator('[data-layer]')
      .evaluateAll((layers) => layers.map((layer) => layer.getAttribute('data-layer'))),
  ).resolves.toEqual([
    'sky',
    'clouds',
    'lake',
    'distant-town',
    'fuji',
    'right-bank',
    'houses',
    'left-sakura',
    'torii',
    'dock',
    'bok-yann',
    'near-sakura',
    'title',
  ]);

  for (const archivedLayer of ['mist', 'rail-train', 'bridge-cottage', 'petals', 'sakura-branch']) {
    await expect(artwork.locator(`[data-layer="${archivedLayer}"]`)).toHaveCount(0);
  }
});

test('hero title remains above the scene while supporting copy stays readable', async ({
  page,
}) => {
  await page.goto('./');

  const title = page.locator('[data-layer="title"]');
  const fuji = page.locator('[data-layer="fuji"]');
  const supportingContent = page.locator('.hero-content');

  await expect(title).toHaveText(/Bok Yann’s\s*Portfolio/);
  await expect(title).toBeVisible();
  await expect(supportingContent).toBeVisible();

  const [titleZ, fujiZ] = await Promise.all([
    title.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10)),
    fuji.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10)),
  ]);
  expect(titleZ).toBeGreaterThan(fujiZ);

  const [titleBox, fujiBox] = await Promise.all([title.boundingBox(), fuji.boundingBox()]);
  expect(titleBox).not.toBeNull();
  expect(fujiBox).not.toBeNull();
  expect(titleBox?.y ?? Infinity).toBeLessThan(fujiBox?.y ?? -Infinity);
});

test('Mount Fuji remains an independent keyboard-operable Easter egg', async ({ page }) => {
  await page.goto('./');

  const fuji = page.getByRole('button', { name: 'Discover the Mount Fuji secret' });

  await fuji.focus();
  await expect(fuji).toBeFocused();
  await expect(fuji).toHaveCSS('outline-style', 'solid');

  await fuji.press('Enter');
  await expect(page.getByRole('status')).toContainText('Keep climbing');
});

test('night treatment preserves enough scene detail to read the landscape', async ({ page }) => {
  await page.goto('./');
  const artwork = page.locator('[data-hero-artwork]');
  await artwork.evaluate((element) => element.setAttribute('data-time-phase', 'night'));

  const shade = await artwork.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue('--scene-shade-opacity')),
  );
  expect(shade).toBeLessThanOrEqual(0.28);
});

test('hero animates only the selected atmospheric depth layers', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');

  const artwork = page.locator('[data-hero-artwork]');
  await expect(artwork).toHaveAttribute('data-hero-motion', 'running');
  await expect(
    artwork
      .locator('[data-motion-layer]')
      .evaluateAll((layers) => layers.map((layer) => layer.getAttribute('data-motion-layer'))),
  ).resolves.toEqual(['clouds', 'lake', 'fuji', 'trees', 'person', 'petals']);
  await expect(artwork.locator('[data-petal]')).toHaveCount(16);
  await expect(
    artwork.locator('[data-petal]').evaluateAll((petals) => {
      const paths = petals.map((petal) =>
        [
          petal.getAttribute('data-start'),
          petal.getAttribute('data-drift'),
          petal.getAttribute('data-duration'),
        ].join(':'),
      );
      return new Set(paths).size;
    }),
  ).resolves.toBeGreaterThanOrEqual(12);
});

test('hero uses the approved calm cinematic motion without demo controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');

  const artwork = page.locator('[data-hero-artwork]');
  await expect(artwork).toHaveAttribute('data-motion-style', 'cinematic');
  await expect(page.getByRole('group', { name: 'Animation style' })).toHaveCount(0);
});

test('Bok Yann moves only while the character is being interacted with', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');

  const person = page.getByRole('button', { name: 'Animate Bok Yann' });
  await expect(person).toHaveAttribute('data-person-motion', 'idle');

  const box = await person.boundingBox();
  if (!box) throw new Error('Character canvas is missing');
  const portrait = await page.evaluate(() => matchMedia('(orientation: portrait)').matches);
  await page.mouse.move(box.x + box.width * (portrait ? 0.6 : 0.523), box.y + box.height * (portrait ? 0.78 : 0.82));
  await expect(person).toHaveAttribute('data-person-motion', 'active');

  await page.mouse.move(0, 0);
  await expect(person).toHaveAttribute('data-person-motion', 'idle');
});

test('hero leaves atmospheric layers still when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');

  const artwork = page.locator('[data-hero-artwork]');
  await expect(artwork).toHaveAttribute('data-hero-motion', 'reduced');
  await expect(
    artwork
      .locator('[data-motion-layer]')
      .evaluateAll((layers) =>
        layers.every((layer) => (layer as HTMLElement).style.transform === ''),
      ),
  ).resolves.toBe(true);
});

test('foreground framing does not overpower the middle-distance torii', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('./');

    const stage = page.locator('.hero-stage');
    const torii = page.locator('[data-layer="torii"]');
    const leftSakura = page.locator('[data-layer="left-sakura"]');
    const nearSakura = page.locator('[data-layer="near-sakura"]');
    const [stageBox, toriiBox, leftBox, nearBox] = await Promise.all([
      stage.boundingBox(),
      torii.boundingBox(),
      leftSakura.boundingBox(),
      nearSakura.boundingBox(),
    ]);

    expect(stageBox).not.toBeNull();
    expect(toriiBox).not.toBeNull();
    expect(leftBox).not.toBeNull();
    expect(nearBox).not.toBeNull();

    const stageWidth = stageBox?.width ?? 1;
    const maxToriiShare = viewport.width < 768 ? 0.3 : 0.2;
    expect((toriiBox?.width ?? stageWidth) / stageWidth).toBeLessThanOrEqual(maxToriiShare);
    expect((leftBox?.width ?? stageWidth) / stageWidth).toBeLessThanOrEqual(0.38);
    expect((nearBox?.width ?? stageWidth) / stageWidth).toBeLessThanOrEqual(0.4);
  }
});

test('anonymous preview is honest and emits no unapproved content links', async ({ page }) => {
  await page.goto('./#contact');

  await expect(page.locator('.hero')).not.toContainText('Owner-approved profile content');

  await expect(
    page.getByText('Profile details have not been configured for this local preview.'),
  ).toBeVisible();
  await expect(page.locator('#contact a')).toHaveCount(0);
  await expect(page.locator('#projects a')).toHaveCount(0);
  await expect(page.locator('#interests a')).toHaveCount(0);
  await expect(page.locator('#projects')).not.toContainText('Selected work');
  await expect(page.locator('.hero')).not.toContainText('Selected work');
});

test('contact links are named and external links are safe', async ({ page }) => {
  await page.goto('./#contact');
  const externalLinks = page.locator('#contact a[target="_blank"]');
  const count = await externalLinks.count();

  for (let index = 0; index < count; index += 1) {
    await expect(externalLinks.nth(index)).toHaveAttribute('rel', /noopener/);
  }
});
