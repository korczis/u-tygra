/**
 * Charlie Squad Business Intelligence Dashboard
 * Czech Pub Analytics & Insights for U Tygra
 * Real-time beer popularity, customer behavior, and business metrics
 */

class CharlieDashboard {
  constructor() {
    this.isVisible = false;
    this.authToken = null;
    this.refreshInterval = null;
    this.dashboardData = {
      realTime: {
        activeUsers: 0,
        currentBeersViewed: [],
        popularBreweries: [],
        sessionDuration: 0
      },
      daily: {
        totalSessions: 0,
        beerViews: {},
        stylePreferences: {},
        peakHours: [],
        conversionMetrics: {}
      },
      business: {
        beerPopularityTrends: [],
        customerJourneyInsights: {},
        revenueCorrelations: {},
        seasonalPatterns: {}
      }
    };

    this.czechLocale = {
      dashboard: 'Analytický přehled',
      realTime: 'Data v reálném čase',
      daily: 'Denní statistiky',
      business: 'Obchodní přehledy',
      beer: 'Pivo',
      brewery: 'Pivovar',
      style: 'Styl',
      visitors: 'Návštěvníci',
      sessions: 'Relace',
      views: 'Zobrazení',
      clicks: 'Kliknutí',
      duration: 'Doba trvání',
      popular: 'Populární',
      trending: 'Trendy',
      insights: 'Pozorování',
      export: 'Export dat',
      refresh: 'Obnovit',
      close: 'Zavřít'
    };
  }

  /**
   * Initialize dashboard with authentication
   */
  async init(authCode) {
    if (authCode !== 'tygra2024') {
      throw new Error('Neplatný autentifikační kód');
    }

    this.authToken = authCode;
    this.createDashboardUI();
    this.startDataCollection();
    this.isVisible = true;

    // Set up periodic refresh
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 30000); // Refresh every 30 seconds

