# Charlie Squad Analytics & Business Intelligence

## Přehled

Charlie Squad implementuje komplexní analytický a business intelligence systém pro Pivnici U Tygra. Systém poskytuje pokročilé sledování chování zákazníků, analýzu popularity piv, české lokalizované poznatky a GDPR-compliant sběr dat.

## Architektúra

### Komponenty

1. **Charlie Analytics Core** (`charlie-analytics.js`)
   - Základní analytický engine
   - Sledování interakcí s pivy
   - Business intelligence metriky
   - České pub industry benchmarks

2. **Charlie Dashboard** (`charlie-dashboard.js`)
   - Administrátorský dashboard
   - Real-time analytics
   - Business intelligence reporty
   - Exportní funkce

3. **Charlie Privacy** (`charlie-privacy.js`)
   - GDPR compliance
   - Consent management
   - Česká lokalizace
   - Privacy-first přístup

4. **Charlie Performance** (`charlie-performance.js`)
   - Monitoring výkonu analytics
   - Optimalizace performance
   - Self-monitoring systém

## Sledované metriky

### Beer Analytics
- **Beer Views**: Zobrazení jednotlivých piv s detailními metrikami
- **Brewery Interactions**: Kliknutí na pivovarské odkazy
- **Style Preferences**: Filtry pivních stylů a preference
- **Price Analysis**: Cenové reakce a preference
- **Czech Beer Categories**: Tradiční vs. craft vs. international

### User Behavior
- **Navigation Patterns**: Pohyb mezi sekcemi
- **Session Duration**: Doba strávená na stránce
- **Food Interactions**: Interakce s jídelním lístkem
- **Reservation Intent**: Indikátory zájmu o rezervaci
- **PWA Usage**: Analýza PWA vs. web usage

### Czech Pub Industry Metrics
- **Style Popularity**: Popularita českých vs. mezinárodních stylů
- **Regional Preferences**: Moravské vs. čezské pivovary
- **Seasonal Patterns**: Sezónní trendy v preferencích
- **Traditional vs. Craft**: Analýza tradičních vs. řemeslných piv

## Business Intelligence Features

### Real-time Dashboard
```javascript
// Přístup k dashboard
// Ctrl+Shift+C → zadejte "tygra2024"
```

#### Dashboard sekce:
- **Live metriky**: Aktivní uživatelé, průměrná doba, zobrazení piv
- **Beer rankings**: Nejpopulárnější piva s percentage
- **Brewery analytics**: Analýza pivovarů s kategorizací
- **Style distribution**: Distribuce preferovaných stylů
- **Customer journey**: Analýza chování zákazníků
- **Business insights**: AI-generované pozorování

### Exportní funkce
- CSV export současných dat
- Analytics reporty pro pivovary
- Performance metriky

## GDPR Compliance

### Privacy Features
- **Consent banner**: Czech-localized consent management
- **Settings modal**: Granular privacy controls
- **Data retention**: 2-year retention policy
- **User rights**: Access, correction, deletion, portability

### Compliance details
```javascript
// Správce údajů
{
  company: "KONOVO s.r.o.",
  ico: "17846927",
  dataRetention: "2 roky",
  contact: "info@utygra.cz",
  rights: ["přístup", "oprava", "výmaz", "přenositelnost"]
}
```

## Performance Monitoring

### Metriky
- **Tracking latency**: Latence jednotlivých trackingů
- **Memory usage**: Spotřeba paměti
- **Network impact**: Vliv na síťové požadavky
- **Error tracking**: Sledování chyb
- **Performance impact assessment**: Hodnocení vlivu na výkon

### Thresholds
```javascript
{
  maxLatency: 50, // ms
  maxMemoryUsage: 10, // MB
  maxQueueSize: 100,
  maxErrors: 5
}
```

## API Reference

### Charlie Analytics

#### Hlavní tracking metody
```javascript
// Beer view tracking
charlie.trackBeerView(beer)

// Brewery click tracking
charlie.trackBreweryClick(breweryName, url)

// Style filter tracking
charlie.trackStyleFilter(styleId, styleName)

// Menu navigation
charlie.trackMenuNavigation(section, method)

// Food interactions
charlie.trackFoodInteraction(action, itemName, category, price)

// PWA engagement
charlie.trackPWAEngagement(action, details)

// Reservation intent
charlie.trackReservationIntent(action, details)
```

#### Session management
```javascript
// Generate session summary
charlie.generateSessionSummary()

// Track session end
charlie.trackSessionEnd()

// Get engagement level
charlie.getUserEngagementLevel()
```

### Charlie Dashboard

```javascript
// Initialize dashboard
charlieDashboard.init('tygra2024')

// Show/hide dashboard
charlieDashboard.show()
charlieDashboard.hide()

// Refresh data
charlieDashboard.refreshData()

// Export data
charlieDashboard.exportData()
```

### Charlie Privacy

```javascript
// Check consent status
charliePrivacy.getConsentStatus()

// Show privacy settings
charliePrivacy.showSettings()

// Accept/decline consent
charliePrivacy.acceptAll()
charliePrivacy.declineAnalytics()

// Reset consent (development)
charliePrivacy.resetConsent()
```

### Charlie Performance

```javascript
// Get performance metrics
charliePerformance.getMetrics()

// Generate performance report
charliePerformance.generatePerformanceSummary()

// Measure function performance
charliePerformance.measureFunction('functionName', fn)
```

## Integrace s Alpine.js

