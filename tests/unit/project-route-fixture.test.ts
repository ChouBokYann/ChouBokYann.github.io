import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  installProjectRouteFixture,
  removeProjectRouteFixture,
  type ProjectRouteFixtureHandle,
} from '../support/project-route-fixture';

const temporaryRoots: string[] = [];

async function makeLayout() {
  const root = await mkdtemp(join(tmpdir(), 'project-route-fixture-'));
  temporaryRoots.push(root);
  const projectsDirectory = join(root, 'projects');
  const fixtureDirectory = join(root, 'fixtures');
  await mkdir(projectsDirectory);
  await mkdir(fixtureDirectory);
  await writeFile(
    join(fixtureDirectory, 'published-project.md'),
    '---\nslug: fixture-project\n---\ntest-only markdown',
  );
  await writeFile(join(fixtureDirectory, 'project-thumbnail.svg'), '<svg></svg>');
  return { fixtureDirectory, projectsDirectory };
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe('project route fixture ownership', () => {
  it('refuses an occupied target without changing its contents', async () => {
    const layout = await makeLayout();
    const occupiedDirectory = join(layout.projectsDirectory, '__route-test-chromium-0');
    const marker = join(occupiedDirectory, 'owner-content.txt');
    await mkdir(occupiedDirectory);
    await writeFile(marker, 'preserve me');

    await expect(
      installProjectRouteFixture({ ...layout, fixtureId: 'chromium-0' }),
    ).rejects.toMatchObject({ code: 'EEXIST' });
    await expect(readFile(marker, 'utf8')).resolves.toBe('preserve me');
  });

  it('does not remove a directory that this run does not own', async () => {
    const layout = await makeLayout();
    const occupiedDirectory = join(layout.projectsDirectory, '__route-test');
    const marker = join(occupiedDirectory, 'owner-content.txt');
    await mkdir(occupiedDirectory);
    await writeFile(marker, 'preserve me');
    const unownedHandle = {
      directory: occupiedDirectory,
      slug: 'fixture-project-forged',
    } as ProjectRouteFixtureHandle;

    await expect(removeProjectRouteFixture(unownedHandle)).resolves.toBe(false);
    await expect(readFile(marker, 'utf8')).resolves.toBe('preserve me');
  });

  it('copies and removes only the directory created by this run', async () => {
    const layout = await makeLayout();

    const handle = await installProjectRouteFixture({ ...layout, fixtureId: 'chromium-0' });
    await expect(readFile(join(handle.directory, 'fixture-project.md'), 'utf8')).resolves.toContain(
      'slug: fixture-project-chromium-0',
    );
    await expect(removeProjectRouteFixture(handle)).resolves.toBe(true);
    await expect(readFile(handle.directory, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('allows separate worker fixtures to coexist', async () => {
    const layout = await makeLayout();

    const desktop = await installProjectRouteFixture({ ...layout, fixtureId: 'chromium-0' });
    const mobile = await installProjectRouteFixture({
      ...layout,
      fixtureId: 'mobile-chromium-1',
    });

    expect(desktop.directory).not.toBe(mobile.directory);
    expect(desktop.slug).toBe('fixture-project-chromium-0');
    expect(mobile.slug).toBe('fixture-project-mobile-chromium-1');
    await expect(removeProjectRouteFixture(desktop)).resolves.toBe(true);
    await expect(removeProjectRouteFixture(mobile)).resolves.toBe(true);
  });

  it('ignores mutable handle fields when deciding what to remove', async () => {
    const layout = await makeLayout();
    const handle = await installProjectRouteFixture({ ...layout, fixtureId: 'chromium-0' });
    const ownedDirectory = handle.directory;
    const victimDirectory = join(layout.projectsDirectory, 'owner-project');
    const marker = join(victimDirectory, 'owner-content.txt');
    await mkdir(victimDirectory);
    await writeFile(marker, 'preserve me');

    try {
      Object.assign(handle as unknown as Record<string, string>, {
        directory: victimDirectory,
        projectsDirectory: layout.projectsDirectory,
      });
    } catch {
      // Frozen handles reject mutation in strict mode.
    }

    await expect(removeProjectRouteFixture(handle)).resolves.toBe(true);
    await expect(readFile(marker, 'utf8')).resolves.toBe('preserve me');
    await expect(readFile(ownedDirectory, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('refuses cleanup after the owned directory is replaced by a link', async () => {
    const layout = await makeLayout();
    const handle = await installProjectRouteFixture({ ...layout, fixtureId: 'chromium-0' });
    const replacementDirectory = join(layout.projectsDirectory, 'owner-project');
    const marker = join(replacementDirectory, 'owner-content.txt');
    await mkdir(replacementDirectory);
    await writeFile(marker, 'preserve me');
    await rm(handle.directory, { recursive: true, force: true });
    await symlink(
      replacementDirectory,
      handle.directory,
      process.platform === 'win32' ? 'junction' : 'dir',
    );

    await expect(removeProjectRouteFixture(handle)).rejects.toThrow(/identity/i);
    await expect(readFile(marker, 'utf8')).resolves.toBe('preserve me');
  });
});
