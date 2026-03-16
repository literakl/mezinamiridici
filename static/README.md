# Static HTML Archive Generator

This tool generates a complete static HTML archive of the Mezi námi řidiči website, preserving articles, blogs, and polls with their comments.

## Purpose

The Mezi námi řidiči project is being retired. This generator creates a static, archival version that:
- Requires no database or backend to run
- Preserves all historical content (articles, blogs, polls, comments)
- Can be hosted on any static file server
- Reduces hosting costs to nearly zero
- Maintains original URL structure

## What Gets Generated

✅ All published articles, blogs, and polls
✅ All comments (including nested replies)
✅ Comment vote counts (up/down)
✅ Poll voting results with percentages
✅ Article/blog featured images
✅ Original URL structure (preserved exactly)
✅ Meta tags (title, description, Open Graph)
✅ Nginx redirect configuration

## What's NOT Generated

❌ User login/registration
❌ Voting functionality (buttons shown as disabled with results)
❌ Commenting (notice shown that it's archived)
❌ Search functionality
❌ Featured polls or accident statistics
❌ User profile pages

## Structure

```
static/
├── generator.js           # Main generation script
├── package.json          # Dependencies
├── README.md            # This file
├── NGINX_CONFIG.md      # Nginx configuration guide
├── QUICKSTART.md        # Quick start guide
└── templates/           # Handlebars templates
    ├── home.hbs         # Home page (simple list)
    ├── article.hbs      # Article detail
    ├── blog.hbs         # Blog post detail
    ├── poll.hbs         # Poll detail
    └── partials/        # Reusable components
        ├── header.hbs
        ├── footer.hbs
        ├── item-card.hbs
        ├── comment.hbs
        ├── comments-section.hbs
        └── poll-results.hbs
```

## Requirements

- Node.js 16+
- MongoDB connection (to fetch data from live database)
- Backend `.env` file configured with database credentials

## Installation

```bash
cd static
npm install
```

## Usage

### Generate the static site

```bash
node generator.js
```

This will:
1. Connect to the MongoDB database
2. Fetch all published content (articles, blogs, polls)
3. Generate HTML files for each piece of content
4. Copy all assets (images, CSS, icons)
5. Generate nginx redirect configuration
6. Create the output in `../output/` directory

### Preview the generated site

```bash
cd ../output
python -m http.server 8000
# Visit http://localhost:8000
```

### Using npm scripts

```bash
# Generate site
npm run generate

# Serve locally (requires Python)
npm run serve
```

## Output Structure

```
output/
├── index.html                 # Home page (list of all content)
├── nginx-redirects.conf      # Nginx configuration
├── css/
│   └── styles.css           # Custom CSS
├── images/                  # All images and icons
├── clanky/                  # Articles
│   └── {slug}/
│       └── index.html
├── ankety/                  # Polls
│   └── {slug}/
│       └── index.html
├── p/                       # User blogs
│   └── {userId}/
│       └── b/
│           └── {slug}/
│               └── index.html
└── o/                       # Static pages (if any)
    └── {slug}/
        └── index.html
```

## URL Preservation

Original URLs are preserved exactly:

| Content Type | URL Format | Example |
|-------------|-----------|---------|
| Article | `/clanky/{slug}` | `/clanky/mezi-nami-ridici-verze-2312022` |
| Blog | `/p/{userId}/b/{slug}` | `/p/abc123/b/maji-chodi-absolutni-prednost` |
| Poll | `/ankety/{slug}` | `/ankety/odboceni-na-krizovatce` |
| Page | `/o/{slug}` | `/o/o-projektu` |

## Nginx Configuration

The generator automatically creates `output/nginx-redirects.conf` with all necessary redirect rules.

### Simple Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name mezinamiridici.cz;
    root /var/www/mezinamiridici;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

See `NGINX_CONFIG.md` for detailed configuration options.

## Deployment

The generated `output/` directory can be deployed to:

- **Netlify** - Drag & drop (easiest)
- **Vercel** - CLI deployment
- **GitHub Pages** - Free hosting
- **AWS S3 + CloudFront** - Scalable option
- **Any web server** - Just upload files

All of these options are free or very low cost.

## Verification

After generation, verify:

```bash
# Check file count
find ../output -name "index.html" | wc -l

# Check structure
ls -la ../output/

# Test locally
cd ../output && python -m http.server 8000
```

Visit:
- Home: http://localhost:8000/
- Article: http://localhost:8000/clanky/{slug}/
- Poll: http://localhost:8000/ankety/{slug}/
- Blog: http://localhost:8000/p/{userId}/b/{slug}/

## Troubleshooting

**Error: Cannot connect to database**
- Check your `backend/.env` file has `MONGODB_URI` configured
- Verify MongoDB Atlas connection string is correct

**Error: No items found**
- Verify database has published items (`info.state: 'published'`)

**Missing images**
- Ensure `spa/public/images/` directory exists

**CSS not loading**
- Verify `spa/src/assets/styles/custom.scss` exists

## Technical Details

### Data Fetching

Queries MongoDB directly:
- **Items**: Published articles, blogs, polls (`type: article|blog|poll`, `state: published`)
- **Comments**: With vote counts via aggregation
- **Poll votes**: Calculates percentages from vote data

### Templates

Uses Handlebars with:
- Helpers: `formatDate`, `formatDateTime`, `percentage`, `eq`, `gt`
- Partials: Reusable components (header, footer, cards, comments)
- Bootstrap 4.6 CSS from CDN

### Assets

Copies from `spa/public/`:
- `/images/` - All images, icons, uploads
- `favicon.ico`, `robots.txt`, `manifest.json`

CSS copied from `spa/src/assets/styles/custom.scss`

## License

MIT - Same as the main project
