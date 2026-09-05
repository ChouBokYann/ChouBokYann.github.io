export interface SiteEnvironment {
  SITE_URL?: string;
  BASE_PATH?: string;
  GITHUB_REPOSITORY?: string;
}

function normalizeBase(base: string): string {
  const value = `/${base}`.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return value === '' ? '/' : value;
}

export function deriveSiteConfig(env: SiteEnvironment): { site: URL; base: string } {
  const [owner, repository] = env.GITHUB_REPOSITORY?.split('/') ?? [];
  const explicitSite = env.SITE_URL?.trim();
  const explicitBase = env.BASE_PATH?.trim();
  const site = new URL(
    explicitSite || (owner ? `https://${owner}.github.io` : 'http://localhost:4321'),
  );
  const isAccountSite = Boolean(owner && repository === `${owner}.github.io`);
  const derivedBase = repository && !isAccountSite ? `/${repository}` : '/';

  return {
    site,
    base: normalizeBase(explicitBase || derivedBase),
  };
}
