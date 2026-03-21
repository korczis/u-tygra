/**
 * Pivnice U Tygra - Alpine.js Application
 * Integrates with Google Sheets for live beer menu
 * AIAD Standard Library v2.0.0 + Charlie Squad Analytics
 */

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeZjP4HadboLuS8v4KVobNqsKtjaBpBJ8oCuPCC-OjfkCtCWA8N_asuxkedh7QSGhsrXU0JU_bV_Rn/pub?gid=1804527038&single=true&output=csv';

/**
 * Charlie Squad Analytics - Enhanced tracking system
 * Privacy-first analytics with Czech pub industry context
 */
class CharlieAnalytics {
  constructor() {
    this.enabled = typeof gtag === 'function';
    this.sessionData = {
      startTime: Date.now(),
      beerViews: new Map(),
      breweryInteractions: new Map(),
      styleFilters: new Map(),
      userBehavior: [],
      isPWA: window.matchMedia('(display-mode: standalone)').matches
    };

    // Czech pub industry benchmarks
    this.pubBenchmarks = {
      avgSessionDuration: 180000, // 3 minutes
      avgBeerViews: 6,
      popularStyles: ['svetlylezak', 'ipa', 'tmavylezak'],
      peakHours: [17, 18, 19, 20, 21]
    };
  }

  /**
   * Track beer interaction events
   */
  trackBeerView(beer) {
    if (!this.enabled) return;

    const beerKey = `${beer.pivovar}-${beer.nazev}`;
    const currentCount = this.sessionData.beerViews.get(beerKey) || 0;
    this.sessionData.beerViews.set(beerKey, currentCount + 1);

    gtag('event', 'beer_view', {
      event_category: 'beer_interaction',
      beer_name: sanitizeText(beer.nazev || 'Unknown'),
      brewery: sanitizeText(beer.pivovar || 'Unknown'),
      beer_style: sanitizeText(beer.styl || 'Unknown'),
      beer_abv: sanitizeText(beer.abv || ''),
      beer_price: beer.cena || 0,
      view_count: currentCount + 1,
      custom_parameters: {
        czech_style_category: this.getCzechStyleCategory(beer.styl),
        price_tier: this.getPriceTier(beer.cena),
        brewery_type: this.getBreweryType(beer.pivovar)
      }
    });

    this.recordBehavior('beer_view', { beer: beerKey, timestamp: Date.now() });
  }

  /**
   * Track brewery interactions
   */
  trackBreweryClick(breweryName, breweryUrl) {
    if (!this.enabled) return;

    const currentCount = this.sessionData.breweryInteractions.get(breweryName) || 0;
    this.sessionData.breweryInteractions.set(breweryName, currentCount + 1);

    gtag('event', 'brewery_click', {
      event_category: 'engagement',
      brewery_name: sanitizeText(breweryName),
      brewery_url: breweryUrl,
      interaction_count: currentCount + 1,
      custom_parameters: {
        brewery_type: this.getBreweryType(breweryName),
        has_website: !!breweryUrl
      }
    });

    this.recordBehavior('brewery_click', { brewery: breweryName, timestamp: Date.now() });
  }

  /**
   * Track beer style filtering
   */
  trackStyleFilter(styleId, styleName) {
    if (!this.enabled) return;

    const currentCount = this.sessionData.styleFilters.get(styleId) || 0;
    this.sessionData.styleFilters.set(styleId, currentCount + 1);

    gtag('event', 'style_filter', {
      event_category: 'beer_discovery',
      style_id: styleId,
      style_name: sanitizeText(styleName),
      filter_count: currentCount + 1,
      custom_parameters: {
        is_czech_traditional: this.isCzechTraditionalStyle(styleId),
        is_craft_style: this.isCraftStyle(styleId)
      }
    });

    this.recordBehavior('style_filter', { style: styleId, timestamp: Date.now() });
  }

