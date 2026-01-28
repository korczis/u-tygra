/**
 * Pivnice U Tygra - Alpine.js Application
 * Integrates with Google Sheets for live beer menu
 * AIAD Standard Library v2.0.0
 */

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeZjP4HadboLuS8v4KVobNqsKtjaBpBJ8oCuPCC-OjfkCtCWA8N_asuxkedh7QSGhsrXU0JU_bV_Rn/pub?gid=1804527038&single=true&output=csv';

/**
 * Sanitize text to prevent XSS attacks
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Parse a single CSV line handling quoted fields with XSS protection
 */
function parseCSVLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cells.push(sanitizeText(current));
        current = '';
      } else {
        current += ch;
      }
    }
  }
  cells.push(sanitizeText(current));
  return cells;
}

/**
 * Fetch and parse beer data from Google Sheets
 */
async function fetchBeerData() {
  const response = await fetch(SHEETS_CSV_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  const lines = text.split('\n').filter(l => l.trim());

  if (lines.length === 0) return { announcement: '', beers: [] };

  // First row may contain announcement in columns C-F (index 2-5)
  const firstRow = parseCSVLine(lines[0]);
  const announcement = [firstRow[2], firstRow[3], firstRow[4], firstRow[5]]
    .filter(Boolean)
    .join(' ');

  // Find header row (contains "pivo", "pivovar", or "nazev")
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('pivo') || lower.includes('pivovar') || lower.includes('název')) {
      headerIdx = i;
      break;
    }
  }

  // Normalize header keys
  function normalizeKey(h) {
    const k = h.toLowerCase().trim();
    if (k.includes('pivovar')) return 'pivovar';
    if (k.includes('název') || k.includes('name')) return 'nazev';
    if (k.includes('styl') || k.includes('style')) return 'styl';
    if (k.includes('alk') || k === '%') return 'abv';
    if (k.includes('ibu')) return 'ibu';
    if (k.includes('cena') || k.includes('price')) return 'cena';
    return k;
  }

  const beers = [];
  if (headerIdx >= 0) {
    const rawHeaders = parseCSVLine(lines[headerIdx]);
    const headers = rawHeaders.map(normalizeKey);
    for (let i = headerIdx + 1; i < lines.length && beers.length < 12; i++) {
      const cells = parseCSVLine(lines[i]);
      const breweryIdx = headers.indexOf('pivovar');
      const nameIdx = headers.indexOf('nazev');
      const brewery = breweryIdx >= 0 ? (cells[breweryIdx] || '').trim() : '';
      const name = nameIdx >= 0 ? (cells[nameIdx] || '').trim() : '';
      if (!brewery && !name) continue;

      const beer = {};
      headers.forEach((h, idx) => {
        if (h) beer[h] = (cells[idx] || '').trim();
      });
      beers.push(beer);
    }
  }

  return { announcement, beers };
}

/**
 * Main Alpine.js app component
 */
