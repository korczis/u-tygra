/**
 * Pivnice U Tygra - Alpine.js Application
 * Integrates with Google Sheets for live beer menu
 * AIAD Standard Library v2.0.0 + Charlie Squad Analytics
 */

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeZjP4HadboLuS8v4KVobNqsKtjaBpBJ8oCuPCC-OjfkCtCWA8N_asuxkedh7QSGhsrXU0JU_bV_Rn/pub?gid=1804527038&single=true&output=csv';

const DRINKS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeZjP4HadboLuS8v4KVobNqsKtjaBpBJ8oCuPCC-OjfkCtCWA8N_asuxkedh7QSGhsrXU0JU_bV_Rn/pub?gid=1397910173&single=true&output=csv';

const FOOD_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeZjP4HadboLuS8v4KVobNqsKtjaBpBJ8oCuPCC-OjfkCtCWA8N_asuxkedh7QSGhsrXU0JU_bV_Rn/pub?gid=2135437169&single=true&output=csv';

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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
      this.worker.onerror = (e) => {
        console.warn('CSV Worker error, disabling:', e.message);
        this.worker = null;
        // Reject all pending callbacks so they fall through to fallback
        for (const [id, cb] of this.pendingCallbacks) {
          cb.reject(new Error('Worker crashed'));
        }
        this.pendingCallbacks.clear();
      };
    } catch (err) {
      console.warn('CSV Worker not available, falling back to main thread');
      this.worker = null;
    }
  }

  async parseCSV(csvText) {
    if (!this.worker) {
      return this.parseCSVFallback(csvText);
    }

    const id = ++this.messageId;
    try {
      return await Promise.race([
        new Promise((resolve, reject) => {
          this.pendingCallbacks.set(id, { resolve, reject });
          this.worker.postMessage({ id, type: 'parse-csv', data: csvText });
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Worker timeout')), 3000)
        )
      ]);
    } catch (e) {
      console.warn('Worker parse failed, using fallback:', e.message);
      this.pendingCallbacks.delete(id);
      return this.parseCSVFallback(csvText);
    }
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
      if (lower.includes('pivo') || lower.includes('pivovar') || lower.includes('název')) {
        headerIdx = i;
        break;
      }
    }

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
}

// Global CSV worker instance (used for subsequent refreshes)
const csvWorker = new CSVWorkerManager();

/**
 * Parse CSV on main thread - reliable, no Worker dependency
 * Mirrors logic from csv-worker.js parseCSVData()
 */
