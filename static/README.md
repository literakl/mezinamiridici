# Static HTML Archive Generator

Generuje kompletní statickou HTML archivaci webu Mezi námi řidiči (články, blogy,
ankety, stránky, komentáře) z Markdown souborů v `content/` — bez závislosti na
backendu nebo MongoDB.

## Proč

Projekt Mezi námi řidiči je archivován. Generátor vytváří statickou verzi, která:

- nepotřebuje běžící databázi ani backend
- zachovává veškerý historický obsah včetně komentářů
- jde hostovat kdekoliv (Netlify, S3, libovolný webserver)
- zachovává původní strukturu URL

## Struktura

```
static/
├── content/              # Zdroj pravdy - Markdown + YAML frontmatter
│   ├── clanky/           # Články (type: article)
│   ├── blogy/            # Blogy (type: blog)
│   ├── ankety/           # Ankety (type: poll), včetně výsledků hlasování
│   ├── o/                # Statické stránky (type: page)
│   └── comments/         # Komentáře jako JSON, jeden soubor na slug
├── generator.js          # Generuje output/ z content/ (žádná DB)
└── templates/            # Handlebars šablony (home, article, blog, poll, partials)
```

## Formát obsahu

Každý `.md` soubor má YAML-ish frontmatter:

```
---
title: "Název"
slug: "nazev"
author: "Jméno"
authorId: "id"
date: 2022-05-08T12:00:00.000Z
image: "/images/..."
tags: ["tag1", "tag2"]
---

Tělo v Markdownu. Podporuje i syrové HTML (iframe, script, style) -
markdown-it běží s `html: true`, takže embedy (YouTube) i budoucí
vlastní JS widgety (např. simulátor provozu) projdou beze změny.
```

Ankety mají navíc blok `votes:` s počty hlasů (`neutral/trivial/dislike/hate`).

## Používání

### Generovat statický web z `content/`

```bash
cd static
npm install
node generator.js
```

Výstup vznikne v `../output/` (HTML stránky, CSS, obrázky, `sitemap.xml`,
`feed.rss`, `nginx.conf`).

### Přidat/upravit obsah ručně

Stačí editovat/přidat `.md` soubor ve správné složce podle typu a znovu spustit
`node generator.js`. Řazení na homepage je automaticky podle `date` (nejnovější
první).

## Náhled výstupu lokálně

Generátor nezávisí na Pythonu; stačí libovolný statický server, např.:

```bash
npx serve ../output
```

## Nasazení

Obsah `output/` se nahraje na hosting dle configu ve vygenerovaném
`output/nginx.conf` (try_files na `index.html`, cache hlaviček pro statická
aktiva).
