import { describe, expect, it } from 'vitest';
import { expectedBasePath, verifyBasePathHtml } from '../../scripts/verify-base-path.mjs';

describe('GitHub Pages base-path verification', () => {
  it('derives project and account-site base paths from the repository slug', () => {
    expect(expectedBasePath('octocat/portfolio-site')).toBe('/portfolio-site/');
    expect(expectedBasePath('octocat/octocat.github.io')).toBe('/');
  });

  it('rejects a project build containing a root-relative URL outside the repository base', () => {
    const homepage = [
      '<link rel="stylesheet" href="/portfolio-site/_astro/site.css">',
      '<a href="/portfolio-site/gallery/">Gallery</a>',
      '<script src="/assets/site.js"></script>',
    ].join('');

    expect(() => verifyBasePathHtml(homepage, '/portfolio-site/')).toThrow(
      'Root-relative URL does not use the expected base path: /assets/site.js',
    );
  });

  it('accepts base-prefixed routes, assets, fragments, and external URLs', () => {
    const homepage = [
      '<link rel="stylesheet" href="/portfolio-site/_astro/site.css">',
      '<a href="/portfolio-site/gallery/">Gallery</a>',
      '<a href="#contact">Contact</a>',
      '<a href="https://example.com">External</a>',
    ].join('');

    expect(() => verifyBasePathHtml(homepage, '/portfolio-site/')).not.toThrow();
  });
});
