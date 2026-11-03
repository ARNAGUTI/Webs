import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const es = new URL('/', site).href;
  const ca = new URL('/ca/', site).href;
  const alt = `<xhtml:link rel="alternate" hreflang="es" href="${es}"/><xhtml:link rel="alternate" hreflang="ca" href="${ca}"/>`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url><loc>${es}</loc>${alt}</url>
<url><loc>${ca}</loc>${alt}</url>
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
