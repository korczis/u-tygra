# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for Pivnice U Tygra, a Czech pub in Brno. Built with Zola (Rust-based SSG), Alpine.js for interactivity, and Tailwind CSS via CDN. The site is a single-page application with live beer menu pulled from Google Sheets CSV export.

Primary language is Czech (cs). All UI text, menu items, and business content are in Czech.

## Build & Development Commands

```bash
# Development server (port 1111, hot reload)
zola serve
# or
make dev

# Production build (outputs to public/)
zola build
# or
make build-prod

# Validate links and content structure
zola check

# Run all quality gates (content validation + link check + zola check)
make quality-check
# or
make test

# Clean build artifacts
make clean

# Full pipeline: clean + analyze + quality + build + health report
make full-check
```

Zola must be installed (v0.22.1). No npm/node dependencies -- Tailwind, Alpine.js, and Flowbite are loaded via CDN.

## Architecture

### Single-Page App Pattern

The site is a single Zola page (`content/_index.md`) rendered through `templates/index.html` (extends `templates/base.html`). All sections (hero, beer menu, food menu, private room, contact) are in the one template with Alpine.js handling navigation, scroll tracking, and data fetching.

### Live Data Flow

```
Google Sheets (published CSV) --> Alpine.js fetch in app.js --> liveBeers[] + announcement
```

`static/js/app.js` contains the entire Alpine.js application including:
- CSV parser for Google Sheets data
- Brewery database (20+ breweries with URLs and icon mappings)
- Beer style definitions (8 categories with Czech/English names)
- Full food menu with prices in CZK
- Business hours and beer trivia rotation
- Intersection Observer for scroll-based nav highlighting

### Template Structure

- `templates/base.html` -- HTML shell, meta tags, Schema.org JSON-LD (BarOrPub), CDN imports, GA4 tracking, custom Tailwind theme config (tiger/brew color palettes)
- `templates/index.html` -- All page sections with Alpine.js directives (x-data, x-show, x-for, etc.)
- `templates/shortcodes/note.html`, `warning.html` -- Reusable callout components

### Styling

- Tailwind CSS 3.x via CDN with custom theme in `base.html` (tiger orange #f08c0f, brew brown #958757 palettes)
- `static/css/style.css` -- Custom effects: glass morphism, hero gradients, beer card animations, shimmer loading skeleton, dark map filter, custom scrollbar
- Google Fonts: Inter (300-900 weights)

### Configuration

`zola.toml` holds all business data (address, phones, company info, Google Sheets IDs, GA tracking ID) accessible in templates via `config.extra.*`.

## CI/CD

Two parallel pipelines deploy on push to main:
- **GitHub Actions** (`.github/workflows/pages.yml`): Installs Zola v0.22.1, rewrites base_url for GitHub Pages, runs `zola check` + `zola build`, deploys to GitHub Pages
- **GitLab CI** (`.gitlab-ci.yml`): Alpine container, downloads Zola v0.22.1, runs `zola check` + `zola build`, publishes `public/` artifact

Base URL in `zola.toml` targets GitLab Pages (`https://korczis.gitlab.io/u-tygra`). The GitHub Actions workflow rewrites it at build time.

## Key Files

| File | Purpose |
|------|---------|
| `zola.toml` | Zola config + all business data |
| `templates/index.html` | Main page template (all sections) |
| `templates/base.html` | HTML shell, CDN deps, Schema.org, Tailwind config |
| `static/js/app.js` | Alpine.js app (beer data, menus, brewery DB) |
| `static/css/style.css` | Custom CSS effects beyond Tailwind |
| `content/_index.md` | Home page content (minimal -- template-driven) |
| `Makefile` | Build automation (50+ targets, `make help` for list) |
| `.aiad/manifest.toml` | AIAD ecosystem configuration |

## AIAD Ecosystem

The project uses an AIAD (AI-Augmented Development) framework with:
- Agent configs in `.aiad/agents/` (content-validator, build-orchestrator, google-sheets-sync, docs-analyzer, quality-gate-sentinel)
- Executable commands in `.aiad/commands/`
- Manifest in `.aiad/manifest.toml`
- Documentation system in `docs/` following a modular pattern (core, guides, reference, operations, architecture)

Use `make aiad-status` to see ecosystem overview, `make aiad-agents` to list agents.
