
import fs from 'fs';
import path from 'path';
import tools from "../tool-list.json" with { type: "json" };

async function generateSitemap() {
  console.log('Generating sitemap...');

  const baseUrl = 'https://tulrex.com';

  // Static pages
  const staticPages = [
    { url: '/', priority: 1.0 },
    { url: '/about', priority: 0.5 },
  ];

  // All page URLs
  const allPages = [
    ...staticPages,
    ...tools.map(tool => ({
      url: `/tools/${tool.slug}`,
      priority: 0.8,
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages
    .map(page => {
      const path = page.url === '/' ? '' : page.url;
      return `
    <url>
      <loc>${baseUrl}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${page.priority}</priority>
    </url>`;
    })
    .join('')}
</urlset>`;

  // The sitemap will be placed in the `public` directory.
  // Next.js will then copy it to the root of the `out` directory during build.
  const publicPath = path.resolve('./public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
  }

  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);

  console.log('Sitemap generated successfully in public/sitemap.xml');
}

generateSitemap();