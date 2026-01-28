/**
 * Charlie Squad Privacy & GDPR Compliance
 * Czech Republic GDPR-compliant analytics consent management
 * Integrates with Charlie Analytics for privacy-first data collection
 */

class CharliePrivacy {
  constructor() {
    this.consentKey = 'tygra-analytics-consent';
    this.consentVersion = '2024.1';
    this.hasConsent = false;
    this.showBanner = false;
    this.consentData = this.loadConsent();

    // Czech GDPR compliance text
    this.czechText = {
      title: 'Ochrana osobních údajů',
      message: 'Používáme analytické cookies pro zlepšení vašeho zážitku v naší pivnici. Pomáhají nám pochopit, která piva a jídla vás zajímají nejvíce.',
      essential: 'Nezbytné cookies',
      analytics: 'Analytické cookies',
      essentialDesc: 'Základní fungování webu (navigace, košík)',
      analyticsDesc: 'Anonymní statistiky návštěvnosti a preferencí piv',
      accept: 'Přijmout vše',
      decline: 'Pouze nezbytné',
      settings: 'Nastavení',
      save: 'Uložit volby',
      moreInfo: 'Více informací',
      privacyPolicy: 'Zásady ochrany osobních údajů',
      dataController: 'Správce údajů: KONOVO s.r.o., IČO: 17846927',
      dataRetention: 'Údaje uchováváme po dobu 2 let',
      yourRights: 'Vaše práva: přístup, oprava, výmaz, přenositelnost',
      contactEmail: 'Kontakt: info@utygra.cz',
      lastUpdated: 'Aktualizováno: 28. ledna 2026'
    };

    this.init();
  }

  /**
   * Initialize privacy management
   */
  init() {
    // Check if consent is needed
    if (!this.hasValidConsent()) {
      this.showConsentBanner();
    } else {
      this.hasConsent = this.consentData.analytics;
      this.enableAnalytics();
    }

    // Add privacy settings to footer
    this.addPrivacyLink();

    // Listen for consent changes
    this.setupEventListeners();
  }

  /**
   * Check if we have valid consent
   */
  hasValidConsent() {
    return this.consentData &&
           this.consentData.version === this.consentVersion &&
           this.consentData.timestamp &&
           (Date.now() - this.consentData.timestamp) < (365 * 24 * 60 * 60 * 1000); // 1 year
  }