### Event handlers
```javascript
// Beer card clicks
@click="onBeerCardClick(beer)"

// Brewery links
@click.stop="onBreweryClick(beer['pivovar'])"

// Style filters
@click.stop="onStyleFilterClick(slugify(beer['styl']))"

// Food tabs
@click="onFoodTabSwitch('cold')"

// Navigation
@click="onNavClick(item.id)"

// Phone clicks
@click="onPhoneClick('bar')"
```

### Alpine.js methods v app()
```javascript
// Analytics integration methods
onBeerCardClick(beer)
onBreweryClick(breweryName)
onStyleFilterClick(styleId)
onFoodTabSwitch(category)
onFoodItemView(item)
onNavClick(section)
onPhoneClick(phoneType)
onSalonekView()
onBeerViewToggle(newView)
```

## Czech Pub Industry Context

### Beer Style Categories
```javascript
beerStyles: [
  {
    id: 'svetlylezak',
    name: 'Světlý ležák',
    category: 'traditional_czech'
  },
  {
    id: 'ipa',
    name: 'IPA',
    category: 'craft_international'
  }
  // ... více stylů
]
```

### Brewery Classification
- **Czech Traditional**: Budvar, Pilsner Urquell, Staropramen
- **Regional Czech**: Chotěborský, Tišnov, Mazák
- **Craft Brewery**: Bernard, Matuška, Clock
- **International**: Guinness, Hoegaarden, Sierra Nevada

### Business Benchmarks
```javascript
pubBenchmarks: {
  avgSessionDuration: 180000, // 3 minuty
  avgBeerViews: 6,
  popularStyles: ['svetlylezak', 'ipa', 'tmavylezak'],
  peakHours: [17, 18, 19, 20, 21]
}
```

## Testing & Validation

### Manual Testing
1. **Analytics Flow**
   ```bash
   # 1. Otevřít browser dev tools
   # 2. Navigovat na web
   # 3. Kliknout na různá piva
   # 4. Zkontrolovat console výstupy
   # 5. Otevřít dashboard (Ctrl+Shift+C)
   ```

2. **Privacy Compliance**
   ```bash
   # 1. Vymazat localStorage
   # 2. Refresh stránky
   # 3. Zkontrolovat consent banner
   # 4. Test accept/decline flows
   ```

3. **Performance Testing**
   ```bash
   # 1. Otevřít Performance tab
   # 2. Zkontrolovat charliePerformanceReport()
   # 3. Monitorovat memory usage
   ```

### Automated Testing
```javascript
// Cypress test example
describe('Charlie Analytics', () => {
  it('should track beer views', () => {
    cy.visit('/')
    cy.get('[data-testid="beer-card"]').first().click()
    cy.window().then(win => {
      expect(win.charlie.sessionData.beerViews.size).to.be.greaterThan(0)
    })
  })
})
```

## Configuration

### Environment Variables
```toml
# zola.toml
[extra]
ga_id = "G-FTXJKHH6R0"
analytics_enabled = true
debug_analytics = false
```

### Feature Flags
```javascript
// Feature toggles
const features = {
  advancedAnalytics: true,
  businessIntelligence: true,
  performanceMonitoring: true,
  gdprCompliance: true
}
```

## Troubleshooting

### Common Issues

1. **Analytics not tracking**
   ```javascript
   // Check consent
   charliePrivacy.getConsentStatus()

   // Check Charlie instance
   console.log(window.charlie)

   // Check GDPR consent
   localStorage.getItem('tygra-analytics-consent')
   ```

2. **Dashboard not loading**
   ```javascript
   // Check authentication
   charlieDashboard.show() // Should prompt for auth

   // Check scripts loaded
   console.log(typeof charlieDashboard)
   ```

3. **Performance issues**
   ```javascript
   // Check performance impact
   charliePerformance.generatePerformanceSummary()

   // Reset if needed
   charliePerformance.resetMetrics()
   ```

### Debug Commands
```javascript
// Global debug helpers
window.resetPrivacyConsent()
window.charliePerformanceReport()
window.resetCharliePerformance()

// Enable debug mode
localStorage.setItem('charlie-debug', 'true')
```

## Data Privacy & Security

### Data Minimization
- Pouze nezbytné údaje pro business analytics
- Anonymizace IP adres
- Žádné osobní identifikátory
- Časové limity pro data retention

### Security Measures
- XSS protection pro všechny inputs
- Content Security Policy compliance
- Secure localStorage usage
- HTTPS-only cookies

### GDPR Rights Support
- Přístup k údajům: Dashboard export
- Oprava údajů: Consent management
- Výmaz údajů: Reset consent + clear storage
- Přenositelnost: CSV export functionality

## Roadmap

### Fase 1 - Základní analytics ✅
- [x] Charlie Analytics Core
- [x] Basic event tracking
- [x] Privacy compliance
- [x] Performance monitoring

### Fase 2 - Business Intelligence ✅
- [x] Dashboard implementation
- [x] Real-time metrics
- [x] Czech pub context
- [x] Export functionality

### Fase 3 - Advanced Features 🚧
- [ ] ML-powered insights
- [ ] Predictive analytics
- [ ] Inventory optimization recommendations
- [ ] Customer segmentation
- [ ] A/B testing framework

### Fase 4 - Integration
- [ ] POS system integration
- [ ] Inventory management sync
- [ ] Marketing automation
- [ ] Customer loyalty program

## Support

### Development Team
- **Charlie Squad Lead**: Analytics & BI specialist
- **Privacy Officer**: GDPR compliance
- **Performance Engineer**: Optimization specialist

### Documentation Updates
- Version: 1.0.0
- Last Updated: 28. ledna 2026
- Next Review: Q2 2026

## License

Proprietary software for Pivnice U Tygra (KONOVO s.r.o.)
All rights reserved.