function parseBeerCSV(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length === 0) return { announcement: '', beers: [] };

  const firstRow = parseCSVLine(lines[0]);
  const announcement = [firstRow[2], firstRow[3], firstRow[4], firstRow[5]]
    .filter(Boolean)
    .join(' ');

  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('pivo') || lower.includes('pivovar') || lower.includes('název')) {
      headerIdx = i;
      break;
    }
  }

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
    const headers = parseCSVLine(lines[headerIdx]).map(normalizeKey);
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

  // Deduplicate by brewery + name (Google Sheets may have duplicate rows)
  const seen = new Set();
  const unique = beers.filter(function(b) {
    const key = (b.pivovar || '').toLowerCase() + '|' + (b.nazev || '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { announcement, beers: unique };
}

/**
 * Fetch and parse beer data from Google Sheets
 * Primary: main-thread parse (reliable, like pivniceutygra.cz)
 * Worker used only for subsequent refreshes if available
 */
async function fetchBeerData() {
  try {
    const response = await fetch(SHEETS_CSV_URL);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const csvText = await response.text();

    // Always parse on main thread for reliability
    return parseBeerCSV(csvText);
  } catch (error) {
    console.error('Failed to fetch beer data:', error);
    throw error;
  }
}

// Eagerly preload beer data BEFORE Alpine.js initializes
// Skip on pages that don't need beer data (admin, privacy, glosar)
window.__BEER_DATA__ = null;
(function() {
  var path = window.location.pathname;
  var skip = /\/(admin|ochrana-udaju|glosar)\b/.test(path);
  if (!skip) {
    fetch(SHEETS_CSV_URL)
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function(csv) { window.__BEER_DATA__ = parseBeerCSV(csv); })
      .catch(function(e) { console.warn('Preload failed, will retry in init:', e); });
  }
})();

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
    activeFoodTab: '',
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
    // Firebase public data
    aktualityEvents: [],
    firebasePhotos: [],

    navItems: [
      { id: 'home', href: '#home', label: 'Domů', title: 'Pivnice U Tygra', desc: 'Budvar & řemeslná piva u Lužánek. Brno.', hideNav: true },
      { id: 'aktuality', href: '#aktuality', label: 'Aktuality', title: 'Aktuality – Pivnice U Tygra', desc: 'Akce, novinky a speciální nabídky.' },
      { id: 'o-nas', href: '#o-nas', label: 'O pivnici', title: 'O pivnici – Pivnice U Tygra', desc: 'Vaše oblíbená pivnice u Lužánek v centru Brna.' },
      { id: 'na-cepu', href: '#na-cepu', label: 'Na čepu', title: 'Na čepu – Pivnice U Tygra', desc: 'Živá nabídka čepovaných piv. Budvar, řemeslná piva a speciály.' },
      { id: 'jidlo', href: '#jidlo', label: 'Menu', title: 'Menu – Pivnice U Tygra', desc: 'Jídelní a nápojový lístek. Chlebíčky, utopené, tlačenka a další.' },
      { id: 'salonek', href: '#salonek', label: 'Salónek', title: 'Salónek – Pivnice U Tygra', desc: 'Soukromý salónek pro oslavy a firemní akce. Kapacita 20 osob.' },
      { id: 'rezervace', href: '#rezervace', label: 'Rezervace', title: 'Rezervace – Pivnice U Tygra', desc: 'Zarezervujte si stůl nebo salónek.' },
      { id: 'galerie', href: '#galerie', label: 'Galerie', title: 'Galerie – Pivnice U Tygra', desc: 'Atmosféra Pivnice U Tygra. Interiér, bar, zahrádka.' },
      { id: 'glosar', href: (window.BASE_URL || '') + '/glosar/', label: 'Glosář', title: 'Glosář pivních pojmů', desc: '100+ pivních pojmů od ABV po Žatecký chmel.', external: true },
      { id: 'kontakt', href: '#kontakt', label: 'Kontakt', title: 'Kontakt – Pivnice U Tygra', desc: 'Vrchlického sad 1893/3, Brno. Otevřeno denně 16:00–24:00.' },
      { id: 'kiosk', href: (window.BASE_URL || '') + '/kiosk/', label: 'Kiosk', title: 'Na čepu – Kiosk', desc: 'Živá pivní tabule pro display.', external: true, hideNav: true },
    ],

    // Drink menu items loaded from Google Sheets CSV
    drinkItems: [],
    drinkCategories: [],

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

    breweryIconColor(name) {
      const icon = this.breweryIcon(name);
      const colorMap = {
        'czech-traditional': 'yellow',
        'craft-brewery': 'orange',
        'international': 'blue',
        'moravian': 'purple',
      };
      return colorMap[icon] || 'green';
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
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '')
        .replace(/^-+|-+$/g, '');
    },

    // "Did you know?" facts
    didYouKnow: [
      'Česko má nejvyšší spotřebu piva na osobu na světě — přes 140 litrů ročně.',
      'IBU (International Bitterness Units) měří hořkost piva. Ležák má typicky 20–40 IBU.',
      'Plzeňský typ piva (Pilsner) vznikl v roce 1842 a změnil svět pivovarnictví.',
      'Teplota servírování ovlivňuje chuť — lager 4–7°C, ale 8–12°C, stout 12–14°C.',
      'Pěna na pivu není jen estetika — chrání před oxidací a udrží aroma.',
      'Kvasnice typu Ale kvasí nahoře (top-fermenting), Lager dole (bottom-fermenting).',
      'Nejstarší pivovar na světě je Weihenstephan v Bavorsku, založený v roce 1040.',
      'V Česku se vaří pivo nepřetržitě od 993 n. l. — Břevnovský klášter.',
      'Chmel Žatecký (Saaz) je považován za nejlepší aromatický chmel na světě.',
      'Česká pivní pečeť chrání označení „české pivo“ od roku 2008 v EU.',
      'Stupně Plato měří hustotu mladiny — 12° znamená 12 % extraktu před kvašením.',
      'Průměrný Čech vypije 6 piv týdně. Neděle je nejméně pivní den.',
      'Pivo obsahuje více než 800 sloučenin ovlivňujících chuť a vůni.',
      'Dry hopping — přidání chmele za studena — dává aroma bez hořkosti.',
    ],

    // Beer style encyclopedia (Encyklopedie pivních stylů)
    beerStyles: [
      {
        id: 'svetlylezak', name: 'Světlý ležák', nameEn: '(Czech Pale Lager)',
        color: '#f7c46d',
        desc: 'Nejrozšířenější český pivní styl. Spodně kvašený, světlý, s výraznou chmelovou hořkostí a čistou sladovou chutí. Základní kámen české pivní tradice. Zrání minimálně 4–6 týdnů za nízkých teplot.',
        abv: '4.0–5.5 %', ibu: '25–45', barva: 'Zlatá', ebc: '6–12',
        examples: ['Pilsner Urquell', 'Budvar', 'Staropramen'],
        pairing: 'Svíčková, smažený sýr, kuřecí řízek',
        temp: '6–8 °C', glass: 'Tůzka / Půllitrová skůra'
      },
      {
        id: 'tmavylezak', name: 'Tmavý ležák', nameEn: '(Czech Dark Lager)',
        color: '#6b3a2a',
        desc: 'Spodně kvašené tmavé pivo s karamelovou až pražkovou chutí. Nižší hořkost, plnější tělo. Často pité jako dezertní pivo. Barvu dávají pražené a karamelizované slady.',
        abv: '3.5–5.5 %', ibu: '18–30', barva: 'Tmavě hnědá až černá', ebc: '30–60',
        examples: ['Kozel Černý', 'Krušovice Černé', 'U Fleků'],
        pairing: 'Dušené maso, pečená kachna, čokoládový dort',
        temp: '8–10 °C', glass: 'Tůzka / Goblet'
      },
      {
        id: 'desitka', name: 'Výčepní (desítka)', nameEn: '(Czech Lager 10°)',
        color: '#e8d48b',
        desc: 'Lehké pivko na každý den. 10° Plato, nižší obsah alkoholu. Osvěžující, pitelné, ideální k delšímu posezení. Základ české hospodské kultury.',
        abv: '3.5–4.5 %', ibu: '20–35', barva: 'Světle zlatá', ebc: '5–9',
        examples: ['Gambrinus 10°', 'Staropramen 10°', 'Budvar 10°'],
        pairing: 'Utopenec, tlačenka, topinky s česnekem',
        temp: '5–7 °C', glass: 'Tůzka / Kriegl'
      },
      {
        id: 'ipa', name: 'IPA', nameEn: '(India Pale Ale)',
        color: '#e17209',
        desc: 'Svrchně kvašený styl s výrazným chmelovým arómatem a hořkostí. Původ v Anglii 18. století. Dnes v mnoha variantách: American IPA (citrusové chmely), West Coast (suchá, hořká), Session IPA (lehčí verze).',
        abv: '5.5–7.5 %', ibu: '40–70', barva: 'Zlatá až mědová', ebc: '8–18',
        examples: ['Matuška Raptor', 'Clock IPA', 'Falkon IPA'],
        pairing: 'Pikantní jídla, burger, curry, nakládané sýry',
        temp: '8–12 °C', glass: 'IPA sklenice / Tulip'
      },
      {
        id: 'neipa', name: 'NEIPA', nameEn: '(New England IPA)',
        color: '#f5c060',
        desc: 'Zakalené, šťavaté IPA s nízkou hořkostí a intenzívním ovocným arómatem (mango, marakuja, broskev). Soft, hedvábné tělo díky ovesným vločkám a pšeničnému sladu. Dry hopping za studena.',
        abv: '5.0–8.0 %', ibu: '20–50', barva: 'Zakalená zlatá až oranžová', ebc: '6–14',
        examples: ['Falkón Hazy', 'Sibeeria Juicy', 'Clock Haze'],
        pairing: 'Suši, ceviche, lehké saláty, ovocné dezerty',
        temp: '6–10 °C', glass: 'IPA sklenice / Tulip'
      },
      {
        id: 'psenicne', name: 'Pšeničné pivo', nameEn: '(Wheat Beer / Weizen)',
        color: '#fad9a5',
        desc: 'Svrchně kvašený styl s vysokým podílem pšeničného sladu (50–70 %). Typická banánová a hřebíčková chuť od speciálních kvasnic. Lehké, osvěžující. Varianty: Hefeweizen (zakalené), Kristallweizen (čiré), Dunkelweizen (tmavé).',
        abv: '4.5–5.5 %', ibu: '8–15', barva: 'Světle zlatá, zakalená', ebc: '4–12',
        examples: ['Maisel Weisse', 'Hoegaarden', 'Primátor Weizen'],
        pairing: 'Saláty, ryby, lehká letní jídla, bílý sýr',
        temp: '6–8 °C', glass: 'Vysoká pšeničná sklenice (Weizen)'
      },
      {
        id: 'stout', name: 'Stout', nameEn: '(Stout / Porter)',
        color: '#1a0f06',
        desc: 'Tmavý, plný styl s příchutěmi pražených sladů — čokoláda, káva, karamel. Dry Stout (irský, suchý), Sweet Stout (mléčný), Oatmeal Stout (ovesný), Imperial Stout (silný 8–12 %). Porter je historický předchůdce stoutu.',
        abv: '4.0–12.0 %', ibu: '25–50', barva: 'Černá', ebc: '60–80+',
        examples: ['Guinness', 'Matuška Black IPA', 'Raven Stout'],
        pairing: 'Čokoládový dort, škrobákový pud., ústřice, grilované maso',
        temp: '10–14 °C', glass: 'Pint / Tulip / Snifter'
      },
      {
        id: 'ale', name: 'Pale Ale', nameEn: '(Pale Ale / APA)',
        color: '#c67a30',
        desc: 'Svrchně kvašený styl s vyváženou chmelovou hořkostí a ovocnými tóny. Základ mnoha moderních řemeslných stylů. APA (American PA) používá americké chmely s citrusovým a borovicovým arómatem. English PA je jemnější, více sladová.',
        abv: '4.5–6.0 %', ibu: '30–50', barva: 'Mědová až jantarová', ebc: '8–20',
        examples: ['Sierra Nevada PA', 'Dva Kohouti Pale Ale', 'Clock Pale Ale'],
        pairing: 'Burger, pizza, grilované kuře, cheddar',
        temp: '8–12 °C', glass: 'Pint / Nonic'
      },
      {
        id: 'sour', name: 'Kyselák', nameEn: '(Sour / Wild Ale)',
        color: '#d4536a',
        desc: 'Piva s výraznou kyselostí. Berliner Weisse (lehčí, často s ovocem), Gose (se solí a koriandrem), Lambik (spontánní kvašení, Belgie), Flanders Red (červený, octný). Moderní variace používají ovoce — višně, maliny, marakuja.',
        abv: '3.0–8.0 %', ibu: '3–15', barva: 'Různá', ebc: '4–30',
        examples: ['Lindemans', 'Rodenbach', 'Sibeeria Sour'],
        pairing: 'Chevr, saláty, moř. plody, ovocné dezerty',
        temp: '6–10 °C', glass: 'Tulip / Flétna'
      },
      {
        id: 'nefiltr', name: 'Nefiltrované', nameEn: '(Unfiltered / Kellerbier)',
        color: '#c9a858',
        desc: 'Pivo bez finální filtrace si zachovává více chutí, aromátů a kvasnicových esencí. Zakalený vzhled, plnější chuť. Německá tradice Kellerbier/Zwickel. V Česku oblíbené jako „kvasnicové“.',
        abv: '4.0–6.0 %', ibu: '20–40', barva: 'Zakalená zlatá', ebc: '6–15',
        examples: ['Bernard Nefiltr.', 'Choťěboř Nefiltr.', 'Rychtář Natur'],
        pairing: 'Tradiční česká kuchyně, pečená kolena',
        temp: '6–8 °C', glass: 'Tůzka / Kriegl'
      },
      {
        id: 'polotmave', name: 'Polotmavé', nameEn: '(Amber Lager / Vienna)',
        color: '#a56b3a',
        desc: 'Měď mezi světlým a tmavým ležákem. Jantarová barva, výraznější sladová chuť s karamelovou nádechem. Vídňský styl (Vienna Lager) nebo český jantarový ležák.',
        abv: '4.5–5.5 %', ibu: '20–35', barva: 'Jantarová až měď', ebc: '15–30',
        examples: ['Svíjánský Kníže', 'Bernard Jantár', 'Rohozec Polotmavý'],
        pairing: 'Guĺáš, pečená žebírka, uzené maso',
        temp: '7–9 °C', glass: 'Tůzka / Goblet'
      },
      {
        id: 'lager', name: 'Svět. ležák (inter.)', nameEn: '(International Lager)',
        color: '#f0e68c',
        desc: 'Lehký, čistý, neutrální lager dominující svět. produkci. Méně chmelový a sladový než český ležák. Pitelný, osvěžující. Typický pro velké komerční pivovary.',
        abv: '4.0–5.0 %', ibu: '10–20', barva: 'Blede zlatá', ebc: '3–6',
        examples: ['Heineken', 'Corona', 'Stella Artois'],
        pairing: 'Lehká jídla, ryby, saláty, sushi',
        temp: '4–6 °C', glass: 'Standardní sklenice'
      },
      {
        id: 'belgicke', name: 'Belgické styly', nameEn: '(Belgian Ales)',
        color: '#d4a44c',
        desc: 'Bohatá tradice svrch. kv. stylů: Dubbel (tmavé, sladové), Tripel (světlé, silné), Witbier (pšeničné s pomerančovou kůrou), Saison (farmářské, kořeněné). Kvasnice dodávají ovocné a kořeněné tóny.',
        abv: '5.0–12.0 %', ibu: '15–45', barva: 'Zlatá až tmavě hnědá', ebc: '5–50',
        examples: ['Chimay', 'Westmalle', 'Duvel'],
        pairing: 'Měkké sýry, mušle, čokoláda',
        temp: '8–14 °C', glass: 'Chalice / Goblet'
      },
      {
        id: 'specialni', name: 'Speciální', nameEn: '(Specialty)',
        color: '#8b6cc5',
        desc: 'Experimentální a sezónní piva: s přídavkem ovoce (višně, maliny), koření (skořice, vanilka), sudově zrání (bourbon, whisky barely), medová, bylinková. Milkshake IPA, Pastry Stout a další moderní trendy.',
        abv: '4.0–14.0 %', ibu: '5–60', barva: 'Různá', ebc: 'Různá',
        examples: ['Medové pivo', 'Cherry Kriek', 'Barrel Aged Stout'],
        pairing: 'Dle konkrétního stylu a přísad',
        temp: '8–14 °C', glass: 'Dle stylu / Snifter'
      },
    ],

    // Glosář pivních pojmů (Beer Glossary)
    glossary: [
      // Základní pojmy
      { term: 'ABV', en: '(Alcohol by Volume)', desc: 'Obsah alkoholu v procentech objemu. Běžný ležák má 4–5 %, IPA 5,5–7,5 %, Imperial Stout až 12+ %.' },
      { term: 'IBU', en: '(International Bitterness Units)', desc: 'Mezinárodní jednotka hořkosti. Čím vyšší číslo, tím větší hořkost. Ležák: 25–45, IPA: 40–70+, Sour: 3–15.' },
      { term: 'EBC', en: '(European Brewery Convention)', desc: 'Stupnice barvy piva. 4–6 = světle zlatá, 15–20 = jantarová, 30–60 = tmavá, 60+ = černá.' },
      { term: 'Stupňovitost', en: '(Original Gravity / °Plato)', desc: 'Obsah extraktu v mladině před kvašením. 10° = desítka, 12° = dvanáctka. Vyšší stupeň = silnější pivo.' },

      // Suroviny
      { term: 'Chmel', en: '(Hops)', desc: 'Rostlina dodávající pivu hořkost, aróma a konzervační vlastnosti. Český Saaz (Žatecký) je světově proslulý aromatický chmel.' },
      { term: 'Slad', en: '(Malt)', desc: 'Naklíčený a usušený ječmen (nebo pšenice). Základ chuti a barvy piva. Pražené slady dávají tmavé pivo, karamely přidávají sladkost.' },
      { term: 'Kvasnice', en: '(Yeast)', desc: 'Jednobuňečné houby přeměňující cukry na alkohol a CO₂. Ale kvasnice (Saccharomyces cerevisiae) pracují nahoře, Lager (S. pastorianus) dole.' },
      { term: 'Voda', en: '(Water)', desc: 'Tvoří 90–95 % piva. Složení vody (tvrdost, minerály) zásadně ovlivňuje výslednou chuť. Plzeňská měkká voda = základ Pilsneru.' },

      // Výroba
      { term: 'Kvašení', en: '(Fermentation)', desc: 'Proces, při kterém kvasnice přetvářejí cukry na alkohol a CO₂. Svrchní (ale, 15–24 °C) nebo spodní (lager, 7–13 °C).' },
      { term: 'Mladina', en: '(Wort)', desc: 'Sladký roztok získaný vylouhováním sladu ve vodě. Před kvašením se vaří s chmelem. Základ každého piva.' },
      { term: 'Rmuty', en: '(Mashing)', desc: 'Proces míchání mletého sladu s vodou při různých teplotách. Enzymy štěpí škrob na zkvasitelné cukry.' },
      { term: 'Chmelováření', en: '(Hopping)', desc: 'Přidávání chmele do mladiny. První dávka = hořkost, poslední = aróma. Dry hopping = za studena, jen aróma.' },
      { term: 'Dry Hopping', en: '', desc: 'Přidání chmele za studena po kvašení. Dává intenzívní chmelové aróma bez zvyšování hořkosti. Typické pro IPA a NEIPA.' },
      { term: 'Zrání', en: '(Lagering / Conditioning)', desc: 'Dozrávání piva za nízkých teplot (0–4 °C). Český ležák zrál tradičně 6–12 týdnů v ležáckých sklepech.' },
      { term: 'Sudové zrání', en: '(Barrel Aging)', desc: 'Zrání piva v dřevěných sudech (bourbon, whisky, víno). Přidává vanilkové, kořeněné a dřevité tóny.' },
      { term: 'Filtrace', en: '(Filtering)', desc: 'Odstraňování kvasnic a zákalů. Filtrované pivo je průhledné, nefiltrované si zachovává více chutí.' },
      { term: 'Pasterace', en: '(Pasteurization)', desc: 'Tepelné ošetření pro delší trvanlivost. Nepasterované pivo má živější chuť, ale kratší expiraci.' },

      // Servírování
      { term: 'Čep / Na čepu', en: '(On tap / Draft)', desc: 'Pivo točené z tlakového sudu přes výčepní zařízení. Čerstvé a správně načářované — to nejlepší podání.' },
      { term: 'Šnyt', en: '', desc: 'Malé pivo (0,15–0,2 l) na ochutnaní. Ideální na ochutnání nového stylu nebo pro řidiče.' },
      { term: 'Hladinkový / Mlíko / Šnyt', en: '(Pour styles)', desc: 'Tři způsoby načářování: Hladinka (2 cm pěny), Mlíko (celé z pěny, sladké), Šnyt (malé ochutnaní).' },
      { term: 'Pěna', en: '(Head / Foam)', desc: 'Ochranná vrstva na pivu. Chrání před oxidací, udrží aróma. Ideálně 2–3 cm u českého ležáku.' },
      { term: 'Teplota serv.', en: '(Serving temp)', desc: 'Lager: 4–8 °C, Ale: 8–12 °C, Stout/Barley Wine: 12–16 °C. Příliš studené pivo ztrácí chuť.' },

      // Stylové pojmy
      { term: 'Plzeň', en: '(Pilsner style)', desc: 'Pivní styl pojmenovaný po městě Plzeň. Světlý spodně kvašený ležák s výrazným chmelem. Světový standard od 1842.' },
      { term: 'NEIPA', en: '(New England IPA)', desc: 'Moderní styl IPA se zakaleným vzhledem, nižší hořkostí a intenzívním ovocným arómem (tropické ovoce). Měkké tělo díky ovsu.' },
      { term: 'Session', en: '', desc: 'Označení pro piva s nižším obsahem alkoholu (do 4,5 %), určená pro delší posezení bez těžké hlavy.' },
      { term: 'Imperial', en: '', desc: 'Označení pro silnější verzi stylu. Imperial Stout (8–12 %), Imperial IPA / DIPA (7–10 %). Více sladu, chmele, chutí.' },
      { term: 'Craft / Řemeslné', en: '(Craft Beer)', desc: 'Pivo z malého nezávislého pivovaru s důrazem na kvalitu, kreativitu a tradiční postupy. V ČR boom od 2010.' },

      // Kvašení a technologie
      { term: 'Svrchní kvašení', en: '(Top-fermentation)', desc: 'Kvašení při vyšší teplotě (15–24 °C). Kvasnice pracují na povrchu. Typické pro Ale, Wheat, Stout.' },
      { term: 'Spodní kvašení', en: '(Bottom-fermentation)', desc: 'Kvašení při nižších teplotách (7–13 °C). Kvasnice klesají ke dnu. Typické pro Lager, Pilsner.' },
      { term: 'Spontánní kvašení', en: '(Wild Fermentation)', desc: 'Kvašení divokými kvasnicemi z ovzduší. Základ Lambiků a některých Sour piv. Nepředvídatelné, komplexní.' },

      // Chmelové odrůdy
      { term: 'Žatecký (Saaz)', en: '', desc: 'Nejslavnější český chmel. Jemné, kořeněné, bylinkové aróma. Základ Pilsneru a českých ležáků.' },
      { term: 'Citra', en: '', desc: 'Americký chmel s intenzívním citrusovým a tropickým arómatem (grep, liči, mango). Hvězda moderních IPA.' },
      { term: 'Mosaic', en: '', desc: 'Americký chmel s komplexním profilem: borůvky, tropické ovoce, květiny. Populární v NEIPA a APA.' },
      { term: 'Cascade', en: '', desc: 'Průkopnický americký chmel (1972). Grapefruitové, květinové aróma. Základ Sierra Nevada Pale Ale.' },
      { term: 'Kazbek', en: '', desc: 'Český moderní chmel s citrusovým a ovocným arómatem (citrón, limeta). Oblíbený v českých řemeslných pivovarech.' },

      // Párování a kultura
      { term: 'Párování', en: '(Food Pairing)', desc: 'Kombinace piva s jídlem. Ležák + řízek, IPA + burger, Stout + čokoláda, Wheat + salát, Sour + sýr.' },
      { term: 'Pivní lázně', en: '(Beer Spa)', desc: 'Česká specialita — koupel v pivě s chmelou a kvasnicemi. Relax pro tělo i duši. Populární turistická atrakce.' },
    ],

    // Food menu loaded from Google Sheets CSV
    foodItems: [],
    foodCategories: [],
    foodLoading: true,

    // Opening hours
    hours: [
      { day: 'Pondělí', time: '16:00 – 24:00' },
      { day: 'Úterý', time: '16:00 – 24:00' },
      { day: 'Středa', time: '16:00 – 24:00' },
      { day: 'Čtvrtek', time: '16:00 – 24:00' },
      { day: 'Pátek', time: '16:00 – 24:00' },
      { day: 'Sobota', time: '16:00 – 24:00' },
      { day: 'Neděle', time: '16:00 – 24:00' },
    ],

    get filteredFood() {
      // Drink categories from CSV
      const drinkCat = this.drinkCategories.find(c => c.key === this.activeFoodTab);
      if (drinkCat) {
        return this.drinkItems.filter(i => i.cat === drinkCat.key);
      }
      // Food categories from CSV
      return this.foodItems.filter(i => i.cat === this.activeFoodTab);
    },

    get foodTabs() {
      const tabs = [];
      // Food categories first (from food CSV)
      for (const cat of this.foodCategories) {
        tabs.push(cat);
      }
      // Then drink categories (from drinks CSV)
      for (const cat of this.drinkCategories) {
        tabs.push(cat);
      }
      return tabs;
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
    eventCategoryLabel(cat) {
      const labels = {
        hudba: 'Hudba',
        sport: 'Sport',
        zapas: 'Zápas',
        degustace: 'Degustace',
        kviz: 'Kvíz',
        akce: 'Akce',
        turnaj: 'Turnaj',
        tema: 'Tématický večer',
      };
      return labels[cat] || 'Novinka';
    },

    eventCategoryStyle(cat) {
      const styles = {
        hudba: 'bg-purple-500/15 text-purple-400',
        sport: 'bg-red-500/15 text-red-400',
        zapas: 'bg-red-500/15 text-red-400',
        degustace: 'bg-amber-500/15 text-amber-400',
        kviz: 'bg-blue-500/15 text-blue-400',
        akce: 'bg-tiger-500/15 text-tiger-400',
        turnaj: 'bg-emerald-500/15 text-emerald-400',
        tema: 'bg-pink-500/15 text-pink-400',
      };
      return styles[cat] || 'bg-brew-700/30 text-brew-300';
    },

    eventCategoryIcon(cat) {
      const icons = {
        hudba: '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
        sport: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
        zapas: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
        degustace: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
        kviz: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        akce: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
        turnaj: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>',
        tema: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>',
      };
      return icons[cat] || '';
    },

    eventSlug(event) {
      let slug = (event.title || '').toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (event.date) slug += '-' + event.date;
      return slug;
    },

    eventDetailUrl(event) {
      return (window.BASE_URL || '') + '/aktuality/#' + this.eventSlug(event);
    },

    isEventToday(dateStr) {
      if (!dateStr) return false;
      const today = new Date();
      const eventDate = new Date(dateStr);
      return today.getFullYear() === eventDate.getFullYear()
        && today.getMonth() === eventDate.getMonth()
        && today.getDate() === eventDate.getDate();
    },

    isEventTomorrow(dateStr) {
      if (!dateStr) return false;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const eventDate = new Date(dateStr);
      return tomorrow.getFullYear() === eventDate.getFullYear()
        && tomorrow.getMonth() === eventDate.getMonth()
        && tomorrow.getDate() === eventDate.getDate();
    },

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
      var siteMeta = document.querySelector('meta[property="og:site_name"]');
      document.title = item.title + ' | ' + (siteMeta ? siteMeta.content : 'Pivnice U Tygra');

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

      // Fetch live beer data, food menu, and drinks menu
      await Promise.all([
        this.refreshBeerData(),
        this.loadFoodData(),
        this.loadDrinksData(),
      ]);

      // Load public data from Firebase (events, photos)
      this.loadFirebaseData();

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
          <div class="kiosk-live" aria-live="polite">
            <span class="live-dot" aria-hidden="true"></span>
            <span>ŽIVĚ Z ČEPU</span>
          </div>
          ${this.announcement ? `<div class="kiosk-announcement">${this.announcement}</div>` : ''}
        </div>
        <div class="kiosk-header-right">
          <button id="kiosk-toggle-view" class="kiosk-view-toggle" title="Přepnout zobrazení" aria-label="Přepnout zobrazení mřížka/seznam" aria-pressed="false">
            <svg id="kiosk-icon-grid" class="kiosk-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
            <svg id="kiosk-icon-list" class="kiosk-icon" aria-hidden="true" style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      footerLeft.textContent = 'Pivnice U Tygra • Brno';

      const footerCenter = document.createElement('div');
      footerCenter.className = 'kiosk-footer-center';
      footerCenter.id = 'kiosk-staleness';
      footerCenter.textContent = 'Aktuální';

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

    // Fingerprint of last rendered kiosk data (skip re-render when unchanged)
    _kioskDataFingerprint: '',

    _buildKioskHTML: function() {
      if (this.liveBeers.length === 0) {
        return '<div class="kiosk-empty">Načítám nabídku...</div>';
      }

      if (this.kioskView === 'list') {
        return '<div class="kiosk-list">' +
          '<div class="kiosk-list-header">' +
            '<span class="kiosk-col-name">Název</span>' +
            '<span class="kiosk-col-brewery">Pivovar</span>' +
            '<span class="kiosk-col-style">Styl</span>' +
            '<span class="kiosk-col-abv">Alk.</span>' +
            '<span class="kiosk-col-price">Cena</span>' +
          '</div>' +
          this.liveBeers.map(function(beer) {
            return '<div class="kiosk-list-row">' +
              '<span class="kiosk-col-name">' + (beer.nazev || '') + '</span>' +
              '<span class="kiosk-col-brewery">' + (beer.pivovar || '') + '</span>' +
              '<span class="kiosk-col-style">' + (beer.styl || '') + '</span>' +
              '<span class="kiosk-col-abv">' + (beer.abv || '') + '</span>' +
              '<span class="kiosk-col-price">' + (beer.cena ? beer.cena + ' Kč' : '') + '</span>' +
            '</div>';
          }).join('') +
        '</div>';
      }

      // Grid view
      return '<div class="kiosk-grid">' +
        this.liveBeers.map(function(beer) {
          return '<div class="kiosk-card">' +
            '<div class="kiosk-card-top">' +
              '<h2 class="kiosk-beer-name">' + (beer.nazev || 'Bez názvu') + '</h2>' +
              '<span class="kiosk-price">' + (beer.cena ? beer.cena + ' Kč' : '') + '</span>' +
            '</div>' +
            '<div class="kiosk-brewery">' + (beer.pivovar || '') + '</div>' +
            '<div class="kiosk-card-bottom">' +
              (beer.styl ? '<span class="kiosk-style">' + beer.styl + '</span>' : '') +
              (beer.abv ? '<span class="kiosk-stats">Alk: ' + beer.abv + '</span>' : '') +
              (beer.ibu ? '<span class="kiosk-stats">Hořkost: ' + beer.ibu + ' IBU</span>' : '') +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';
    },

    updateKioskUI: function() {
      var content = document.getElementById('kiosk-content');
      if (!content) return;

      var html = this._buildKioskHTML();

      // Skip re-render if data hasn't changed
      if (html === this._kioskDataFingerprint) return;
      this._kioskDataFingerprint = html;

      // First render — no fade, just set content
      if (!content.childElementCount || content.querySelector('.kiosk-empty')) {
        content.textContent = '';
        content.insertAdjacentHTML('beforeend', html);
        content.style.opacity = '1';
        return;
      }

      // Crossfade: fade out -> swap -> fade in
      content.style.transition = 'opacity 0.3s ease';
      content.style.opacity = '0';
      setTimeout(function() {
        content.textContent = '';
        content.insertAdjacentHTML('beforeend', html);
        content.style.opacity = '1';
      }, 300);
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
        console.warn('Wake Lock unavailable:', e.name, e.message);
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
        el.textContent = 'Aktuální';
        el.className = 'kiosk-staleness';
      } else {
        const ageMin = Math.floor(ageSec / 60);
        el.textContent = `Před ${ageMin} min`;
        el.className = 'kiosk-staleness stale';
      }
    },

    async refreshBeerData() {
      try {
        const startTime = Date.now();

        // Use preloaded data on first load (already fetched before Alpine init)
        let data;
        if (window.__BEER_DATA__ && !this._dataLoaded) {
          data = window.__BEER_DATA__;
          this._dataLoaded = true;
        } else {
          data = await fetchBeerData();
        }

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
     * Load food menu from Google Sheets CSV
     * Columns: Aktuální?, Množství, Kategorie, Název, Cena, Alergeny
     * - Only rows with Aktuální? = "x" are shown
     * - Kategorie is sparse (carries forward from last non-empty value)
     * - Empty rows (no Název) are skipped
     */
    async loadFoodData() {
      try {
        const response = await fetch(FOOD_CSV_URL);
        if (!response.ok) return;
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return;

        const items = [];
        const categoryOrder = [];
        const categorySet = new Set();
        let currentCategory = '';

        for (let i = 1; i < lines.length; i++) {
          const row = this.parseMenuCsvRow(lines[i]);

          // Update current category if column C is filled
          const rowCategory = (row[2] || '').trim();
          if (rowCategory) {
            currentCategory = rowCategory;
          }

          // Skip rows without a name (column D)
          const nazev = (row[3] || '').trim();
          if (!nazev) continue;

          // Only show rows where Aktuální? (column A) is "x"
          const aktualni = (row[0] || '').trim().toLowerCase();
          if (aktualni !== 'x') continue;

          // Parse price: "125,-" -> 125, "17,-" -> 17, "125" -> 125
          const rawPrice = (row[4] || '').trim().replace(',-', '').replace('"', '');
          const price = parseInt(rawPrice, 10) || 0;

          const mnozstvi = (row[1] || '').trim();
          const alergeny = (row[5] || '').trim();
          const cat = currentCategory || 'Ostatní';

          // Build category key
          const key = 'food_' + cat.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_');

          if (!categorySet.has(key)) {
            categorySet.add(key);
            categoryOrder.push({ key, label: cat });
          }

          items.push({
            name: nazev,
            desc: alergeny ? 'Alergeny: ' + alergeny : '',
            weight: mnozstvi,
            price,
            cat: key,
          });
        }

        this.foodItems = items;
        this.foodCategories = categoryOrder;
        this.foodLoading = false;

        // Set active tab to first available food category
        if (this.foodCategories.length > 0) {
          this.activeFoodTab = this.foodCategories[0].key;
        }
      } catch (e) {
        console.warn('Failed to load food data:', e);
        this.foodLoading = false;
      }
    },

    /**
     * Load drinks menu from Google Sheets CSV (Kategorie, Název, Cena)
     */
    async loadDrinksData() {
      try {
        const response = await fetch(DRINKS_CSV_URL);
        if (!response.ok) return;
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return;

        const items = [];
        const categorySet = new Map();

        for (let i = 1; i < lines.length; i++) {
          const row = this.parseMenuCsvRow(lines[i]);
          if (row.length < 3 || !row[0].trim()) continue;

          const kategorie = row[0].trim();
          const nazev = row[1].trim();
          const cena = parseInt(row[2].trim(), 10) || 0;

          // Build category key (lowercase, no diacritics for internal use)
          const key = 'drink_' + kategorie.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_');

          if (!categorySet.has(key)) {
            categorySet.set(key, kategorie);
          }

          items.push({ name: nazev, desc: '', weight: '', price: cena, cat: key });
        }

        this.drinkItems = items;
        this.drinkCategories = Array.from(categorySet.entries()).map(([key, label]) => ({ key, label }));
      } catch (e) {
        console.warn('Failed to load drinks data:', e);
      }
    },

    /**
     * Parse a single CSV row handling quoted fields with commas
     */
    parseMenuCsvRow(line) {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current);
      return result;
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
     * Load public data from Firebase (events, food, photos)
     * No auth required — Firestore rules allow public read
     */
    async loadFirebaseData() {
      const config = window.FIREBASE_CONFIG;
      if (!config) return;

      try {
        const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
        const { getFirestore, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

        const app = getApps().find(a => a.name === 'public-reader')
          ? getApp('public-reader')
          : initializeApp(config, 'public-reader');
        const db = getFirestore(app);

        // Load events → aktuality
        const eventsSnap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
        const allEvents = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        this.aktualityEvents = allEvents
          .filter(e => !e.date || new Date(e.date) >= weekAgo)
          .slice(0, 6);

        // Load photos for gallery
        const photosSnap = await getDocs(query(collection(db, 'photos'), orderBy('createdAt', 'desc')));
        this.firebasePhotos = photosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`Firebase loaded: ${allEvents.length} events, ${this.firebasePhotos.length} photos`);
      } catch (e) {
        console.warn('Firebase public read failed:', e.message);
      }
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
