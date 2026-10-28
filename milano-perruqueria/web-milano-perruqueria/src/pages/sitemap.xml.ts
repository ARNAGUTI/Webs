import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const url = (p: string) => new URL(p, site).href;
  const par = (es: string, ca: string) => {
    const alt = `<xhtml:link rel="alternate" hreflang="es" href="${url(es)}"/><xhtml:link rel="alternate" hreflang="ca" href="${url(ca)}"/>`;
    return `<url><loc>${url(es)}</loc>${alt}</url>\n<url><loc>${url(ca)}</loc>${alt}</url>`;
  };
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${par('/', '/ca/')}
${par('/legal/', '/ca/legal/')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
