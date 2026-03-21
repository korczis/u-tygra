# Pivnice U Tygra

Static website for **Pivnice U Tygra**, a Czech pub in Brno serving Budvar and craft beers near Luzanky park. Built with Zola, Alpine.js, Tailwind CSS, and Flowbite.

**Live**: [pivniceutygra.cz](https://www.pivniceutygra.cz) (replacing the current static HTML site)

---

## Tech Stack

| Layer | Technology | Version | Delivery |
|-------|-----------|---------|----------|
| SSG | [Zola](https://www.getzola.org) | 0.22.1 | Local binary |
| UI Framework | [Alpine.js](https://alpinejs.dev) | 3.14.3 | CDN |
| CSS | [Tailwind CSS](https://tailwindcss.com) | 3.x | CDN |
| Components | [Flowbite](https://flowbite.com) | 2.5.2 | CDN (CSS only) |
| Analytics | Google Analytics 4 | — | gtag.js |
| Live Data | Google Sheets | — | CSV export |
| Storage | Firebase (planned) | — | Free tier |
| Hosting | GitHub Pages + GitLab Pages | — | Dual deployment |

**No Node.js, npm, or build pipeline** beyond Zola. All frontend dependencies via CDN.

---

## Quick Start

```bash
# Prerequisites: Zola v0.22.1 (https://www.getzola.org/documentation/getting-started/installation/)

# Development server with hot reload
zola serve
# -> http://127.0.0.1:1111

# Production build
zola build
# -> output in public/

# Quality checks
make quality-check    # Content + links + zola check
make test             # Alias for quality-check
make full-check       # clean + analyze + quality + build + health
make help             # List all 50+ Makefile targets
```

---

## Architecture

### Single-Page Application

One Zola page (`content/_index.md`) rendered through `templates/index.html` extending `templates/base.html`. Six sections:

| Section | ID | Content |
|---------|-----|---------|
| Hero | `#home` | Announcement banner, CTAs, quick stats |
| Na cepu | `#na-cepu` | Live beer board from Google Sheets |
| Jidlo | `#jidlo` | Food menu with cold/warm tabs |
| Salonek | `#salonek` | Private room info + gallery |
| Galerie | `#galerie` | Pub interior photos |
| Kontakt | `#kontakt` | Address, hours, phone, Google Maps |

### Live Beer Data Flow

```
Google Sheets (published CSV)
    -> fetch() in app.js
    -> CSVWorkerManager (Web Worker off-thread parsing)
    -> liveBeers[] + announcement
    -> Alpine.js reactive rendering
```

- **Source**: Google Sheets CSV export (configured in `zola.toml` via `sheets_id` / `sheets_gid`)
- **Parsing**: `static/js/csv-worker.js` (Web Worker) with main-thread fallback
- **Columns**: pivovar, nazev, styl, abv, ibu, cena
- **Announcement**: Row 1, columns C-F
- **Max beers**: 12 (hardcoded in worker)
- **Kiosk refresh**: Every 2 minutes

### Key Files

```
templates/
  base.html          # Head, CDN loading, Schema.org, SW registration
  index.html         # All 6 sections with Alpine.js bindings

static/js/
  app.js             # Complete Alpine.js app (~1200 lines)
                     #   - CharlieAnalytics (GA4 events)
                     #   - CSVWorkerManager (Web Worker bridge)
                     #   - breweryUrls/breweryIcons (27 breweries)
                     #   - beerStyles (9 styles), foodItems (12 items)
                     #   - Kiosk mode UI and auto-refresh
  csv-worker.js      # Off-thread CSV parsing
  sw.js              # Service Worker (Cache-First images, Network-First CSV)
  charlie-privacy.js # GDPR consent banner

static/css/
  style.css          # Glass morphism, hero gradients, beer animations, kiosk

zola.toml            # All business data, Google Sheets config, GA4 ID
content/_index.md    # Single page content marker
```

### Configuration (`zola.toml`)

All business data in `[extra]`:

```toml
business_name = "Pivnice U Tygra"
address = "Vrchlickeho sad 1893/3"
phone_bar = "+420 776 140 840"
phone_ops = "+420 777 935 052"
company = "KONOVO s.r.o."
ico = "17846927"
ga_id = "G-FTXJKHH6R0"
opening_hours = "16:00-24:00"
```

---

## Kiosk Mode

Activate with `?kiosk=1` URL parameter. Designed for large TV display in the pub.

```bash
# Chromium kiosk launch
chromium --kiosk --noerrdialogs --disable-translate --disable-infobars \
  --start-fullscreen --window-size=1920,1080 \
  "https://korczis.github.io/u-tygra/?kiosk=1"
```

**Features**:
- Auto-refresh beer data every 2 minutes
- Grid view default
- Hidden navigation and footer
- Optimized for 1920x1080 landscape
- Anti-burn-in pixel shifting
- Wake Lock API (prevents display sleep)
- Self-healing (auto-recovery from errors)

See `.aiad/doctrine/kiosk-fortress.doctrine.md` for full specification.

---

## PWA Support

- `static/site.webmanifest` — Full manifest with shortcuts
- `static/js/sw.js` — Service Worker with offline fallback
- `static/offline.html` — Offline page
- Install prompt after 10 seconds
- Cache strategies: Cache-First (images), Network-First (CSV data)

---

## Deployment

Dual deployment on push to `main`:

### GitHub Pages
`.github/workflows/pages.yml` — Rewrites `base_url` from GitLab to `https://korczis.github.io/u-tygra` via sed at build time.

### GitLab Pages
`.gitlab-ci.yml` — Uses `base_url` from `zola.toml` as-is (`https://korczis.gitlab.io/u-tygra`).

**Important**: If you change `base_url` in `zola.toml`, also update the sed pattern in `.github/workflows/pages.yml`.

---

## Custom Theme

Two Tailwind color palettes defined inline in `base.html`:

| Palette | Base | Usage |
|---------|------|-------|
| `tiger` | `#f08c0f` | Primary accent (orange shades: `tiger-400` to `tiger-600`) |
| `brew` | `#958757` | Backgrounds and text (brown shades: `brew-300` to `brew-950`) |

Dark theme optimized for pub ambience. See `.aiad/doctrine/kiosk-fortress.doctrine.md` for kiosk-specific palette.

---

## AIAD Ecosystem

AI-Augmented Development framework:

```
.aiad/
  manifest.toml          # Project metadata and ecosystem config
  doctrine/              # Governance doctrines (6 files)
    no-mercy-no-doubts   # Zero tolerance for defects
    no-way-back          # Permanent solutions only
    golden-tap           # Content freshness guarantees
    kiosk-fortress       # Display security and UX
    czech-first          # Localization rules
    flowbite-first       # UI component standards
    absorption-strategy  # Technology integration rules
  policies/              # Enforcement policies
  agents/                # AI agent configurations (13 agents)
  commands/              # Executable AIAD commands (16 commands)
  quality-gates.toml     # Quality thresholds
```

Key commands:
```bash
make aiad-status     # Ecosystem overview
make aiad-agents     # List all agents
make quality-check   # Run all quality gates
make test-links      # Full link integrity test
```

---

## Link Testing

```bash
make test-links           # Full: external + internal + data
make test-links-external  # Brewery URLs, CDN, social
make test-links-internal  # Internal paths (needs build)
make test-links-data      # Google Sheets CSV validation
make test-links-offline   # Internal only (no network)
```

---

## Adding a New Brewery

1. Add to `breweryUrls` in `static/js/app.js` (name -> website URL)
2. Add to `breweryIcons` in `static/js/app.js` (name -> icon category)
3. Add URL to `.aiad/commands/test-links` BREWERY_URLS array
4. Run `make test-links-external` to validate

---

## URL Parameters

| Parameter | Effect |
|-----------|--------|
| `?kiosk=1` | Kiosk mode (TV display, no UI chrome, auto-refresh) |

---

## Project Structure

```
u-tygra/
  content/
    _index.md              # Single page content
  templates/
    base.html              # HTML head, CDN, SW, Schema.org
    index.html             # All sections
  static/
    css/style.css          # Custom effects
    js/                    # App, worker, SW, privacy, analytics
    img/                   # Hero, gallery, food, salonek photos
    site.webmanifest       # PWA manifest
    offline.html           # Offline fallback
  sass/                    # SASS source files
  .aiad/                   # AIAD ecosystem
  .claude/                 # Claude Code configuration
  .github/workflows/       # GitHub Pages deployment
  .gitlab-ci.yml           # GitLab Pages deployment
  .githooks/               # Git hooks
  zola.toml                # Zola config + business data
  Makefile                 # 50+ targets
```

---

## License

MIT

## Maintainer

KONOVO s.r.o. (ICO: 17846927)