  /**
   * Track menu navigation patterns
   */
  trackMenuNavigation(section, method = 'click') {
    if (!this.enabled) return;

    gtag('event', 'menu_navigation', {
      event_category: 'navigation',
      section: section,
      method: method, // 'click', 'scroll', 'swipe'
      custom_parameters: {
        is_main_menu: ['na-cepu', 'jidlo'].includes(section),
        user_journey_step: this.getUserJourneyStep()
      }
    });

    this.recordBehavior('navigation', { section, method, timestamp: Date.now() });
  }

  /**
   * Track food menu interactions
   */
  trackFoodInteraction(action, itemName, category, price) {
    if (!this.enabled) return;

    gtag('event', 'food_interaction', {
      event_category: 'menu_engagement',
      action: action, // 'view', 'category_switch', 'item_focus'
      item_name: sanitizeText(itemName || ''),
      food_category: category,
      item_price: price || 0,
      custom_parameters: {
        price_tier: this.getFoodPriceTier(price),
        czech_cuisine: this.isCzechCuisine(itemName)
      }
    });

    this.recordBehavior('food_interaction', { action, item: itemName, timestamp: Date.now() });
  }

  /**
   * Track PWA engagement metrics
   */
  trackPWAEngagement(action, details = {}) {
    if (!this.enabled) return;

    gtag('event', 'pwa_engagement', {
      event_category: 'pwa',
      pwa_action: action, // 'install_prompt', 'install_success', 'offline_usage', 'update_available'
      is_pwa_active: this.sessionData.isPWA,
      custom_parameters: {
        session_duration: Date.now() - this.sessionData.startTime,
        ...details
      }
    });
  }

  /**
   * Track reservation intent
   */
  trackReservationIntent(action, details = {}) {
    if (!this.enabled) return;

    gtag('event', 'reservation_intent', {
      event_category: 'conversion',
      intent_action: action, // 'phone_click', 'salonek_view', 'contact_section_view'
      custom_parameters: {
        user_engagement_level: this.getUserEngagementLevel(),
        session_beer_views: this.sessionData.beerViews.size,
        time_to_intent: Date.now() - this.sessionData.startTime,
        ...details
      }
    });

    this.recordBehavior('reservation_intent', { action, timestamp: Date.now() });
  }

  /**
   * Generate session analytics summary
   */
  generateSessionSummary() {
    const sessionDuration = Date.now() - this.sessionData.startTime;
    const totalBeerViews = Array.from(this.sessionData.beerViews.values()).reduce((a, b) => a + b, 0);
    const uniqueBeersViewed = this.sessionData.beerViews.size;
    const uniqueBreweriesViewed = this.sessionData.breweryInteractions.size;

    return {
      duration: sessionDuration,
      beerViews: {
        total: totalBeerViews,
        unique: uniqueBeersViewed,
        avgViewsPerBeer: uniqueBeersViewed ? totalBeerViews / uniqueBeersViewed : 0
      },
      breweryEngagement: uniqueBreweriesViewed,
      styleFilters: this.sessionData.styleFilters.size,
      engagementLevel: this.getUserEngagementLevel(),
      benchmarkComparison: {
        durationVsBenchmark: sessionDuration / this.pubBenchmarks.avgSessionDuration,
        viewsVsBenchmark: totalBeerViews / this.pubBenchmarks.avgBeerViews
      },
      isPWA: this.sessionData.isPWA
    };
  }

  /**
   * Track session end with comprehensive summary
   */
  trackSessionEnd() {
    if (!this.enabled) return;

    const summary = this.generateSessionSummary();

    gtag('event', 'session_summary', {
      event_category: 'engagement_summary',
      session_duration: summary.duration,
      total_beer_views: summary.beerViews.total,
      unique_beers_viewed: summary.beerViews.unique,
      brewery_interactions: summary.breweryEngagement,
      style_filters_used: summary.styleFilters,
      engagement_level: summary.engagementLevel,
      custom_parameters: {
        duration_vs_benchmark: summary.benchmarkComparison.durationVsBenchmark,
        views_vs_benchmark: summary.benchmarkComparison.viewsVsBenchmark,
        is_pwa_session: summary.isPWA,
        behavior_pattern: this.analyzeBehaviorPattern()
      }
    });
  }