function app() {
  // Detect kiosk mode from URL param
  const urlParams = new URLSearchParams(window.location.search);
  const isKiosk = urlParams.get('kiosk') === '1' || urlParams.get('kiosk') === 'true';

  return {
    // UI state
    scrolled: false,
    mobileMenu: false,
    activeSection: 'home',
    activeFoodTab: 'cold',
    beerLoading: true,
    beerError: false,
    beerView: 'grid', // Default to grid in kiosk mode for better space usage
    currentFact: 0,
    kioskMode: isKiosk,

    // Live data from Google Sheets
    liveBeers: [],
    announcement: '',

    // Navigation
    navItems: [
      { id: 'home', href: '#home', label: 'Domu' },
      { id: 'na-cepu', href: '#na-cepu', label: 'Na cepu' },
      { id: 'jidlo', href: '#jidlo', label: 'Jidlo' },
      { id: 'salonek', href: '#salonek', label: 'Salonek' },
      { id: 'kontakt', href: '#kontakt', label: 'Kontakt' },
    ],

    // Known brewery URLs
    breweryUrls: {
      'budvar': 'https://www.budvar.cz',
      'budejovicky budvar': 'https://www.budvar.cz',
      'chotebor': 'https://www.pivovar-chotebor.cz',
      'pivovar chotebor': 'https://www.pivovar-chotebor.cz',
      'mazak': 'https://www.pivovarmazak.cz',
      'pivovar mazak': 'https://www.pivovarmazak.cz',
      'tisnov': 'https://www.mestsky-pivovar-tisnov.cz',
      'tišnov': 'https://www.mestsky-pivovar-tisnov.cz',
      'maisel': 'https://www.maisel.com',
      'maisels': 'https://www.maisel.com',
      "maisel's": 'https://www.maisel.com',
      'staropramen': 'https://www.staropramen.cz',
      'pilsner urquell': 'https://www.pilsnerurquell.com',
      'kozel': 'https://www.kozel.cz',
      'bernard': 'https://www.bernard.cz',
      'matuska': 'https://www.pivovarmatuska.cz',
      'clock': 'https://www.clockbrewery.cz',
      'raven': 'https://www.ravenbrewery.cz',
      'krusovice': 'https://www.krusovice.cz',
      'primator': 'https://www.primator.cz',
      'u fleku': 'https://www.ufleku.cz',
      'guinness': 'https://www.guinness.com',
      'hoegaarden': 'https://www.hoegaarden.com',
      'sierra nevada': 'https://www.sierranevada.com',
      'falkon': 'https://www.pivovarfalkon.cz',
      'rohozec': 'https://www.pivovarrohozec.cz',
      'rychtár': 'https://www.rychtar.cz',
      'rychtar': 'https://www.rychtar.cz',
      'dva kohouti': 'https://www.dvakohouti.cz',
    },

    // Brewery icon mapping
    breweryIcons: {
      // Czech traditional breweries
      'budvar': 'czech-traditional',
      'budejovicky budvar': 'czech-traditional',
      'pilsner urquell': 'czech-traditional',
      'staropramen': 'czech-traditional',
      'kozel': 'czech-traditional',
      'krusovice': 'czech-traditional',
      'gambrinus': 'czech-traditional',
      'primator': 'czech-traditional',
      'u fleku': 'historical',

      // Craft/artisanal breweries
      'bernard': 'craft-brewery',
      'matuska': 'craft-brewery',
      'clock': 'craft-brewery',
      'raven': 'craft-brewery',
      'falkon': 'craft-brewery',
      'chotebor': 'craft-brewery',
      'pivovar chotebor': 'craft-brewery',
      'mazak': 'craft-brewery',
      'pivovar mazak': 'craft-brewery',
      'dva kohouti': 'craft-brewery',
      'rohozec': 'craft-brewery',

      // Moravian breweries
      'tisnov': 'moravian',
      'tišnov': 'moravian',
      'rychtár': 'moravian',
      'rychtar': 'moravian',

      // International breweries
      'guinness': 'international',
      'hoegaarden': 'international',
      'sierra nevada': 'international',
      'maisel': 'international',
      'maisels': 'international',
      "maisel's": 'international',
    },

    // Get brewery icon
    breweryIcon(name) {
      if (!name) return 'czech-traditional'; // default
      const n = name.toLowerCase().trim();
      // exact match
      if (this.breweryIcons[n]) return this.breweryIcons[n];
      // partial match
      for (const [key, icon] of Object.entries(this.breweryIcons)) {
        if (n.includes(key) || key.includes(n)) return icon;
      }
      // fallback based on name patterns
      if (n.includes('pivovar') || n.includes('brewery')) return 'craft-brewery';
      if (n.includes('micro')) return 'micro';
      return 'czech-traditional'; // default
    },

    // Resolve brewery name to URL
    breweryUrl(name) {
      if (!name) return '';
      const n = name.toLowerCase().trim();
      // exact match
      if (this.breweryUrls[n]) return this.breweryUrls[n];
      // partial match
      for (const [key, url] of Object.entries(this.breweryUrls)) {
        if (n.includes(key) || key.includes(n)) return url;
      }
      return '';
    },

    // Slugify for anchor links
    slugify(str) {
      if (!str) return '';
      return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '')
        .replace(/^-+|-+$/g, '');
    },

    // "Did you know?" facts
    didYouKnow: [
      'Cesko ma nejvyssi spotrebu piva na osobu na svete — pres 140 litru rocne.',
      'IBU (International Bitterness Units) meri horkost piva. Lezak ma typicky 20-40 IBU.',
      'Plzensky typ piva (Pilsner) vznikl v roce 1842 a zmenil svet pivovarnistvi.',
      'Teplota servirovania ovlivnuje chut — lager 4-7°C, ale 8-12°C, stout 12-14°C.',
      'Pena na pivu neni jen estetika — chroni pred oxidaci a udrzi aroma.',
      'Kvasnice typu Ale kvasí nahore (top-fermenting), Lager dole (bottom-fermenting).',
      'Nejstarsi pivovar na svete je Weihenstephan v Bavorsku, založeny v roce 1040.',
    ],

    // Beer style categories
    beerStyles: [
      {
        id: 'svetlylezak', name: 'Svetly lezak', nameEn: '(Pale Lager)',
        color: '#f7c46d',
        desc: 'Nejrozsirenejsi cesky pivni styl. Spodne kvaseny, svetly, s vyraznou chmelovou horci a cistou sladovou chuti. Zakladni kamen ceske pivni tradice.',
        abv: '4.0–5.5 %', ibu: '25–45', barva: 'Zlata',
        examples: ['Pilsner Urquell', 'Budvar', 'Staropramen']
      },
      {
        id: 'tmavylezak', name: 'Tmavy lezak', nameEn: '(Dark Lager)',
        color: '#6b3a2a',
        desc: 'Spodne kvasene tmavy pivo s karamelovou az prazkovou chuti. Nizsi horkost, plnejsi telo. Casto piti jako dezertni pivo.',
        abv: '3.5–5.5 %', ibu: '18–30', barva: 'Tmave hneda az cerna',
        examples: ['Kozel Cerny', 'Krusovice Cerne', 'U Fleku']
      },
      {
        id: 'ipa', name: 'IPA', nameEn: '(India Pale Ale)',
        color: '#e17209',
        desc: 'Svrchne kvaseny styl s vyraznym chmelovym aromam a horkosti. Puvod v Anglii, dnes popularni ve vsech variantach — American IPA, NEIPA, Session IPA.',
        abv: '5.5–7.5 %', ibu: '40–70', barva: 'Zlata az medova',
        examples: ['Matuska Raptor', 'Clock IPA', 'Falkon IPA']
      },
      {
        id: 'psenicne', name: 'Psenicne pivo', nameEn: '(Wheat Beer)',
        color: '#fad9a5',
        desc: 'Svrchne kvaseny styl s vysokym podilem psenicneho sladu. Typicke bananova a hrebickova chut. Lehke, osvezujici, idealni na leto.',
        abv: '4.5–5.5 %', ibu: '8–15', barva: 'Svetle zlata, zakalene',
        examples: ['Maisel Weisse', 'Hoegaarden', 'Primator Weizen']
      },
      {
        id: 'stout', name: 'Stout', nameEn: '(Stout / Porter)',
        color: '#1a0f06',
        desc: 'Tmavy, plny styl s prichutemi prazenych sladu — cokolada, kava, caramel. Od sucheho irského stoutu az po sladky imperial stout.',
        abv: '4.0–12.0 %', ibu: '25–50', barva: 'Cerna',
        examples: ['Guinness', 'Matuska Black IPA', 'Raven Stout']
      },
      {
        id: 'ale', name: 'Pale Ale', nameEn: '(Pale Ale)',
        color: '#c67a30',
        desc: 'Svrchne kvaseny styl s vyvazenou chmelovou horkosti a ovocnymi tony. Zaklad mnoha modernich remeselnych stylu.',
        abv: '4.5–6.0 %', ibu: '30–50', barva: 'Medova az jantarova',
        examples: ['Sierra Nevada PA', 'Dva Kohouti Pale Ale', 'Clock Pale Ale']
      },
      {
        id: 'sour', name: 'Kyselak', nameEn: '(Sour / Wild Ale)',
        color: '#d4536a',
        desc: 'Piva s vyraznou kyselosti vznikajici spontannim kvasenim nebo pridanim ovoce. Od lehkych Berliner Weisse az po komplexni Lambiky.',
        abv: '3.0–8.0 %', ibu: '3–15', barva: 'Ruzna',
        examples: ['Lindemans', 'Rodenbach', 'Sibeeria Sour']
      },
      {
        id: 'nefiltr', name: 'Nefiltrovanane', nameEn: '(Unfiltered)',
        color: '#c9a858',
        desc: 'Pivo bez konecne filtrace si zachovava vice chuti, aromatu a kvasinkovych esencí. Zakaleny vzhled, plnejsi chut.',
        abv: '4.0–6.0 %', ibu: '20–40', barva: 'Zakalena zlata',
        examples: ['Bernard Nefiltrovany', 'Chotebor Nefiltrovany', 'Rychtár Natur']
      },
      {
        id: 'specialni', name: 'Specialni', nameEn: '(Specialty)',
        color: '#8b6cc5',
        desc: 'Experimentalni a sezonni piva — s pridavkem ovoce, koeni, kvasinkovych kultur, sudove zrani, medove, bylinkova a dalsi.',
        abv: '4.0–14.0 %', ibu: '5–60', barva: 'Ruzna',
        examples: ['Medove pivo', 'Cherry Kriek', 'Barrel Aged Stout']
      },
    ],

    // Glossary of beer terms
    glossary: [
      { term: 'ABV', en: '(Alcohol by Volume)', desc: 'Obsah alkoholu v procentech objemu. Bezny lezak ma 4-5 %, silnejsi styly az 12+ %.' },
      { term: 'IBU', en: '(International Bitterness Units)', desc: 'Mezinarodni jednotka horkosti. Cim vyssi cislo, tim vyssi horkost. Lezak: 25-45, IPA: 40-70+.' },
      { term: 'Stupnovitost', en: '(Original Gravity)', desc: 'Obsah extraktu v mladine pred kvasenim. 10° = desitka, 12° = dvanactka. Vyssi stupen = silnejsi pivo.' },
      { term: 'Chmel', en: '(Hops)', desc: 'Rostlina dodavajici pivu horkost, aroma a konzervacni vlastnosti. Cesky Saaz (Zatec) je svetove prosluly.' },
      { term: 'Slad', en: '(Malt)', desc: 'Nakliceny a ususzeny jecmen (nebo pszenice). Zaklad chuti a barvy piva. Prazene slady daji tmave pivo.' },
      { term: 'Kvaseni', en: '(Fermentation)', desc: 'Proces, pri kterem kvasnice pretvarei cukry na alkohol a CO2. Svrchni (ale) nebo spodni (lager).' },
      { term: 'Mladina', en: '(Wort)', desc: 'Sladky roztok ziskany vylouhovanim sladu ve vode. Zaklad pro kvaseni, ktere z nej udela pivo.' },
      { term: 'Plzen', en: '(Pilsner style)', desc: 'Pivni styl pojmenovany po meste Plzen. Svetly spodne kvaseny lezak s vyraznym chmelem. Svetovy standard.' },
      { term: 'Cep / Na cepu', en: '(On tap / Draft)', desc: 'Pivo tocene z tlakoveho sudu pres vycepni zarizeni. Cerstve a spravne nacarovane — to nejlepsi podani.' },
      { term: 'NEIPA', en: '(New England IPA)', desc: 'Moderni styl IPA s zakalenm vzhledem, nizsí horkosti a intenzivnim ovocnym aromem (tropicke ovoce).' },
      { term: 'Session', en: '', desc: 'Oznaceni pro piva s nizsim obsahem alkoholu (do 4.5 %), urcena pro delsi posezeni bez tezke hlavy.' },
      { term: 'Svrchni kvaseni', en: '(Top-fermentation)', desc: 'Kvaseni pri vyšší teplote (15-24°C). Kvasnice pracuji na povrchu. Typicke pro Ale, Wheat, Stout.' },
      { term: 'Spodni kvaseni', en: '(Bottom-fermentation)', desc: 'Kvaseni pri nizsich teplotach (7-13°C). Kvasnice klesaji ke dnu. Typicke pro Lager, Plzen.' },
      { term: 'EBC', en: '(European Brewery Convention)', desc: 'Stupnice barvy piva. Cislo 4-6 = svetle zlata, 20-30 = jantarova, 60+ = cerna.' },
    ],

    // Food menu
    foodItems: [
      { name: 'Nakladany hermelin', desc: 'V oleji s cibuli, paprikou a korenim', price: 89, weight: '150 g', cat: 'cold' },
      { name: 'Utopenec', desc: 'Klasicky utopeny burt v pikantnim nalevu', price: 69, weight: '1 ks', cat: 'cold' },
      { name: 'Pivni syr (oblozeny)', desc: 'Tvaruzky, hermelin, niva s pecivem', price: 129, weight: '200 g', cat: 'cold' },
      { name: 'Tatarek z lososa', desc: 'S kapary, cervenou cibulkou a topinkami', price: 159, weight: '150 g', cat: 'cold' },
      { name: 'Masova prkenka', desc: 'Mix susenych mas, syru a okurek. Pro dva.', price: 219, weight: '350 g', cat: 'cold' },
      { name: 'Skvarkova pomazanka', desc: 'Domaci, s cerstvym chlebem', price: 79, weight: '150 g', cat: 'cold' },
      { name: 'Topinky s cesnekem', desc: 'Klasika ke kazdemu pivu. Se syrem nebo bez.', price: 69, weight: '3 ks', cat: 'warm' },
      { name: 'Pivni klobasa', desc: 'Grilovana klobasa s horcici a chlebem', price: 99, weight: '200 g', cat: 'warm' },
      { name: 'Smazeny syr v housce', desc: 'Eidam 30%, tatarska omacka', price: 109, weight: '150 g', cat: 'warm' },
      { name: 'Kureci stripsy', desc: 'S cesnekovym dipem a hranolkami', price: 129, weight: '200 g', cat: 'warm' },
      { name: 'Nachos grande', desc: 'Se syrovou omackou, jalapenos a salsou', price: 119, weight: '300 g', cat: 'warm' },
      { name: 'Hovezi burger', desc: 'Domaci bulka, cheddar, slanina, BBQ', price: 179, weight: '250 g', cat: 'warm' },
    ],

    // Opening hours
    hours: [
      { day: 'Pondeli', time: '16:00 – 24:00' },
      { day: 'Utery', time: '16:00 – 24:00' },
      { day: 'Streda', time: '16:00 – 24:00' },
      { day: 'Ctvrtek', time: '16:00 – 24:00' },
      { day: 'Patek', time: '16:00 – 24:00' },
      { day: 'Sobota', time: '16:00 – 24:00' },
      { day: 'Nedele', time: '16:00 – 24:00' },
    ],

    get filteredFood() {
      return this.foodItems.filter(i => i.cat === this.activeFoodTab);
    },

    async init() {
      // Fetch live beer data first
      await this.refreshBeerData();

      // Kiosk mode setup - create dedicated fullscreen UI
      if (this.kioskMode) {
        document.body.classList.add('kiosk-mode');
        document.documentElement.classList.add('kiosk-mode');
        this.createKioskUI();
        // Auto-refresh data every 2 minutes in kiosk mode
        setInterval(async () => {
          await this.refreshBeerData();
          this.updateKioskUI();
        }, 120000);
        return; // Skip normal initialization in kiosk mode
      }

      // Normal mode - rotate "did you know" facts
      setInterval(() => {
        this.currentFact = (this.currentFact + 1) % this.didYouKnow.length;
      }, 8000);

      // Intersection observer for active section tracking
      const sections = document.querySelectorAll('section[id]');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.activeSection = entry.target.id;
            }
          });
        },
        { rootMargin: '-40% 0px -40% 0px' }
      );
      sections.forEach((s) => observer.observe(s));
    },

    kioskView: 'grid', // 'grid' or 'list'

    toggleKioskView() {
      this.kioskView = this.kioskView === 'grid' ? 'list' : 'grid';
      this.updateKioskUI();
    },

    createKioskUI() {
      // Create kiosk container
      const container = document.createElement('div');
      container.id = 'kiosk-container';

      // Header
      const header = document.createElement('div');
      header.className = 'kiosk-header';
      header.innerHTML = `
        <div class="kiosk-header-left">
          <h1 class="kiosk-title">Nástěnka</h1>
          <div class="kiosk-live">
            <span class="live-dot"></span>
            <span>ŽIVĚ Z ČEPU</span>
          </div>
        </div>
        <div class="kiosk-header-right">
          <button id="kiosk-toggle-view" class="kiosk-view-toggle" title="Přepnout zobrazení">
            <svg id="kiosk-icon-grid" class="kiosk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
            <svg id="kiosk-icon-list" class="kiosk-icon" style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
      container.appendChild(header);

      // Content area
      const content = document.createElement('div');
      content.className = 'kiosk-content';
      content.id = 'kiosk-content';
      container.appendChild(content);

      document.body.appendChild(container);

      // Add event listener for toggle
      document.getElementById('kiosk-toggle-view').addEventListener('click', () => {
        this.toggleKioskView();
        const gridIcon = document.getElementById('kiosk-icon-grid');
        const listIcon = document.getElementById('kiosk-icon-list');
        if (this.kioskView === 'grid') {
          gridIcon.style.display = 'block';
          listIcon.style.display = 'none';
        } else {
          gridIcon.style.display = 'none';
          listIcon.style.display = 'block';
        }
      });

      this.updateKioskUI();
    },

    updateKioskUI() {
      const content = document.getElementById('kiosk-content');
      if (!content) return;

      if (this.liveBeers.length === 0) {
        content.innerHTML = `<div class="kiosk-empty">Načítám nabídku...</div>`;
        return;
      }

      if (this.kioskView === 'list') {
        content.innerHTML = `
          <div class="kiosk-list">
            <div class="kiosk-list-header">
              <span class="kiosk-col-name">Název</span>
              <span class="kiosk-col-brewery">Pivovar</span>
              <span class="kiosk-col-style">Styl</span>
              <span class="kiosk-col-abv">Alk.</span>
              <span class="kiosk-col-price">Cena</span>
            </div>
            ${this.liveBeers.map(beer => `
              <div class="kiosk-list-row">
                <span class="kiosk-col-name">${beer.nazev || ''}</span>
                <span class="kiosk-col-brewery">${beer.pivovar || ''}</span>
                <span class="kiosk-col-style">${beer.styl || ''}</span>
                <span class="kiosk-col-abv">${beer.abv || ''}</span>
                <span class="kiosk-col-price">${beer.cena ? beer.cena + ' Kč' : ''}</span>
              </div>
            `).join('')}
          </div>
        `;
        return;
      }

      // Grid view
      content.innerHTML = `
        <div class="kiosk-grid">
          ${this.liveBeers.map(beer => `
            <div class="kiosk-card">
              <div class="kiosk-card-top">
                <h2 class="kiosk-beer-name">${beer.nazev || 'Bez názvu'}</h2>
                <span class="kiosk-price">${beer.cena ? beer.cena + ' Kč' : ''}</span>
              </div>
              <div class="kiosk-brewery">${beer.pivovar || ''}</div>
              <div class="kiosk-card-bottom">
                ${beer.styl ? `<span class="kiosk-style">${beer.styl}</span>` : ''}
                ${beer.abv ? `<span class="kiosk-stats">Alk: ${beer.abv}</span>` : ''}
                ${beer.ibu ? `<span class="kiosk-stats">Hořkost: ${beer.ibu} IBU</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    async refreshBeerData() {
      try {
        const data = await fetchBeerData();
        this.liveBeers = data.beers;
        this.announcement = data.announcement;
        this.beerLoading = false;
      } catch (e) {
        console.error('Failed to fetch beer data:', e);
        this.beerError = true;
        this.beerLoading = false;
      }
    },
  };
}
