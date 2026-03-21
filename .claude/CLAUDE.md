# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for Pivnice U Tygra, a Czech pub in Brno. Built with Zola (Rust-based SSG), Alpine.js for interactivity, and Tailwind CSS via CDN. Single-page application with live beer menu pulled from Google Sheets CSV export.

Primary language is Czech (cs) with proper diacritics. All UI text, menu items, and business content are in Czech.

## Build & Development Commands

```bash
zola serve                # Dev server on port 1111 with hot reload
zola build                # Production build to public/
zola check                # Validate links and content structure
make quality-check        # Full quality gates (content + links + zola check)
make test                 # Alias for quality-check
make full-check           # clean + analyze + quality + build + test-links + health report
make clean                # Remove public/, .cache/, .sass-cache/
make help                 # List all 50+ Makefile targets

# Link integrity testing
make test-links           # Full: external URLs + internal paths + data
make test-links-external  # Brewery, CDN, social URLs only
make test-links-internal  # Internal paths in public/ (needs build)
make test-links-data      # Google Sheets CSV data validation
make test-links-offline   # Internal checks only (no network)
```

Requires Zola v0.22.1. No npm/node — Tailwind, Alpine.js, and Flowbite are loaded via CDN.

## Architecture

### Single-Page Structure

One Zola page (`content/_index.md`) rendered through `templates/index.html` -> `templates/base.html`. Sections: hero, beer menu (na-cepu), food menu (jidlo), private room (salonek), gallery (galerie), contact (kontakt). Alpine.js handles navigation, scroll tracking, and data fetching.

### Live Beer Data Flow

```
Google Sheets (published CSV) -> fetch() in app.js -> CSVWorkerManager (Web Worker) -> liveBeers[] + announcement
```

The CSV is fetched client-side from a public Google Sheets export URL. Parsing happens off-main-thread via `static/js/csv-worker.js` with a main-thread fallback. The CSV URL and sheet GID are configured in `zola.toml` under `extra.sheets_id` / `extra.sheets_gid`.

**CSV column mapping** (from Google Sheets): Row 1 columns [2]-[5] form the announcement text. Beer rows use: `pivovar` (brewery), `nazev` (name), `styl` (style ID matching `beerStyles[].id`), `abv`, `cena` (price in CZK).

**CRITICAL**: The `parseCSVFallback()` method in CSVWorkerManager must mirror the parsing logic in `csv-worker.js`. If one changes, update both.

### Key Data in app.js

`static/js/app.js` is the entire Alpine.js application (~1200 lines). It contains:
- `breweryUrls` / `breweryIcons` — lookup tables for 25+ breweries (name -> URL, name -> icon category)
- `beerStyles` — 14 style categories with Czech/English names, colors, ABV/IBU/EBC ranges, pairing, temperature, glass
- `glossary` — 38 beer terms with Czech descriptions, organized by category
- `foodItems` — full food menu with prices in CZK, categorized as `cold` / `warm`
- `didYouKnow` — 14 rotating beer trivia facts (Czech with diacritics)
- `CharlieAnalytics` — GA4 event tracking class (beer views, brewery clicks, style filters, PWA engagement)
- `hours` — opening hours array
- `navItems` — navigation with section metadata (title, description) for dynamic OG tags

When adding a new brewery, update both `breweryUrls` and `breweryIcons` objects in `app.js`, and add the URL to `.aiad/commands/test-links` BREWERY_URLS array.

### URL Parameters

- `?kiosk=1` — activates kiosk mode (full-screen beer board, auto-refresh every 2min, cursor hidden)

### Features

- **Scroll-snap**: CSS `scroll-snap-type: y proximity` on sections for page-like navigation
- **Dynamic OG tags**: Meta tags update per section (og:title, og:description, twitter:*) via `updateSectionMeta()`
- **Bookmarkable URLs**: Hash-based navigation with `history.replaceState`, hashchange listener for back/forward
- **Kiosk mode**: `?kiosk=1` for TV/digital signage display (32" optimized, grid/list toggle, live clock, staleness indicator)
- **Glossary search**: Real-time filter on 38 beer terms
- **Beer style encyclopedia**: 14 styles with expandable detail cards (EBC, serving temp, glass, food pairing)
- **PWA**: Service worker, offline page, install prompt
- **CSVWorkerManager**: Off-main-thread CSV parsing with main-thread fallback

### Styling

Custom Tailwind theme defined inline in `base.html` with two palettes:
- **tiger**: orange shades (`tiger-400`, `tiger-500`, etc.) — primary accent, base #f08c0f
- **brew**: brown shades (`brew-300`, `brew-500`, `brew-950`, etc.) — backgrounds/text, base #958757

`static/css/style.css` has custom effects: glass morphism, hero gradients, beer card animations, shimmer loading skeleton, dark map filter, kiosk mode (TV-optimized with 1920px+ and 3840px+ breakpoints).

### Configuration

`zola.toml` holds all business data accessible in templates via `config.extra.*` — address, phones, company info (ICO, bank account), Google Sheets IDs, GA4 tracking ID.

## Czech Diacritics

All user-facing text MUST use proper Czech diacritics (hacky, carky):
- Domů, Na čepu, Jídlo, Salónek, Kontakt
- Světlý ležák, Tmavý ležák, Pšeničné, Nefiltrované
- Žatecký chmel, Řemeslné pivo

In JavaScript use Unicode escapes when needed: `\u010d` = č, `\u0159` = ř, `\u017e` = ž, `\u0161` = š, etc.

## Dual Deployment

Two parallel pipelines deploy on push to main:
- **GitHub Pages** (`.github/workflows/pages.yml`): sed-rewrites `base_url` from GitLab to `https://korczis.github.io/u-tygra` at build time
- **GitLab Pages** (`.gitlab-ci.yml`): uses `base_url` from `zola.toml` as-is (`https://korczis.gitlab.io/u-tygra`)

**Important**: `base_url` in `zola.toml` targets GitLab Pages. The GitHub workflow rewrites it with `sed`. If you change the URL format in `zola.toml`, also update the sed pattern in `.github/workflows/pages.yml`.

AIAD Quality Gates pipeline (`.github/workflows/aiad-integration.yml`) runs quality checks but does NOT deploy (deployment is handled by `pages.yml`).

## AIAD Ecosystem

The project uses an AIAD (AI-Augmented Development) framework:

### Agents
- **AIAD agents** (`.aiad/agents/`): build-orchestrator, content-validator, docs-analyzer, google-sheets-sync, link-integrity-checker, quality-gate-sentinel
- **Claude Code agents** (`.claude/agents/`): commit-coordinator, deploy-manager, code-reviewer, content-manager, session-tracker

### Commands
- `.aiad/commands/content-analyze` — Content structure analysis
- `.aiad/commands/test-links` — Comprehensive link integrity testing (external + internal + data)

### Quality Gates
- Pre-commit hook (`.githooks/pre-commit`): Zola check, UTF-8 encoding validation, secrets detection
- CI pipeline: Content validation, build, HTML/SEO/a11y checks, link integrity

### Quick Reference
```bash
make aiad-status           # Ecosystem overview
make aiad-agents           # List agents
make aiad-commands         # List commands
```