  // Helper methods for analytics categorization

  getCzechStyleCategory(style) {
    if (!style) return 'unknown';
    const s = style.toLowerCase();
    if (s.includes('lezak') || s.includes('pilsner')) return 'traditional_czech';
    if (s.includes('ipa') || s.includes('ale')) return 'craft_international';
    if (s.includes('psenicne') || s.includes('wheat')) return 'wheat_specialty';
    if (s.includes('tmavy') || s.includes('dark')) return 'dark_traditional';
    return 'specialty';
  }

  getPriceTier(price) {
    if (!price) return 'unknown';
    if (price <= 45) return 'budget';
    if (price <= 65) return 'standard';
    if (price <= 85) return 'premium';
    return 'luxury';
  }

  getFoodPriceTier(price) {
    if (!price) return 'unknown';
    if (price <= 80) return 'snack';
    if (price <= 120) return 'standard';
    if (price <= 160) return 'premium';
    return 'specialty';
  }

  getBreweryType(brewery) {
    if (!brewery) return 'unknown';
    const b = brewery.toLowerCase();
    if (b.includes('budvar') || b.includes('pilsner') || b.includes('staropramen')) return 'major_czech';
    if (b.includes('pivovar') || b.includes('brewery')) return 'craft_brewery';
    if (b.includes('chotebor') || b.includes('tisnov') || b.includes('mazak')) return 'regional_czech';
    return 'international';
  }

  isCzechTraditionalStyle(styleId) {
    return ['svetlylezak', 'tmavylezak', 'nefiltr'].includes(styleId);
  }

  isCraftStyle(styleId) {
    return ['ipa', 'ale', 'sour', 'stout'].includes(styleId);
  }

  isCzechCuisine(itemName) {
    if (!itemName) return false;
    const item = itemName.toLowerCase();
    return item.includes('hermelin') || item.includes('utopenec') || item.includes('tatarek') ||
           item.includes('skvarkova') || item.includes('topinky') || item.includes('klobasa');
  }

  getUserEngagementLevel() {
    const totalViews = Array.from(this.sessionData.beerViews.values()).reduce((a, b) => a + b, 0);
    const sessionDuration = Date.now() - this.sessionData.startTime;

    if (totalViews >= 10 && sessionDuration > 300000) return 'high';
    if (totalViews >= 5 && sessionDuration > 120000) return 'medium';
    if (totalViews >= 2 || sessionDuration > 60000) return 'low';
    return 'minimal';
  }

  getUserJourneyStep() {
    const behaviors = this.sessionData.userBehavior;
    if (behaviors.length === 0) return 'entry';
    if (behaviors.some(b => b.type === 'reservation_intent')) return 'conversion';
    if (behaviors.some(b => b.type === 'beer_view')) return 'exploration';
    return 'browsing';
  }

  analyzeBehaviorPattern() {
    const behaviors = this.sessionData.userBehavior;
    if (behaviors.length < 3) return 'quick_browse';

    const beerViews = behaviors.filter(b => b.type === 'beer_view').length;
    const styleFilters = behaviors.filter(b => b.type === 'style_filter').length;
    const breweryClicks = behaviors.filter(b => b.type === 'brewery_click').length;

    if (styleFilters > 2) return 'style_explorer';
    if (breweryClicks > 2) return 'brewery_researcher';
    if (beerViews > 8) return 'menu_studier';
    return 'general_browser';
  }

