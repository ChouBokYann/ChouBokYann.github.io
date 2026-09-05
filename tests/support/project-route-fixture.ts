import type { Stats } from 'node:fs';
import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  realpath,
  rmdir,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

export interface ProjectRouteFixtureOptions {
  fixtureDirectory: string;
  fixtureId: string;
  projectsDirectory: string;
}

export interface ProjectRouteFixtureHandle {
  readonly directory: string;
  readonly slug: string;
}

interface FileIdentity {
  dev: number;
  ino: number;
}

interface OwnedFixture {
  directory: string;
  directoryIdentity: FileIdentity;
  files: Array<{ identity: FileIdentity; path: string }>;
}

const ownedFixtures = new WeakMap<ProjectRouteFixtureHandle, OwnedFixture>();

function identityOf(stats: Stats): FileIdentity {
  return { dev: stats.dev, ino: stats.ino };
}

function hasIdentity(stats: Stats, identity: FileIdentity): boolean {
  return stats.dev === identity.dev && stats.ino === identity.ino;
}

async function removeCreatedPath(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

async function rollbackCreatedFixture(directory: string, files: string[]): Promise<void> {
  for (const file of files) await removeCreatedPath(file);

  try {
    await rmdir(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

export async function installProjectRouteFixture(
  options: ProjectRouteFixtureOptions,
): Promise<ProjectRouteFixtureHandle> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.fixtureId)) {
    throw new Error(`Invalid project route fixture ID: ${options.fixtureId}`);
  }

  const projectsDirectory = await realpath(options.projectsDirectory);
  const directory = resolve(projectsDirectory, `__route-test-${options.fixtureId}`);
  const slug = `fixture-project-${options.fixtureId}`;

  if (dirname(directory) !== projectsDirectory) {
    throw new Error(`Refusing to create fixture outside projects: ${directory}`);
  }

  await mkdir(directory);
  const thumbnailPath = join(directory, 'project-thumbnail.svg');
  const markdownPath = join(directory, 'fixture-project.md');
  const createdFiles = [markdownPath, thumbnailPath];

  try {
    await copyFile(join(options.fixtureDirectory, 'project-thumbnail.svg'), thumbnailPath);
    const sourceMarkdown = await readFile(
      join(options.fixtureDirectory, 'published-project.md'),
      'utf8',
    );
    const markdown = sourceMarkdown.replace(/^slug: fixture-project$/m, `slug: ${slug}`);

    if (markdown === sourceMarkdown) {
      throw new Error('Published project fixture is missing its test slug.');
    }

    await writeFile(markdownPath, markdown);

    const directoryStats = await lstat(directory);
    const thumbnailStats = await lstat(thumbnailPath);
    const markdownStats = await lstat(markdownPath);
    const handle = Object.freeze({ directory, slug });
    ownedFixtures.set(handle, {
      directory,
      directoryIdentity: identityOf(directoryStats),
      files: [
        { identity: identityOf(markdownStats), path: markdownPath },
        { identity: identityOf(thumbnailStats), path: thumbnailPath },
      ],
    });
    return handle;
  } catch (error) {
    await rollbackCreatedFixture(directory, createdFiles);
    throw error;
  }
}

export async function removeProjectRouteFixture(
  handle: ProjectRouteFixtureHandle,
): Promise<boolean> {
  const owned = ownedFixtures.get(handle);
  if (!owned) return false;

  const directoryStats = await lstat(owned.directory);
  if (
    !directoryStats.isDirectory() ||
    directoryStats.isSymbolicLink() ||
    !hasIdentity(directoryStats, owned.directoryIdentity)
  ) {
    throw new Error(`Project route fixture directory identity changed: ${owned.directory}`);
  }

  for (const file of owned.files) {
    const stats = await lstat(file.path);
    if (stats.isDirectory() || !hasIdentity(stats, file.identity)) {
      throw new Error(`Project route fixture file identity changed: ${file.path}`);
    }
  }

  for (const file of owned.files) await unlink(file.path);
  await rmdir(owned.directory);
  ownedFixtures.delete(handle);
  return true;
}
