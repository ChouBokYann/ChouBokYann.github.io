import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base =
    import.meta.env.BASE_URL === '/' ? '/' : `${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;
  const sitemap = new URL(`${base}sitemap-index.xml`, site ?? 'http://localhost:4321');

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