  recordBehavior(type, data) {
    this.sessionData.userBehavior.push({ type, data, timestamp: Date.now() });
    // Keep only last 100 behavior events to prevent memory issues
    if (this.sessionData.userBehavior.length > 100) {
      this.sessionData.userBehavior.shift();
    }
  }
}

// Global analytics instance
const charlie = new CharlieAnalytics();

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
 * CSV Worker manager for off-main-thread parsing
 */
class CSVWorkerManager {
  constructor() {
    this.worker = null;
    this.messageId = 0;
    this.pendingCallbacks = new Map();
  }

  async init() {
    if (this.worker) return;

    try {
      // Use pathname from BASE_URL to get relative path for worker
      const basePath = window.BASE_URL ? new URL(window.BASE_URL).pathname.replace(/\/$/, '') : '';
      this.worker = new Worker(`${basePath}/js/csv-worker.js`);
      this.worker.onmessage = (e) => {
        const { id, type, data, error } = e.data;
        const callback = this.pendingCallbacks.get(id);

        if (callback) {
          this.pendingCallbacks.delete(id);
          if (error) {
            callback.reject(new Error(error.message));
          } else {
            callback.resolve(data);
          }
        }
      };
    } catch (err) {
      console.warn('CSV Worker not available, falling back to main thread');
      this.worker = null;
    }
  }

  async parseCSV(csvText) {
    if (!this.worker) {
      // Fallback: parse on main thread (legacy browsers)
      return this.parseCSVFallback(csvText);
    }

    const id = ++this.messageId;
    return new Promise((resolve, reject) => {
      this.pendingCallbacks.set(id, { resolve, reject });
      this.worker.postMessage({ id, type: 'parse-csv', data: csvText });
    });
  }

  parseCSVFallback(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length === 0) return { announcement: '', beers: [] };

    const firstRow = parseCSVLine(lines[0]);
    const announcement = [firstRow[2], firstRow[3], firstRow[4], firstRow[5]]
      .filter(Boolean)
      .join(' ');

    // Find header row
    let headerIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const lower = lines[i].toLowerCase();
      if (lower.includes('pivo') || lower.includes('pivovar') || lower.includes('n\u00e1zev')) {
        headerIdx = i;
        break;
      }
    }

    function normalizeKey(h) {
      const k = h.toLowerCase().trim();
      if (k.includes('pivovar')) return 'pivovar';
      if (k.includes('n\u00e1zev') || k.includes('name')) return 'nazev';
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
}

// Global CSV worker instance
const csvWorker = new CSVWorkerManager();

/**
 * Fetch and parse beer data from Google Sheets (optimized for INP)
 */