  /**
   * Load consent from localStorage
   */
  loadConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Failed to load consent data:', e);
      return null;
    }
  }

  /**
   * Save consent to localStorage
   */
  saveConsent(essential = true, analytics = false) {
    const consent = {
      version: this.consentVersion,
      timestamp: Date.now(),
      essential: essential,
      analytics: analytics,
      ip: null, // We don't store IP addresses
      userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
    };

    try {
      localStorage.setItem(this.consentKey, JSON.stringify(consent));
      this.consentData = consent;
      this.hasConsent = analytics;

      // Update Charlie Analytics
      if (analytics) {
        this.enableAnalytics();
      } else {
        this.disableAnalytics();
      }

      console.log('🔒 Privacy consent saved:', { essential, analytics });
    } catch (e) {
      console.error('Failed to save consent:', e);
    }
  }

  /**
   * Enable analytics with consent
   */
  enableAnalytics() {
    if (window.charlie) {
      window.charlie.enabled = true;
      console.log('🎯 Charlie Analytics enabled with user consent');
    }
  }

  /**
   * Disable analytics
   */
  disableAnalytics() {
    if (window.charlie) {
      window.charlie.enabled = false;
      console.log('🔒 Charlie Analytics disabled - no consent');
    }
  }

  /**
   * Show consent banner
   */
  showConsentBanner() {
    if (document.getElementById('charlie-privacy-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'charlie-privacy-banner';
    banner.className = 'charlie-privacy-banner';

    banner.innerHTML = `
      <div class="privacy-banner-content">
        <div class="privacy-banner-text">
          <h3 class="privacy-title">${this.czechText.title}</h3>
          <p class="privacy-message">${this.czechText.message}</p>
          <div class="privacy-details">
            <div class="privacy-category">
              <strong>${this.czechText.essential}:</strong> ${this.czechText.essentialDesc}
            </div>
            <div class="privacy-category">
              <strong>${this.czechText.analytics}:</strong> ${this.czechText.analyticsDesc}
            </div>
          </div>
        </div>
        <div class="privacy-banner-actions">
          <button class="privacy-btn privacy-btn-decline" onclick="charliePrivacy.declineAnalytics()">
            ${this.czechText.decline}
          </button>
          <button class="privacy-btn privacy-btn-accept" onclick="charliePrivacy.acceptAll()">
            ${this.czechText.accept}
          </button>
          <button class="privacy-btn privacy-btn-settings" onclick="charliePrivacy.showSettings()">
            ${this.czechText.settings}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    this.addPrivacyStyles();

    // Show with animation
    setTimeout(() => {
      banner.classList.add('visible');
    }, 100);

    this.showBanner = true;
  }

  /**
   * Hide consent banner
   */
  hideConsentBanner() {
    const banner = document.getElementById('charlie-privacy-banner');
    if (banner) {
      banner.classList.add('hiding');
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
    this.showBanner = false;
  }

  /**
   * Accept all cookies
   */
  acceptAll() {
    this.saveConsent(true, true);
    this.hideConsentBanner();

    // Track consent decision
    if (window.charlie && window.charlie.enabled) {
      setTimeout(() => {
        window.charlie.recordBehavior('privacy_consent', {
          decision: 'accept_all',
          timestamp: Date.now()
        });
      }, 100);
    }
  }

  /**
   * Decline analytics cookies
   */
  declineAnalytics() {
    this.saveConsent(true, false);
    this.hideConsentBanner();

    console.log('🔒 User declined analytics cookies');
  }

  /**
   * Show privacy settings modal
   */
  showSettings() {
    if (document.getElementById('charlie-privacy-settings')) return;

    const modal = document.createElement('div');
    modal.id = 'charlie-privacy-settings';
    modal.className = 'charlie-privacy-modal';

    modal.innerHTML = `
      <div class="privacy-modal-backdrop" onclick="charliePrivacy.hideSettings()"></div>
      <div class="privacy-modal-content">
        <div class="privacy-modal-header">
          <h2>${this.czechText.title}</h2>
          <button class="privacy-modal-close" onclick="charliePrivacy.hideSettings()">×</button>
        </div>
        <div class="privacy-modal-body">
          <div class="privacy-section">
            <div class="privacy-toggle">
              <label class="privacy-toggle-label">
                <input type="checkbox" checked disabled class="privacy-toggle-input">
                <span class="privacy-toggle-slider"></span>
                <div class="privacy-toggle-text">
                  <strong>${this.czechText.essential}</strong>
                  <div class="privacy-toggle-desc">${this.czechText.essentialDesc}</div>
                </div>
              </label>
            </div>
          </div>

          <div class="privacy-section">
            <div class="privacy-toggle">
              <label class="privacy-toggle-label">
                <input type="checkbox" id="analytics-consent" class="privacy-toggle-input"
                       ${this.consentData?.analytics ? 'checked' : ''}>
                <span class="privacy-toggle-slider"></span>
                <div class="privacy-toggle-text">
                  <strong>${this.czechText.analytics}</strong>
                  <div class="privacy-toggle-desc">${this.czechText.analyticsDesc}</div>
                </div>
              </label>
            </div>
          </div>

          <div class="privacy-info">
            <h3>Informace o zpracování</h3>
            <ul>
              <li>${this.czechText.dataController}</li>
              <li>${this.czechText.dataRetention}</li>
              <li>${this.czechText.yourRights}</li>
              <li>${this.czechText.contactEmail}</li>
            </ul>
            <p class="privacy-updated">${this.czechText.lastUpdated}</p>
          </div>
        </div>
        <div class="privacy-modal-footer">
          <button class="privacy-btn privacy-btn-save" onclick="charliePrivacy.saveSettings()">
            ${this.czechText.save}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      modal.classList.add('visible');
    }, 10);
  }

  /**
   * Hide privacy settings modal
   */
  hideSettings() {
    const modal = document.getElementById('charlie-privacy-settings');
    if (modal) {
      modal.classList.add('hiding');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  /**
   * Save privacy settings from modal
   */
  saveSettings() {
    const analyticsCheckbox = document.getElementById('analytics-consent');
    const analyticsConsent = analyticsCheckbox ? analyticsCheckbox.checked : false;

    this.saveConsent(true, analyticsConsent);
    this.hideSettings();
    this.hideConsentBanner();

    // Track consent change
    if (window.charlie && window.charlie.enabled) {
      setTimeout(() => {
        window.charlie.recordBehavior('privacy_consent', {
          decision: analyticsConsent ? 'accept_analytics' : 'decline_analytics',
          via: 'settings_modal',
          timestamp: Date.now()
        });
      }, 100);
    }
  }

  /**
   * Add privacy link to footer
   */
  addPrivacyLink() {
    // Find a suitable place in the footer to add privacy link
    const footer = document.querySelector('footer') || document.querySelector('#kontakt');
    if (footer) {
      const privacyLink = document.createElement('div');
      privacyLink.className = 'privacy-footer-link';
      privacyLink.innerHTML = `
        <button onclick="charliePrivacy.showSettings()"
                class="text-brew-500 hover:text-tiger-400 text-xs transition-colors">
          ${this.czechText.privacyPolicy}
        </button>
      `;

      // Try to append to an existing container or create one
      const existingLinks = footer.querySelector('.text-brew-600, .text-center');
      if (existingLinks) {
        existingLinks.appendChild(privacyLink);
      } else {
        footer.appendChild(privacyLink);
      }
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for localStorage changes (multiple tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === this.consentKey) {
        this.consentData = this.loadConsent();
        this.hasConsent = this.consentData?.analytics || false;

        if (this.hasConsent) {
          this.enableAnalytics();
        } else {
          this.disableAnalytics();
        }
      }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.hasValidConsent() && !this.showBanner) {
        // Re-check consent when page becomes visible
        setTimeout(() => {
          if (!this.hasValidConsent()) {
            this.showConsentBanner();
          }
        }, 1000);
      }
    });
  }

  /**
   * Add privacy banner and modal styles
   */
  addPrivacyStyles() {
    if (document.getElementById('charlie-privacy-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'charlie-privacy-styles';
    styles.textContent = `
      .charlie-privacy-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(43, 34, 25, 0.98);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(240, 140, 15, 0.2);
        padding: 1.5rem;
        z-index: 9999;
        transform: translateY(100%);
        opacity: 0;
        transition: all 0.4s ease-out;
        font-family: 'Inter', sans-serif;
        color: #e8e5d8;
      }

      .charlie-privacy-banner.visible {
        transform: translateY(0);
        opacity: 1;
      }

      .charlie-privacy-banner.hiding {
        transform: translateY(100%);
        opacity: 0;
      }

      .privacy-banner-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .privacy-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #f3a533;
      }

      .privacy-message {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        line-height: 1.4;
        color: #b9af89;
      }

      .privacy-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: #958757;
      }

      .privacy-category strong {
        color: #f7c46d;
      }

      .privacy-banner-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .privacy-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .privacy-btn-accept {
        background: #f08c0f;
        color: white;
      }

      .privacy-btn-accept:hover {
        background: #e17209;
      }

      .privacy-btn-decline {
        background: rgba(255, 255, 255, 0.1);
        color: #b9af89;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .privacy-btn-decline:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #e8e5d8;
      }

      .privacy-btn-settings {
        background: transparent;
        color: #f7c46d;
        border: 1px solid rgba(240, 140, 15, 0.3);
      }

      .privacy-btn-settings:hover {
        background: rgba(240, 140, 15, 0.1);
      }

      .privacy-btn-save {
        background: #f08c0f;
        color: white;
        padding: 0.75rem 2rem;
      }

      .privacy-btn-save:hover {
        background: #e17209;
      }

      /* Modal styles */
      .charlie-privacy-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease-out;
        font-family: 'Inter', sans-serif;
      }

      .charlie-privacy-modal.visible {
        opacity: 1;
        visibility: visible;
      }

      .charlie-privacy-modal.hiding {
        opacity: 0;
      }

      .privacy-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
      }

      .privacy-modal-content {
        position: relative;
        max-width: 600px;
        width: 90%;
        margin: 5% auto;
        background: rgba(43, 34, 25, 0.98);
        border: 1px solid rgba(240, 140, 15, 0.2);
        border-radius: 1rem;
        backdrop-filter: blur(20px);
        color: #e8e5d8;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .privacy-modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .privacy-modal-header h2 {
        margin: 0;
        color: #f3a533;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .privacy-modal-close {
        background: none;
        border: none;
        color: #b9af89;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.25rem;
        line-height: 1;
      }

      .privacy-modal-close:hover {
        color: #f3a533;
      }

      .privacy-modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
      }

      .privacy-section {
        margin-bottom: 1.5rem;
      }

      .privacy-toggle-label {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        cursor: pointer;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        transition: background 0.2s ease;
      }

      .privacy-toggle-label:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .privacy-toggle-input {
        display: none;
      }

      .privacy-toggle-slider {
        width: 44px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        position: relative;
        transition: background 0.3s ease;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .privacy-toggle-slider::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: transform 0.3s ease;
      }

      .privacy-toggle-input:checked + .privacy-toggle-slider {
        background: #f08c0f;
      }

      .privacy-toggle-input:checked + .privacy-toggle-slider::after {
        transform: translateX(20px);
      }

      .privacy-toggle-input:disabled + .privacy-toggle-slider {
        background: #958757;
      }

      .privacy-toggle-text {
        flex: 1;
      }

      .privacy-toggle-desc {
        font-size: 0.8rem;
        color: #b9af89;
        margin-top: 0.25rem;
        line-height: 1.3;
      }

      .privacy-info {
        background: rgba(255, 255, 255, 0.03);
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 1.5rem;
      }

      .privacy-info h3 {
        margin: 0 0 0.75rem 0;
        color: #f7c46d;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .privacy-info ul {
        margin: 0;
        padding-left: 1rem;
        font-size: 0.8rem;
        color: #b9af89;
        line-height: 1.4;
      }

      .privacy-info li {
        margin-bottom: 0.25rem;
      }

      .privacy-updated {
        margin: 0.75rem 0 0 0;
        font-size: 0.75rem;
        color: #958757;
        font-style: italic;
      }

      .privacy-modal-footer {
        padding: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
      }

      @media (min-width: 768px) {
        .privacy-banner-content {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .privacy-banner-text {
          flex: 1;
          margin-right: 2rem;
        }

        .privacy-banner-actions {
          flex-shrink: 0;
        }
      }

      @media (max-width: 640px) {
        .privacy-modal-content {
          margin: 2% auto;
          width: 95%;
          max-height: 90vh;
        }

        .privacy-details {
          display: none;
        }

        .privacy-btn {
          flex: 1;
          min-width: 0;
          font-size: 0.8rem;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Reset all consent (for testing/development)
   */
  resetConsent() {
    localStorage.removeItem(this.consentKey);
    this.consentData = null;
    this.hasConsent = false;
    this.showBanner = false;
    this.hideConsentBanner();
    this.hideSettings();
    this.disableAnalytics();
    console.log('🔄 Privacy consent reset');
  }

  /**
   * Get consent status
   */
  getConsentStatus() {
    return {
      hasConsent: this.hasConsent,
      consentData: this.consentData,
      isValid: this.hasValidConsent()
    };
  }
}

// Initialize privacy management
const charliePrivacy = new CharliePrivacy();

// Global access
window.charliePrivacy = charliePrivacy;

// Development helper
window.resetPrivacyConsent = () => charliePrivacy.resetConsent();

console.log('🔒 Charlie Privacy initialized - GDPR compliant analytics consent');