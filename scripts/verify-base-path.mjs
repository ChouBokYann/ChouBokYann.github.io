/* global URL, console, process */
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function expectedBasePath(githubRepository) {
  const [owner, repository, extra] = githubRepository?.split('/') ?? [];
  if (!owner || !repository || extra) {
    throw new Error('GITHUB_REPOSITORY must be set to owner/repository');
  }

  return repository === `${owner}.github.io` ? '/' : `/${repository}/`;
}

export function verifyBasePathHtml(homepage, expectedBase) {
  const rootRelativeUrls = Array.from(homepage.matchAll(/\b(?:href|src)=["']([^"']+)["']/g))
    .map(([, value]) => value)
    .filter((value) => value.startsWith('/') && !value.startsWith('//'));

  if (rootRelativeUrls.length === 0) {
    throw new Error('Generated homepage does not contain a root-relative route or asset URL');
  }

  for (const value of rootRelativeUrls) {
    if (
      expectedBase !== '/' &&
      value !== expectedBase.slice(0, -1) &&
      !value.startsWith(expectedBase)
    ) {
      throw new Error(`Root-relative URL does not use the expected base path: ${value}`);
    }
  }
}

async function run() {
  const expectedBase = expectedBasePath(process.env.GITHUB_REPOSITORY);
  const homepage = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  verifyBasePathHtml(homepage, expectedBase);
  console.log(`GitHub Pages base-path output verified: ${expectedBase}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await run();
}
