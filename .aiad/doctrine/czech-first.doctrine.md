# CZECH FIRST - Localization & Cultural Doctrine

**Version**: 1.0.0
**Status**: ABSOLUTE ENFORCEMENT
**Authority**: SUPREME COMMAND
**Last Updated**: 2026-03-21
**Classification**: L3 (Publicly Shareable)

---

## Core Philosophy

**CZECH FIRST**: This is a Czech pub in Brno. Every user-facing string, every label, every error message, every notification is in Czech. English is for code comments and technical documentation only.

---

## Philosophical Foundation

> *"Kdyz prijdete do ceske hospody a vidite anglicky menu, otocite se a jdete jinam."*

### Why This Doctrine Exists

U Tygra is not a tourist trap. It's a neighborhood pub near Luzanky park. The target audience speaks Czech. English UI elements feel corporate and alienating. Czech-first is not a localization strategy — it's a statement of identity.

---

## The Doctrine

### 1. LANGUAGE RULES

```yaml
rule: all_user_facing_content_in_czech
enforcement: HARD
czech_required:
  - All UI labels and buttons
  - Navigation items
  - Error messages and notifications
  - Loading states ("Nacitam nabidku piv...")
  - Cookie/privacy consent text
  - Announcement text
  - Food and beer descriptions
  - Accessibility labels (aria-label)
  - HTML lang attribute ("cs")
  - Schema.org addressLocality, addressCountry
english_allowed:
  - Code comments
  - Git commit messages
  - CLAUDE.md and technical documentation
  - Variable names and function names
  - CSS class names
  - Console.log messages (developer-facing)
  - Beer style English names (secondary, in parentheses)
```

### 2. CZECH FORMATTING

```yaml
rule: czech_number_and_date_formatting
enforcement: HARD
rules:
  currency: "XX Kc" # Not CZK, not "XX,-"
  phone: "+420 XXX XXX XXX" # Grouped by threes
  date: "DD.MM.YYYY" # Czech format
  time: "HH:MM" # 24-hour format
  address: "Street Number, PSC City" # Czech postal format
  decimal: "," # Czech uses comma as decimal separator
  thousands: " " # Space as thousands separator (non-breaking)
  diacritics: "always" # Never strip diacritics (Brno, not Brno)
```

### 3. CULTURAL CONTEXT

```yaml
rule: respect_czech_pub_culture
enforcement: SOFT
guidelines:
  - Beer is measured in 0.5L (velke) and 0.3L (male), never pints
  - Prices are per glass, tax included (DPH)
  - Opening hours in 24h format
  - "Na zdravi" not "Cheers"
  - Food items use Czech culinary terms (utopenci, tlacentka, chlebicky)
  - No tipping suggestions in UI (Czech custom differs)
  - Facebook is primary social (not Instagram/Twitter for Czech pubs)
```

### 4. DIACRITICS

```yaml
rule: preserve_czech_diacritics_everywhere
enforcement: HARD
applies_to: [html, json, csv, meta_tags, schema_org, alt_text]
characters: [a, c, d, e, e, i, n, o, r, s, t, u, u, y, z]
violations:
  - "Brno" without hacky/carky where applicable
  - "Svetly lezak" instead of "Svetly lezak"
  - Stripping diacritics for URL slugs (use transliteration)
exceptions:
  - URL paths (ASCII only, use transliteration)
  - CSS class names
  - JavaScript identifiers
```

---

## Enforcement

### Pre-Commit Checks
- All user-facing strings in templates must be Czech
- `lang="cs"` on `<html>` tag
- No English-only error messages in UI code

### Content Validation
- `make quality-check` includes Czech content verification
- Schema.org markup uses Czech address format
- Google Sheets data assumes Czech column headers

---

## Mantras

- "Tady se mluvi cesky"
- "Czech first, English never (in UI)"
- "Diacritics are not optional"
