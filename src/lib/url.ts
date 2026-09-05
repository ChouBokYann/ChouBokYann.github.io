export function withBase(path: string, base = import.meta.env.BASE_URL): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('#') || path.startsWith('mailto:')) {
    return path;
  }

  const normalizedBase = base === '/' ? '' : `/${base}`.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  const normalizedPath = path === '/' ? '/' : `/${path}`.replace(/\/{2,}/g, '/');

  return normalizedPath === '/' ? `${normalizedBase}/` : `${normalizedBase}${normalizedPath}`;
}
