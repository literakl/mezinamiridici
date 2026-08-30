const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const dayjs = require('dayjs');
const axios = require('axios');
require('dotenv').config();

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const SPA_PUBLIC_DIR = path.join(PROJECT_ROOT, 'spa/public');
const SPA_ASSETS_DIR = path.join(PROJECT_ROOT, 'spa/src/assets');

// API configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://www.mezinamiridici.cz';
const WEB_URL = process.env.WEB_URL || 'https://www.mezinamiridici.cz';
const MAX_PAGE_SIZE = 50;
const FEED_ITEM_LIMIT = 30;

// Simple logger
const jobLogger = {
  info: (msg, ...args) => console.log(`✓ ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`⚠ ${msg}`, ...args),
  error: (msg, ...args) => console.error(`✗ ${msg}`, ...args),
  debug: (msg, ...args) => console.log(`  ${msg}`, ...args)
};

// Compiled templates cache
const COMPILED_TEMPLATES = {};

// Register Handlebars helpers
function registerHelpers() {
  Handlebars.registerHelper('formatDate', (date) => {
    if (!date) return '';
    return dayjs(date).format('D.M.YYYY');
  });

  Handlebars.registerHelper('formatDateTime', (date) => {
    if (!date) return '';
    return dayjs(date).format('D.M.YYYY HH:mm');
  });

  Handlebars.registerHelper('percentage', (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  });

  Handlebars.registerHelper('eq', (a, b) => a === b);
  Handlebars.registerHelper('gt', (a, b) => a > b);
  Handlebars.registerHelper('add', (a, b) => a + b);

  // Register partials
  const partialsDir = path.join(TEMPLATES_DIR, 'partials');
  if (fsSync.existsSync(partialsDir)) {
    const partialFiles = fsSync.readdirSync(partialsDir);
    partialFiles.forEach(file => {
      if (file.endsWith('.hbs')) {
        const partialName = file.replace('.hbs', '');
        const partialContent = fsSync.readFileSync(path.join(partialsDir, file), 'utf8');
        Handlebars.registerPartial(partialName, partialContent);
        jobLogger.debug(`Registered partial: ${partialName}`);
      }
    });
  }
}

// Load and compile template
function getTemplate(templateName) {
  if (!COMPILED_TEMPLATES[templateName]) {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
    const templateContent = fsSync.readFileSync(templatePath, 'utf8');
    COMPILED_TEMPLATES[templateName] = Handlebars.compile(templateContent);
  }
  return COMPILED_TEMPLATES[templateName];
}

// Get file path for an item
function getFilePathForItem(item) {
  let relativePath;

  if (item.type === 'article') {
    relativePath = path.join('clanky', item.info.slug, 'index.html');
  } else if (item.type === 'blog') {
    relativePath = path.join('blogy', item.info.slug, 'index.html');
  } else if (item.type === 'poll') {
    relativePath = path.join('ankety', item.info.slug, 'index.html');
  } else if (item.type === 'page') {
    relativePath = path.join('o', item.info.slug, 'index.html');
  } else {
    throw new Error(`Unknown item type: ${item.type}`);
  }

  return path.join(OUTPUT_DIR, relativePath);
}

// Get URL for an item
function getUrlForItem(item) {
  if (item.type === 'article') {
    return `/clanky/${item.info.slug}`;
  } else if (item.type === 'blog') {
    return `/blogy/${item.info.slug}`;
  } else if (item.type === 'poll') {
    return `/ankety/${item.info.slug}`;
  } else if (item.type === 'page') {
    return `/o/${item.info.slug}`;
  }
  return '/';
}

// Get absolute URL for an item
function getAbsoluteUrlForItem(item) {
  return `${WEB_URL}${getUrlForItem(item)}`;
}

// Resolve a possibly-relative image path to an absolute URL
function getAbsoluteImageUrl(picture) {
  if (!picture) return null;
  return /^https?:\/\//i.test(picture) ? picture : `${WEB_URL}/${picture.replace(/^\//, '')}`;
}

// Fetch all published items from API
async function fetchAllItems() {
  jobLogger.info('Fetching all published items from API...');

  const allItems = [];
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/item-stream`, {
        params: { start, ps: MAX_PAGE_SIZE }
      });

      const items = response.data.data || [];

      // Filter out "Statistiky nehod" posts
      const filteredItems = items.filter(item => {
        const caption = item.info?.caption || '';
        return !caption.toLowerCase().includes('statistiky nehod');
      });

      allItems.push(...filteredItems);

      jobLogger.debug(`Fetched ${items.length} items (total: ${allItems.length})`);

      // If we got less than the page size, we're done
      if (items.length < MAX_PAGE_SIZE) {
        hasMore = false;
      } else {
        start += MAX_PAGE_SIZE;
      }
    } catch (error) {
      jobLogger.error(`Failed to fetch items: ${error.message}`);
      throw error;
    }
  }

  jobLogger.info(`Found ${allItems.length} published items`);
  return allItems;
}

// Fetch full content for an item
async function fetchItemContent(slug) {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/content/${slug}`);
    return response.data.data;
  } catch (error) {
    jobLogger.warn(`Failed to fetch content for ${slug}: ${error.message}`);
    return null;
  }
}

// Fetch comments for an item
async function fetchCommentsForItem(itemId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/bff/items/${itemId}/comments`, {
      params: { ps: 1000 } // Get all comments
    });

    const data = response.data.data;
    return data.comments || [];
  } catch (error) {
    jobLogger.warn(`Failed to fetch comments for ${itemId}: ${error.message}`);
    return [];
  }
}

// Calculate poll vote percentages
function calculatePollVotes(poll) {
  if (!poll || !poll.data || !poll.data.votes) {
    return { neutral: 0, trivial: 0, dislike: 0, hate: 0, total: 0 };
  }

  const votes = poll.data.votes;
  const total = (votes.neutral || 0) + (votes.trivial || 0) +
                (votes.dislike || 0) + (votes.hate || 0);

  return {
    neutral: votes.neutral || 0,
    trivial: votes.trivial || 0,
    dislike: votes.dislike || 0,
    hate: votes.hate || 0,
    total,
    neutralPercent: total > 0 ? Math.round((votes.neutral || 0) / total * 100) : 0,
    trivialPercent: total > 0 ? Math.round((votes.trivial || 0) / total * 100) : 0,
    dislikePercent: total > 0 ? Math.round((votes.dislike || 0) / total * 100) : 0,
    hatePercent: total > 0 ? Math.round((votes.hate || 0) / total * 100) : 0
  };
}

// Generate home page
async function generateHomePage(items) {
  jobLogger.info('Generating home page...');

  const template = getTemplate('home');

  const html = template({
    pageTitle: 'Mezi námi řidiči',
    pageDescription: 'Archiv diskuzního fóra o dopravě a řízení v České republice',
    canonicalUrl: WEB_URL,
    items,
    generationDate: dayjs().format('D.M.YYYY')
  });

  const filePath = path.join(OUTPUT_DIR, 'index.html');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');

  jobLogger.info('Home page generated');
}

// Generate individual item page
async function generateItemPage(item) {
  const itemType = item.type;

  // Fetch full content
  const fullItem = await fetchItemContent(item.info.slug);
  if (!fullItem) {
    jobLogger.warn(`Skipping ${item.info.slug} - content not found`);
    return;
  }

  // Fetch comments
  const comments = await fetchCommentsForItem(item._id);

  // For polls, calculate vote results
  let voteResults = null;
  if (itemType === 'poll') {
    voteResults = calculatePollVotes(fullItem);
  }

  // Load appropriate template
  const template = getTemplate(itemType);

  const canonicalUrl = getAbsoluteUrlForItem(item);
  const ogImage = getAbsoluteImageUrl(fullItem.info.picture);

  let jsonLd = null;
  if (itemType === 'article' || itemType === 'blog') {
    jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': itemType === 'article' ? 'NewsArticle' : 'BlogPosting',
      headline: fullItem.info.caption,
      description: fullItem.info.summary || fullItem.info.caption,
      datePublished: fullItem.info.date ? new Date(fullItem.info.date).toISOString() : undefined,
      author: fullItem.info.author?.nickname ? { '@type': 'Person', name: fullItem.info.author.nickname } : undefined,
      image: ogImage ? [ogImage] : undefined,
      publisher: {
        '@type': 'Organization',
        name: 'Mezi námi řidiči',
        logo: { '@type': 'ImageObject', url: `${WEB_URL}/images/logo.png` }
      },
      mainEntityOfPage: canonicalUrl
    });
  }

  const html = template({
    pageTitle: fullItem.info.caption,
    pageDescription: fullItem.info.summary || fullItem.info.caption,
    ogImage,
    canonicalUrl,
    jsonLd,
    item: fullItem,
    comments,
    voteResults,
    commentCount: comments.length,
    generationDate: dayjs().format('D.M.YYYY')
  });

  const filePath = getFilePathForItem(item);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}

// Copy directory recursively
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Copy static assets
async function copyAssets() {
  jobLogger.info('Copying static assets...');

  // Copy images
  const imagesSource = path.join(SPA_PUBLIC_DIR, 'images');
  const imagesDest = path.join(OUTPUT_DIR, 'images');
  if (fsSync.existsSync(imagesSource)) {
    await copyDir(imagesSource, imagesDest);
    jobLogger.info('Images copied');
  }

  // Copy root files
  const rootFiles = ['favicon.ico', 'manifest.json'];
  for (const file of rootFiles) {
    const srcPath = path.join(SPA_PUBLIC_DIR, file);
    const destPath = path.join(OUTPUT_DIR, file);
    if (fsSync.existsSync(srcPath)) {
      await fs.copyFile(srcPath, destPath);
    }
  }

  // Copy CSS
  const cssSource = path.join(SPA_ASSETS_DIR, 'styles', 'custom.scss');
  const cssDest = path.join(OUTPUT_DIR, 'css', 'styles.css');
  await fs.mkdir(path.dirname(cssDest), { recursive: true });
  if (fsSync.existsSync(cssSource)) {
    await fs.copyFile(cssSource, cssDest);
    jobLogger.info('CSS copied');
  }

  jobLogger.info('Assets copied successfully');
}

// Generate nginx production configuration
function generateNginxConfig(items) {
  jobLogger.info('Generating nginx production configuration...');

  const config = [];
  config.push('# Nginx configuration for Mezi námi řidiči static archive');
  config.push('# Replace /etc/nginx/sites-enabled/www.mezinamiridici.cz with this file\n');

  // Expires map
  config.push('# Expires map');
  config.push('map $sent_http_content_type $expires {');
  config.push('    default                    off;');
  config.push('    text/html                  epoch;');
  config.push('    text/css                   max;');
  config.push('    application/javascript     max;');
  config.push('    ~image/                    max;');
  config.push('    ~font/                     max;');
  config.push('}\n');

  // Main HTTPS server block
  config.push('server {');
  config.push('    root /var/www/mezinamiridici;');
  config.push('    index index.html;');
  config.push('    client_max_body_size 20M;\n');

  config.push('    server_name www.mezinamiridici.cz;\n');

  config.push('    expires $expires;\n');

  // Redirects for old blog URLs
  const blogs = items.filter(item => item.type === 'blog');
  if (blogs.length > 0) {
    config.push('    # Redirects for old blog URLs (/p/{userId}/b/{slug} -> /blogy/{slug})');
    blogs.forEach(item => {
      if (item.info.author?.id) {
        config.push(`    rewrite ^/p/${item.info.author.id}/b/${item.info.slug}$ /blogy/${item.info.slug} permanent;`);
      }
    });
    config.push('');
  }

  // Plausible script proxy
  config.push('    # Plausible analytics script');
  config.push('    location /js/ {');
  config.push('        proxy_pass http://localhost:8000/js/;');
  config.push('        proxy_set_header Host $host;');
  config.push('        proxy_set_header X-Real-IP $remote_addr;');
  config.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
  config.push('        proxy_set_header X-Forwarded-Proto $scheme;');
  config.push('    }\n');

  // Plausible API proxy
  config.push('    # Plausible analytics API');
  config.push('    location /api/event {');
  config.push('        proxy_pass http://localhost:8000/api/event;');
  config.push('        proxy_buffering on;');
  config.push('        proxy_http_version 1.1;');
  config.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
  config.push('        proxy_set_header X-Forwarded-Proto $scheme;');
  config.push('        proxy_set_header X-Forwarded-Host $host;');
  config.push('    }\n');

  // Main location
  config.push('    # Serve static files with index.html fallback');
  config.push('    location / {');
  config.push('        try_files $uri $uri/ $uri/index.html =404;');
  config.push('    }\n');

  // SSL configuration (placeholder - managed by Certbot)
  config.push('    listen [::]:443 ssl http2 ipv6only=on; # managed by Certbot');
  config.push('    listen 443 ssl http2; # managed by Certbot\n');

  config.push('    ssl_certificate /etc/letsencrypt/live/mezinamiridici.cz/fullchain.pem; # managed by Certbot');
  config.push('    ssl_certificate_key /etc/letsencrypt/live/mezinamiridici.cz/privkey.pem; # managed by Certbot');
  config.push('    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot');
  config.push('    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot');
  config.push('}\n');

  // Redirect mezinamiridici.cz -> www.mezinamiridici.cz (HTTPS)
  config.push('# Redirect mezinamiridici.cz -> www.mezinamiridici.cz');
  config.push('server {');
  config.push('    server_name mezinamiridici.cz;');
  config.push('    return 301 https://www.mezinamiridici.cz$request_uri;\n');

  config.push('    listen [::]:443 ssl http2;');
  config.push('    listen 443 ssl http2;\n');

  config.push('    ssl_certificate /etc/letsencrypt/live/mezinamiridici.cz/fullchain.pem;');
  config.push('    ssl_certificate_key /etc/letsencrypt/live/mezinamiridici.cz/privkey.pem;');
  config.push('    include /etc/letsencrypt/options-ssl-nginx.conf;');
  config.push('    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;');
  config.push('}\n');

  // HTTP -> HTTPS redirect
  config.push('# HTTP -> HTTPS redirect');
  config.push('server {');
  config.push('    listen 80;');
  config.push('    listen [::]:80;');
  config.push('    server_name mezinamiridici.cz www.mezinamiridici.cz;\n');

  config.push('    return 301 https://www.mezinamiridici.cz$request_uri;');
  config.push('}');

  const configPath = path.join(OUTPUT_DIR, 'nginx.conf');
  fsSync.writeFileSync(configPath, config.join('\n'), 'utf8');

  jobLogger.info(`Nginx config generated: ${configPath}`);
  return configPath;
}

// Generate sitemap.xml
function generateSitemap(items) {
  jobLogger.info('Generating sitemap.xml...');

  const urls = [{ loc: WEB_URL, lastmod: dayjs().format('YYYY-MM-DD') }];
  items.forEach((item) => {
    urls.push({
      loc: getAbsoluteUrlForItem(item),
      lastmod: item.info?.date ? dayjs(item.info.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
    });
  });

  const body = urls.map((u) => (
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`
  )).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  const filePath = path.join(OUTPUT_DIR, 'sitemap.xml');
  fsSync.writeFileSync(filePath, xml, 'utf8');
  jobLogger.info(`Sitemap generated: ${filePath}`);
}