async function fetchBeerData() {
  try {
    // Initialize worker on first use
    await csvWorker.init();

    // Fetch CSV data
    const response = await fetch(SHEETS_CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csvText = await response.text();

    // Parse in Web Worker (off main thread)
    const result = await csvWorker.parseCSV(csvText);
    return result;
  } catch (error) {
    console.error('Failed to fetch beer data:', error);
    return { announcement: '', beers: [] };
  }
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

    // PWA state
    showInstallButton: false,
    installPrompt: null,
    isOnline: navigator.onLine,

    // Navigation with section metadata for OG tags
    navItems: [
      { id: 'home', href: '#home', label: 'Dom\u016f', title: 'Pivnice U Tygra', desc: 'Budvar & \u0159emesln\u00e1 piva u Lu\u017e\u00e1nek. Brno.' },
      { id: 'na-cepu', href: '#na-cepu', label: 'Na \u010depu', title: 'Na \u010depu \u2013 Pivnice U Tygra', desc: '\u017div\u00e1 nab\u00eddka \u010depovan\u00fdch piv. Budvar, \u0159emesln\u00e1 piva a speci\u00e1ly.' },
      { id: 'jidlo', href: '#jidlo', label: 'J\u00eddlo', title: 'J\u00eddlo \u2013 Pivnice U Tygra', desc: 'Tradi\u010dn\u00ed \u010desk\u00e9 pochutiny. Chlebíčky, utopen\u00e9, tla\u010denka a dal\u0161\u00ed.' },
      { id: 'salonek', href: '#salonek', label: 'Sal\u00f3nek', title: 'Sal\u00f3nek \u2013 Pivnice U Tygra', desc: 'Soukrom\u00fd sal\u00f3nek pro oslavy a firemn\u00ed akce. Kapacita 20 osob.' },
      { id: 'kontakt', href: '#kontakt', label: 'Kontakt', title: 'Kontakt \u2013 Pivnice U Tygra', desc: 'Vrchlick\u00e9ho sad 1893/3, Brno. Otev\u0159eno denn\u011b 16:00\u201324:00.' },
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

    /**
     * Enhanced beer card interaction with analytics
     */
    onBeerCardClick(beer) {
      charlie.trackBeerView(beer);
      // Additional beer-specific analytics
      if (beer.cena) {
        charlie.recordBehavior('price_consideration', {
          beer: `${beer.pivovar}-${beer.nazev}`,
          price: beer.cena,
          priceReaction: this.classifyPriceReaction(beer.cena)
        });
      }
    },

    /**
     * Track brewery link clicks
     */
    onBreweryClick(breweryName) {
      const url = this.breweryUrl(breweryName);
      charlie.trackBreweryClick(breweryName, url);

      // Track if brewery has website
      if (url) {
        window.open(url, '_blank');
      } else {
        charlie.recordBehavior('brewery_no_website', { brewery: breweryName });
      }
    },

    /**
     * Track beer style filtering
     */
    onStyleFilterClick(styleId) {
      const style = this.beerStyles.find(s => s.id === styleId);
      if (style) {
        charlie.trackStyleFilter(styleId, style.name);
      }
    },

    /**
     * Track food menu interactions
     */
    onFoodTabSwitch(category) {
      const previousTab = this.activeFoodTab;
      this.activeFoodTab = category;

      charlie.trackFoodInteraction('category_switch', '', category, 0);
      charlie.recordBehavior('food_exploration', {
        from: previousTab,
        to: category,
        timestamp: Date.now()
      });
    },

    /**
     * Track food item interactions
     */
    onFoodItemView(item) {
      charlie.trackFoodInteraction('view', item.name, item.cat, item.price);
    },

    /**
     * Track navigation clicks
     */
    onNavClick(section) {
      charlie.trackMenuNavigation(section, 'nav_click');
      this.activeSection = section;
      this.updateSectionMeta(section);
    },

    /**
     * Update OG meta tags and URL hash for current section
     */
    updateSectionMeta(sectionId) {
      const item = this.navItems.find(n => n.id === sectionId);
      if (!item) return;

      // Update URL hash without scrolling
      const newHash = sectionId === 'home' ? '' : '#' + sectionId;
      const newUrl = window.location.pathname + newHash;
      if (window.location.pathname + window.location.hash !== newUrl) {
        history.replaceState(null, '', newUrl);
      }

      // Update document title
      document.title = item.title + ' | ' + (document.querySelector('meta[property="og:site_name"]')?.content || 'Pivnice U Tygra');

      // Update OG meta tags
      const updates = {
        'og:title': item.title,
        'og:description': item.desc,
        'og:url': window.location.href,
        'twitter:title': item.title,
        'twitter:description': item.desc,
        'twitter:url': window.location.href
      };

      for (const [prop, value] of Object.entries(updates)) {
        const isOg = prop.startsWith('og:');
        const selector = isOg ? `meta[property="${prop}"]` : `meta[name="${prop}"]`;
        const meta = document.querySelector(selector);
        if (meta) meta.setAttribute('content', value);
      }

      // Update meta description
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute('content', item.desc);
    },

    /**
     * Track phone/contact interactions for reservation intent
     */
    onPhoneClick(phoneType) {
      charlie.trackReservationIntent('phone_click', {
        phone_type: phoneType,
        section: this.activeSection
      });
    },

    /**
     * Track salonek (private room) interest
     */
    onSalonekView() {
      charlie.trackReservationIntent('salonek_view', {
        time_on_site: Date.now() - charlie.sessionData.startTime,
        beer_views_before_salonek: charlie.sessionData.beerViews.size
      });
    },

    /**
     * Track beer view switching (grid/list)
     */
    onBeerViewToggle(newView) {
      charlie.recordBehavior('view_preference', {
        from: this.beerView,
        to: newView,
        beer_count: this.liveBeers.length
      });
      this.beerView = newView;
    },

    /**
     * Classify price reaction for analytics
     */
    classifyPriceReaction(price) {
      if (price <= 45) return 'budget_friendly';
      if (price <= 65) return 'standard_accepted';
      if (price <= 85) return 'premium_consideration';
      return 'luxury_hesitation';
    },

    /**
     * Track beer facts engagement
     */
    onBeerFactView(factIndex) {
      charlie.recordBehavior('educational_content', {
        fact_index: factIndex,
        fact_text: this.didYouKnow[factIndex].substring(0, 50) + '...',
        section: this.activeSection
      });
    },

    async init() {
      // Initialize Charlie Analytics first
      this.initializeCharlie();

      // Track application start
      charlie.trackMenuNavigation('home', 'app_start');

      // Fetch live beer data first
      await this.refreshBeerData();

      // Kiosk mode setup - create dedicated fullscreen UI
      // See .aiad/doctrine/kiosk-fortress.doctrine.md
      if (this.kioskMode) {
        document.body.classList.add('kiosk-mode');
        document.documentElement.classList.add('kiosk-mode');
        this.createKioskUI();
        this.initKioskFortress();
        charlie.trackPWAEngagement('kiosk_mode_activated');
        // Auto-refresh data every 90 seconds in kiosk mode (GT doctrine: 120s max staleness)
        this._lastDataRefresh = Date.now();
        setInterval(async () => {
          await this.refreshBeerData();
          this._lastDataRefresh = Date.now();
          this.updateKioskUI();
        }, 90000);
        return; // Skip normal initialization in kiosk mode
      }

      // Normal mode - rotate "did you know" facts
      setInterval(() => {
        this.currentFact = (this.currentFact + 1) % this.didYouKnow.length;
      }, 8000);

      // Initialize PWA functionality
      this.setupPWA();
      this.monitorConnectivity();

      // Navigate to hash section on load
      const initialHash = window.location.hash.replace('#', '');
      if (initialHash) {
        const target = document.getElementById(initialHash);
        if (target) {
          setTimeout(() => target.scrollIntoView(), 100);
          this.activeSection = initialHash;
        }
      }

      // Intersection observer for active section tracking with analytics
      const sections = document.querySelectorAll('section[id]');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const previousSection = this.activeSection;
              this.activeSection = entry.target.id;

              // Track section changes with analytics
              if (previousSection !== this.activeSection) {
                charlie.trackMenuNavigation(this.activeSection, 'scroll');
                this.updateSectionMeta(this.activeSection);
              }
            }
          });
        },
        { rootMargin: '-40% 0px -40% 0px' }
      );
      sections.forEach((s) => observer.observe(s));

      // Handle browser back/forward for hash navigation
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash && hash !== this.activeSection) {
          const target = document.getElementById(hash);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });

      // Track session end when user leaves
      window.addEventListener('beforeunload', () => {
        charlie.trackSessionEnd();
      });

      // Track visibility changes (tab switching)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          charlie.trackSessionEnd();
        }
      });
    },

    /**
     * Initialize Charlie Analytics integration
     */
    initializeCharlie() {
      // Set up global Charlie instance if not already done
      window.charlie = charlie;
      console.log('🎯 Charlie Analytics integrated with Alpine.js app');
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
      // Note: announcement is already sanitized by sanitizeText() in CSV parser
      header.innerHTML = `
        <div class="kiosk-header-left">
          <h1 class="kiosk-title">Pivnice U Tygra</h1>
          <div class="kiosk-live">
            <span class="live-dot"></span>
            <span>ŽIVĚ Z ČEPU</span>
          </div>
          ${this.announcement ? `<div class="kiosk-announcement">${this.announcement}</div>` : ''}
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

      // Footer with clock and staleness (static content only, no user input)
      const footer = document.createElement('div');
      footer.className = 'kiosk-footer';

      const footerLeft = document.createElement('div');
      footerLeft.className = 'kiosk-footer-left';
      footerLeft.textContent = 'Pivnice U Tygra \u2022 Brno';

      const footerCenter = document.createElement('div');
      footerCenter.className = 'kiosk-footer-center';
      footerCenter.id = 'kiosk-staleness';
      footerCenter.textContent = 'Aktu\u00e1ln\u00ed';

      const footerRight = document.createElement('div');
      footerRight.className = 'kiosk-footer-right';
      const clock = document.createElement('span');
      clock.className = 'kiosk-clock';
      clock.id = 'kiosk-clock';
      clock.textContent = new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
      footerRight.appendChild(clock);

      footer.appendChild(footerLeft);
      footer.appendChild(footerCenter);
      footer.appendChild(footerRight);
      container.appendChild(footer);

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

    /**
     * Kiosk Fortress - Security, self-healing, and display optimization
     * Per .aiad/doctrine/kiosk-fortress.doctrine.md
     */
    initKioskFortress() {
      // 1. Interaction lockdown
      document.addEventListener('contextmenu', e => e.preventDefault());
      document.addEventListener('selectstart', e => e.preventDefault());
      document.addEventListener('dragstart', e => e.preventDefault());
      document.addEventListener('keydown', e => {
        // Allow F5 for staff manual refresh only
        if (e.key !== 'F5') e.preventDefault();
      });
      document.addEventListener('touchstart', e => {
        if (e.touches.length > 1) e.preventDefault();
      }, { passive: false });

      // 2. Wake Lock API - prevent display sleep
      this._requestWakeLock();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this._requestWakeLock();
      });

      // 3. Anti-burn-in pixel shift (2px every 5 minutes)
      setInterval(() => {
        const shiftX = Math.sin(Date.now() / 300000) * 2;
        const shiftY = Math.cos(Date.now() / 300000) * 2;
        const container = document.getElementById('kiosk-container');
        if (container) container.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
      }, 60000);

      // 4. Clock update every minute
      this._updateKioskClock();
      setInterval(() => this._updateKioskClock(), 60000);

      // 5. Staleness indicator update
      setInterval(() => this._updateStalenessIndicator(), 30000);

      // 6. Memory watchdog - reload if heap exceeds 200MB
      if (performance.memory) {
        setInterval(() => {
          if (performance.memory.usedJSHeapSize > 200 * 1024 * 1024) {
            location.reload();
          }
        }, 60000);
      }

      // 7. Full page reload every 6 hours for memory hygiene
      setTimeout(() => location.reload(), 6 * 60 * 60 * 1000);

      // 8. Global error boundary - log and continue
      window.addEventListener('error', (e) => {
        console.error('Kiosk error caught:', e.message);
      });
      window.addEventListener('unhandledrejection', (e) => {
        console.error('Kiosk promise rejection:', e.reason);
        e.preventDefault();
      });

      // 9. Network monitoring with visual feedback
      window.addEventListener('online', () => this._updateStalenessIndicator());
      window.addEventListener('offline', () => this._updateStalenessIndicator());
    },

    async _requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          this._wakeLock = await navigator.wakeLock.request('screen');
          this._wakeLock.addEventListener('release', () => {
            setTimeout(() => this._requestWakeLock(), 1000);
          });
        }
      } catch (e) {
        // Wake Lock not supported or permission denied
      }
    },

    _updateKioskClock() {
      const el = document.getElementById('kiosk-clock');
      if (el) {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
      }
    },

    _updateStalenessIndicator() {
      const el = document.getElementById('kiosk-staleness');
      if (!el) return;

      if (!navigator.onLine) {
        el.textContent = 'Offline';
        el.className = 'kiosk-staleness offline';
        return;
      }

      const age = Date.now() - (this._lastDataRefresh || Date.now());
      const ageSec = Math.floor(age / 1000);

      if (ageSec < 120) {
        el.textContent = 'Aktualni';
        el.className = 'kiosk-staleness';
      } else {
        const ageMin = Math.floor(ageSec / 60);
        el.textContent = `Pred ${ageMin} min`;
        el.className = 'kiosk-staleness stale';
      }
    },

    async refreshBeerData() {
      try {
        const startTime = Date.now();
        const data = await fetchBeerData();
        const loadTime = Date.now() - startTime;

        this.liveBeers = data.beers;
        this.announcement = data.announcement;
        this.beerLoading = false;

        // Track beer data refresh with analytics
        charlie.recordBehavior('data_refresh', {
          beer_count: data.beers.length,
          load_time: loadTime,
          has_announcement: !!data.announcement,
          refresh_type: this.kioskMode ? 'kiosk_auto' : 'user_triggered'
        });

        // Track beer availability analytics
        if (data.beers.length > 0) {
          charlie.recordBehavior('beer_availability', {
            total_beers: data.beers.length,
            unique_breweries: [...new Set(data.beers.map(b => b.pivovar))].length,
            style_diversity: [...new Set(data.beers.map(b => b.styl))].length,
            price_range: this.calculatePriceRange(data.beers)
          });
        }

        // Update kiosk UI if in kiosk mode
        if (this.kioskMode) {
          this.updateKioskUI();
        }
      } catch (e) {
        console.error('Failed to fetch beer data:', e);
        this.beerError = true;
        this.beerLoading = false;

        // Track data loading errors
        charlie.recordBehavior('data_error', {
          error_type: 'beer_fetch_failed',
          error_message: e.message,
          retry_available: true
        });
      }
    },

    /**
     * Calculate price range for analytics
     */
    calculatePriceRange(beers) {
      const prices = beers.map(b => b.cena).filter(p => p && p > 0);
      if (prices.length === 0) return { min: 0, max: 0, avg: 0 };

      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      };
    },

    /**
     * PWA setup and functionality
     */
    setupPWA() {
      // Set global functions for PWA prompts
      window.showInstallPrompt = (prompt) => {
        this.installPrompt = prompt;
        this.showInstallButton = true;
      };

      window.showUpdateNotification = () => {
        if (confirm('Nová verze aplikace je dostupná. Chcete ji načíst?')) {
          window.location.reload();
        }
      };

      // Check if running as PWA
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('🎉 Running as PWA');
        if (window.gtag) {
          gtag('event', 'pwa_active', {
            event_category: 'engagement'
          });
        }
      }
    },

    /**
     * Install PWA
     */
    async installPWA() {
      if (!this.installPrompt) return;

      const result = await this.installPrompt.prompt();
      console.log('PWA install result:', result.outcome);

      this.installPrompt = null;
      this.showInstallButton = false;

      if (window.gtag) {
        gtag('event', 'pwa_install_clicked', {
          event_category: 'engagement',
          value: result.outcome === 'accepted' ? 1 : 0
        });
      }
    },

    /**
     * Network connectivity monitoring
     */
    monitorConnectivity() {
      const updateOnlineStatus = () => {
        this.isOnline = navigator.onLine;
        console.log('Network status:', this.isOnline ? 'online' : 'offline');
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
    },
  };
}
