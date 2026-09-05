import { spawn, type ChildProcess } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const astroCli = join(projectDirectory, 'node_modules', 'astro', 'bin', 'astro.mjs');
let fixtureServer: ChildProcess | undefined;

function fixtureIdFor(projectName: string): string {
  return projectName.replace(/^fixture-/, '');
}

function portFor(fixtureId: string): number {
  return fixtureId === 'mobile-chromium' ? 4323 : 4322;
}

async function startFixtureServer(fixtureId: string, baseURL: string): Promise<void> {
  fixtureServer = spawn(
    process.execPath,
    [astroCli, 'dev', '--host', '127.0.0.1', '--port', String(portFor(fixtureId))],
    {
      cwd: projectDirectory,
      env: { ...process.env, PROJECT_ROUTE_E2E: '1' },
      stdio: 'ignore',
    },
  );
  fixtureServer.unref();

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (fixtureServer.exitCode !== null) {
      throw new Error(`Fixture server exited before startup with code ${fixtureServer.exitCode}.`);
    }

    try {
      const response = await fetch(new URL(`projects/fixture-project-${fixtureId}/`, baseURL));
      if (response.ok) return;
    } catch {
      // The server has not bound its port yet.
    }

    await delay(100);
  }

  throw new Error('Fixture server did not become ready.');
}

async function stopFixtureServer(): Promise<void> {
  if (!fixtureServer || fixtureServer.exitCode !== null) return;

  const exited = new Promise<void>((resolveExit) => {
    fixtureServer?.once('exit', () => resolveExit());
  });
  fixtureServer.kill();
  await Promise.race([exited, delay(5_000)]);
}

test.beforeAll(async (_fixtures, testInfo) => {
  const fixtureId = fixtureIdFor(testInfo.project.name);
  const baseURL = testInfo.project.use.baseURL;
  if (typeof baseURL !== 'string') throw new Error('Fixture project requires a base URL.');
  await startFixtureServer(fixtureId, baseURL);
});

test.afterAll(async () => {
  await stopFixtureServer();
});

test('project page exposes technical evidence and outbound actions', async ({ page }, testInfo) => {
  const projectId = fixtureIdFor(testInfo.project.name);

  await page.goto(`/projects/fixture-project-${projectId}/`);
  await expect(page.getByRole('heading', { level: 1, name: 'Fixture project' })).toBeVisible();
  const architecture = page.getByRole('tab', { name: 'Architecture' });
  const evidenceIsland = page.locator('astro-island').filter({ has: architecture });
  await expect(architecture).toBeVisible();
  await expect(evidenceIsland).not.toHaveAttribute('ssr');
  await page.getByRole('tab', { name: 'Metrics' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('test-only value');
  await expect(page.getByRole('link', { name: 'Read the full article' })).toHaveAttribute(
    'href',
    'https://example.com/test-only-article',
  );
  await expect(page.getByRole('link', { name: 'View source' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Open demo' })).toHaveCount(0);
});
