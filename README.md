# Pivnice U Tygra

Webová prezentace **Pivnice U Tygra** — české hospody v Brně u parku Lužánky. Budvar, řemeslná piva, studená i teplá kuchyně, soukromý salónek.

**Live:** [korczis.github.io/u-tygra](https://korczis.github.io/u-tygra) | [korczis.gitlab.io/u-tygra](https://korczis.gitlab.io/u-tygra)

---

## Technologie

| Vrstva | Technologie |
|--------|-------------|
| **SSG** | [Zola](https://www.getzola.org/) 0.22.1 (Rust) |
| **JS framework** | [Alpine.js](https://alpinejs.dev/) 3.15 (CDN) |
| **CSS** | [Tailwind CSS](https://tailwindcss.com/) 3.x (CDN) + vlastní `style.css` |
| **Komponenty** | [Flowbite](https://flowbite.com/) 2.5 (CSS only) |
| **Data** | Google Sheets CSV (živá nabídka piv) |
| **Backend** | Firebase (admin panel — Auth, Firestore, Storage) |
| **Hosting** | GitHub Pages + GitLab Pages (dual deploy) |
| **PWA** | Service Worker, offline page, install prompt |
| **CI/CD** | GitHub Actions (deploy + quality gates) |
| **AIAD** | AI-Augmented Development framework |

## Struktura projektu

```
u-tygra/
├── content/                  # Zola obsah
│   ├── _index.md             # Hlavní stránka
│   ├── glosar/               # Pivní glosář (99 termínů)
│   │   ├── _index.md         # Seznam všech pojmů
│   │   ├── abv.md            # Jednotlivé termíny
│   │   ├── chmel.md
│   │   └── ...
│   ├── kiosk.md              # Kiosk režim (Alpine.js)
│   ├── vyveska.md            # TV vývěska (ES5, zero-dependency)
│   ├── admin.md              # Admin panel (Firebase)
│   └── ochrana-udaju.md      # GDPR
├── templates/                # Zola šablony (Tera)
│   ├── base.html             # Základ — sdílený navbar, footer, meta
│   ├── index.html            # Hlavní stránka
│   ├── kiosk.html            # Kiosk pro moderní prohlížeče
│   ├── vyveska.html          # TV vývěska (ES5, standalone)
│   ├── admin.html            # Admin panel
│   ├── 404.html              # Chybová stránka
│   └── glosar/               # Glosář šablony
│       ├── list.html          # Přehled pojmů s filtrem
│       └── page.html          # Detail termínu
├── static/
│   ├── js/
│   │   ├── app.js            # Hlavní Alpine.js aplikace (~1600 řádků)
│   │   ├── admin.js          # Admin panel (Firebase CRUD)
│   │   ├── csv-worker.js     # Web Worker pro CSV parsing
│   │   ├── performance.js    # Core Web Vitals monitoring
│   │   ├── sw.js             # Service Worker (cache strategies)
│   │   └── charlie-*.js      # Analytics suite
│   ├── css/style.css         # Vlastní styly (kiosk, glosář, efekty)
│   └── img/                  # Obrázky, favicony, galerie
├── .aiad/                    # AIAD agents & commands
│   ├── agents/               # 6 TOML agent configs
│   ├── commands/             # 5 shell commands
│   └── manifest.toml         # AIAD manifest
├── .claude/                  # Claude Code konfigurace
│   ├── CLAUDE.md             # Projektové instrukce
│   ├── agents/               # 5 Claude Code agents
│   ├── protocols/            # Quality gates
│   └── AGENT_REGISTRY.md     # Katalog agentů
├── .github/workflows/        # CI/CD
│   ├── pages.yml             # Deploy na GitHub Pages
│   └── aiad-integration.yml  # Quality gates pipeline
├── .gitlab-ci.yml            # Deploy na GitLab Pages
├── .githooks/pre-commit      # 6-phase quality gates
├── firebase.json             # Firebase konfigurace
├── firestore.rules           # Firestore security rules
├── storage.rules             # Storage security rules
├── zola.toml                 # Zola konfigurace + business data
├── Makefile                  # 50+ dev příkazů
└── CLAUDE.md -> .claude/CLAUDE.md
```

## Stránky

| Route | Popis | Technologie |
|-------|-------|-------------|
| `/` | Hlavní stránka — hero, nástěnka, jídlo, salónek, galerie, kontakt | Alpine.js + Google Sheets CSV |
| `/glosar/` | Pivní glosář — 99 termínů s filtrem podle kategorií | Zola section + Alpine.js filtr |
| `/glosar/{term}/` | Detail termínu — obsah, tabulky, related links | Zola page + vlastní CSS |
| `/kiosk/` | Kiosk režim pro moderní prohlížeče | Alpine.js + kioskApp() |
| `/vyveska/` | TV vývěska pro staré Smart TV (JVC, Samsung, LG) | Pure ES5, zero dependencies |
| `/admin/` | Admin panel — fotky, akce, jídlo, nastavení | Firebase Auth + Firestore |
| `/ochrana-udaju/` | Ochrana osobních údajů (GDPR) | Statická stránka |

## Živá nabídka piv

Nabídka piv se načítá z **Google Sheets** publikovaného jako CSV:

```
Google Sheets → HTTP CSV → fetch() → parseBeerCSV() → Alpine.js reactivity → UI
```

- **Řádek 1, sloupce C–F**: Announcement text (zobrazí se nad nabídkou)
- **Header řádek**: Pivovar, Název, Styl, Alk., IBU, Cena
- **Data**: Max 12 piv, deduplikace podle pivovar+název
- **Refresh**: Automaticky každých 90 sekund (kiosk/vývěska)
- **Fallback**: Main-thread parser pokud Web Worker selže

### Editace nabídky

Nabídku editujete přímo v Google Sheets. Změny se projeví na webu do 90 sekund.

## TV vývěska (`/vyveska/`)

Speciální stránka pro zobrazení na TV v hospodě:

- **Zero dependencies** — žádný Alpine.js, žádné ES6+, žádné moduly
- **ES5 kompatibilní** — funguje na starých Smart TV (JVC, Samsung Tizen, LG webOS)
- **Fullscreen** — 100vh, žádný header/footer, řádky vyplní celou obrazovku
- **Auto-refresh** — data se obnovují každých 90 sekund
- **Anti-burn-in** — subtilní 2px posun každých 120 sekund
- **Adaptivní fonty** — velikost se přizpůsobí počtu piv a rozlišení TV
- **Čtvercové číslo řádku** — tiger dlaždice s číslem piva
- **Dvouřádkové názvy** — dlouhé názvy se rozdělí, 2. řádek menší

Použití na TV:
```
https://korczis.github.io/u-tygra/vyveska/
```

## Pivní glosář

99 termínů ve 7 kategoriích:

| Kategorie | Počet | Příklady |
|-----------|-------|----------|
| **Základy** | ABV, IBU, EBC, Stupňovitost | 4 |
| **Suroviny** | Chmel, Slad, Kvasnice, Voda | 4 |
| **Výroba** | Kvašení, Mladina, Rmuty, Dry Hopping, Zrání... | ~20 |
| **Servírování** | Čep, Šnyt, Hladinka, Pěna, Teplota | 6 |
| **Styly** | Pilsner, IPA, NEIPA, Stout, Craft, Session... | ~20 |
| **Chmely** | Žatecký (Saaz), Citra, Mosaic, Cascade, Kazbek... | ~10 |
| **Kultura** | Párování, Pivní lázně, Minipivovar... | ~5 |

Každý termín má:
- Vlastní URL (`/glosar/abv/`, `/glosar/chmel/`)
- Detailní obsah s tabulkami a historickým kontextem
- Cross-reference linky na související pojmy (186 inline linků)
- OG/Twitter meta tagy pro sdílení
- Schema.org structured data

## Admin panel (`/admin/`)

Firebase-based admin rozhraní:

- **Přihlášení**: Google Auth (Firebase) nebo lokální režim (localStorage)
- **Fotografie**: Upload, kategorizace, mazání
- **Akce**: CRUD pro události (živá hudba, degustace, kvízy)
- **Jídelní lístek**: Správa studených a teplých jídel
- **Nastavení**: Firebase status, Google Sheets odkaz, kiosk URL
- **Hash routing**: `/admin/#photos`, `/admin/#events`, `/admin/#food`, `/admin/#settings`

### Firebase setup

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```

V [Firebase Console](https://console.firebase.google.com/project/u-tygra):
1. Authentication → Sign-in method → Google → Enable
2. Přidat `korczis.github.io` do Authorized domains

## Vývoj

### Požadavky

- [Zola](https://www.getzola.org/documentation/getting-started/installation/) 0.22.1+

### Příkazy

```bash
# Vývoj
zola serve                    # Dev server na port 1111
zola build                    # Production build do public/
zola check                    # Validace odkazů

# Quality gates
make quality-check            # Kompletní quality gates
make test-links               # Integrita odkazů (ext + int + data)
make full-check               # clean + analyze + quality + build + links

# AIAD
make dev-check                # Dev environment health check
make deploy-status            # GitHub/GitLab deploy status
make validate                 # Pre-push validace
make push                     # Validate + push na oba remotes

# Ostatní
make help                     # Všechny příkazy (50+)
make clean                    # Smazat build artifacts
```

### Pre-commit hooks

6-phase validace (`.githooks/pre-commit`):

1. **Zola check** — broken links, template errors
2. **Content** — UTF-8 encoding validace
3. **Doctrine** — Flowbite First, NMND (no TODO/FIXME)
4. **Security** — no hardcoded secrets
5. **Czech First** — kontrola diakritiky
6. **UTF-8 doctrine** — žádné `\uXXXX` Unicode escapes v JS

### Git workflow

```bash
git config core.hooksPath .githooks   # Aktivovat hooks
```

Conventional commits: `feat(scope): description`

Dual remote:
- `origin` → GitLab (`git@gitlab.com:korczis/u-tygra.git`)
- `github` → GitHub (`git@github.com:korczis/u-tygra.git`)

## Architektura

### Sdílené komponenty (base.html)

```
{% block navbar %}    — Sdílený navbar (Na čepu, Jídlo, Salónek, Glosář, Kontakt)
{% block body %}      — Obsah stránky
{% block footer %}    — Sdílený footer (adresa, odkazy)
{% block app_script %}— app.js (přepínatelné, admin/glosar ho skipují)
{% block preloads %}  — Preload resources (hero image jen na hlavní stránce)
{% block body_tag %}  — Body atributy (x-data, x-cloak)
```

### Stránky a jejich bloky

| Stránka | navbar | footer | app_script | body_tag |
|---------|--------|--------|------------|----------|
| index | vlastní (Alpine) | vlastní | app() | x-data="app()" x-cloak |
| glosar/list | sdílený | sdílený | skip | x-data="{ filter: 'all' }" |
| glosar/page | sdílený | sdílený | skip | plain |
| kiosk | skip | skip | kioskApp() | x-data="kioskApp()" x-cloak |
| vyveska | — | — | — | standalone (ne base.html) |
| admin | skip | skip | skip | plain |

### CSP (Content Security Policy)

```
script-src: 'self' cdn.tailwindcss.com cdn.jsdelivr.net www.googletagmanager.com www.gstatic.com
connect-src: 'self' docs.google.com *.googleusercontent.com region1.google-analytics.com
frame-src: 'self' www.google.com *.firebaseapp.com
```

## SEO

- 104 stránek s `<title>`, `<meta description>`, OG tags, Twitter Card
- Schema.org: BarOrPub, Organization, WebSite, BreadcrumbList, Menu
- `robots.txt`, `sitemap.xml` (generovaný Zolou), `humans.txt`
- Canonical URLs, `lang="cs"`, geo tags
- Breadcrumbs na glosářových stránkách

## Performance

- **Critical CSS** inlined v `<head>` (~3 KB)
- **app.js** načten synchronně jen na hlavní stránce (65 KB)
- **Glosář, admin, kiosk** — skipují app.js
- **Charlie analytics** — lazy-loaded jen když je GA aktivní
- **Service Worker** — network-first pro HTML, cache-first pro assets
- **Preconnect** — fonts, Sheets, Tailwind, jsdelivr
- **Hero image** preloaded jen na hlavní stránce

## AIAD ekosystém

### Agents (11)

**Claude Code** (`.claude/agents/`):
commit-coordinator, deploy-manager, code-reviewer, content-manager, session-tracker

**AIAD** (`.aiad/agents/`):
build-orchestrator, content-validator, docs-analyzer, google-sheets-sync, link-integrity-checker, quality-gate-sentinel

### Commands (5)

| Příkaz | Popis |
|--------|-------|
| `content-analyze` | Analýza struktury obsahu |
| `test-links` | Integrita odkazů (brewery, CDN, data) |
| `validate` | Pre-push validace |
| `dev-check` | Dev environment health |
| `deploy-status` | Deploy status na GitHub/GitLab |

## Licence

MIT

## Autor

**[Tomáš Korčák](https://github.com/korczis)** (korczis)

- GitHub: [github.com/korczis](https://github.com/korczis)
- LinkedIn: [linkedin.com/in/korczis](https://linkedin.com/in/korczis)
- Provozovatel: KONOVO s.r.o., IČO 17846927