// Generate robots.txt
function generateRobotsTxt() {
  jobLogger.info('Generating robots.txt...');

  const content = `User-agent: *\nAllow: /\n\nSitemap: ${WEB_URL}/sitemap.xml\n`;
  const filePath = path.join(OUTPUT_DIR, 'robots.txt');
  fsSync.writeFileSync(filePath, content, 'utf8');
  jobLogger.info(`robots.txt generated: ${filePath}`);
}

// Escape text for inclusion in XML
function escapeXml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate RSS feed (articles and blogs, most recent first)
function generateFeed(items) {
  jobLogger.info('Generating feed.rss...');

  const feedItems = items
    .filter((item) => item.type === 'article' || item.type === 'blog')
    .sort((a, b) => new Date(b.info?.date || 0) - new Date(a.info?.date || 0))
    .slice(0, FEED_ITEM_LIMIT);

  const rssItems = feedItems.map((item) => {
    const url = getAbsoluteUrlForItem(item);
    const pubDate = item.info?.date ? new Date(item.info.date).toUTCString() : new Date().toUTCString();
    return `  <item>\n    <title>${escapeXml(item.info?.caption)}</title>\n    <link>${url}</link>\n    <guid>${url}</guid>\n    <pubDate>${pubDate}</pubDate>\n  </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>Mezi námi řidiči</title>\n  <link>${WEB_URL}</link>\n  <description>Archiv diskuzního fóra o dopravě a řízení v České republice</description>\n  <language>cs</language>\n${rssItems}\n</channel>\n</rss>\n`;

  const filePath = path.join(OUTPUT_DIR, 'feed.rss');
  fsSync.writeFileSync(filePath, rss, 'utf8');
  jobLogger.info(`Feed generated: ${filePath}`);
}

// Main generator function
async function generateStaticSite() {
  jobLogger.info('Starting static site generation...');
  jobLogger.info(`API URL: ${API_BASE_URL}`);
  jobLogger.info(`Output directory: ${OUTPUT_DIR}`);

  const startTime = Date.now();

  // Register Handlebars helpers and partials
  registerHelpers();

  try {
    // Clean output directory (keep images to avoid re-downloading)
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    if (fsSync.existsSync(OUTPUT_DIR)) {
      jobLogger.info('Cleaning output directory (keeping images)...');
      const entries = await fs.readdir(OUTPUT_DIR);
      for (const entry of entries) {
        // Skip images folder to avoid re-downloading
        if (entry === 'images') {
          jobLogger.debug('Skipping images folder');
          continue;
        }
        await fs.rm(path.join(OUTPUT_DIR, entry), { recursive: true, force: true });
      }
    }

    // Fetch all items from API
    const items = await fetchAllItems();

    if (items.length === 0) {
      jobLogger.warn('No items found! Exiting.');
      return;
    }

    // Generate home page (simple list, no featured poll or accidents)
    await generateHomePage(items);

    // Generate individual pages
    jobLogger.info('Generating individual pages...');
    let processed = 0;
    for (const item of items) {
      await generateItemPage(item);
      processed++;
      if (processed % 10 === 0) {
        jobLogger.info(`Processed ${processed}/${items.length} items...`);
      }
    }
    jobLogger.info(`All ${items.length} pages generated`);

    // Copy assets
    await copyAssets();

    // Generate SEO files
    generateSitemap(items);
    generateRobotsTxt();
    generateFeed(items);

    // Generate nginx redirect configuration
    const nginxConfigPath = generateNginxConfig(items);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    jobLogger.info(`✓ Static site generation completed in ${duration}s`);
    jobLogger.info(`✓ Output: ${OUTPUT_DIR}`);
    jobLogger.info(`✓ Nginx config: ${nginxConfigPath}`);

  } catch (error) {
    jobLogger.error('Static site generation failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  generateStaticSite()
    .then(() => {
      console.log('\n✓ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Error:', error.message);
      process.exit(1);
    });
}

exports.generateStaticSite = generateStaticSite;
