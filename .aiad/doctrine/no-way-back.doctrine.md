# NO WAY BACK - U Tygra Permanent Solution Doctrine

**Version**: 1.0.0
**Status**: ABSOLUTE ENFORCEMENT
**Authority**: SUPREME COMMAND
**Last Updated**: 2026-03-21
**Classification**: L3 (Publicly Shareable)
**Origin**: Adapted from Prismatic Platform NWB v1.0.0

---

## Core Philosophy

**NO WAY BACK**: Build solutions that make the old way impossible. When we migrate from hardcoded data to Google Sheets, delete the hardcoded data. When we replace the old production site, take it down. No dual-running, no fallbacks to legacy.

---

## Philosophical Foundation

> *"Progress is not about building bridges back to where you came from. It's about burning those bridges and making the new path the only path."*

### Why This Doctrine Exists

The current production site (pivniceutygra.cz) is 5 static HTML files with inline JS. This Zola project replaces it completely. There is no "gradual migration" — there is only the cut-over.

Backwards compatibility in this context means:
- Maintaining two codebases
- Confusion about which site is "real"
- Staff updating two beer boards
- Double the maintenance for zero benefit

---

## The Doctrine (adapted for U Tygra)

### 1. COMPLETE REPLACEMENT

```yaml
rule: old_site_replaced_entirely
enforcement: HARD
requirements:
  - All 5 production pages have equivalents in Zola project
  - DNS cutover is atomic (no A/B testing between old and new)
  - Old site files are not preserved "just in case"
  - Google Sheets integration is the ONLY beer data source
```

### 2. DATA SOURCE CONSOLIDATION

```yaml
rule: one_source_of_truth_per_data_type
enforcement: HARD
sources:
  beer_menu: "Google Sheets (CSV export)"
  announcements: "Google Sheets (row 1)"
  food_menu: "Firebase or Google Sheets (NOT hardcoded in JS)"
  events: "Firebase or Google Sheets"
  business_info: "zola.toml [extra] section"
  photos: "static/img/ (repo) -> Firebase Storage (future)"
violations:
  - Same data in multiple places
  - Hardcoded values that duplicate a live source
  - Template values that override config values
```

### 3. TECHNOLOGY FORWARD

```yaml
rule: adopt_fully_or_not_at_all
enforcement: HARD
examples:
  flowbite: "Either use Flowbite components properly or remove the CDN import"
  alpine_js: "All interactivity through Alpine — no vanilla JS onclick handlers"
  tailwind: "All styling through Tailwind utilities — no custom CSS for things Tailwind handles"
  pwa: "Full PWA with working offline mode — or no PWA at all"
  firebase: "Full Firebase integration with auth — or no Firebase"
```

---

## Application

### Migration Checklist
When replacing any component:
1. Implement the new version completely
2. Verify the new version works in all modes (normal + kiosk)
3. Remove the old implementation entirely
4. Update all references and documentation
5. There is no step 5 — you're done

### No Dual-Running
- No `if (useNewVersion)` feature flags
- No `// old implementation, keeping for reference` comments
- No backup files (`.bak`, `.old`, `.deprecated`)

---

## Mantras

- "The old site is dead. Long live the new site."
- "One source of truth, one codebase, one deployment"
- "If you're keeping the old code 'just in case', you don't trust the new code"
