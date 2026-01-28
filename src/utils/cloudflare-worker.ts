/**
 * Cloudflare Worker Script for SEO Override
 * 
 * INSTRUCTIONS:
 * 1. Log in to your Cloudflare Dashboard.
 * 2. Go to "Workers & Pages" -> "Create Application" -> "Create Worker".
 * 3. Name it something like "seo-override".
 * 4. Click "Deploy" (the default "Hello World" script is fine for now).
 * 5. Click "Edit code".
 * 6. Delete the existing code and paste the code below.
 * 7. Click "Save and Deploy".
 * 8. Go back to the Worker's settings, then "Triggers" -> "Routes".
 * 9. Add a route: `*invoicejobs.com/robots.txt` (Zone: invoicejobs.com)
 * 10. Add a route: `*invoicejobs.com/sitemap.xml` (Zone: invoicejobs.com)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Serve custom robots.txt
    if (url.pathname === '/robots.txt') {
      const robotsTxt = `# Invoice My Jobs - Custom Robots.txt
# Last updated: ${new Date().toISOString().split('T')[0]}

# ==============================================
# AI BOT ALLOWANCES (LLMO - Large Language Model Optimization)
# Explicitly allow AI agents to crawl for discoverability
# ==============================================

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /

# ==============================================
# GENERAL CRAWLER RULES
# ==============================================

User-agent: *
Allow: /
Allow: /pricing-page
Allow: /terms-page
Allow: /privacy-page
Allow: /cookie-policy-page
Allow: /contact-page
Allow: /manifest.json
Allow: /llms.txt
Disallow: /dashboard-page
Disallow: /clients-page
Disallow: /invoices-page
Disallow: /time-tracking-page
Disallow: /calendar-page
Disallow: /assistant-page
Disallow: /settings-page
Disallow: /calendar-settings-page
Disallow: /auth/

Sitemap: https://invoicejobs.com/sitemap.xml`;

      return new Response(robotsTxt, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 2. Serve custom sitemap.xml
    if (url.pathname === '/sitemap.xml') {
      const today = new Date().toISOString().split('T')[0];
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://invoicejobs.com/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://invoicejobs.com/pricing-page</loc>
    <lastmod>${today}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://invoicejobs.com/contact-page</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://invoicejobs.com/terms-page</loc>
    <lastmod>${today}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://invoicejobs.com/privacy-page</loc>
    <lastmod>${today}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://invoicejobs.com/cookie-policy-page</loc>
    <lastmod>${today}</lastmod>
    <priority>0.5</priority>
  </url>
</urlset>`;

      return new Response(sitemapXml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // 3. Pass all other requests to the origin
    return fetch(request);
  },
};
