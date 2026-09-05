import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import type { FullConfig } from '@playwright/test';

async function isAvailable(url: string): Promise<boolean> {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL;
  if (typeof baseURL !== 'string') throw new Error('Playwright requires a base URL.');
  if (await isAvailable(baseURL)) {
    throw new Error(`Refusing to reuse an unknown server at ${baseURL}.`);
  }

  const projectDirectory = resolve(import.meta.dirname, '..', '..');
  const astroCli = join(projectDirectory, 'node_modules', 'astro', 'bin', 'astro.mjs');
  const server = spawn(
    process.execPath,
    [astroCli, 'dev', '--host', '127.0.0.1', '--port', '4321'],
    { cwd: projectDirectory, env: process.env, stdio: 'ignore' },
  );
  server.unref();

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Playwright server exited before startup with code ${server.exitCode}.`);
    }
    if (await isAvailable(baseURL)) {
      return async () => {
        if (server.exitCode === null) server.kill();
      };
    }
    await delay(100);
  }

  if (server.exitCode === null) server.kill();
  throw new Error('Playwright server did not become ready.');
}
