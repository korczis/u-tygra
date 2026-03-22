# Pivnice U Tygra

Webova prezentace **Pivnice U Tygra** — ceske hospody v Brne u parku Luzanky. Budvar, remeslna piva, studena i tepla kuchyne, soukromy salonek.

**Live:** [korczis.github.io/u-tygra](https://korczis.github.io/u-tygra) | [korczis.gitlab.io/u-tygra](https://korczis.gitlab.io/u-tygra)

---

## Obsah

- [Technologie](#technologie)
- [Pozadavky](#pozadavky)
- [Instalace a spusteni](#instalace-a-spusteni)
- [Prikazy pro vyvoj](#prikazy-pro-vyvoj)
- [Struktura projektu](#struktura-projektu)
- [Stranky](#stranky)
- [Architektura](#architektura)
- [Ziva nabidka piv](#ziva-nabidka-piv)
- [TV vyveska](#tv-vyveska)
- [Pivni glosar](#pivni-glosar)
- [Admin panel](#admin-panel)
- [Kiosk rezim](#kiosk-rezim)
- [PWA](#pwa)
- [Firebase](#firebase)
- [CI/CD a deployment](#cicd-a-deployment)
- [Quality gates](#quality-gates)
- [SEO](#seo)
- [Performance](#performance)
- [AIAD ekosystem](#aiad-ekosystem)
- [Licence](#licence)
- [Autor](#autor)

---

## Technologie

| Vrstva | Technologie | Verze |
|--------|-------------|-------|
| **SSG** | [Zola](https://www.getzola.org/) (Rust) | 0.22.1 |
| **Sablony** | [Tera](https://keats.github.io/tera/) | bundled se Zolou |
| **JS framework** | [Alpine.js](https://alpinejs.dev/) (CDN) | 3.15.8 |
| **CSS framework** | [Tailwind CSS](https://tailwindcss.com/) (CDN) | 3.x |
| **UI komponenty** | [Flowbite](https://flowbite.com/) (pouze CSS) | 2.5.2 |
| **Fonty** | Inter, Playfair Display (Google Fonts) | — |
| **Ziva data** | Google Sheets (CSV export) | — |
| **Backend** | Firebase (Auth, Firestore, Storage) | — |
| **Analytika** | Google Analytics 4 | G-FTXJKHH6R0 |
| **E2E testy** | [Playwright](https://playwright.dev/) | ^1.58.2 |
| **CI/CD** | GitHub Actions + GitLab CI | — |
| **Hosting** | GitHub Pages + GitLab Pages (dual deploy) | — |
| **PWA** | Service Worker, offline page, install prompt | v9.0.0 |
| **AIAD** | AI-Augmented Development framework | — |

> **Poznamka:** Zadne npm zavislosti v produkci. Tailwind, Alpine.js a Flowbite se nacitaji z CDN. Jedina devDependency je Playwright pro E2E testy.

---

## Pozadavky

### Povinne

- **[Zola](https://www.getzola.org/documentation/getting-started/installation/) 0.22.1+** — Static site generator

#### Instalace Zoly

**macOS** (Homebrew):
```bash
brew install zola
```

**macOS** (MacPorts):
```bash
port install zola
```

**Linux** (Snap):
```bash
snap install --edge zola
```

**Linux** (z release binarky):
```bash
# Stahnout z https://github.com/getzola/zola/releases
# Rozbalit a presunout do /usr/local/bin/
wget https://github.com/getzola/zola/releases/download/v0.22.1/zola-v0.22.1-x86_64-unknown-linux-gnu.tar.gz
tar xzf zola-v0.22.1-x86_64-unknown-linux-gnu.tar.gz
sudo mv zola /usr/local/bin/
```

**Windows** (Scoop):
```bash
scoop install zola
```

**Windows** (Chocolatey):
```bash
choco install zola
```

**Cargo** (kompilace ze zdrojoveho kodu):
```bash
cargo install zola --locked
```

### Volitelne

| Nastroj | Ucel | Instalace |
|---------|------|-----------|
| **Make** | Build prikazy (50+ targetu) | Soucasti macOS/Linux, Windows: `choco install make` |
| **Node.js 18+** | E2E testy (Playwright) | `brew install node` / [nodejs.org](https://nodejs.org/) |
| **Firebase CLI** | Deploy Firestore rules | `npm install -g firebase-tools` |
| **Git** | Verzovani + hooks | `brew install git` / [git-scm.com](https://git-scm.com/) |

---

## Instalace a spusteni

### 1. Klonovat repozitar

```bash
# Z GitHubu
git clone https://github.com/korczis/u-tygra.git
cd u-tygra

# Nebo z GitLabu
git clone https://gitlab.com/korczis/u-tygra.git
cd u-tygra
```

### 2. Overit instalaci Zoly

```bash
zola --version
# Ocekavany vystup: zola 0.22.1 nebo vyssi
```

### 3. Aktivovat pre-commit hooks (doporuceno)

```bash
git config core.hooksPath .githooks
```

### 4. Spustit vyvojovy server

```bash
zola serve
```

Server bezi na **http://127.0.0.1:1111** s hot reload. Zmeny v `content/`, `templates/` a `static/` se automaticky projevuji.

### 5. Overit build

```bash
zola build
```

Vysledek se vygeneruje do `public/`. Production build s minifikaci HTML.

### 6. (Volitelne) Nastavit E2E testy

```bash
npm install              # Nainstaluje Playwright
npx playwright install   # Stahnout browsery (Chromium, Firefox, WebKit)
```

### Rychly start (TL;DR)

```bash
git clone https://github.com/korczis/u-tygra.git
cd u-tygra
zola serve
# Otevrit http://127.0.0.1:1111
```

---

## Prikazy pro vyvoj

### Zakladni prikazy (bez Make)

```bash
zola serve                    # Dev server na portu 1111 s hot reload
zola serve --port 8080        # Vlastni port
zola serve --interface 0.0.0.0  # Pristupne z lokalni site
zola build                    # Production build do public/
zola check                    # Validace odkazu a obsahu
```

### Make prikazy

```bash
# Vyvoj
make dev                      # Alias pro zola serve
make serve                    # Alias pro zola serve
make build                    # Production build
make build-dev                # Build s localhost base URL
make build-staging            # Build se staging URL
make watch                    # Sledovat zmeny

# Quality gates
make test                     # Kompletni quality gates (alias pro quality-check)
make quality-check            # content-validate + zola check + link check
make test-e2e                 # Playwright E2E testy
make test-all                 # quality-check + test-e2e
make full-check               # clean + analyze + quality + build + links + health report

# Integrita odkazu
make test-links               # Vsechny testy odkazu (ext + int + data)
make test-links-external      # Pivovary, CDN, socialni site
make test-links-internal      # Interni cesty v public/ (vyzaduje build)
make test-links-data          # Google Sheets CSV endpoint
make test-links-offline       # Pouze interni (bez site)

# E2E testy
make test-e2e                 # Spustit vsechny Playwright testy
make test-e2e-ui              # Playwright UI rezim
make test-e2e-debug           # Debug rezim s inspektorem

# AIAD
make aiad-status              # Prehled ekosystemu
make aiad-agents              # Seznam agentu
make aiad-commands            # Seznam prikazu
make content-analyze          # Analyza obsahu
make content-sync             # Google Sheets sync

# Deploy a validace
make deploy-status            # Status deploymentu na GitHub/GitLab
make validate                 # Pre-push validace
make push                     # Validate + push na oba remotes

# Udrzba
make clean                    # Smazat public/, .cache/, .sass-cache/
make health-report            # Vygenerovat reports/health-report.md
make backup-content           # Zalohovat content + config
make install                  # Overit nastroje
make version                  # Vypsat verze
make ci                       # CI pipeline: validate + quality + build + report

# Napoveda
make help                     # Vsechny prikazy (50+)
```

---

## Struktura projektu

```
u-tygra/
├── content/                      # Zola obsah (Markdown + TOML frontmatter)
│   ├── _index.md                 # Hlavni stranka
│   ├── glosar/                   # Pivni glosar
│   │   ├── _index.md             # Seznam vsech pojmu
│   │   ├── abv.md                # Jednotlive terminy (99+)
│   │   ├── chmel.md
│   │   └── ...
│   ├── kiosk.md                  # Kiosk rezim (Alpine.js)
│   ├── vyveska.md                # TV vyveska (ES5, zero-dependency)
│   ├── admin.md                  # Admin panel (Firebase)
│   └── ochrana-udaju.md          # GDPR
│
├── templates/                    # Tera sablony
│   ├── base.html                 # Zakladni layout — navbar, footer, meta, CSP
│   ├── index.html                # Hlavni stranka (hero, piva, jidlo, galerie, kontakt)
│   ├── kiosk.html                # Kiosk pro moderni prohlizece
│   ├── vyveska.html              # TV vyveska (ES5, standalone, neextenduje base)
│   ├── admin.html                # Admin panel
│   ├── privacy.html              # GDPR ochrana udaju
│   ├── 404.html                  # Chybova stranka
│   └── glosar/
│       ├── list.html             # Prehled pojmu s filtrem
│       └── page.html             # Detail terminu
│
├── static/
│   ├── js/
│   │   ├── app.js                # Hlavni Alpine.js aplikace (~1600 radku)
│   │   ├── admin.js              # Admin panel (Firebase CRUD)
│   │   ├── csv-worker.js         # Web Worker pro CSV parsing
│   │   ├── sw.js                 # Service Worker (cache strategie)
│   │   ├── performance.js        # Core Web Vitals monitoring
│   │   ├── promos.js             # Promocni data
│   │   └── charlie-*.js          # Analytics suite (dashboard, performance, privacy)
│   ├── css/
│   │   └── style.css             # Vlastni styly (71 KB) — kiosk, glosar, efekty, animace
│   ├── img/
│   │   ├── logo.svg              # Logo
│   │   ├── hero-bg.jpg           # Hero pozadi
│   │   ├── brewery-icons.svg     # SVG spritemap pivovaru
│   │   ├── gallery/              # 24 fotek interieru, jidla, exterieru
│   │   ├── favicon-*.png         # Favicony (16, 32, 48, 96px)
│   │   ├── android-chrome-*.png  # PWA ikony (192, 512px)
│   │   ├── apple-touch-icon.png  # iOS ikona
│   │   └── mstile-*.png          # Windows dlazdice
│   ├── site.webmanifest          # PWA manifest
│   ├── offline.html              # Offline fallback stranka
│   ├── robots.txt                # SEO robots
│   └── humans.txt                # Credits
│
├── tests/                        # Playwright E2E testy
│   ├── admin.spec.ts             # Admin panel testy (13 testu)
│   ├── kiosk.spec.ts             # Kiosk rezim testy
│   └── ...
│
├── scripts/
│   └── seed-firebase.mjs         # Firebase seed script (konzolovy import)
│
├── .aiad/                        # AIAD framework
│   ├── manifest.toml             # AIAD konfigurace + doctriny
│   ├── quality-gates.toml        # Quality gates definice
│   ├── agents/                   # 6 TOML agent konfiguraci
│   ├── commands/                 # 5 shell prikazu (test-links, content-analyze, ...)
│   ├── doctrine/                 # 7 doctrine souboru (Czech First, Flowbite First, ...)
│   ├── mycelial/                 # Evolucni tracking
│   └── policies/                 # Enforcement policies
│
├── .claude/                      # Claude Code konfigurace
│   ├── CLAUDE.md                 # Projektove instrukce
│   ├── agents/                   # 5 specializovanych agentu
│   ├── protocols/                # Quality gates protokoly
│   └── AGENT_REGISTRY.md         # Katalog agentu
│
├── .github/workflows/
│   ├── pages.yml                 # Deploy na GitHub Pages
│   └── aiad-integration.yml      # Quality gates pipeline (4 faze, 7 gates)
│
├── .gitlab-ci.yml                # Deploy na GitLab Pages
├── .githooks/pre-commit          # 6-fazovy pre-commit hook
├── firebase.json                 # Firebase project konfigurace
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexy
├── storage.rules                 # Firebase Storage rules
├── zola.toml                     # Zola konfigurace + vsechna business data
├── Makefile                      # 50+ dev prikazu
├── package.json                  # Playwright devDependency
├── playwright.config.ts          # Playwright konfigurace
├── CLAUDE.md -> .claude/CLAUDE.md
└── README.md
```

---

## Stranky

| Route | Sablona | Popis | Technologie |
|-------|---------|-------|-------------|
| `/` | `index.html` | Hlavni stranka — hero, nastenka, jidlo, salonek, galerie, kontakt | Alpine.js + Google Sheets CSV |
| `/glosar/` | `glosar/list.html` | Pivni glosar — 99+ terminu s filtrem podle kategorii | Zola section + Alpine.js filtr |
| `/glosar/{term}/` | `glosar/page.html` | Detail terminu — obsah, tabulky, related links, Schema.org | Zola page + vlastni CSS |
| `/kiosk/` | `kiosk.html` | Kiosk rezim pro moderni prohlizece (TV/digital signage) | Alpine.js + kioskApp() |
| `/vyveska/` | `vyveska.html` | TV vyveska pro stare Smart TV (JVC, Samsung, LG) | Pure ES5, zero dependencies |
| `/admin/` | `admin.html` | Admin panel — fotky, akce, jidlo, nastaveni | Firebase Auth + Firestore |
| `/ochrana-udaju/` | `privacy.html` | Ochrana osobnich udaju (GDPR) | Staticka stranka |

---

## Architektura

### Template block dedicnost (base.html)

Vsechny stranky (krome `vyveska.html`) dedi z `base.html`. Sablona definuje bloky:

```
{% block navbar %}     — Sdileny navbar (Na cepu, Jidlo, Salonek, Glosar, Kontakt)
{% block body %}       — Obsah stranky
{% block footer %}     — Sdileny footer (adresa, odkazy)
{% block app_script %} — app.js (prepinatelne)
{% block preloads %}   — Preload resources
{% block body_tag %}   — Body atributy (x-data, x-cloak)
```

### Override matice

| Stranka | navbar | footer | app_script | body_tag |
|---------|--------|--------|------------|----------|
| index | vlastni (Alpine) | vlastni | app() | `x-data="app()" x-cloak` |
| glosar/list | sdileny | sdileny | skip | `x-data="{ filter: 'all' }"` |
| glosar/page | sdileny | sdileny | skip | plain |
| kiosk | skip | skip | kioskApp() | `x-data="kioskApp()" x-cloak` |
| vyveska | — | — | — | standalone (nededi z base.html) |
| admin | skip | skip | skip (admin.js) | plain |
| privacy | sdileny | sdileny | skip | plain |

### Tailwind tema

Vlastni barvy definovane inline v `base.html`:

- **tiger-\***: oranzove odstiny, zaklad `#f08c0f` — primarni akcent
- **brew-\***: hnede odstiny, zaklad `#958757` — pozadi a text

### CSP (Content Security Policy)

```
script-src:  'self' cdn.tailwindcss.com cdn.jsdelivr.net www.googletagmanager.com www.gstatic.com
connect-src: 'self' docs.google.com *.googleusercontent.com region1.google-analytics.com
frame-src:   'self' www.google.com *.firebaseapp.com
```

---

## Ziva nabidka piv

Nabidka piv se nacita z **Google Sheets** publikovaneho jako CSV:

```
Google Sheets (CSV) ──fetch()──> CSVWorkerManager ──Web Worker──> liveBeers[] + announcement
                                       │
                                       └── fallback: main-thread parseCSVFallback()
```

### Jak to funguje

1. `fetch()` v `app.js` stahne CSV z Google Sheets endpointu
2. `CSVWorkerManager` odesle data do `csv-worker.js` (Web Worker, off-main-thread)
3. Pokud Worker selze, `parseCSVFallback()` parsuje na main threadu
4. Zparsovana data naplni `liveBeers[]` a `announcement` v Alpine.js stavu
5. Auto-refresh: kazdych 90 sekund (kiosk/vyveska)

### CSV format

- **Radek 1, sloupce C–F**: Text oznameni (zobrazi se nad nabidkou)
- **Header radek**: Pivovar, Nazev, Styl, Alk., IBU, Cena
- **Data radky**: Jednotliva piva s atributy
- **Max 12 piv**, deduplikace podle pivovar + nazev

### Editace nabidky

Nabidku editujete primo v Google Sheets. Zmeny se projevi na webu do 90 sekund.

### Pridani noveho pivovaru

Pri pridani noveho pivovaru:
1. Pridat do `breweryUrls` v `app.js` (nazev -> URL)
2. Pridat do `breweryIcons` v `app.js` (nazev -> kategorie ikony)
3. Pridat URL do `.aiad/commands/test-links` pole `BREWERY_URLS`

---

## TV vyveska

Route: `/vyveska/`

Specialni stranka pro zobrazeni na TV v hospode:

- **Zero dependencies** — zadny Alpine.js, zadne ES6+, zadne moduly
- **ES5 kompatibilni** — funguje na starych Smart TV (JVC, Samsung Tizen, LG webOS)
- **Fullscreen** — 100vh, zadny header/footer
- **Auto-refresh** — data se obnovuji kazdych 90 sekund
- **Anti-burn-in** — subtilni 2px posun kazdych 120 sekund (prevence vypaleni displeje)
- **Adaptivni fonty** — velikost se prizpusobi poctu piv a rozliseni TV
- **Standalone** — neextenduje `base.html`, kompletne samostatna sablona

### Pouziti na TV

```
https://korczis.github.io/u-tygra/vyveska/
```

Otevrit v prohlizeci Smart TV a nastavit jako domovskou stranku.

---

## Pivni glosar

99+ terminu ve 7 kategoriich:

| Kategorie | Priklady | Pocet |
|-----------|----------|-------|
| **Zaklady** | ABV, IBU, EBC, Stupnovitost | ~4 |
| **Suroviny** | Chmel, Slad, Kvasnice, Voda | ~4 |
| **Vyroba** | Kvaseni, Mladina, Rmuty, Dry Hopping, Zrani | ~20 |
| **Servirovani** | Cep, Snyt, Hladinka, Pena, Teplota | ~6 |
| **Styly** | Pilsner, IPA, NEIPA, Stout, Craft, Session | ~20 |
| **Chmely** | Zatecky (Saaz), Citra, Mosaic, Cascade, Kazbek | ~10 |
| **Kultura** | Parovani, Pivni lazne, Minipivovar | ~5 |

Kazdy termin ma:
- Vlastni URL (`/glosar/abv/`, `/glosar/chmel/`)
- Detailni obsah s tabulkami a historickym kontextem
- Cross-reference linky na souvisejici pojmy (186 inline linku)
- OG/Twitter meta tagy pro sdileni
- Schema.org structured data (DefinedTerm + BreadcrumbList)

---

## Admin panel

Route: `/admin/`

Firebase-based admin rozhrani pro spravu obsahu:

### Funkce

| Zalozka | Popis | Hash route |
|---------|-------|------------|
| **Fotografie** | Upload, kategorizace, mazani | `#photos` |
| **Akce** | CRUD pro udalosti (ziva hudba, degustace, kvizy) | `#events` |
| **Jidelni listek** | Sprava studenych a teplych jidel | `#food` |
| **Nastaveni** | Firebase status, Google Sheets odkaz, kiosk URL | `#settings` |

### Prihlaseni

- **Google Auth** pres Firebase Authentication
- **Lokalni rezim** (localStorage) jako fallback pro vyvoj

### Firebase setup

```bash
# Nainstalovat Firebase CLI
npm install -g firebase-tools

# Prihlasit se
firebase login

# Nasadit pravidla
firebase deploy --only firestore:rules,storage
```

V [Firebase Console](https://console.firebase.google.com/project/u-tygra):
1. Authentication -> Sign-in method -> Google -> Enable
2. Pridat `korczis.github.io` do Authorized domains
3. Pridat `korczis.gitlab.io` do Authorized domains

---

## Kiosk rezim

Route: `/kiosk/` nebo `/?kiosk=1`

Optimalizovany pro TV/digital signage displeje:

- **Fullscreen** pivni tabule, skryty kurzor
- **Auto-refresh** kazdych 2 minuty
- **Zive hodiny** (cesky format, HH:MM)
- **Indikator cerstvosti** (stari dat + offline stav)
- **Grid/list** prepinani zobrazeni
- **Wake Lock API** — zabranuje usypani obrazovky
- **Plny reload** kazdych 6 hodin (cisteni pameti)
- **Error boundary** — zachyti a zaloguje chyby, nikdy nespadne
- **TV breakpointy** — 1920px+ a 3840px+ v `style.css`

---

## PWA

Progressive Web App s plnou offline podporou:

### Manifest (`site.webmanifest`)

- **Nazev**: Pivnice U Tygra
- **Zkraceny nazev**: U Tygra
- **Display**: standalone (s window-controls-overlay fallback)
- **Barvy**: tiger oranzova (`#f08c0f`) + tmava brew (`#2b2219`)
- **Zkratky**: Na cepu, Jidlo, Kontakt, Salonek
- **Ikony**: 16–512px vcetne maskable variant

### Service Worker (`sw.js`)

| Strategie | Pouziti |
|-----------|---------|
| **Cache-first** | Obrazky, fonty, staticke assety |
| **Network-first** | HTML, Google Sheets CSV, GTM |
| **Offline fallback** | `offline.html` + `offline-placeholder.svg` |

- Cache: `u-tygra-v9.0.0`
- Pre-cache: `style.css`, `app.js`, `performance.js`, klicove obrazky
- `skipWaiting()` pro okamzitou aktivaci

---

## Firebase

### Konfigurace

Projekt: `u-tygra`

| Soubor | Ucel |
|--------|------|
| `firebase.json` | Project konfigurace |
| `firestore.rules` | Security rules (public read, auth write) |
| `firestore.indexes.json` | Indexy |
| `storage.rules` | Storage security |

### Firestore kolekce

| Kolekce | Pristup | Popis |
|---------|---------|-------|
| `events` | public read, auth write | Udalosti (hudba, degustace) |
| `food` | public read, auth write | Jidelni listek |
| `photos` | public read, auth write | Fotogalerie |
| `settings` | auth only | Nastaveni aplikace |

### Seed data

```bash
# V prohlizeci otevrit /admin/, prihlasit se, pak v konzoli:
# (nebo pouzit scripts/seed-firebase.mjs)
```

### Datovy tok

```
Firebase Firestore ──loadFirebaseData()──> app.js ──> Alpine.js reactive state ──> UI
```

Data z Firestore (akce, jidlo, fotky) prepisuji hardcoded `foodItems`/`drinkItems` pokud jsou k dispozici.

---

## CI/CD a deployment

### Dual deployment

Projekt se automaticky deployuje na **dva** hostingy pri push na `main`:

#### GitHub Pages (`.github/workflows/pages.yml`)

```
push to main -> checkout -> install Zola 0.22.1
             -> sed rewrite base_url (GitLab -> GitHub)
             -> sed rewrite robots.txt
             -> zola check -> zola build
             -> upload artifact -> deploy to GitHub Pages
```

**URL**: `https://korczis.github.io/u-tygra`

#### GitLab Pages (`.gitlab-ci.yml`)

```
push to main -> alpine:3.19 container
             -> download Zola musl binary
             -> zola check -> zola build
             -> artifact: public/
```

**URL**: `https://korczis.gitlab.io/u-tygra`

> **Dulezite:** `base_url` v `zola.toml` cili na GitLab Pages. GitHub workflow ji prepisuje pres `sed` pri buildu. Pokud menite format URL, aktualizujte i sed pattern v `.github/workflows/pages.yml`.

### AIAD Quality Gates (`.github/workflows/aiad-integration.yml`)

4-fazovy pipeline bezici na push a PRs do `main`:

1. **Faze 1**: Content validace (frontmatter, cesky jazyk)
2. **Faze 2**: Build + upload artefaktu (varuje pri >50 MB nebo >30 s)
3. **Faze 3** (paralelni): HTML validace, SEO, pristupnost, integrita odkazu
4. **Faze 4**: Quality summary — 7 gates celkem, selhani = blocked

> Quality gates pipeline **nedeployuje** — deployment resi `pages.yml`.

### Git workflow

```bash
# Aktivovat hooks
git config core.hooksPath .githooks

# Conventional commits
git commit -m "feat(beer): add new brewery support"
git commit -m "fix(kiosk): resolve auto-refresh timing"
git commit -m "docs(readme): update installation instructions"

# Dual remote
git remote -v
# origin    git@gitlab.com:korczis/u-tygra.git
# github    git@github.com:korczis/u-tygra.git

# Push na oba
make push    # validate + push na oba remotes
```

---

## Quality gates

### Pre-commit hook (`.githooks/pre-commit`)

6-fazova validace pri kazdem commitu:

| Faze | Kontrola |
|------|----------|
| 1 | **Zola check** — broken links, template errors |
| 2 | **Content encoding** — UTF-8 validace staged .md/.html |
| 3 | **Doctrine** — Flowbite First (zadny Flowbite JS), NMND (zadne TODO/FIXME v JS) |
| 4 | **Security** — zadne hardcoded secrets |
| 5 | **Czech First** — kontrola diakritiky na znamych slovech |
| 6 | **UTF-8 doctrine** — zadne `\uXXXX` Unicode escapes v JS (musi byt raw UTF-8) |

### AIAD doctriny

| Zkratka | Nazev | Popis |
|---------|-------|-------|
| **CF** | Czech First | Veskerý text v cestine s diakritikou |
| **FF** | Flowbite First | Pouze CSS tridy, zadny Flowbite JS |
| **NMND** | No Mercy No Doubts | Zadne TODO/FIXME v kodu |
| **NWB** | No Way Back | Zadne regrese |
| **GT** | Golden Tap | Standard kvality pro pivni data |
| **KF** | Kiosk Fortress | Stabilita kiosk rezimu |
| **AS** | Absorption Strategy | Strategie integrace novych technologii |

---

## SEO

- **104 stranek** s `<title>`, `<meta description>`, OG tags, Twitter Card
- **Schema.org**: BarOrPub, Organization, WebSite, BreadcrumbList, Menu, DefinedTerm
- **`robots.txt`**, **`sitemap.xml`** (generovany Zolou), **`humans.txt`**
- **Canonical URLs**, `lang="cs"`, geo tags (Brno, 49.205, 16.615)
- **Dynamicke OG tagy** — meni se podle sekce na hlavni strance (`updateSectionMeta()`)
- **Bookmarkable URLs** — hash-based navigace s `history.replaceState`
- **Breadcrumbs** na glosarových strankach

---

## Performance

| Optimalizace | Detail |
|-------------|--------|
| **Critical CSS** | Inlined v `<head>` (~3 KB) |
| **Selektivni JS** | `app.js` jen na hlavni strance (65 KB), glosar/admin/kiosk skipuji |
| **Lazy analytics** | Charlie analytics jen kdyz je GA aktivni |
| **Service Worker** | Network-first HTML, cache-first assety |
| **Preconnect** | Fonts, Sheets, Tailwind, jsDelivr |
| **Hero preload** | Jen na hlavni strance |
| **Off-main-thread** | CSV parsing v Web Workeru |
| **Minifikace** | HTML minifikovano Zolou (`minify_html = true`) |

---

## AIAD ekosystem

AI-Augmented Development framework integrovany do projektu.

### Agents (11)

**Claude Code** (`.claude/agents/`):
- `commit-coordinator` — Koordinace atomickych commitu
- `deploy-manager` — Sprava dual deploymentu
- `code-reviewer` — Review kodu
- `content-manager` — Sprava ceskeho obsahu
- `session-tracker` — Sledovani kontextu session

**AIAD** (`.aiad/agents/`):
- `build-orchestrator` — Orchestrace buildu
- `content-validator` — Validace obsahu
- `docs-analyzer` — Analyza dokumentace
- `google-sheets-sync` — Synchronizace Google Sheets
- `link-integrity-checker` — Kontrola integrity odkazu
- `quality-gate-sentinel` — Strazce quality gates

### Commands (5)

| Prikaz | Popis |
|--------|-------|
| `content-analyze` | Analyza struktury obsahu |
| `test-links` | Integrita odkazu (pivovary, CDN, data) |
| `validate` | Pre-push validace |
| `dev-check` | Health check vyvojoveho prostredi |
| `deploy-status` | Status deploymentu GitHub/GitLab |

```bash
make aiad-status    # Prehled ekosystemu
make aiad-agents    # Seznam agentu
make aiad-commands  # Seznam prikazu
```

---

## Licence

MIT

---

## Autor

**[Tomas Korcak](https://github.com/korczis)** (korczis)

- GitHub: [github.com/korczis](https://github.com/korczis)
- LinkedIn: [linkedin.com/in/korczis](https://linkedin.com/in/korczis)
- Provozovatel: KONOVO s.r.o., ICO 17846927
