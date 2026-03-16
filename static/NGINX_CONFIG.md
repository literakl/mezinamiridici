# Nginx Configuration for Static Archive

## Overview

The static site generator preserves the original URL structure. URLs work without `.html` extensions by using the `index.html` pattern (e.g., `/clanky/slug/index.html` serves as `/clanky/slug`).

## Automatic Configuration Generation

When you run the generator, it creates `output/nginx-redirects.conf` with rewrite rules for all your content.

## Simple Configuration (Recommended)

This is the easiest and most maintainable approach:

```nginx
server {
    listen 80;
    server_name mezinamiridici.cz;
    root /var/www/mezinamiridici;
    index index.html;

    # Try to serve the file, then directory, then with /index.html, then 404
    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    # Static assets caching
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

## HTTPS Configuration (Production)

Always use HTTPS in production:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name mezinamiridici.cz www.mezinamiridici.cz;
    return 301 https://mezinamiridici.cz$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name www.mezinamiridici.cz;
    return 301 https://mezinamiridici.cz$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mezinamiridici.cz;
    root /var/www/mezinamiridici;
    index index.html;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/mezinamiridici.cz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mezinamiridici.cz/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Content serving
    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    # Static assets with caching
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

## URL Mapping

| Content Type | URL | File Path |
|-------------|-----|-----------|
| Home | `/` | `/index.html` |
| Article | `/clanky/slug` | `/clanky/slug/index.html` |
| Blog | `/p/userId/b/slug` | `/p/userId/b/slug/index.html` |
| Poll | `/ankety/slug` | `/ankety/slug/index.html` |
| Page | `/o/slug` | `/o/slug/index.html` |

## Using Auto-Generated Config

If you prefer explicit rules, include the generated config:

```nginx
server {
    listen 80;
    server_name mezinamiridici.cz;
    root /var/www/mezinamiridici;

    # Include auto-generated redirects
    include /var/www/mezinamiridici/nginx-redirects.conf;

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Testing

After configuring nginx:

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Test URLs
curl -I https://mezinamiridici.cz/
curl -I https://mezinamiridici.cz/clanky/some-article
curl -I https://mezinamiridici.cz/ankety/some-poll
```

All should return `200 OK`.

## Common Issues

### 404 Errors on Content Pages

Check:
- `try_files` directive includes `$uri/index.html`
- File permissions (nginx needs read access)
- `root` directive points to correct path

### CSS/Images Not Loading

Check:
- Static files location block is present
- File paths are correct (check browser console)
- CORS headers if serving from different domain

### Redirect Loops

- Remove conflicting rewrite rules
- Ensure you're not redirecting index.html to itself
- Check for duplicate location blocks
