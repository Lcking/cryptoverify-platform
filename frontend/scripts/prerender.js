/*
  Simple prerender for CRA using react-dom/server + StaticRouter
  - Renders selected routes into build/*.html
  - Generates sitemap.xml
*/

const fs = require('fs');
const path = require('path');
// SSR 渲染完整 React 树在 CRA 下较复杂，这里采取轻量预渲染：
// 1) 调整每个路由的 title/description/OG 标签
// 2) 注入 noscript 结构化内容，帮助爬虫抓取

// Load built assets
const buildDir = path.resolve(__dirname, '..', 'build');
const indexHtmlPath = path.join(buildDir, 'index.html');
const indexTemplate = fs.readFileSync(indexHtmlPath, 'utf8');

// Import App from the built source via require-from-root src (using transpiled code is tricky).
// Here we instead render minimal shell HTML per route with key content placeholders you can enhance later.
// For SEO boost, we pre-inject simple route-specific title/description and a noscript SSR-like snippet.

const routes = [
  { path: '/', title: 'Crypto Verify Platform', description: 'Real-time news, platform verification, insights and exposure.' },
  { path: '/news', title: 'Live News', description: 'Latest updates and headlines around the clock.' },
  { path: '/platforms', title: 'Platforms Directory', description: 'Directory of major platforms ranked by trust and metrics.' },
  { path: '/verifications', title: 'Verifications', description: 'Published verification records with operation checks and evidence.' },
  { path: '/insights', title: 'Insights & Research', description: 'Deep dives, market insights, and analysis.' },
  { path: '/exposure', title: 'Fraud Exposure', description: 'Community reports and exposure of risky projects/platforms.' },
  { path: '/submit', title: 'Submit Platform', description: 'Submit a platform to verify or report suspicious activity.' }
];

// Build detail routes dynamically using content snapshots
const content = require('./content');

const staticDetailRoutes = [
  { path: '/platforms/binance', title: 'Binance - Platform Profile', description: 'Largest exchange by volume with derivatives products.' },
  { path: '/platforms/coinbase-pro', title: 'Coinbase Pro - Platform Profile', description: 'US regulated exchange with strong compliance.' },
  { path: '/platforms/kraken', title: 'Kraken - Platform Profile', description: 'Professional exchange with security reputation.' },
  { path: '/news/market-update-1', title: 'Market Update #1', description: 'Concise market update summary and key movements.' },
  { path: '/verifications/binance-2025-09-10', title: 'Verification - Binance (Sept 10, 2025)', description: 'Live trading and withdrawal check.' }
];

const insightDetailRoutes = content.insights.map(i => ({
  path: `/insights/${i.slug}`,
  title: i.title,
  description: i.excerpt || 'Insight article.'
}));

const exposureDetailRoutes = content.exposureReports.map(r => ({
  path: `/exposure/${r.slug}`,
  title: `${r.platform} — ${r.type}`,
  description: r.summary || 'Exposure report.'
}));

const detailRoutes = [...staticDetailRoutes, ...insightDetailRoutes, ...exposureDetailRoutes];

function injectMeta(html, { title, description }) {
  let out = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  const descMetaRe = /<meta\s+name="description"\s+content=".*?"\s*\/>/i;
  if (descMetaRe.test(out)) {
    out = out.replace(descMetaRe, `<meta name="description" content="${description}"/>`);
  } else {
    out = out.replace('</head>', `  <meta name="description" content="${description}"/>\n</head>`);
  }

  const ogTitleRe = /<meta\s+property="og:title"\s+content=".*?"\s*\/>/i;
  const ogDescRe = /<meta\s+property="og:description"\s+content=".*?"\s*\/>/i;

  if (ogTitleRe.test(out)) {
    out = out.replace(ogTitleRe, `<meta property="og:title" content="${title}"/>`);
  } else {
    out = out.replace('</head>', `  <meta property="og:title" content="${title}"/>\n</head>`);
  }

  if (ogDescRe.test(out)) {
    out = out.replace(ogDescRe, `<meta property="og:description" content="${description}"/>`);
  } else {
    out = out.replace('</head>', `  <meta property="og:description" content="${description}"/>\n</head>`);
  }

  return out;
}

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function writeFileSafe(p, content) {
  ensureDir(p);
  fs.writeFileSync(p, content);
}

// For lightweight "SSR" signal, we add a noscript content block per route (search engines can parse it)
function buildNoscriptContent(route) {
  const map = {
    '/': '<noscript><div>Crypto Verify Platform - Home</div></noscript>',
    '/news': '<noscript><h1>24/7 News</h1><p>Latest headlines and updates.</p></noscript>',
    '/platforms': '<noscript><h1>Platforms Directory</h1><ul><li>Binance</li><li>Coinbase</li><li>Kraken</li></ul><p>Latest verification: Binance - Sept 10, 2025</p></noscript>',
    '/verifications': '<noscript><h1>Verifications</h1><ul><li>Binance - Sept 10, 2025</li><li>Coinbase Pro - Sept 5, 2025</li></ul></noscript>',
    '/insights': '<noscript><h1>Insights & Research</h1><p>Deep dives and market analysis.</p></noscript>',
    '/exposure': '<noscript><h1>Fraud Exposure</h1><p>Community exposure reports.</p></noscript>',
    '/submit': '<noscript><h1>Submit Platform</h1><p>Send a platform or exposure report.</p></noscript>'
  };
  return map[route] || '';
}

function renderRouteToHtml(route) {
  const tpl = injectMeta(indexTemplate, { title: route.title, description: route.description });
  const noscript = buildNoscriptContent(route.path);
  // Inject noscript right after opening body tag
  const html = tpl.replace('<body>', `<body>\n${noscript}`);
  return html;
}

function routeToFilename(routePath) {
  if (routePath === '/') return path.join(buildDir, 'index.html');
  const outDir = path.join(buildDir, routePath);
  const outFile = path.join(outDir, 'index.html');
  return outFile;
}

function generateSitemap(baseUrl, routes) {
  const urls = routes.map(r => `  <url>\n    <loc>${baseUrl}${r.path === '/' ? '' : r.path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${r.path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

(function main() {
  try {
    // Write route-specific html
    [...routes, ...detailRoutes].forEach(r => {
      const html = renderRouteToHtml(r);
      const outFile = routeToFilename(r.path);
      writeFileSafe(outFile, html);
      console.log('Prerendered:', r.path, '->', outFile);
    });

    // Write sitemap.xml
    const baseUrl = process.env.SITE_URL || 'https://example.com';
  const sitemap = generateSitemap(baseUrl, [...routes, ...detailRoutes]);
    fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemap);
    console.log('Generated sitemap.xml');
  } catch (e) {
    console.error('Prerender failed:', e);
    process.exit(1);
  }
})();
