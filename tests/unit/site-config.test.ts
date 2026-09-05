import { describe, expect, it } from 'vitest';
import { deriveSiteConfig } from '../../src/config/site';

describe('deriveSiteConfig', () => {
  it('uses localhost and root paths outside GitHub Actions', () => {
    expect(deriveSiteConfig({})).toEqual({
      site: new URL('http://localhost:4321'),
      base: '/',
    });
  });

  it('derives a project Pages URL from GITHUB_REPOSITORY', () => {
    expect(deriveSiteConfig({ GITHUB_REPOSITORY: 'octocat/portfolio-site' })).toEqual({
      site: new URL('https://octocat.github.io'),
      base: '/portfolio-site',
    });
  });

  it('uses root base for an account Pages repository', () => {
    expect(deriveSiteConfig({ GITHUB_REPOSITORY: 'octocat/octocat.github.io' }).base).toBe('/');
  });

  it('treats empty optional GitHub variables as absent', () => {
    expect(
      deriveSiteConfig({ SITE_URL: '', BASE_PATH: '', GITHUB_REPOSITORY: 'octocat/work' }),
    ).toEqual({
      site: new URL('https://octocat.github.io'),
      base: '/work',
    });
  });

  it('honors explicit custom-domain settings', () => {
    expect(
      deriveSiteConfig({ SITE_URL: 'https://portfolio.example', BASE_PATH: '/work/' }),
    ).toEqual({ site: new URL('https://portfolio.example'), base: '/work' });
  });
});
