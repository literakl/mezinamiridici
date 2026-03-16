# Quick Start Guide

Generate your static archive in 2 simple steps.

## Krok 1: Spusť backend

```bash
cd backend
npm run dev
```

Backend poběží na http://localhost:3000

## Krok 2: Spusť generátor

V novém terminálu:

```bash
cd static
node generator.js
```

Hotovo! Statický web je ve složce `../output/`

## Preview lokálně

```bash
cd ../output
python -m http.server 8000
```

Otevři http://localhost:8000 v prohlížeči.

## Co dostaneš

- **Domovská stránka** - Jednoduchý seznam všeho obsahu
- **Všechny články** - `/clanky/{slug}/`
- **Všechny blogy** - `/blogy/{slug}/`
- **Všechny ankety** - `/ankety/{slug}/`
- **Všechny komentáře** - Včetně vnořených odpovědí
- **Nginx config** - `nginx-redirects.conf` pro deployment

## Očekávaný výstup

```
✓ Starting static site generation...
✓ API URL: http://localhost:3000
✓ Fetching all published items from API...
✓ Found 150 published items
✓ Generating home page...
✓ Home page generated
✓ Generating individual pages...
✓ Processed 10/150 items...
...
✓ All 150 pages generated
✓ Copying static assets...
✓ Images copied
✓ CSS copied
✓ Assets copied successfully
✓ Generating nginx redirect configuration...
✓ Static site generation completed in 45.32s
```

## Deploy na Netlify (nejjednodušší)

1. Jdi na https://app.netlify.com/drop
2. Přetáhni složku `output/` na stránku
3. Hotovo! Web je živě.

## Deploy s Nginx

Zkopíruj `output/` na server:

```bash
scp -r output/* user@server:/var/www/mezinamiridici/
```

Konfigurace nginx (jednoduchá verze):

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

Viz `NGINX_CONFIG.md` pro kompletní HTTPS konfiguraci.

## Nastavení

Pokud backend běží na jiném portu/URL, nastav v `static/.env`:

```env
API_BASE_URL=http://localhost:3000
# nebo
API_BASE_URL=https://api.mezinamiridici.cz
```

## Řešení problémů

**Backend API není dostupné**
→ Zkontroluj, že backend běží na `http://localhost:3000`

**Žádné položky nenalezeny**
→ Ověř, že databáze má publikované položky (`info.state: 'published'`)

**Chybí obrázky**
→ Ujisti se, že `spa/public/images/` existuje

**CSS se nenačítá**
→ Zkontroluj console v prohlížeči na 404 chyby

## Potřebuješ pomoc?

- Kompletní dokumentace: `README.md`
- Nginx setup: `NGINX_CONFIG.md`
- Jak začít: `START.md`
