# GOLDEN TAP - Content Freshness Doctrine

**Version**: 1.0.0
**Status**: ABSOLUTE ENFORCEMENT
**Authority**: SUPREME COMMAND
**Last Updated**: 2026-03-21
**Classification**: L3 (Publicly Shareable)
**Integration**: NMND + NWB Doctrines

---

## Core Philosophy

**GOLDEN TAP**: Live data flows like beer from a golden tap — always fresh, never stale, never interrupted. Every piece of dynamic content must have a verified source, a refresh mechanism, and a fallback strategy.

---

## Philosophical Foundation

> *"Hosty nezajima, ze mas problem s Wi-Fi. Zajima je, co je na cepu."*

### Why This Doctrine Exists

A pub beer board that shows yesterday's beers is worse than no beer board at all. Stale data erodes trust. Customers who see "Plzen 12" on the board and get told "that was yesterday" don't come back.

This doctrine ensures:
- All displayed data reflects reality within acceptable latency
- Network failures never produce blank screens
- Data sources are validated, not assumed
- Content freshness is measurable and enforced

---

## The Doctrine

### 1. DATA SOURCE INTEGRITY

```yaml
rule: every_dynamic_element_has_verified_source
enforcement: HARD
applies_to: [beer_menu, announcements, events, prices]
violations:
  - Hardcoded data pretending to be live
  - Data source URL without validation
  - Missing fallback for network failure
```

**Requirements**:
- Every live data element must declare its source (Google Sheets, Firebase, API)
- Source URL must be validated on build/startup
- CSV/JSON schema must be validated before rendering
- Data age must be tracked and displayed in kiosk mode

### 2. FRESHNESS GUARANTEES

```yaml
rule: maximum_staleness_enforced
enforcement: HARD
thresholds:
  beer_menu: 120_seconds   # 2 minute max staleness
  announcements: 300_seconds # 5 minute max staleness
  events: 3600_seconds      # 1 hour max staleness
  food_menu: 86400_seconds  # 24 hour (daily update acceptable)
  static_content: infinity  # No freshness requirement
```

### 3. GRACEFUL DEGRADATION

```yaml
rule: never_show_blank_screen
enforcement: HARD
strategy:
  level_1: Show live data (normal operation)
  level_2: Show cached data with "Last updated" timestamp
  level_3: Show static fallback content
  level_4: Show offline page with business info (phone, address)
  never: Blank screen, error stack trace, broken layout
```

### 4. FOOD MENU MIGRATION

```yaml
rule: food_data_must_be_externalized
enforcement: SOFT (transition period)
current_state: hardcoded in app.js
target_state: Google Sheets or Firebase
rationale: Prices change, items rotate — hardcoded data violates Golden Tap
```

---

## Enforcement

### Pre-Commit Checks
- No hardcoded prices in template files
- Data source URLs must be in configuration (zola.toml), not in JS
- Fallback content must exist for every dynamic section

### Runtime Checks
- Console warning if data is older than threshold
- Visual indicator (amber dot) if data is stale
- Red indicator if data fetch has failed

### Quality Gates
- `make test-links-data` validates Google Sheets endpoint
- Kiosk mode displays "last updated" timestamp

---

## Mantras

- "Stale data is a lie on display"
- "The tap never runs dry — there's always a fallback"
- "If you can't prove it's fresh, it's stale"
