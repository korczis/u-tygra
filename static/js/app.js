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
      { id: 'galerie', href: '#galerie', label: 'Galerie', title: 'Galerie \u2013 Pivnice U Tygra', desc: 'Atmosf\u00e9ra Pivnice U Tygra. Interi\u00e9r, bar, zahr\u00e1dka.' },
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
      '\u010cesko m\u00e1 nejvy\u0161\u0161\u00ed spot\u0159ebu piva na osobu na sv\u011bt\u011b \u2014 p\u0159es 140 litr\u016f ro\u010dn\u011b.',
      'IBU (International Bitterness Units) m\u011b\u0159\u00ed ho\u0159kost piva. Le\u017e\u00e1k m\u00e1 typicky 20\u201340 IBU.',
      'Plze\u0148sk\u00fd typ piva (Pilsner) vznikl v roce 1842 a zm\u011bnil sv\u011bt pivovarnistv\u00ed.',
      'Teplota serv\u00edrov\u00e1n\u00ed ovliv\u0148uje chu\u0165 \u2014 lager 4\u20137\u00b0C, ale 8\u201312\u00b0C, stout 12\u201314\u00b0C.',
      'P\u011bna na pivu nen\u00ed jen estetika \u2014 chr\u00e1n\u00ed p\u0159ed oxidac\u00ed a udr\u017e\u00ed aroma.',
      'Kvasnice typu Ale kvas\u00ed naho\u0159e (top-fermenting), Lager dole (bottom-fermenting).',
      'Nejstar\u0161\u00ed pivovar na sv\u011bt\u011b je Weihenstephan v Bavorsku, zalo\u017een\u00fd v roce 1040.',
      'V \u010cesku se va\u0159\u00ed pivo nep\u0159etr\u017eit\u011b od 993 n. l. \u2014 B\u0159evnovsk\u00fd kl\u00e1\u0161ter.',
      'Chmel \u017dateck\u00fd (Saaz) je pova\u017eov\u00e1n za nejlep\u0161\u00ed aromatick\u00fd chmel na sv\u011bt\u011b.',
      '\u010cesk\u00e1 pivn\u00ed pe\u010de\u0165 chr\u00e1n\u00ed ozna\u010den\u00ed \u201e\u010desk\u00e9 pivo\u201c od roku 2008 v EU.',
      'Stupn\u011b Plato m\u011b\u0159\u00ed hustotu mladiny \u2014 12\u00b0 znamen\u00e1 12 % extraktu p\u0159ed kva\u0161en\u00edm.',
      'Pr\u016fm\u011brn\u00fd \u010cech vypije 6 piv t\u00fddn\u011b. Ned\u011ble je nejm\u00e9n\u011b pivn\u00ed den.',
      'Pivo obsahuje v\u00edce ne\u017e 800 slou\u010denin ovliv\u0148uj\u00edc\u00edch chu\u0165 a v\u016fni.',
      'Dry hopping \u2014 p\u0159id\u00e1n\u00ed chmele za studena \u2014 d\u00e1v\u00e1 aroma bez ho\u0159kosti.',
    ],

    // Beer style encyclopedia (Encyklopedie pivn\u00edch styl\u016f)
    beerStyles: [
      {
        id: 'svetlylezak', name: 'Sv\u011btl\u00fd le\u017e\u00e1k', nameEn: '(Czech Pale Lager)',
        color: '#f7c46d',
        desc: 'Nejroz\u0161\u00ed\u0159en\u011bj\u0161\u00ed \u010desk\u00fd pivn\u00ed styl. Spodn\u011b kva\u0161en\u00fd, sv\u011btl\u00fd, s v\u00fdraznou chmelovou ho\u0159c\u00ed a \u010distou sladovou chut\u00ed. Z\u00e1kladn\u00ed k\u00e1men \u010desk\u00e9 pivn\u00ed tradice. Zr\u00e1n\u00ed minim\u00e1ln\u011b 4\u20136 t\u00fddn\u016f za n\u00edzk\u00fdch teplot.',
        abv: '4.0\u20135.5 %', ibu: '25\u201345', barva: 'Zlat\u00e1', ebc: '6\u201312',
        examples: ['Pilsner Urquell', 'Budvar', 'Staropramen'],
        pairing: 'Sv\u00ed\u010dkov\u00e1, sma\u017een\u00fd s\u00fdr, kuřec\u00ed \u0159\u00edzek',
        temp: '6\u20138 \u00b0C', glass: 'T\u016fzka / P\u016fllitrov\u00e1 sk\u016fra'
      },
      {
        id: 'tmavylezak', name: 'Tmav\u00fd le\u017e\u00e1k', nameEn: '(Czech Dark Lager)',
        color: '#6b3a2a',
        desc: 'Spodn\u011b kva\u0161en\u00e9 tmav\u00e9 pivo s karamelovou a\u017e pra\u017ekovou chut\u00ed. Ni\u017e\u0161\u00ed ho\u0159kost, pln\u011bj\u0161\u00ed t\u011blo. \u010casto pit\u00e9 jako dezertn\u00ed pivo. Barvu d\u00e1vaj\u00ed pra\u017een\u00e9 a karamelizovan\u00e9 slady.',
        abv: '3.5\u20135.5 %', ibu: '18\u201330', barva: 'Tmav\u011b hn\u011bd\u00e1 a\u017e \u010dern\u00e1', ebc: '30\u201360',
        examples: ['Kozel \u010cern\u00fd', 'Kru\u0161ovice \u010cern\u00e9', 'U Flek\u016f'],
        pairing: 'Du\u0161en\u00e9 maso, pe\u010den\u00e1 kachna, \u010dokol\u00e1dov\u00fd dort',
        temp: '8\u201310 \u00b0C', glass: 'T\u016fzka / Goblet'
      },
      {
        id: 'desitka', name: 'V\u00fd\u010depn\u00ed (des\u00edtka)', nameEn: '(Czech Lager 10\u00b0)',
        color: '#e8d48b',
        desc: 'Lehk\u00e9 pivko na ka\u017ed\u00fd den. 10\u00b0 Plato, ni\u017e\u0161\u00ed obsah alkoholu. Osv\u011b\u017euj\u00edc\u00ed, pitelné, ide\u00e1ln\u00ed k del\u0161\u00edmu posezen\u00ed. Z\u00e1klad \u010desk\u00e9 hospodsk\u00e9 kultury.',
        abv: '3.5\u20134.5 %', ibu: '20\u201335', barva: 'Sv\u011btle zlat\u00e1', ebc: '5\u20139',
        examples: ['Gambrinus 10\u00b0', 'Staropramen 10\u00b0', 'Budvar 10\u00b0'],
        pairing: 'Utopenec, tla\u010denka, topinky s \u010desnekem',
        temp: '5\u20137 \u00b0C', glass: 'T\u016fzka / Kriegl'
      },
      {
        id: 'ipa', name: 'IPA', nameEn: '(India Pale Ale)',
        color: '#e17209',
        desc: 'Svrchně kva\u0161en\u00fd styl s v\u00fdrazn\u00fdm chmelov\u00fdm ar\u00f3matem a ho\u0159kost\u00ed. P\u016fvod v Anglii 18. stolet\u00ed. Dnes v mnoha variant\u00e1ch: American IPA (citrusov\u00e9 chmely), West Coast (such\u00e1, ho\u0159k\u00e1), Session IPA (leh\u010d\u00ed verze).',
        abv: '5.5\u20137.5 %', ibu: '40\u201370', barva: 'Zlat\u00e1 a\u017e m\u011bdov\u00e1', ebc: '8\u201318',
        examples: ['Matu\u0161ka Raptor', 'Clock IPA', 'Falkon IPA'],
        pairing: 'Pikantn\u00ed j\u00eddla, burger, curry, nakl\u00e1dan\u00e9 s\u00fdry',
        temp: '8\u201312 \u00b0C', glass: 'IPA sklenice / Tulip'
      },
      {
        id: 'neipa', name: 'NEIPA', nameEn: '(New England IPA)',
        color: '#f5c060',
        desc: 'Zakalené, \u0161\u0165avaté IPA s n\u00edzkou ho\u0159kost\u00ed a intenz\u00edvn\u00edm ovocn\u00fdm ar\u00f3matem (mango, marakuja, broskev). Soft, hedvábné t\u011blo d\u00edky ovesn\u00fdm vlo\u010dk\u00e1m a p\u0161eni\u010dn\u00e9mu sladu. Dry hopping za studena.',
        abv: '5.0\u20138.0 %', ibu: '20\u201350', barva: 'Zakalená zlat\u00e1 a\u017e oran\u017eov\u00e1', ebc: '6\u201314',
        examples: ['Falk\u00f3n Hazy', 'Sibeeria Juicy', 'Clock Haze'],
        pairing: 'Su\u0161i, ceviche, lehk\u00e9 sal\u00e1ty, ovocn\u00e9 dezerty',
        temp: '6\u201310 \u00b0C', glass: 'IPA sklenice / Tulip'
      },
      {
        id: 'psenicne', name: 'P\u0161eni\u010dn\u00e9 pivo', nameEn: '(Wheat Beer / Weizen)',
        color: '#fad9a5',
        desc: 'Svrchn\u011b kva\u0161en\u00fd styl s vysok\u00fdm pod\u00edlem p\u0161eni\u010dn\u00e9ho sladu (50\u201370 %). Typick\u00e1 ban\u00e1nov\u00e1 a h\u0159eb\u00ed\u010dkov\u00e1 chu\u0165 od speci\u00e1ln\u00edch kvasnic. Lehk\u00e9, osv\u011b\u017euj\u00edc\u00ed. Varianty: Hefeweizen (zakalené), Kristallweizen (\u010dir\u00e9), Dunkelweizen (tmav\u00e9).',
        abv: '4.5\u20135.5 %', ibu: '8\u201315', barva: 'Sv\u011btle zlat\u00e1, zakalená', ebc: '4\u201312',
        examples: ['Maisel Weisse', 'Hoegaarden', 'Prim\u00e1tor Weizen'],
        pairing: 'Sal\u00e1ty, ryby, lehk\u00e1 letn\u00ed j\u00eddla, b\u00edl\u00fd sýr',
        temp: '6\u20138 \u00b0C', glass: 'Vysok\u00e1 p\u0161eni\u010dn\u00e1 sklenice (Weizen)'
      },
      {
        id: 'stout', name: 'Stout', nameEn: '(Stout / Porter)',
        color: '#1a0f06',
        desc: 'Tmav\u00fd, pln\u00fd styl s p\u0159\u00edchutěmi pra\u017een\u00fdch slad\u016f \u2014 \u010dokol\u00e1da, k\u00e1va, karamel. Dry Stout (irsk\u00fd, such\u00fd), Sweet Stout (mlé\u010dn\u00fd), Oatmeal Stout (ovesn\u00fd), Imperial Stout (siln\u00fd 8\u201312 %). Porter je historick\u00fd p\u0159edch\u016fdce stoutu.',
        abv: '4.0\u201312.0 %', ibu: '25\u201350', barva: '\u010cern\u00e1', ebc: '60\u201380+',
        examples: ['Guinness', 'Matu\u0161ka Black IPA', 'Raven Stout'],
        pairing: '\u010cokol\u00e1dov\u00fd dort, \u0161krob\u00e1kov\u00fd pud., ústřice, grilované maso',
        temp: '10\u201314 \u00b0C', glass: 'Pint / Tulip / Snifter'
      },
      {
        id: 'ale', name: 'Pale Ale', nameEn: '(Pale Ale / APA)',
        color: '#c67a30',
        desc: 'Svrchn\u011b kva\u0161en\u00fd styl s vyv\u00e1\u017eenou chmelovou ho\u0159kost\u00ed a ovocn\u00fdmi t\u00f3ny. Z\u00e1klad mnoha modern\u00edch \u0159emesln\u00fdch styl\u016f. APA (American PA) pou\u017e\u00edv\u00e1 americké chmely s citrusov\u00fdm a borovicov\u00fdm ar\u00f3matem. English PA je jemn\u011bj\u0161\u00ed, v\u00edce sladov\u00e1.',
        abv: '4.5\u20136.0 %', ibu: '30\u201350', barva: 'M\u011bdov\u00e1 a\u017e jantarov\u00e1', ebc: '8\u201320',
        examples: ['Sierra Nevada PA', 'Dva Kohouti Pale Ale', 'Clock Pale Ale'],
        pairing: 'Burger, pizza, grilovan\u00e9 ku\u0159e, cheddar',
        temp: '8\u201312 \u00b0C', glass: 'Pint / Nonic'
      },
      {
        id: 'sour', name: 'Kyselák', nameEn: '(Sour / Wild Ale)',
        color: '#d4536a',
        desc: 'Piva s v\u00fdraznou kyselost\u00ed. Berliner Weisse (leh\u010d\u00ed, \u010dasto s ovocem), Gose (se sol\u00ed a koriandrem), Lambik (spont\u00e1nn\u00ed kva\u0161en\u00ed, Belgie), Flanders Red (\u010derven\u00fd, octn\u00fd). Modern\u00ed variace pou\u017e\u00edvaj\u00ed ovoce \u2014 vi\u0161n\u011b, maliny, marakuja.',
        abv: '3.0\u20138.0 %', ibu: '3\u201315', barva: 'R\u016fzná', ebc: '4\u201330',
        examples: ['Lindemans', 'Rodenbach', 'Sibeeria Sour'],
        pairing: 'Chevr, sal\u00e1ty, moř. plody, ovocn\u00e9 dezerty',
        temp: '6\u201310 \u00b0C', glass: 'Tulip / Flétna'
      },
      {
        id: 'nefiltr', name: 'Nefiltrované', nameEn: '(Unfiltered / Kellerbier)',
        color: '#c9a858',
        desc: 'Pivo bez finální filtrace si zachov\u00e1v\u00e1 v\u00edce chut\u00ed, arom\u00e1t\u016f a kvasnicov\u00fdch esenc\u00ed. Zakalený vzhled, pln\u011bj\u0161\u00ed chu\u0165. N\u011bmeck\u00e1 tradice Kellerbier/Zwickel. V \u010cesku obl\u00edben\u00e9 jako \u201ekvasnicov\u00e9\u201c.',
        abv: '4.0\u20136.0 %', ibu: '20\u201340', barva: 'Zakalená zlat\u00e1', ebc: '6\u201315',
        examples: ['Bernard Nefiltr.', 'Choť\u011bboř Nefiltr.', 'Rycht\u00e1\u0159 Natur'],
        pairing: 'Tradi\u010dn\u00ed \u010desk\u00e1 kuchyn\u011b, pe\u010den\u00e1 kolena',
        temp: '6\u20138 \u00b0C', glass: 'T\u016fzka / Kriegl'
      },
      {
        id: 'polotmave', name: 'Polotmavé', nameEn: '(Amber Lager / Vienna)',
        color: '#a56b3a',
        desc: 'M\u011b\u010f mezi sv\u011btl\u00fdm a tmav\u00fdm le\u017e\u00e1kem. Jantarov\u00e1 barva, v\u00fdrazn\u011bj\u0161\u00ed sladov\u00e1 chu\u0165 s karamelovou nádechem. V\u00eddňský styl (Vienna Lager) nebo \u010desk\u00fd jantarov\u00fd le\u017e\u00e1k.',
        abv: '4.5\u20135.5 %', ibu: '20\u201335', barva: 'Jantarov\u00e1 a\u017e m\u011b\u010f', ebc: '15\u201330',
        examples: ['Sv\u00edj\u00e1nsk\u00fd Kní\u017ee', 'Bernard Jant\u00e1r', 'Rohozec Polotmavý'],
        pairing: 'Gu\u013a\u00e1\u0161, pe\u010den\u00e1 žebírka, uzen\u00e9 maso',
        temp: '7\u20139 \u00b0C', glass: 'T\u016fzka / Goblet'
      },
      {
        id: 'lager', name: 'Svět. le\u017e\u00e1k (inter.)', nameEn: '(International Lager)',
        color: '#f0e68c',
        desc: 'Lehk\u00fd, čist\u00fd, neutr\u00e1ln\u00ed lager dominujíc\u00ed svět. produkci. M\u00e9ně chmelový a sladov\u00fd ne\u017e \u010desk\u00fd le\u017e\u00e1k. Pitelný, osv\u011b\u017eujíc\u00ed. Typick\u00fd pro velk\u00e9 komerčn\u00ed pivovary.',
        abv: '4.0\u20135.0 %', ibu: '10\u201320', barva: 'Blede zlat\u00e1', ebc: '3\u20136',
        examples: ['Heineken', 'Corona', 'Stella Artois'],
        pairing: 'Lehká j\u00eddla, ryby, sal\u00e1ty, sushi',
        temp: '4\u20136 \u00b0C', glass: 'Standardn\u00ed sklenice'
      },
      {
        id: 'belgicke', name: 'Belgick\u00e9 styly', nameEn: '(Belgian Ales)',
        color: '#d4a44c',
        desc: 'Bohat\u00e1 tradice svrch. kv. styl\u016f: Dubbel (tmav\u00e9, sladov\u00e9), Tripel (sv\u011btl\u00e9, siln\u00e9), Witbier (p\u0161eni\u010dn\u00e9 s pomeran\u010dovou k\u016frou), Saison (farm\u00e1\u0159sk\u00e9, ko\u0159en\u011bné). Kvasnice dod\u00e1vaj\u00ed ovocn\u00e9 a ko\u0159en\u011bn\u00e9 t\u00f3ny.',
        abv: '5.0\u201312.0 %', ibu: '15\u201345', barva: 'Zlat\u00e1 a\u017e tmav\u011b hn\u011bd\u00e1', ebc: '5\u201350',
        examples: ['Chimay', 'Westmalle', 'Duvel'],
        pairing: 'Měkk\u00e9 s\u00fdry, mu\u0161le, \u010dokol\u00e1da',
        temp: '8\u201314 \u00b0C', glass: 'Chalice / Goblet'
      },
      {
        id: 'specialni', name: 'Speci\u00e1ln\u00ed', nameEn: '(Specialty)',
        color: '#8b6cc5',
        desc: 'Experiment\u00e1ln\u00ed a sez\u00f3nn\u00ed piva: s př\u00eddavkem ovoce (vi\u0161ně, maliny), ko\u0159en\u00ed (skořice, vanilka), sudov\u011b zr\u00e1n\u00ed (bourbon, whisky barely), medov\u00e1, bylinkov\u00e1. Milkshake IPA, Pastry Stout a dal\u0161\u00ed modern\u00ed trendy.',
        abv: '4.0\u201314.0 %', ibu: '5\u201360', barva: 'R\u016fzn\u00e1', ebc: 'R\u016fzn\u00e1',
        examples: ['Medov\u00e9 pivo', 'Cherry Kriek', 'Barrel Aged Stout'],
        pairing: 'Dle konkr\u00e9tn\u00edho stylu a př\u00edsad',
        temp: '8\u201314 \u00b0C', glass: 'Dle stylu / Snifter'
      },
    ],

    // Glos\u00e1\u0159 pivn\u00edch pojm\u016f (Beer Glossary)
    glossary: [
      // Z\u00e1kladn\u00ed pojmy
      { term: 'ABV', en: '(Alcohol by Volume)', desc: 'Obsah alkoholu v procentech objemu. B\u011b\u017en\u00fd le\u017e\u00e1k m\u00e1 4\u20135 %, IPA 5,5\u20137,5 %, Imperial Stout a\u017e 12+ %.' },
      { term: 'IBU', en: '(International Bitterness Units)', desc: 'Mezin\u00e1rodn\u00ed jednotka ho\u0159kosti. \u010c\u00edm vy\u0161\u0161\u00ed \u010d\u00edslo, t\u00edm v\u011bt\u0161\u00ed ho\u0159kost. Le\u017e\u00e1k: 25\u201345, IPA: 40\u201370+, Sour: 3\u201315.' },
      { term: 'EBC', en: '(European Brewery Convention)', desc: 'Stupnice barvy piva. 4\u20136 = sv\u011btle zlat\u00e1, 15\u201320 = jantarov\u00e1, 30\u201360 = tmav\u00e1, 60+ = \u010dern\u00e1.' },
      { term: 'Stup\u0148ovitost', en: '(Original Gravity / \u00b0Plato)', desc: 'Obsah extraktu v mladin\u011b p\u0159ed kva\u0161en\u00edm. 10\u00b0 = des\u00edtka, 12\u00b0 = dvan\u00e1ctka. Vy\u0161\u0161\u00ed stupe\u0148 = siln\u011bj\u0161\u00ed pivo.' },

      // Suroviny
      { term: 'Chmel', en: '(Hops)', desc: 'Rostlina dod\u00e1vaj\u00edc\u00ed pivu ho\u0159kost, ar\u00f3ma a konzerva\u010dn\u00ed vlastnosti. \u010cesk\u00fd Saaz (\u017dateck\u00fd) je sv\u011btov\u011b prosl\u00fdlý aromatick\u00fd chmel.' },
      { term: 'Slad', en: '(Malt)', desc: 'Nakl\u00ed\u010den\u00fd a usu\u0161en\u00fd je\u010dmen (nebo p\u0161enice). Z\u00e1klad chuti a barvy piva. Pra\u017een\u00e9 slady d\u00e1vaj\u00ed tmav\u00e9 pivo, karamely p\u0159id\u00e1vaj\u00ed sladkost.' },
      { term: 'Kvasnice', en: '(Yeast)', desc: 'Jednobu\u0148e\u010dn\u00e9 houby p\u0159em\u011b\u0148uj\u00edc\u00ed cukry na alkohol a CO\u2082. Ale kvasnice (Saccharomyces cerevisiae) pracuj\u00ed naho\u0159e, Lager (S. pastorianus) dole.' },
      { term: 'Voda', en: '(Water)', desc: 'Tvo\u0159\u00ed 90\u201395 % piva. Slou\u017een\u00ed vody (tvrdost, miner\u00e1ly) z\u00e1sadn\u011b ovliv\u0148uje v\u00fdslednou chu\u0165. Plze\u0148sk\u00e1 m\u011bkk\u00e1 voda = z\u00e1klad Pilsneru.' },

      // V\u00fdroba
      { term: 'Kva\u0161en\u00ed', en: '(Fermentation)', desc: 'Proces, p\u0159i kter\u00e9m kvasnice p\u0159etv\u00e1\u0159ej\u00ed cukry na alkohol a CO\u2082. Svrchní (ale, 15\u201324 \u00b0C) nebo spodní (lager, 7\u201313 \u00b0C).' },
      { term: 'Mladina', en: '(Wort)', desc: 'Sladk\u00fd roztok z\u00edskan\u00fd vylouhov\u00e1n\u00edm sladu ve vod\u011b. P\u0159ed kva\u0161en\u00edm se va\u0159\u00ed s chmelem. Z\u00e1klad ka\u017ed\u00e9ho piva.' },
      { term: 'Rmuty', en: '(Mashing)', desc: 'Proces m\u00edch\u00e1n\u00ed mlet\u00e9ho sladu s vodou p\u0159i r\u016fzn\u00fdch teplot\u00e1ch. Enzymy \u0161t\u011bp\u00ed \u0161krob na zkvasiteln\u00e9 cukry.' },
      { term: 'Chmelov\u00e1\u0159en\u00ed', en: '(Hopping)', desc: 'P\u0159id\u00e1v\u00e1n\u00ed chmele do mladiny. Prvn\u00ed d\u00e1vka = ho\u0159kost, posledn\u00ed = aróma. Dry hopping = za studena, jen aróma.' },
      { term: 'Dry Hopping', en: '', desc: 'P\u0159id\u00e1n\u00ed chmele za studena po kva\u0161en\u00ed. D\u00e1v\u00e1 intenz\u00edvn\u00ed chmelov\u00e9 ar\u00f3ma bez zvy\u0161ov\u00e1n\u00ed ho\u0159kosti. Typick\u00e9 pro IPA a NEIPA.' },
      { term: 'Zr\u00e1n\u00ed', en: '(Lagering / Conditioning)', desc: 'Dozr\u00e1v\u00e1n\u00ed piva za n\u00edzk\u00fdch teplot (0\u20134 \u00b0C). \u010cesk\u00fd le\u017e\u00e1k zr\u00e1l tradi\u010dn\u011b 6\u201312 t\u00fddn\u016f v le\u017e\u00e1ck\u00fdch sklepech.' },
      { term: 'Sudov\u00e9 zr\u00e1n\u00ed', en: '(Barrel Aging)', desc: 'Zr\u00e1n\u00ed piva v d\u0159ev\u011bn\u00fdch sudech (bourbon, whisky, v\u00edno). P\u0159id\u00e1v\u00e1 vanilkov\u00e9, ko\u0159en\u011bn\u00e9 a d\u0159evit\u00e9 t\u00f3ny.' },
      { term: 'Filtrace', en: '(Filtering)', desc: 'Odstra\u0148ov\u00e1n\u00ed kvasnic a z\u00e1kal\u016f. Filtrovan\u00e9 pivo je pr\u016fhledn\u00e9, nefiltrovan\u00e9 si zachov\u00e1v\u00e1 v\u00edce chut\u00ed.' },
      { term: 'Pasterace', en: '(Pasteurization)', desc: 'Tepeln\u00e9 o\u0161et\u0159en\u00ed pro del\u0161\u00ed trvanlivost. Nepasterovan\u00e9 pivo m\u00e1 \u017eiv\u011bj\u0161\u00ed chu\u0165, ale krat\u0161\u00ed expiraci.' },

      // Serv\u00edrov\u00e1n\u00ed
      { term: '\u010cep / Na \u010depu', en: '(On tap / Draft)', desc: 'Pivo to\u010den\u00e9 z tlakov\u00e9ho sudu p\u0159es v\u00fd\u010depn\u00ed za\u0159\u00edzen\u00ed. \u010cerstv\u00e9 a spr\u00e1vn\u011b na\u010d\u00e1\u0159ovan\u00e9 \u2014 to nejlep\u0161\u00ed pod\u00e1n\u00ed.' },
      { term: '\u0160nyt', en: '', desc: 'Mal\u00e9 pivo (0,15\u20130,2 l) na ochutnan\u00ed. Ide\u00e1ln\u00ed na ochutn\u00e1n\u00ed nov\u00e9ho stylu nebo pro \u0159idi\u010de.' },
      { term: 'Hladinkov\u00fd / Mlíko / \u0160nyt', en: '(Pour styles)', desc: 'T\u0159i zp\u016fsoby na\u010d\u00e1\u0159ov\u00e1n\u00ed: Hladinka (2 cm p\u011bny), Ml\u00edko (cel\u00e9 z p\u011bny, sladk\u00e9), \u0160nyt (mal\u00e9 ochutnan\u00ed).' },
      { term: 'P\u011bna', en: '(Head / Foam)', desc: 'Ochrann\u00e1 vrstva na pivu. Chr\u00e1n\u00ed p\u0159ed oxidac\u00ed, udr\u017e\u00ed aróma. Ide\u00e1ln\u011b 2\u20133 cm u \u010desk\u00e9ho le\u017e\u00e1ku.' },
      { term: 'Teplota serv.', en: '(Serving temp)', desc: 'Lager: 4\u20138 \u00b0C, Ale: 8\u201312 \u00b0C, Stout/Barley Wine: 12\u201316 \u00b0C. P\u0159\u00edli\u0161 studen\u00e9 pivo ztr\u00e1c\u00ed chu\u0165.' },

      // Stylov\u00e9 pojmy
      { term: 'Plze\u0148', en: '(Pilsner style)', desc: 'Pivn\u00ed styl pojmenovan\u00fd po m\u011bst\u011b Plze\u0148. Sv\u011btl\u00fd spodn\u011b kva\u0161en\u00fd le\u017e\u00e1k s v\u00fdrazn\u00fdm chmelem. Sv\u011btov\u00fd standard od 1842.' },
      { term: 'NEIPA', en: '(New England IPA)', desc: 'Modern\u00ed styl IPA se zakalenn\u00fdm vzhledem, n\u00ed\u017e\u0161\u00ed ho\u0159kost\u00ed a intenz\u00edvn\u00edm ovocn\u00fdm ar\u00f3mem (tropick\u00e9 ovoce). M\u011bkk\u00e9 t\u011blo d\u00edky ovsu.' },
      { term: 'Session', en: '', desc: 'Ozna\u010den\u00ed pro piva s ni\u017e\u0161\u00edm obsahem alkoholu (do 4,5 %), ur\u010den\u00e1 pro del\u0161\u00ed posezen\u00ed bez t\u011b\u017ek\u00e9 hlavy.' },
      { term: 'Imperial', en: '', desc: 'Ozna\u010den\u00ed pro siln\u011bj\u0161\u00ed verzi stylu. Imperial Stout (8\u201312 %), Imperial IPA / DIPA (7\u201310 %). V\u00edce sladu, chmele, chut\u00ed.' },
      { term: 'Craft / \u0158emesln\u00e9', en: '(Craft Beer)', desc: 'Pivo z mal\u00e9ho nez\u00e1visl\u00e9ho pivovaru s d\u016frazem na kvalitu, kreativitu a tradi\u010dn\u00ed postupy. V \u010cR boom od 2010.' },

      // Kva\u0161en\u00ed a technologie
      { term: 'Svrchní kva\u0161ení', en: '(Top-fermentation)', desc: 'Kva\u0161en\u00ed p\u0159i vy\u0161\u0161\u00ed teplot\u011b (15\u201324 \u00b0C). Kvasnice pracuj\u00ed na povrchu. Typick\u00e9 pro Ale, Wheat, Stout.' },
      { term: 'Spodn\u00ed kva\u0161en\u00ed', en: '(Bottom-fermentation)', desc: 'Kva\u0161en\u00ed p\u0159i ni\u017e\u0161\u00edch teplot\u00e1ch (7\u201313 \u00b0C). Kvasnice klesaj\u00ed ke dnu. Typick\u00e9 pro Lager, Pilsner.' },
      { term: 'Spont\u00e1nn\u00ed kva\u0161en\u00ed', en: '(Wild Fermentation)', desc: 'Kva\u0161en\u00ed divok\u00fdmi kvasnicemi z ovzdu\u0161\u00ed. Z\u00e1klad Lambik\u016f a n\u011bkter\u00fdch Sour piv. Nepředvídatelné, komplexn\u00ed.' },

      // Chmelov\u00e9 odr\u016fdy
      { term: '\u017dateck\u00fd (Saaz)', en: '', desc: 'Nejslavn\u011bj\u0161\u00ed \u010desk\u00fd chmel. Jemn\u00e9, ko\u0159en\u011bn\u00e9, bylinkov\u00e9 ar\u00f3ma. Z\u00e1klad Pilsneru a \u010desk\u00fdch le\u017e\u00e1k\u016f.' },
      { term: 'Citra', en: '', desc: 'Americk\u00fd chmel s intenz\u00edvn\u00edm citrusov\u00fdm a tropick\u00fdm ar\u00f3matem (grep, li\u010di, mango). Hvězda modern\u00edch IPA.' },
      { term: 'Mosaic', en: '', desc: 'Americk\u00fd chmel s komplexn\u00edm profilem: borůvky, tropick\u00e9 ovoce, kvě\u0165iny. Popul\u00e1rn\u00ed v NEIPA a APA.' },
      { term: 'Cascade', en: '', desc: 'Pr\u016fkopnick\u00fd americk\u00fd chmel (1972). Grapefruitov\u00e9, kvě\u0165inov\u00e9 ar\u00f3ma. Z\u00e1klad Sierra Nevada Pale Ale.' },
      { term: 'Kazbek', en: '', desc: '\u010cesk\u00fd modern\u00ed chmel s citrusov\u00fdm a ovocn\u00fdm ar\u00f3matem (citr\u00f3n, limeta). Obl\u00edben\u00fd v \u010desk\u00fdch \u0159emesln\u00fdch pivovarech.' },

      // P\u00e1rov\u00e1n\u00ed a kultura
      { term: 'P\u00e1rov\u00e1n\u00ed', en: '(Food Pairing)', desc: 'Kombin\u00e1ce piva s j\u00eddlem. Le\u017e\u00e1k + \u0159\u00edzek, IPA + burger, Stout + \u010dokol\u00e1da, Wheat + sal\u00e1t, Sour + s\u00fdr.' },
      { term: 'Pivn\u00ed l\u00e1zn\u011b', en: '(Beer Spa)', desc: '\u010cesk\u00e1 specialita \u2014 koupel v piv\u011b s chmelou a kvasnicemi. Relax pro t\u011blo i du\u0161i. Popul\u00e1rn\u00ed turistick\u00e1 atrakce.' },
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