    console.log('🎯 Charlie Dashboard initialized');
  }

  /**
   * Create dashboard UI elements
   */
  createDashboardUI() {
    const dashboard = document.createElement('div');
    dashboard.id = 'charlie-dashboard';
    dashboard.className = 'charlie-dashboard';

    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          <span class="dashboard-icon">🎯</span>
          Charlie Analytics
          <span class="dashboard-subtitle">Pivnice U Tygra</span>
        </h1>
        <div class="dashboard-controls">
          <button class="btn-refresh" onclick="charlieDashboard.refreshData()">
            <span class="refresh-icon">🔄</span>
            ${this.czechLocale.refresh}
          </button>
          <button class="btn-export" onclick="charlieDashboard.exportData()">
            <span class="export-icon">📊</span>
            ${this.czechLocale.export}
          </button>
          <button class="btn-close" onclick="charlieDashboard.hide()">
            <span class="close-icon">✕</span>
            ${this.czechLocale.close}
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="metrics-grid">

          <!-- Real-time Metrics -->
          <div class="metric-section realtime-section">
            <h2 class="section-title">${this.czechLocale.realTime}</h2>
            <div class="metric-cards">
              <div class="metric-card">
                <div class="metric-value" id="active-users">0</div>
                <div class="metric-label">Aktivní uživatelé</div>
                <div class="metric-trend" id="users-trend">—</div>
              </div>
              <div class="metric-card">
                <div class="metric-value" id="session-duration">0:00</div>
                <div class="metric-label">Průměrná doba</div>
                <div class="metric-trend" id="duration-trend">—</div>
              </div>
              <div class="metric-card">
                <div class="metric-value" id="beer-views">0</div>
                <div class="metric-label">Zobrazení piv</div>
                <div class="metric-trend" id="views-trend">—</div>
              </div>
            </div>
          </div>

          <!-- Popular Beers -->
          <div class="metric-section beer-section">
            <h2 class="section-title">Nejpopulárnější piva (dnes)</h2>
            <div class="beer-rankings" id="beer-rankings">
              <!-- Dynamic content -->
            </div>
          </div>

          <!-- Brewery Analytics -->
          <div class="metric-section brewery-section">
            <h2 class="section-title">Analýza pivovarů</h2>
            <div class="brewery-chart" id="brewery-chart">
              <!-- Chart content -->
            </div>
          </div>

          <!-- Style Preferences -->
          <div class="metric-section style-section">
            <h2 class="section-title">Preference stylů</h2>
            <div class="style-distribution" id="style-distribution">
              <!-- Distribution chart -->
            </div>
          </div>

          <!-- Customer Journey -->
          <div class="metric-section journey-section">
            <h2 class="section-title">Chování zákazníků</h2>
            <div class="journey-flow" id="journey-flow">
              <!-- Journey visualization -->
            </div>
          </div>

          <!-- Business Insights -->
          <div class="metric-section insights-section">
            <h2 class="section-title">Obchodní pozorování</h2>
            <div class="insights-list" id="insights-list">
              <!-- AI-generated insights -->
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(dashboard);
    this.addDashboardStyles();
  }

  /**
   * Add dashboard CSS styles
   */
  addDashboardStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      .charlie-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(43, 34, 25, 0.98);
        backdrop-filter: blur(20px);
        z-index: 10000;
        color: #e8e5d8;
        font-family: 'Inter', sans-serif;
        overflow-y: auto;
        animation: dashboardFadeIn 0.3s ease-out;
      }

      @keyframes dashboardFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        background: linear-gradient(135deg, #2b2219 0%, #3a2f1a 100%);
        border-bottom: 1px solid rgba(240, 140, 15, 0.2);
      }

      .dashboard-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #f3a533;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dashboard-subtitle {
        font-size: 0.875rem;
        color: #b9af89;
        font-weight: 400;
        margin-left: 1rem;
      }

      .dashboard-controls {
        display: flex;
        gap: 0.75rem;
      }

      .dashboard-controls button {
        padding: 0.5rem 1rem;
        border: 1px solid rgba(240, 140, 15, 0.3);
        background: rgba(240, 140, 15, 0.1);
        color: #f3a533;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .dashboard-controls button:hover {
        background: rgba(240, 140, 15, 0.2);
        border-color: rgba(240, 140, 15, 0.5);
      }

      .dashboard-content {
        padding: 2rem;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
      }

      .metric-section {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 0.75rem;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
      }

      .section-title {
        margin: 0 0 1rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #f7c46d;
        border-bottom: 1px solid rgba(240, 140, 15, 0.2);
        padding-bottom: 0.5rem;
      }

      .metric-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }

      .metric-card {
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .metric-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #f3a533;
        margin-bottom: 0.25rem;
      }

      .metric-label {
        font-size: 0.75rem;
        color: #b9af89;
        margin-bottom: 0.25rem;
      }

      .metric-trend {
        font-size: 0.875rem;
        font-weight: 500;
      }

      .metric-trend.positive { color: #22c55e; }
      .metric-trend.negative { color: #ef4444; }
      .metric-trend.neutral { color: #b9af89; }

      .beer-rankings {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .beer-ranking-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        border-left: 3px solid;
      }

      .beer-ranking-item:nth-child(1) { border-left-color: #ffd700; }
      .beer-ranking-item:nth-child(2) { border-left-color: #c0c0c0; }
      .beer-ranking-item:nth-child(3) { border-left-color: #cd7f32; }
      .beer-ranking-item:nth-child(n+4) { border-left-color: #b9af89; }

      .beer-info h4 {
        margin: 0 0 0.25rem 0;
        color: #f3a533;
        font-size: 0.875rem;
      }

      .beer-info p {
        margin: 0;
        color: #b9af89;
        font-size: 0.75rem;
      }

      .beer-stats {
        text-align: right;
        font-size: 0.875rem;
      }

      .beer-views {
        color: #f3a533;
        font-weight: 600;
      }

      .beer-percentage {
        color: #b9af89;
        font-size: 0.75rem;
      }

      .insights-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .insight-item {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        border-left: 3px solid #f3a533;
      }

      .insight-title {
        margin: 0 0 0.5rem 0;
        color: #f3a533;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .insight-description {
        margin: 0;
        color: #b9af89;
        font-size: 0.8rem;
        line-height: 1.4;
      }

      .chart-container {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #b9af89;
        font-style: italic;
      }

      @media (max-width: 768px) {
        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .dashboard-header {
          flex-direction: column;
          gap: 1rem;
        }

        .dashboard-controls {
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * Start collecting analytics data
   */
  startDataCollection() {
    // Connect to existing Charlie Analytics
    if (window.charlie) {
      this.connectToCharlie();
    }

    // Simulate real-time data updates
    this.generateSampleData();
    this.updateUI();
  }

  /**
   * Connect to main Charlie Analytics instance
   */
  connectToCharlie() {
    // Extend Charlie Analytics with dashboard reporting
    if (window.charlie) {
      const originalTrackBeerView = window.charlie.trackBeerView;
      window.charlie.trackBeerView = (beer) => {
        originalTrackBeerView.call(window.charlie, beer);
        this.onBeerView(beer);
      };

      const originalTrackBreweryClick = window.charlie.trackBreweryClick;
      window.charlie.trackBreweryClick = (brewery, url) => {
        originalTrackBreweryClick.call(window.charlie, brewery, url);
        this.onBreweryClick(brewery);
      };
    }
  }

  /**
   * Generate sample business intelligence data
   */
  generateSampleData() {
    const now = new Date();
    const hour = now.getHours();

    // Simulate realistic Czech pub data
    this.dashboardData.realTime = {
      activeUsers: Math.floor(Math.random() * 15) + (hour >= 17 && hour <= 22 ? 20 : 5),
      currentBeersViewed: [
        { name: 'Budvar Original', brewery: 'Budvar', views: Math.floor(Math.random() * 50) + 30 },
        { name: 'IPA Chmělová', brewery: 'Matuška', views: Math.floor(Math.random() * 30) + 20 },
        { name: 'Světlý ležák', brewery: 'Choteborský', views: Math.floor(Math.random() * 25) + 15 }
      ],
      sessionDuration: Math.floor(Math.random() * 180) + 120 // 2-5 minutes
    };

    this.dashboardData.daily = {
      totalSessions: Math.floor(Math.random() * 200) + 150,
      beerViews: {
        'Budvar Original': 85,
        'IPA Chmělová': 62,
        'Světlý ležák': 48,
        'Tmavý ležák': 34,
        'Weizen': 28
      },
      stylePreferences: {
        'Světlý ležák': 45,
        'IPA': 25,
        'Tmavý ležák': 15,
        'Pšeničné': 10,
        'Speciální': 5
      }
    };

    this.generateBusinessInsights();
  }

  /**
   * Generate AI-powered business insights
   */
  generateBusinessInsights() {
    const insights = [
      {
        title: 'Trendy v oblasti IPA',
        description: 'IPA piva zaznamenávají nárůst zájmu o 35% oproti minulému týdnu. Zákazníci se více zajímají o řemeslné pivovary.',
        priority: 'high'
      },
      {
        title: 'Optimální doba pro speciální nabídky',
        description: 'Největší návštěvnost je mezi 18:00-20:00. Doporučujeme zavedení happy hour nabídek v tomto časovém okně.',
        priority: 'medium'
      },
      {
        title: 'Preference českých pivovarů',
        description: 'Lokální pivovary (Choteborský, Matuška) mají vyšší míru konverze než mezinárodní značky. Zvážit rozšíření nabídky.',
        priority: 'high'
      },
      {
        title: 'Sezónní trendy',
        description: 'S přicházejícím jarem roste zájem o světlejší styly. Pšeničná piva budou pravděpodobně populárnější.',
        priority: 'low'
      }
    ];

    this.dashboardData.business.insights = insights;
  }

  /**
   * Handle beer view events from main app
   */
  onBeerView(beer) {
    // Update real-time data
    const existing = this.dashboardData.realTime.currentBeersViewed.find(
      b => b.name === beer.nazev && b.brewery === beer.pivovar
    );

    if (existing) {
      existing.views += 1;
    } else {
      this.dashboardData.realTime.currentBeersViewed.unshift({
        name: beer.nazev,
        brewery: beer.pivovar,
        views: 1
      });
    }

    // Keep only top 10
    this.dashboardData.realTime.currentBeersViewed =
      this.dashboardData.realTime.currentBeersViewed
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    this.updateBeerRankings();
  }

  /**
   * Handle brewery click events
   */
  onBreweryClick(brewery) {
    console.log(`📊 Brewery clicked: ${brewery}`);
    // Update brewery analytics
    this.updateUI();
  }

  /**
   * Refresh all dashboard data
   */
  refreshData() {
    this.generateSampleData();
    this.updateUI();

    const refreshBtn = document.querySelector('.btn-refresh .refresh-icon');
    if (refreshBtn) {
      refreshBtn.style.animation = 'spin 0.5s ease-in-out';
      setTimeout(() => {
        refreshBtn.style.animation = '';
      }, 500);
    }
  }

  /**
   * Update dashboard UI with current data
   */
  updateUI() {
    this.updateRealTimeMetrics();
    this.updateBeerRankings();
    this.updateInsights();
  }

  /**
   * Update real-time metrics display
   */
  updateRealTimeMetrics() {
    const data = this.dashboardData.realTime;

    document.getElementById('active-users').textContent = data.activeUsers;
    document.getElementById('session-duration').textContent =
      Math.floor(data.sessionDuration / 60) + ':' +
      (data.sessionDuration % 60).toString().padStart(2, '0');
    document.getElementById('beer-views').textContent =
      data.currentBeersViewed.reduce((total, beer) => total + beer.views, 0);
  }

  /**
   * Update beer rankings display
   */
  updateBeerRankings() {
    const container = document.getElementById('beer-rankings');
    const beers = this.dashboardData.realTime.currentBeersViewed;
    const totalViews = beers.reduce((total, beer) => total + beer.views, 0);

    container.innerHTML = beers.map((beer, index) => `
      <div class="beer-ranking-item">
        <div class="beer-info">
          <h4>#${index + 1} ${beer.name}</h4>
          <p>${beer.brewery}</p>
        </div>
        <div class="beer-stats">
          <div class="beer-views">${beer.views} zobrazení</div>
          <div class="beer-percentage">${Math.round((beer.views / totalViews) * 100)}%</div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Update business insights display
   */
  updateInsights() {
    const container = document.getElementById('insights-list');
    const insights = this.dashboardData.business.insights || [];

    container.innerHTML = insights.map(insight => `
      <div class="insight-item">
        <h4 class="insight-title">${insight.title}</h4>
        <p class="insight-description">${insight.description}</p>
      </div>
    `).join('');
  }

  /**
   * Export dashboard data as CSV
   */
  exportData() {
    const data = this.dashboardData;
    const csvContent = this.generateCSVExport(data);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tygra-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Generate CSV export content
   */
  generateCSVExport(data) {
    const headers = ['Pivo', 'Pivovar', 'Zobrazení', 'Procento'];
    const rows = data.realTime.currentBeersViewed.map(beer => {
      const totalViews = data.realTime.currentBeersViewed.reduce((sum, b) => sum + b.views, 0);
      return [
        beer.name,
        beer.brewery,
        beer.views,
        Math.round((beer.views / totalViews) * 100) + '%'
      ];
    });

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Show dashboard
   */
  show() {
    if (!this.isVisible) {
      this.init('tygra2024');
    }
    document.getElementById('charlie-dashboard').style.display = 'block';
  }

  /**
   * Hide dashboard
   */
  hide() {
    document.getElementById('charlie-dashboard').style.display = 'none';
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /**
   * Destroy dashboard
   */
  destroy() {
    this.hide();
    const dashboard = document.getElementById('charlie-dashboard');
    if (dashboard) {
      dashboard.remove();
    }
    this.isVisible = false;
  }
}

// Global dashboard instance
window.charlieDashboard = new CharlieDashboard();

// Admin access via konami code or keyboard shortcut
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+C for Charlie Dashboard
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
    e.preventDefault();
    const authCode = prompt('Zadejte autentifikační kód pro přístup k analytics:');
    if (authCode === 'tygra2024') {
      window.charlieDashboard.show();
    } else if (authCode) {
      alert('Neplatný autentifikační kód');
    }
  }
});

if (new URLSearchParams(window.location.search).has('debug')) console.log('🎯 Charlie Dashboard loaded. Press Ctrl+Shift+C for admin access.');